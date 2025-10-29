import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateArticleWithGemini(
  apiKey: string,
  topic: string,
  additionalContext?: string
): Promise<{ title: string; content: string; excerpt: string; hashtags: string[] }> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a professional blog writer. Write a comprehensive, engaging blog article about: "${topic}"

${additionalContext ? `Additional context: ${additionalContext}` : ''}

CRITICAL REQUIREMENTS - Generate HTML-formatted content:
- The article must be at least 800 words
- Write in a clear, engaging, professional style
- Format the content using ONLY HTML tags (no markdown, no plain text)
- Use proper HTML structure with semantic tags

HTML FORMATTING REQUIREMENTS:
1. Use <p> tags for all paragraphs (wrap each paragraph in <p></p>)
2. Use <h2> tags for major section headings (2-3 sections recommended)
3. Use <h3> tags for subsection headings
4. Use <strong> tags for emphasis and important points (use sparingly, 3-5 times)
5. Use <em> tags for subtle emphasis
6. Use <ul> and <li> for bullet lists when appropriate
7. Use <ol> and <li> for numbered lists when listing steps or items
8. Use <blockquote> for quotes or highlighted important statements

STRUCTURE REQUIREMENTS:
- Start with an engaging introduction (in <p> tags)
- Include 2-3 main sections with <h2> headings
- Each section should have 2-3 paragraphs with <p> tags
- Use <strong> to highlight 3-5 key points throughout the article
- Include at least one list (ul or ol) somewhere in the content
- Include a compelling conclusion (in <p> tags)
- Make it informative and valuable to readers

CRITICAL: Output ONLY valid HTML content wrapped in paragraph and heading tags.

IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON object.

Response format:
{
  "title": "Write an engaging article title here (no quotes in the title)",
  "excerpt": "Write a compelling 150-200 word summary here that captures the essence of your article. This excerpt should be engaging, informative, and make readers want to read more. Do not include HTML tags in the excerpt - use plain text only.",
  "content": "<p>First paragraph with engaging introduction...</p><h2>Main Section Title</h2><p>Content paragraph with <strong>important point</strong>...</p><ul><li>First item</li><li>Second item</li></ul>",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10", "hashtag11", "hashtag12", "hashtag13", "hashtag14", "hashtag15"]
}

IMPORTANT: Generate exactly 10-15 relevant hashtags for optimal SEO. These should be diverse, covering main topics, related concepts, and niche terms. Do not include the # symbol in hashtags.

Remember: The excerpt must be plain text (no HTML), while content must be HTML formatted.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('Raw Gemini Response:', text); // Debug log
    
    // Clean the text: remove code blocks, control characters, and extra whitespace
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
    text = text.trim();
    
    // Try to parse JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON from Gemini:', parsed); // Debug log
        
        // Generate excerpt if not provided
        let excerpt = parsed.excerpt;
        if (!excerpt && parsed.content) {
          // Strip HTML from content to create excerpt
          const plainText = parsed.content.replace(/<[^>]*>/g, '');
          excerpt = plainText.substring(0, 200);
          if (plainText.length > 200) {
            excerpt += '...';
          }
        }
        
        const finalResult = {
          title: parsed.title || topic,
          excerpt: excerpt || '',
          content: parsed.content || text,
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : []
        };
        
        console.log('Returning result:', finalResult); // Debug log
        return finalResult;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // If JSON parsing fails, return the raw text
        return {
          title: topic,
          excerpt: text.substring(0, 200) + '...',
          content: text,
          hashtags: []
        };
      }
    }
    
    // Fallback if JSON parsing fails
    return {
      title: topic,
      excerpt: text.substring(0, 200) + '...',
      content: text,
      hashtags: []
    };
  } catch (error) {
    console.error('Error generating article with Gemini:', error);
    throw new Error('Failed to generate article. Please check your API key and try again.');
  }
}

export async function generateHashtags(apiKey: string, content: string): Promise<string[]> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Generate 5 relevant hashtags for SEO optimization based on this content. Return only the hashtags as a JSON array, without the # symbol.

Content: ${content.substring(0, 500)}...

Format: ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating hashtags:', error);
    return [];
  }
}