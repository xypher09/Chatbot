/**
 * Parses text for Markdown links and raw URLs, converting them to HTML anchor tags
 * @param {string} text - The text to parse
 * @returns {string} The text with HTML links
 */
function parseAndLinkify(text) {
    // Match Markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    
    // Match raw URLs (but avoid double-linking already processed URLs)
    const rawUrlRegex = /(?<!href=")(https?:\/\/[^\s<>"]+)/g;
    
    return text
        .replace(
            markdownLinkRegex,
            '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">$1</a>'
        )
        .replace(
            rawUrlRegex,
            '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">$1</a>'
        );
}

// Make globally available
window.parseAndLinkify = parseAndLinkify;