import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateArticleWithGemini(
  apiKey: string,
  topic: string,
  additionalContext?: string
): Promise<{ title: string; content: string; hashtags: string[] }> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a professional blog writer. Write a comprehensive, engaging blog article about: "${topic}"

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- The article must be at least 800 words
- Write in a clear, engaging, professional style
- Use proper paragraphs with natural flow
- DO NOT use any markdown syntax (no **, __, ##, ---, ***, etc.)
- DO NOT use bullet points or numbered lists with markdown
- Write everything as flowing prose with proper paragraphs
- Use natural paragraph breaks for readability
- Include a compelling introduction and conclusion
- Make it informative and valuable to readers
- Write in plain text format only

CRITICAL: Output ONLY clean, well-formatted text. No markdown symbols whatsoever.

Format your response as JSON:
{
  "title": "Article Title Here",
  "content": "Full article content as clean text with proper paragraphs...",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean the text: remove code blocks, control characters, and extra whitespace
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
    text = text.trim();
    
    // Try to parse JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || topic,
          content: parsed.content || text,
          hashtags: parsed.hashtags || []
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // If JSON parsing fails, return the raw text
        return {
          title: topic,
          content: text,
          hashtags: []
        };
      }
    }
    
    // Fallback if JSON parsing fails
    return {
      title: topic,
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