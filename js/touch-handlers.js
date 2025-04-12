// Touch event handlers for mobile devices
import { messagesContainer, userInput } from './dom-elements.js';

/**
 * Initializes touch event handlers
 */
export function initializeTouchHandlers() {
    // Prevent default touch behavior except for the messages container and user input
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('#messages') === null && 
            e.target.closest('#user-input') === null && 
            e.target.closest('#chat-form') === null) {
            e.preventDefault();
        }
    }, { passive: false });

    // Allow scrolling within the messages container
    if (messagesContainer) {
        messagesContainer.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, { passive: true });
    }

    // Prevent sidebar toggle when interacting with chat input
    if (userInput) {
        userInput.addEventListener('focus', function(e) {
            e.stopPropagation();
        });
        
        userInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        userInput.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        });
    }
}
