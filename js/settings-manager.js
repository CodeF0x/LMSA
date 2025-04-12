// Settings Manager for handling application settings
import { systemPromptInput, hideThinkingCheckbox } from './dom-elements.js';
import { applyThinkingVisibility, refreshAllMessages } from './ui-manager.js';

let systemPrompt = '';
let temperature = 0.9;
let hideThinking = false;

/**
 * Initializes temperature settings
 */
export function initializeTemperature() {
    const temperatureInput = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const temperatureLock = document.getElementById('temperature-lock');

    if (temperatureInput && temperatureValue && temperatureLock) {
        temperatureInput.addEventListener('input', () => {
            const inputValue = temperatureInput.value;
            const parsedValue = parseFloat(inputValue);

            if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 2.0 && /^\d*\.?\d{0,1}$/.test(inputValue)) {
                temperature = parsedValue;
                temperatureValue.textContent = temperature.toFixed(1);
                localStorage.setItem('temperature', temperature);
            } else {
                temperatureInput.value = temperature.toFixed(1);
            }
        });

        temperatureLock.addEventListener('click', () => {
            const isLocked = temperatureInput.disabled;
            temperatureInput.disabled = !isLocked;
            temperatureLock.innerHTML = isLocked ? '<i class="fas fa-unlock"></i>' : '<i class="fas fa-lock"></i>';
        });

        // Load saved temperature
        const savedTemperature = localStorage.getItem('temperature');
        if (savedTemperature) {
            const parsedTemperature = parseFloat(savedTemperature);
            if (!isNaN(parsedTemperature) && parsedTemperature >= 0 && parsedTemperature <= 2.0) {
                temperatureInput.value = parsedTemperature.toFixed(1);
                temperature = parsedTemperature;
                temperatureValue.textContent = temperature.toFixed(1);
            } else {
                // If saved temperature is invalid, set to default
                temperatureInput.value = '0.9';
                temperature = 0.9;
                temperatureValue.textContent = '0.9';
            }
        } else {
            // Set default temperature to 0.9
            temperatureInput.value = '0.9';
            temperature = 0.9;
            temperatureValue.textContent = '0.9';
        }
    }
}

/**
 * Initializes system prompt settings
 */
export function initializeSystemPrompt() {
    if (systemPromptInput) {
        systemPromptInput.addEventListener('change', () => {
            systemPrompt = systemPromptInput.value;
            localStorage.setItem('systemPrompt', systemPrompt);
        });
        
        // Load saved system prompt
        const savedPrompt = localStorage.getItem('systemPrompt');
        if (savedPrompt) {
            systemPromptInput.value = savedPrompt;
            systemPrompt = savedPrompt;
        }
    }
}

/**
 * Loads the hide thinking setting from localStorage
 */
export function loadHideThinkingSetting() {
    if (hideThinkingCheckbox) {
        const savedHideThinking = localStorage.getItem('hideThinking');
        if (savedHideThinking === 'true') {
            hideThinkingCheckbox.checked = true;
            hideThinking = true;
        } else {
            hideThinkingCheckbox.checked = false;
            hideThinking = false;
        }
        applyThinkingVisibility();

        // After loading settings, ensure removal of any visible think tags
        if (hideThinking) {
            setTimeout(() => {
                removeVisibleThinkTags();
            }, 100);
        }

        // Add event listener for the checkbox
        hideThinkingCheckbox.addEventListener('change', saveHideThinkingSetting);
    }
}

/**
 * Saves the hide thinking setting to localStorage
 */
export function saveHideThinkingSetting() {
    if (hideThinkingCheckbox) {
        hideThinking = hideThinkingCheckbox.checked;
        localStorage.setItem('hideThinking', hideThinking);
        applyThinkingVisibility();
        refreshAllMessages(); // Refresh all messages when setting changes

        if (hideThinking) {
            removeVisibleThinkTags(); // Remove any visible think tags
        }
    }
}

/**
 * Removes visible think tags from messages
 */
export function removeVisibleThinkTags() {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;

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
 * Loads all settings
 */
export function loadSettings() {
    initializeSystemPrompt();
    initializeTemperature();
    loadHideThinkingSetting();
}

/**
 * Gets the current system prompt
 * @returns {string} - The current system prompt
 */
export function getSystemPrompt() {
    return systemPrompt;
}

/**
 * Gets the current temperature setting
 * @returns {number} - The current temperature value
 */
export function getTemperature() {
    return temperature;
}

/**
 * Gets the current hide thinking setting
 * @returns {boolean} - The current hide thinking value
 */
export function getHideThinking() {
    return hideThinking;
}
