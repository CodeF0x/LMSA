// File Upload functionality
import { fileUploadButton, fileUploadInput } from './dom-elements.js';
import { appendMessage } from './ui-manager.js';

let uploadedFiles = [];
let uploadedFileIds = []; // Track uploaded file IDs for API requests

/**
 * Initializes file upload functionality
 */
export function initializeFileUpload() {
    if (fileUploadButton && fileUploadInput) {
        fileUploadButton.addEventListener('click', () => {
            fileUploadInput.click();
        });

        fileUploadInput.addEventListener('change', handleFileSelection);
    }
}

/**
 * Handles file selection from the file input
 * @param {Event} event - The change event from the file input
 */
function handleFileSelection(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Define allowed file extensions
    const allowedExtensions = [
        '.txt', '.pdf', '.json', '.csv', '.tsv', '.xml', '.html', '.log', '.md',
        '.yaml', '.yml', '.jsonl', '.jsonlines', '.c', '.cpp', '.h', '.hpp', '.py',
        '.js', '.ts', '.jsx', '.tsx', '.sh', '.ps1', '.docx'
    ];

    // Filter files to only include allowed types
    const validFiles = Array.from(files).filter(file => {
        const fileName = file.name.toLowerCase();
        return allowedExtensions.some(ext => fileName.endsWith(ext));
    });

    if (validFiles.length === 0) {
        appendMessage('error', 'No valid files selected. Please upload files with the following extensions: ' + allowedExtensions.join(', '));
        return;
    }

    if (validFiles.length < files.length) {
        appendMessage('warning', 'Some files were skipped because they are not supported.');
    }

    uploadedFiles = validFiles;

    // Create visual file preview indicators
    const filePreviewContainer = document.createElement('div');
    filePreviewContainer.className = 'file-previews flex flex-wrap gap-2 mt-2 mb-2';

    uploadedFiles.forEach(file => {
        const filePreview = document.createElement('div');
        filePreview.className = 'file-preview';

        // Choose icon based on file type
        let iconClass = 'fa-file';
        if (file.type.includes('image')) iconClass = 'fa-file-image';
        else if (file.type.includes('text')) iconClass = 'fa-file-alt';
        else if (file.type.includes('pdf')) iconClass = 'fa-file-pdf';

        filePreview.innerHTML = `
            <i class="fas ${iconClass}"></i>
            ${file.name}
        `;

        filePreviewContainer.appendChild(filePreview);
    });

    // Display the file previews before the form
    const chatForm = document.getElementById('chat-form');
    const filePreviewsExisting = document.querySelector('.file-previews');

    if (filePreviewsExisting) {
        filePreviewsExisting.parentNode.removeChild(filePreviewsExisting);
    }

    chatForm.parentNode.insertBefore(filePreviewContainer, chatForm);

    // Update the input field
    let fileNames = uploadedFiles.map(file => file.name).join(', ');
    const userInput = document.getElementById('user-input');
    if (userInput.value.trim() === '') {
        userInput.value = ``;
    }

    // Focus the input field for additional text
    userInput.focus();
}

/**
 * Processes uploaded files for sending to the LM Studio server
 * @param {File[]} files - Array of File objects to process
 * @returns {Promise<Object[]>} - Array of processed file objects with content
 */
export async function uploadFilesToLMStudio(files) {
    try {
        // Instead of uploading to server, we'll read files locally and create base64 content
        const fileContentsPromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // For text files, just get the content directly
                    // For binary files, use base64 encoding
                    if (file.type.includes('text')) {
                        resolve({
                            name: file.name,
                            type: file.type,
                            content: e.target.result,
                            isText: true
                        });
                    } else {
                        // For images and other binary files, we want the full data URL
                        resolve({
                            name: file.name,
                            type: file.type,
                            content: e.target.result,
                            isText: false
                        });
                    }
                };
                reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));

                if (file.type.includes('text')) {
                    reader.readAsText(file);
                } else {
                    reader.readAsDataURL(file);
                }
            });
        });

        const fileContents = await Promise.all(fileContentsPromises);
        console.log('Files processed locally:', fileContents.map(f => f.name));
        return fileContents;
    } catch (error) {
        console.error('Error processing files:', error);
        appendMessage('error', 'Failed to process files.');
        return null;
    }
}

/**
 * Resets uploaded files
 */
export function resetUploadedFiles() {
    uploadedFiles = [];
    uploadedFileIds = [];
    if (fileUploadInput) {
        fileUploadInput.value = '';
    }
    const filePreviewsExisting = document.querySelector('.file-previews');
    if (filePreviewsExisting) {
        filePreviewsExisting.parentNode.removeChild(filePreviewsExisting);
    }
}

/**
 * Gets the currently uploaded files
 * @returns {File[]} - Array of uploaded File objects
 */
export function getUploadedFiles() {
    return uploadedFiles;
}

/**
 * Gets the uploaded file IDs
 * @returns {string[]} - Array of uploaded file IDs
 */
export function getUploadedFileIds() {
    return uploadedFileIds;
}
