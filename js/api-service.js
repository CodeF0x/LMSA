// API Service for handling server communication
import { serverIpInput, serverPortInput, loadedModelDisplay } from './dom-elements.js';

let API_URL = '';
let availableModels = [];

/**
 * Updates the server URL based on IP and port inputs
 */
export function updateServerUrl() {
    const ip = serverIpInput.value.trim();
    const port = serverPortInput.value.trim();

    if (ip && port) {
        API_URL = `http://${ip}:${port}/v1/chat/completions`;
        localStorage.setItem('serverIp', ip);
        localStorage.setItem('serverPort', port);
        fetchAvailableModels();
    }
}

/**
 * Fetches available models from the server
 * @returns {Promise<string[]>} - Array of available model IDs
 */
export async function fetchAvailableModels() {
    try {
        if (!serverIpInput || !serverPortInput) return [];
        const response = await fetch(`http://${serverIpInput.value}:${serverPortInput.value}/v1/models`);
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        availableModels = data.data.map(model => model.id);
        console.log('Available models:', availableModels);
        if (availableModels.length > 0) {
            updateLoadedModelDisplay(availableModels[0]);
            // Ensure the model display is visible initially
            if (loadedModelDisplay) {
                loadedModelDisplay.classList.remove('hidden');
            }
        }
        return availableModels;
    } catch (error) {
        console.error('Error fetching models:', error);
        return [];
    }
}

/**
 * Updates the loaded model display
 * @param {string} modelName - The name of the loaded model
 */
export function updateLoadedModelDisplay(modelName) {
    if (loadedModelDisplay) {
        loadedModelDisplay.textContent = `Loaded Model: ${modelName}`;
        loadedModelDisplay.classList.remove('hidden');
    }
}

/**
 * Checks if the server is running
 * @returns {Promise<boolean>} - True if server is running, false otherwise
 */
export async function isServerRunning() {
    try {
        if (!serverIpInput || !serverPortInput) return false;
        const response = await fetch(`http://${serverIpInput.value}:${serverPortInput.value}/v1/models`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Gets the API URL
 * @returns {string} - The current API URL
 */
export function getApiUrl() {
    return API_URL;
}

/**
 * Gets the available models
 * @returns {string[]} - Array of available model IDs
 */
export function getAvailableModels() {
    return [...availableModels]; // Return a copy of the array
}

/**
 * Loads saved server settings from localStorage
 */
export function loadServerSettings() {
    const savedIp = localStorage.getItem('serverIp');
    const savedPort = localStorage.getItem('serverPort');

    if (serverIpInput && serverPortInput) {
        if (savedIp) serverIpInput.value = savedIp;
        if (savedPort) serverPortInput.value = savedPort;

        if (savedIp && savedPort) {
            API_URL = `http://${savedIp}:${savedPort}/v1/chat/completions`;
            // Fetch models after setting the API URL
            setTimeout(() => fetchAvailableModels(), 500);
        }

        // Add event listeners for IP and port inputs
        serverIpInput.addEventListener('change', updateServerUrl);
        serverPortInput.addEventListener('change', updateServerUrl);
    }
}
