/**
 * Parses text for Markdown links and raw URLs, converting them to HTML anchor tags
 * @param text - The text to parse
 * @returns The text with HTML links
 */
export function parseAndLinkify(text: string): string {
  // Match Markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  
  // Match raw URLs (but avoid double-linking already processed URLs)
  const rawUrlRegex = /(?<!href=")(https?:\/\/[^\s<>"]+)/g;
  
  return text
    .replace(
      markdownLinkRegex,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>'
    )
    .replace(
      rawUrlRegex,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>'
    );
}