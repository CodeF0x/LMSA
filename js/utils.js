// Utility functions

/**
 * Sanitizes input for non-reasoning models
 * @param {string} input - The input text to sanitize
 * @returns {string} - Sanitized HTML
 */
export function basicSanitizeInput(input) {
    // Escape HTML for XSS prevention
    const div = document.createElement('div');
    div.textContent = input;
    let sanitized = div.innerHTML;

    // Handle code blocks with language specification
    sanitized = sanitized.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        return `<pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>`;
    });

    // Handle inline code
    sanitized = sanitized.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Handle headers
    sanitized = sanitized.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    sanitized = sanitized.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    sanitized = sanitized.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Handle lists
    sanitized = sanitized.replace(/^\* (.+)$/gm, '<li>$1</li>');
    sanitized = sanitized.replace(/^- (.+)$/gm, '<li>$1</li>');
    sanitized = sanitized.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap lists in appropriate containers
    sanitized = sanitized.replace(/(<li>.*?<\/li>\n*)+/g, '<ul>$&</ul>');

    // Handle emphasis and strong
    sanitized = sanitized.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    sanitized = sanitized.replace(/\*(.+?)\*/g, '<em>$1</em>');
    sanitized = sanitized.replace(/_(.+?)_/g, '<em>$1</em>');

    // Handle links
    sanitized = sanitized.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300">$1</a>');

    // Handle paragraphs
    sanitized = sanitized.replace(/\n\n/g, '</p><p>');
    sanitized = '<p>' + sanitized + '</p>';

    return sanitized;
}

/**
 * Sanitizes input with thinking tag processing
 * @param {string} input - The input text to sanitize
 * @returns {string} - Sanitized HTML with thinking tags processed
 */
export function sanitizeInput(input) {
    // First extract all <think> tag contents before any HTML escaping
    let processedInput = input;
    const thinkMatches = [];
    let hasThinkTag = false;

    // Find all <think> sections and store them
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    let match;
    while ((match = thinkRegex.exec(processedInput)) !== null) {
        thinkMatches.push({
            fullMatch: match[0],
            content: match[1]
        });
        hasThinkTag = true;
    }

    // Now escape HTML for XSS prevention
    const div = document.createElement('div');
    div.textContent = processedInput;
    let sanitized = div.innerHTML;

    // Replace the escaped <think> tags with properly formatted HTML
    thinkMatches.forEach(match => {
        const escapedMatch = match.fullMatch.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        sanitized = sanitized.replace(escapedMatch, `<div class="think">
            <div class="reasoning-intro">
                <i class="fas fa-brain"></i>
                Reasoning Process
                <span class="reasoning-toggle" title="Toggle visibility">[<span class="toggle-text">Hide</span>]</span>
            </div>
            <div class="reasoning-content">
                ${match.content.split('\n\n').map(paragraph => {
                    if (!paragraph.trim()) return '';
                    return `<div class="reasoning-step">${paragraph.trim()}</div>`;
                }).join('')}
            </div>
        </div>`);
    });

    // If we didn't replace any think tags but they exist in the text,
    // mark the output with a special class for CSS targeting
    if (hasThinkTag && thinkMatches.length === 0) {
        sanitized = `<div class="contains-think-tag">${sanitized}</div>`;
    }

    // Handle thinking sections (legacy format)
    sanitized = sanitized.replace(/Let's approach this step by step:\n/g, '<div class="think"><div class="reasoning-intro">Let\'s approach this step by step:</div>');
    sanitized = sanitized.replace(/^(\d+\)\s*.*?)(?=\n\d+\)|$)/gm, '<div class="reasoning-step">$1</div>');

    // Handle code blocks with language specification
    sanitized = sanitized.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        return `<pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>`;
    });

    // Handle inline code
    sanitized = sanitized.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Handle headers
    sanitized = sanitized.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    sanitized = sanitized.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    sanitized = sanitized.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Handle lists
    sanitized = sanitized.replace(/^\* (.+)$/gm, '<li>$1</li>');
    sanitized = sanitized.replace(/^- (.+)$/gm, '<li>$1</li>');
    sanitized = sanitized.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap lists in appropriate containers
    sanitized = sanitized.replace(/(<li>.*?<\/li>\n*)+/g, '<ul>$&</ul>');

    // Handle emphasis and strong
    sanitized = sanitized.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    sanitized = sanitized.replace(/\*(.+?)\*/g, '<em>$1</em>');
    sanitized = sanitized.replace(/_(.+?)_/g, '<em>$1</em>');

    // Handle links
    sanitized = sanitized.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300">$1</a>');

    // Handle paragraphs
    sanitized = sanitized.replace(/\n\n/g, '</p><p>');
    sanitized = '<p>' + sanitized + '</p>';

    // Close thinking section div if it was opened
    if (sanitized.includes('think') && !sanitized.includes('reasoning-content')) {
        sanitized += '</div>';
    }

    return sanitized;
}

/**
 * Initializes CodeMirror for code blocks
 * @param {HTMLElement} element - The element containing code blocks
 */
export function initializeCodeMirror(element) {
    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach((block, index) => {
        const language = block.className.replace('language-', '');
        const codeMirrorContainer = document.createElement('div');
        codeMirrorContainer.className = 'code-mirror-container';
        block.parentNode.replaceWith(codeMirrorContainer);

        const editor = CodeMirror(codeMirrorContainer, {
            value: block.textContent,
            mode: language,
            theme: 'monokai',
            lineNumbers: true,
            readOnly: true,
        });

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-button';
        copyButton.addEventListener('click', () => copyToClipboard(editor.getValue()));
        codeMirrorContainer.appendChild(copyButton);
    });
}

/**
 * Copies text to clipboard
 * @param {string} text - The text to copy
 */
export function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Error copying text: ', err);
    });
}

/**
 * Scrolls to the bottom of the messages container
 * @param {HTMLElement} messagesContainer - The messages container element
 */
export function scrollToBottom(messagesContainer) {
    if (messagesContainer) messagesContainer.scrollTop = 0;
}

/**
 * Closes the application (for desktop app)
 */
export function closeApplication() {
    // Send a message to the main process to close the application
    if (window.electron) {
        window.electron.send('close-app');
    } else {
        console.log('Electron not available. Unable to close the application.');
        alert('This function is only available in the desktop application.');
    }
}
