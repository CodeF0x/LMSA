// Main entry point for the application
import { loadServerSettings, fetchAvailableModels } from './api-service.js';
import { loadSettings } from './settings-manager.js';
import { loadChatHistory } from './chat-service.js';
import { initializeFileUpload } from './file-upload.js';
import { initializeEventHandlers } from './event-handlers.js';
import { hideLoadingIndicatorOnLoad, ensureWelcomeMessagePosition } from './ui-manager.js';
import { initializeTouchHandlers } from './touch-handlers.js';

/**
 * Initializes the application
 */
function initializeApp() {
    console.log('Starting LMSA...');

    // Ensure settings modal is hidden on startup
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.classList.add('hidden');
        settingsModal.style.display = 'none';
        settingsModal.style.opacity = '0';
        settingsModal.style.visibility = 'hidden';
    }

    // Load settings and initialize components
    loadServerSettings(); // This will also fetch available models
    loadSettings();
    loadChatHistory();
    initializeFileUpload();
    hideLoadingIndicatorOnLoad();
    ensureWelcomeMessagePosition();

    // Initialize event handlers
    initializeEventHandlers();

    // Initialize touch handlers
    initializeTouchHandlers();

    // Add window resize event listener to ensure welcome message is properly positioned
    window.addEventListener('resize', () => {
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage && welcomeMessage.style.display === 'flex') {
            ensureWelcomeMessagePosition();
        }
    });

    // Add event listener to hide loading indicator when the page loads
    window.addEventListener('load', hideLoadingIndicatorOnLoad);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
