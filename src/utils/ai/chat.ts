import { API_KEY, generateSystemInstruction } from './config';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export async function generateAIResponse(userMessage: string, userProfile: any): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: generateSystemInstruction(userProfile)
          },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('GROQ API Error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from GROQ');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Chat Error:', error);
    if (error instanceof Error) {
      return `I apologize, but I encountered an error: ${error.message}. Please try again.`;
    }
    return "I apologize, but I encountered an unexpected error. Please try again later.";
  }
}