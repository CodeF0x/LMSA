// Chat Service for handling chat functionality
import { messagesContainer, userInput, loadedModelDisplay } from './dom-elements.js';
import { appendMessage, showLoadingIndicator, hideLoadingIndicator, toggleSendStopButton, hideWelcomeMessage, showWelcomeMessage, toggleSidebar, showConfirmationModal, hideConfirmationModal } from './ui-manager.js';
import { getApiUrl, getAvailableModels, isServerRunning, fetchAvailableModels } from './api-service.js';
import { getSystemPrompt, getTemperature } from './settings-manager.js';
import { sanitizeInput, basicSanitizeInput, initializeCodeMirror, scrollToBottom } from './utils.js';
// No file upload functions are used in this module
import { setActionToPerform } from './shared-state.js';

let currentChatId = Date.now();
let chatHistoryData = {};
// This variable is now managed in event-handlers.js
// let isFirstMessage = true;
let chatToDelete = null;
let abortController = null;

/**
 * Generates an AI response to a user message
 * @param {string} userMessage - The user's message
 * @param {Array} fileContents - Optional array of file contents
 */
export async function generateAIResponse(userMessage, fileContents = []) {
    showLoadingIndicator();
    toggleSendStopButton();

    try {
        if (!(await isServerRunning())) {
            throw new Error('LM Studio server is not running');
        }

        // Get the latest available models
        const availableModels = getAvailableModels();

        if (availableModels.length === 0) {
            // Try to fetch models if none are available
            await fetchAvailableModels();
            // Get the updated list of models
            const updatedModels = getAvailableModels();

            if (updatedModels.length === 0) {
                throw new Error('No models available');
            }
        }

        const currentChat = chatHistoryData[currentChatId] || [];

        // Prepare message content with file data if present
        let enhancedMessage = userMessage;

        // Add file contents directly to the message
        if (fileContents && fileContents.length > 0) {
            enhancedMessage += '\n\nAttached Files:\n';

            fileContents.forEach((file, index) => {
                enhancedMessage += `\n--- File ${index + 1}: ${file.name} (${file.type}) ---\n`;

                if (file.isText) {
                    // For text files, include the content directly
                    enhancedMessage += `\nContent:\n${file.content}\n`;
                } else if (file.type.includes('image')) {
                    // For images, include markdown image syntax for the base64 data
                    // Some LLMs can "see" images in markdown format
                    const imgData = file.content; // This is already a data URL from the FileReader

                    enhancedMessage += `\n[Image content is available but not displayed in this text. The model can process this image.]`;

                    // For models that support markdown-style image references
                    enhancedMessage += `\n![Image](${imgData})`;
                } else {
                    // For other binary files
                    enhancedMessage += '[This is a binary file that has been attached]';
                }

                enhancedMessage += '\n--- End of file ---\n';
            });
        }

        // Create the messages array
        let userMsg = { role: 'user', content: enhancedMessage };

        const messages = [
            { role: 'system', content: getSystemPrompt() },
            ...currentChat.map(msg => ({ role: msg.role, content: msg.content })),
            userMsg
        ];

        // Create request body
        const requestBody = {
            model: getAvailableModels()[0], // Use the first available model
            messages: messages,
            temperature: getTemperature(),
            stream: true, // Enable streaming
        };

        console.log('Sending API request with message containing file content');

        abortController = new AbortController();

        const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let aiMessage = '';
        const aiMessageElement = appendMessage('ai', '');

        // Flag to track if this is a reasoning model (has think tags)
        let hasThinkTags = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            const parsedLines = lines
                .map(line => line.replace(/^data: /, '').trim())
                .filter(line => line !== '' && line !== '[DONE]')
                .map(line => JSON.parse(line));

            for (const parsedLine of parsedLines) {
                const { choices } = parsedLine;
                const { delta } = choices[0];
                const { content } = delta;
                if (content) {
                    aiMessage += content;

                    // Check if the message contains think tags
                    if (content.includes('<think>') || content.includes('</think>') ||
                        aiMessage.includes('<think>') || aiMessage.includes('</think>')) {
                        hasThinkTags = true;
                    }

                    // Store the original unsanitized content for later reprocessing if needed
                    aiMessageElement.originalContent = aiMessage;

                    // Apply the appropriate sanitization based on message type
                    if (hasThinkTags) {
                        aiMessageElement.innerHTML = sanitizeInput(aiMessage);
                    } else {
                        aiMessageElement.innerHTML = basicSanitizeInput(aiMessage);
                    }

                    // Apply the appropriate sanitization based on message type and thinking flag
                    if (hasThinkTags) {
                        // For reasoning models, apply full sanitization
                        aiMessageElement.innerHTML = sanitizeInput(aiMessage);
                        // Mark this message as a reasoning model response
                        aiMessageElement.dataset.hasThinking = 'true';
                    } else {
                        // For non-reasoning models, apply basic sanitization (no thinking tag processing)
                        aiMessageElement.innerHTML = basicSanitizeInput(aiMessage);
                        // Mark this message as a non-reasoning model response
                        aiMessageElement.dataset.hasThinking = 'false';
                    }

                    initializeCodeMirror(aiMessageElement);
                    scrollToBottom(messagesContainer);
                }
            }
        }

        updateChatHistory(userMessage, aiMessage, fileContents);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
        } else {
            console.error('Error:', error);
            appendMessage('error', 'An error occurred while fetching the response. Please check your LM Studio server connection.');
        }
    } finally {
        hideLoadingIndicator();
        toggleSendStopButton();
        abortController = null;
    }
}

/**
 * Updates the chat history with a new user-AI message pair
 * @param {string} userMessage - The user's message
 * @param {string} aiMessage - The AI's response
 * @param {Array} fileContents - Optional array of file contents
 */
export function updateChatHistory(userMessage, aiMessage, fileContents = []) {
    if (!chatHistoryData[currentChatId]) {
        chatHistoryData[currentChatId] = [];
    }

    // Determine if this is an enhanced message (with files) or a regular message
    let messageToStore = userMessage;
    let hasFiles = false;

    // If we have file contents, mark this message as having attachments
    if (fileContents && fileContents.length > 0) {
        hasFiles = true;
    }

    // Create user message object
    const userMsg = { role: 'user', content: messageToStore };
    if (hasFiles) {
        userMsg.has_files = true; // Just a marker for UI, not used in API calls
    }

    chatHistoryData[currentChatId].push(userMsg);
    chatHistoryData[currentChatId].push({ role: 'assistant', content: aiMessage });

    updateChatHistoryUI();
    saveChatHistory();
}

/**
 * Updates the chat history UI
 */
export function updateChatHistoryUI() {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    chatHistory.innerHTML = '';
    Object.entries(chatHistoryData).forEach(([id, messages]) => {
        const button = document.createElement('button');
        button.classList.add('w-full', 'text-left', 'py-2', 'px-4', 'hover:bg-gray-700', 'focus:outline-none', 'focus:ring-2', 'focus:ring-gray-500', 'text-gray-300', 'animate-fade-in');

        const chatTitle = document.createElement('span');
        chatTitle.textContent = messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '');
        button.appendChild(chatTitle);

        const trashIcon = document.createElement('i');
        trashIcon.classList.add('fas', 'fa-trash', 'trash-icon');
        trashIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(id);
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
        button.appendChild(trashIcon);

        button.addEventListener('click', () => loadChat(id));
        chatHistory.appendChild(button);
    });
}

/**
 * Shows the delete confirmation modal for a chat
 * @param {string} id - The ID of the chat to delete
 */
export function showDeleteConfirmation(id) {
    chatToDelete = id;
    setActionToPerform('deleteChat');
    showConfirmationModal('Are you sure you want to delete this chat? This action cannot be undone.');
}

/**
 * Deletes a chat from the chat history
 * @param {string} id - The ID of the chat to delete
 */
export function deleteChatHistory(id) {
    delete chatHistoryData[id];
    updateChatHistoryUI();
    saveChatHistory();
    if (id === currentChatId) {
        messagesContainer.innerHTML = '';
        showWelcomeMessage();
        currentChatId = Date.now();
    }
    hideConfirmationModal();
}

/**
 * Loads a chat from the chat history
 * @param {string} id - The ID of the chat to load
 */
export function loadChat(id) {
    currentChatId = id;
    messagesContainer.innerHTML = '';
    hideWelcomeMessage();

    // Hide the loaded model notification when loading a saved chat
    if (loadedModelDisplay) {
        loadedModelDisplay.classList.add('hidden');
    }

    const messages = chatHistoryData[id];
    lazyLoadMessages(messages, 0);
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.add('hidden');
}

/**
 * Lazy loads messages to improve performance
 * @param {Array} messages - Array of messages to load
 * @param {number} startIndex - Starting index
 * @param {number} chunkSize - Number of messages to load at once
 */
export function lazyLoadMessages(messages, startIndex, chunkSize = 10) {
    const endIndex = Math.min(startIndex + chunkSize, messages.length);
    for (let i = startIndex; i < endIndex; i++) {
        const message = messages[i];
        let contentDisplay = message.content;

        // Add file attachment indicator if present
        if (message.has_files) {
            contentDisplay += ' [File attached]';
        }

        // Map 'assistant' role to 'ai' class for consistent styling
        const sender = message.role === 'assistant' ? 'ai' : message.role;
        appendMessage(sender, contentDisplay);
    }
    if (endIndex < messages.length) {
        setTimeout(() => lazyLoadMessages(messages, endIndex), 100);
    } else {
        scrollToBottom(messagesContainer);
    }
}

/**
 * Clears all chats
 */
export function clearAllChats() {
    messagesContainer.innerHTML = '';
    showWelcomeMessage();
    chatHistoryData = {};
    updateChatHistoryUI();
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.add('hidden');
    localStorage.removeItem('chatHistory');
}

/**
 * Creates a new chat
 */
export function createNewChat() {
    currentChatId = Date.now();
    messagesContainer.innerHTML = '';
    showWelcomeMessage();
    userInput.focus();

    // Show the loaded model notification for new chats
    if (loadedModelDisplay && getAvailableModels().length > 0) {
        loadedModelDisplay.classList.remove('hidden');
    }

    // Reset isFirstMessage flag is now handled in event-handlers.js

    // Always close sidebar on mobile when creating new chat
    const sidebar = document.getElementById('sidebar');
    if (sidebar && (sidebar.classList.contains('active') || !sidebar.classList.contains('hidden'))) {
        toggleSidebar();
    }
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.add('hidden');
}

/**
 * Saves the chat history to localStorage
 */
export function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistoryData));
}

/**
 * Loads the chat history from localStorage
 */
export function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatHistoryData = JSON.parse(savedHistory);
        updateChatHistoryUI();
    }
}

/**
 * Aborts the current AI response generation
 */
export function abortGeneration() {
    if (abortController) {
        abortController.abort();
    }
}

/**
 * Gets the current chat ID
 * @returns {string} - The current chat ID
 */
export function getCurrentChatId() {
    return currentChatId;
}

/**
 * Gets the chat history data
 * @returns {Object} - The chat history data
 */
export function getChatHistoryData() {
    return chatHistoryData;
}

/**
 * Sets the chat to delete
 * @param {string} id - The ID of the chat to delete
 */
export function setChatToDelete(id) {
    chatToDelete = id;
}

/**
 * Gets the chat to delete
 * @returns {string} - The ID of the chat to delete
 */
export function getChatToDelete() {
    return chatToDelete;
}
