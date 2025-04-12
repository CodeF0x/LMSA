// UI Manager for handling UI-related functionality
import { 
    messagesContainer, welcomeMessage, sidebar, settingsModal, 
    loadingIndicator, sendButton, stopButton, loadedModelDisplay
} from './dom-elements.js';
import { basicSanitizeInput, sanitizeInput, initializeCodeMirror, scrollToBottom } from './utils.js';
import { getHideThinking } from './settings-manager.js';

let selectedText = '';
let selectedMessageElement = null;
let longPressTimer;

/**
 * Shows the welcome message and hides the messages container
 */
export function showWelcomeMessage() {
    if (welcomeMessage) {
        welcomeMessage.style.display = 'flex';
        welcomeMessage.style.opacity = '1';
        welcomeMessage.style.visibility = 'visible';
        // Force a reflow to ensure proper positioning on mobile
        void welcomeMessage.offsetWidth;
    }
    if (messagesContainer) {
        messagesContainer.style.opacity = '0';
        messagesContainer.style.visibility = 'hidden';
        setTimeout(() => {
            messagesContainer.style.display = 'none';
        }, 50);
    }
}

/**
 * Hides the welcome message and shows the messages container
 */
export function hideWelcomeMessage() {
    if (welcomeMessage) {
        welcomeMessage.style.opacity = '0';
        welcomeMessage.style.visibility = 'hidden';
        setTimeout(() => {
            welcomeMessage.style.display = 'none';
        }, 300); // Match transition duration
    }
    if (messagesContainer) {
        messagesContainer.style.display = 'flex';
        messagesContainer.style.height = '100%';
        messagesContainer.style.opacity = '1';
        messagesContainer.style.visibility = 'visible';
    }
}

/**
 * Toggles the sidebar visibility
 */
export function toggleSidebar() {
    if (!sidebar) return; // Ensure sidebar element exists
    sidebar.classList.toggle('hidden');
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
    settingsModal.classList.add('hidden');

    // Add animation for smooth transition
    if (sidebar.classList.contains('active')) {
        sidebar.classList.add('animate-slide-in');
        sidebar.classList.remove('animate-slide-out');
    } else {
        sidebar.classList.add('animate-slide-out');
        sidebar.classList.remove('animate-slide-in');

        // Collapse options container when sidebar is closed in mobile view
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer && window.innerWidth <= 768) {
            optionsContainer.classList.add('hidden');
            optionsContainer.classList.remove('animate-fade-in');
        }

        setTimeout(() => {
            sidebar.classList.remove('animate-slide-out');
        }, 300);
    }
}

/**
 * Shows the confirmation modal with a message
 * @param {string} message - The message to display in the confirmation modal
 */
export function showConfirmationModal(message) {
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    
    if (confirmationModal && confirmationMessage) {
        confirmationMessage.textContent = message;
        confirmationModal.classList.remove('hidden');
        confirmationModal.classList.add('animate-fade-in');
    }
}

/**
 * Hides the confirmation modal
 */
export function hideConfirmationModal() {
    const confirmationModal = document.getElementById('confirmation-modal');
    
    if (confirmationModal) {
        confirmationModal.classList.add('animate-fade-out');
        setTimeout(() => {
            confirmationModal.classList.add('hidden');
            confirmationModal.classList.remove('animate-fade-out');
        }, 300);
    }
}

/**
 * Shows the loading indicator
 */
export function showLoadingIndicator() {
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.innerHTML = '<span class="loading-ellipsis">...</span>';
    }
    loadingIndicator.classList.remove('hidden');
    loadingIndicator.classList.add('animate-fade-in');
    messagesContainer.insertBefore(loadingIndicator, messagesContainer.firstChild);
    scrollToBottom(messagesContainer);
}

/**
 * Hides the loading indicator
 */
export function hideLoadingIndicator() {
    if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
}

/**
 * Hides the loading indicator on page load
 */
export function hideLoadingIndicatorOnLoad() {
    if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
}

/**
 * Toggles between send and stop buttons
 */
export function toggleSendStopButton() {
    if (sendButton && stopButton) {
        sendButton.classList.toggle('hidden');
        stopButton.classList.toggle('hidden');
    }
}

/**
 * Appends a message to the messages container
 * @param {string} sender - The sender of the message ('user', 'ai', or 'error')
 * @param {string} message - The message content
 * @returns {HTMLElement} - The created message element
 */
export function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender, 'animate-fade-in', 'mb-4', 'p-4', 'rounded-lg');

    // Store the original message content for reprocessing if needed
    if (sender === 'ai') {
        messageElement.originalContent = message;

        // Directly display text with minimal formatting for non-reasoning models
        // Only apply thinking tag processing if the message contains think tags
        if (!message.includes('<think>') && !message.includes('</think>')) {
            // For non-reasoning models, apply basic formatting without think tag processing
            messageElement.innerHTML = basicSanitizeInput(message);
            // Mark as non-reasoning model message
            messageElement.dataset.hasThinking = 'false';
        } else {
            // For reasoning models, apply full sanitization with think tag processing
            messageElement.innerHTML = sanitizeInput(message);
            // Mark as reasoning model message
            messageElement.dataset.hasThinking = 'true';
        }
    } else {
        // For user messages, apply regular sanitization
        messageElement.innerHTML = sanitizeInput(message);
    }

    // Add long-press event listeners for AI messages
    if (sender === 'ai') {
        messageElement.addEventListener('touchstart', handleTouchStart);
        messageElement.addEventListener('touchend', handleTouchEnd);
        messageElement.addEventListener('touchmove', handleTouchMove);
        messageElement.addEventListener('mousedown', handleMouseDown);
        messageElement.addEventListener('mouseup', handleMouseUp);
        messageElement.addEventListener('mouseleave', handleMouseLeave);

        // If hide thinking is enabled, remove any visible think tags
        if (getHideThinking()) {
            setTimeout(() => {
                // Find all paragraphs inside this message
                const paragraphs = messageElement.querySelectorAll('p');
                paragraphs.forEach(p => {
                    // Check for raw think tags and remove them
                    if (p.textContent.includes('<think>') && p.textContent.includes('</think>')) {
                        p.style.display = 'none';
                    }
                });
                removeVisibleThinkTags();
            }, 0);
        }
    }

    messagesContainer.insertBefore(messageElement, messagesContainer.firstChild);
    initializeCodeMirror(messageElement);
    applyThinkingVisibility();
    scrollToBottom(messagesContainer);
    return messageElement;
}

/**
 * Applies the thinking visibility setting to all messages
 */
export function applyThinkingVisibility() {
    if (messagesContainer) {
        if (getHideThinking()) {
            messagesContainer.classList.add('hide-thinking');
            document.body.classList.add('hide-thinking'); // Also add to body to ensure all messages are affected

            // Additional direct DOM manipulation to hide any <think> tags
            const messageParagraphs = messagesContainer.querySelectorAll('p');
            messageParagraphs.forEach(p => {
                // Check for raw <think> tags
                if (p.textContent.includes('<think>') && p.textContent.includes('</think>')) {
                    p.style.display = 'none';
                }

                // Check for escaped &lt;think&gt; tags
                if (p.innerHTML.includes('&lt;think&gt;') && p.innerHTML.includes('&lt;/think&gt;')) {
                    p.style.display = 'none';
                }
            });

            // Also remove any visible think tags
            removeVisibleThinkTags();
        } else {
            messagesContainer.classList.remove('hide-thinking');
            document.body.classList.remove('hide-thinking');

            // Reset visibility of paragraphs
            const messageParagraphs = messagesContainer.querySelectorAll('p');
            messageParagraphs.forEach(p => {
                p.style.removeProperty('display');
            });

            // Special handling for non-reasoning models
            // Find all non-reasoning model messages and ensure they don't show thinking text
            const nonReasoningMessages = messagesContainer.querySelectorAll('.ai[data-has-thinking="false"]');
            nonReasoningMessages.forEach(messageEl => {
                if (messageEl.originalContent) {
                    // Re-apply basic sanitization to ensure no thinking text is displayed
                    messageEl.innerHTML = basicSanitizeInput(messageEl.originalContent);
                    initializeCodeMirror(messageEl);
                }
            });

            // Refresh messages to restore original content for reasoning models
            const reasoningMessages = messagesContainer.querySelectorAll('.ai[data-has-thinking="true"]');
            reasoningMessages.forEach(messageEl => {
                if (messageEl.originalContent) {
                    messageEl.innerHTML = sanitizeInput(messageEl.originalContent);
                    initializeCodeMirror(messageEl);
                }
            });
        }
    }
}

/**
 * Refreshes all messages to apply current settings
 */
export function refreshAllMessages() {
    if (!messagesContainer) return;

    const aiMessages = messagesContainer.querySelectorAll('.ai');
    aiMessages.forEach(messageEl => {
        if (messageEl.originalContent) {
            // If we saved the original content, re-sanitize it based on content type
            const originalContent = messageEl.originalContent;

            // Check if message is from a reasoning model (has thinking tags)
            const hasThinkTags = originalContent.includes('<think>') || originalContent.includes('</think>');

            // Update the dataset attribute to consistently mark reasoning vs non-reasoning messages
            messageEl.dataset.hasThinking = hasThinkTags ? 'true' : 'false';

            if (hasThinkTags) {
                // For reasoning models, use full sanitization with think tag processing
                messageEl.innerHTML = sanitizeInput(originalContent);
            } else {
                // For non-reasoning models, use basic sanitization (no thinking tag processing)
                // This ensures non-reasoning models never show thinking text
                messageEl.innerHTML = basicSanitizeInput(originalContent);
            }

            initializeCodeMirror(messageEl);
        }
    });
}

/**
 * Removes visible think tags from messages
 */
export function removeVisibleThinkTags() {
    if (!messagesContainer) return;

    // First, handle all AI messages based on whether they're from reasoning or non-reasoning models
    const aiMessages = messagesContainer.querySelectorAll('.ai');
    aiMessages.forEach(messageEl => {
        // For non-reasoning models, make sure no thinking text is shown
        if (messageEl.dataset.hasThinking === 'false' && messageEl.originalContent) {
            // Re-apply basic sanitization to ensure no thinking text is displayed
            messageEl.innerHTML = basicSanitizeInput(messageEl.originalContent);
            initializeCodeMirror(messageEl);
        }
    });

    // Then handle any raw think tags that might be visible
    const allParagraphs = messagesContainer.querySelectorAll('p');
    allParagraphs.forEach(p => {
        // Check if paragraph contains raw think tags
        if (p.innerHTML.includes('&lt;think&gt;') && p.innerHTML.includes('&lt;/think&gt;')) {
            // Extract the text and remove the think tags and their content
            let content = p.innerHTML;
            content = content.replace(/&lt;think&gt;[\s\S]*?&lt;\/think&gt;/g, '');
            p.innerHTML = content;
        }

        // In case the literal tags got through
        if (p.innerHTML.includes('<think>') && p.innerHTML.includes('</think>')) {
            let content = p.innerHTML;
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '');
            p.innerHTML = content;
        }
    });
}

/**
 * Ensures the welcome message is properly positioned
 */
export function ensureWelcomeMessagePosition() {
    if (welcomeMessage) {
        // Force a reflow to ensure proper positioning
        void welcomeMessage.offsetWidth;

        // Make sure welcome message is visible
        welcomeMessage.style.display = 'flex';
        welcomeMessage.style.visibility = 'visible';
        welcomeMessage.style.opacity = '1';
    }
}

// Long-press handling functions
function handleTouchStart(e) {
    startLongPress(e);
}

function handleTouchEnd(e) {
    clearLongPress();
}

function handleTouchMove(e) {
    clearLongPress();
}

function handleMouseDown(e) {
    startLongPress(e);
}

function handleMouseUp(e) {
    clearLongPress();
}

function handleMouseLeave(e) {
    clearLongPress();
}

function startLongPress(e) {
    clearLongPress();
    longPressTimer = setTimeout(() => {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            selectedText = selection.toString();
            selectedMessageElement = e.currentTarget;
            showContextMenu(e);
        }
    }, 500); // 500ms for long-press
}

function clearLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function showContextMenu(e) {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        const rect = e.target.getBoundingClientRect();
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        e.preventDefault();
    }
}

/**
 * Gets the selected text from long-press
 * @returns {string} - The selected text
 */
export function getSelectedText() {
    return selectedText;
}

/**
 * Gets the selected message element from long-press
 * @returns {HTMLElement} - The selected message element
 */
export function getSelectedMessageElement() {
    return selectedMessageElement;
}
