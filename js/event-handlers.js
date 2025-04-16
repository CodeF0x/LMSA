// Event Handlers for the application
import {
    chatForm, userInput, clearChatButton, newChatButton, settingsButton,
    closeSettingsButton, settingsModal, welcomeMessage, messagesContainer,
    sidebarToggle, closeSidebarButton, confirmActionButton, cancelActionButton,
    helpButton, helpIconButton, aboutButton, stopButton, contextMenu, copyTextButton,
    regenerateTextButton, exitButton, refreshButton, modelToggleButton, loadedModelDisplay
} from './dom-elements.js';
import {
    showWelcomeMessage, hideWelcomeMessage, toggleSidebar, showLoadingIndicator,
    hideLoadingIndicator, toggleSendStopButton, hideConfirmationModal, showConfirmationModal,
    getSelectedText, getSelectedMessageElement, appendMessage
} from './ui-manager.js';
import {
    generateAIResponse, clearAllChats, createNewChat, deleteChatHistory,
    getChatToDelete, abortGeneration
} from './chat-service.js';
import { fetchAvailableModels, isServerRunning, getAvailableModels } from './api-service.js';
import { closeApplication, copyToClipboard } from './utils.js';
import { resetUploadedFiles, getUploadedFiles, uploadFilesToLMStudio } from './file-upload.js';
import { setActionToPerform, getActionToPerform } from './shared-state.js';

let isFirstMessage = true;
let abortController = null;
let sidebar = document.getElementById('sidebar');

/**
 * Initializes all event handlers
 */
export function initializeEventHandlers() {
    // Chat form submission
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatFormSubmit);
    }

    // Clear chat button
    if (clearChatButton) {
        clearChatButton.addEventListener('click', () => {
            setActionToPerform('clearAllChats');
            showConfirmationModal('Are you sure you want to clear all chats? This action cannot be undone.');
        });
    }

    // New chat button
    if (newChatButton) {
        newChatButton.addEventListener('click', createNewChat);
    }

    // Settings button
    if (settingsButton) {
        settingsButton.addEventListener('click', handleSettingsButtonClick);
    }

    // Close settings button
    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', handleCloseSettingsButtonClick);
    }

    // Close settings modal when clicking outside
    if (settingsModal) {
        settingsModal.addEventListener('click', handleSettingsModalOutsideClick);

        // Close settings modal with Escape key
        document.addEventListener('keydown', handleEscapeKeyPress);
    }

    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Close sidebar button
    if (closeSidebarButton) {
        closeSidebarButton.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking outside on mobile - only for non-input elements
    document.addEventListener('click', function(e) {
        // Skip this event handler if the target is an input, textarea, or form control
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' || 
            e.target.tagName === 'SELECT' ||
            e.target.closest('form') !== null) {
            return;
        }
        
        handleSidebarOutsideClick(e);
    });

    // Handle window resize
    window.addEventListener('resize', handleWindowResize);

    // Confirmation action button
    if (confirmActionButton) {
        confirmActionButton.addEventListener('click', handleConfirmAction);
    }

    // Cancel action button
    if (cancelActionButton) {
        cancelActionButton.addEventListener('click', hideConfirmationModal);
    }

    // Help button
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            const helpModal = document.getElementById('help-modal');
            if (helpModal) helpModal.classList.remove('hidden');
        });
    }

    // Help icon button
    if (helpIconButton) {
        helpIconButton.addEventListener('click', () => {
            const helpModal = document.getElementById('help-modal');
            if (helpModal) helpModal.classList.remove('hidden');
        });
    }

    // About button
    if (aboutButton) {
        aboutButton.addEventListener('click', () => {
            const aboutModal = document.getElementById('about-modal');
            if (aboutModal) aboutModal.classList.remove('hidden');
        });
    }

    // Options button for mobile view
    const optionsBtn = document.getElementById('options-btn');
    const optionsContainer = document.getElementById('options-container');
    if (optionsBtn && optionsContainer) {
        optionsBtn.addEventListener('click', handleOptionsButtonClick);
    }

    // Stop button
    if (stopButton) {
        stopButton.addEventListener('click', abortGeneration);
    }

    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    // Copy text button
    if (copyTextButton) {
        copyTextButton.addEventListener('click', handleCopyText);
    }

    // Regenerate text button
    if (regenerateTextButton) {
        regenerateTextButton.addEventListener('click', handleRegenerateText);
    }

    // Exit button
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            setActionToPerform('exit');
            showConfirmationModal('Are you sure you want to exit the application?');
        });
    }

    // Refresh button
    if (refreshButton) {
        refreshButton.addEventListener('click', handleRefreshButtonClick);
    }

    // Model toggle button
    if (modelToggleButton) {
        modelToggleButton.addEventListener('click', handleModelToggleButtonClick);
    }
}

/**
 * Handles chat form submission
 * @param {Event} e - The form submission event
 */
async function handleChatFormSubmit(e) {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    hideWelcomeMessage();

    // Process local files if any
    let fileContents = [];
    let processedMessage = message;
    const uploadedFiles = getUploadedFiles();

    if (uploadedFiles.length > 0) {
        appendMessage('user', `${message}`);
        showLoadingIndicator();
        fileContents = await uploadFilesToLMStudio(uploadedFiles);
        hideLoadingIndicator();

        // Reset uploaded files after processing
        resetUploadedFiles();

        if (!fileContents) {
            return; // Error already displayed
        }

        console.log('Processed files:', fileContents.length);
    } else {
        appendMessage('user', message);
    }

    userInput.value = '';
    showLoadingIndicator();
    toggleSendStopButton();

    // Hide the loaded model display after first message
    if (isFirstMessage) {
        if (loadedModelDisplay) {
            loadedModelDisplay.classList.add('hidden');
        }
        isFirstMessage = false;
    }

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

        await generateAIResponse(message, fileContents);
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
 * Handles settings button click
 */
function handleSettingsButtonClick() {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }

    // Ensure the welcome message is hidden when settings modal is shown
    if (welcomeMessage && welcomeMessage.style.display !== 'none') {
        welcomeMessage.style.opacity = '0';
        welcomeMessage.style.visibility = 'hidden';
    }

    // Show the settings modal
    settingsModal.classList.remove('hidden');
    settingsModal.style.display = 'flex';
    settingsModal.style.opacity = '1';
    settingsModal.style.visibility = 'visible';
    settingsModal.style.pointerEvents = 'auto';

    const modalContent = settingsModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.add('animate-modal-in');
        modalContent.style.pointerEvents = 'auto';
        setTimeout(() => {
            modalContent.classList.remove('animate-modal-in');
        }, 300);
    }
}

/**
 * Handles close settings button click
 */
function handleCloseSettingsButtonClick() {
    const modalContent = settingsModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.add('animate-modal-out');
        settingsModal.style.opacity = '0';
        settingsModal.style.pointerEvents = 'none';
        setTimeout(() => {
            settingsModal.classList.add('hidden');
            settingsModal.style.display = 'none';
            modalContent.classList.remove('animate-modal-out');
        }, 300);
    } else {
        settingsModal.classList.add('hidden');
        settingsModal.style.display = 'none';
        settingsModal.style.opacity = '0';
        settingsModal.style.pointerEvents = 'none';
    }

    // If there are no messages, show the welcome message again
    if (messagesContainer && messagesContainer.children.length === 0) {
        showWelcomeMessage();
    }
}

/**
 * Handles settings modal outside click
 * @param {Event} e - The click event
 */
function handleSettingsModalOutsideClick(e) {
    if (e.target === settingsModal) {
        const modalContent = settingsModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.add('animate-modal-out');
            settingsModal.style.opacity = '0';
            settingsModal.style.pointerEvents = 'none';
            setTimeout(() => {
                settingsModal.classList.add('hidden');
                settingsModal.style.display = 'none';
                modalContent.classList.remove('animate-modal-out');
            }, 300);
        } else {
            settingsModal.classList.add('hidden');
            settingsModal.style.display = 'none';
            settingsModal.style.opacity = '0';
            settingsModal.style.pointerEvents = 'none';
        }

        // If there are no messages, show the welcome message again
        if (messagesContainer && messagesContainer.children.length === 0) {
            showWelcomeMessage();
        }
    }
}

/**
 * Handles escape key press
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleEscapeKeyPress(e) {
    if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
        const modalContent = settingsModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.add('animate-modal-out');
            settingsModal.style.opacity = '0';
            settingsModal.style.pointerEvents = 'none';
            setTimeout(() => {
                settingsModal.classList.add('hidden');
                settingsModal.style.display = 'none';
                modalContent.classList.remove('animate-modal-out');
            }, 300);
        } else {
            settingsModal.classList.add('hidden');
            settingsModal.style.display = 'none';
            settingsModal.style.opacity = '0';
            settingsModal.style.pointerEvents = 'none';
        }

        // If there are no messages, show the welcome message again
        if (messagesContainer && messagesContainer.children.length === 0) {
            showWelcomeMessage();
        }
    }
}

/**
 * Handles clicking outside the sidebar
 * @param {Event} e - The click event
 */
function handleSidebarOutsideClick(e) {
    if (window.innerWidth <= 768 &&
        sidebar &&
        !sidebar.classList.contains('hidden') &&
        !e.target.closest('#sidebar') &&
        !e.target.closest('#sidebar-toggle') &&
        !e.target.closest('#user-input') &&
        !e.target.closest('#chat-form') &&
        !e.target.closest('#messages') &&
        !e.target.closest('#chat-container') &&
        !e.target.closest('#model-toggle-button') &&
        !e.target.closest('#refresh-button') &&
        !e.target.closest('.app-title') &&
        !e.target.closest('header')) {
        toggleSidebar();
    }
}

/**
 * Handles window resize
 */
function handleWindowResize() {
    if (window.innerWidth > 768) {
        if (sidebar) {
            sidebar.classList.remove('hidden');
            sidebar.classList.remove('active');
        }
        document.body.classList.remove('sidebar-open');
    } else {
        if (sidebar) sidebar.classList.add('hidden');
    }
}

/**
 * Handles confirmation action button click
 */
function handleConfirmAction() {
    const action = getActionToPerform();
    if (action === 'clearAllChats') {
        clearAllChats();
    } else if (action === 'deleteChat') {
        deleteChatHistory(getChatToDelete());
    } else if (action === 'exit') {
        closeApplication();
    }
    hideConfirmationModal();
}

/**
 * Handles options button click
 */
function handleOptionsButtonClick() {
    const optionsContainer = document.getElementById('options-container');
    if (optionsContainer.classList.contains('animate-fade-in')) {
        optionsContainer.classList.remove('animate-fade-in');
        // Add a small delay before adding the hidden class
        setTimeout(() => {
            optionsContainer.classList.add('hidden');
        }, 300); // Match the transition duration
    } else {
        optionsContainer.classList.remove('hidden');
        // Small delay to ensure the hidden class is fully removed
        setTimeout(() => {
            optionsContainer.classList.add('animate-fade-in');
        }, 10);
    }
}

/**
 * Handles copy text button click
 */
function handleCopyText() {
    const selectedText = getSelectedText();
    if (selectedText) {
        copyToClipboard(selectedText).then(() => {
            console.log('Text copied to clipboard');
            contextMenu.style.display = 'none';
        }).catch(err => {
            console.error('Error copying text: ', err);
        });
    }
}

/**
 * Handles regenerate text button click
 */
async function handleRegenerateText() {
    const selectedMessageElement = getSelectedMessageElement();
    if (selectedMessageElement) {
        const messageIndex = Array.from(messagesContainer.children).indexOf(selectedMessageElement);
        if (messageIndex !== -1) {
            // Remove this message and all subsequent messages
            while (messagesContainer.children.length > messageIndex) {
                messagesContainer.removeChild(messagesContainer.firstChild);
            }

            // Remove corresponding messages from chatHistoryData
            chatHistoryData[currentChatId] = chatHistoryData[currentChatId].slice(0, messageIndex * 2);

            // Get the last user message
            const lastUserMessage = chatHistoryData[currentChatId][chatHistoryData[currentChatId].length - 1];

            // Regenerate the AI response
            contextMenu.style.display = 'none';
            await generateAIResponse(lastUserMessage.content);
        }
    }
}

/**
 * Handles refresh button click
 */
function handleRefreshButtonClick() {
    console.log('Refresh button clicked');
    // Add visual feedback
    refreshButton.classList.add('animate-spin');
    // Disable the button to prevent multiple clicks
    refreshButton.disabled = true;

    // Perform a full page refresh, equivalent to browser refresh
    window.location.reload();
}

/**
 * Handles model toggle button click
 */
function handleModelToggleButtonClick() {
    console.log('Model toggle button clicked');
    if (loadedModelDisplay) {
        loadedModelDisplay.classList.toggle('hidden');
        console.log('Model display visibility toggled:', !loadedModelDisplay.classList.contains('hidden'));
    }
}


