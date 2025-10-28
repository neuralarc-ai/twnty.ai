// Function to format article content with proper paragraph structure
export function formatArticleContent(content: string): string {
  if (!content) return '';
  
  // Split content into paragraphs - try double line breaks first
  let blocks = content.split(/\n\s*\n/);
  
  // If we only have one block, split by single line breaks instead
  if (blocks.length === 1 && content.includes('\n')) {
    blocks = content.split(/\n/);
  }
  
  // Process each block into a paragraph with basic formatting
  const paragraphs = blocks
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => {
      // Clean up whitespace
      let formatted = para.replace(/\s+/g, ' ').trim();
      
      // Convert markdown-style formatting
      // **bold** to <strong>
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // __bold__ to <strong>
      formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
      // *italic* to <em> (careful with lookbehind to avoid conflicts)
      formatted = formatted.replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
      // _italic_ to <em>
      formatted = formatted.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, '$1<em>$2</em>$3');
      
      return `<p>${formatted}</p>`;
    });
  
  return paragraphs.join('\n');
}
