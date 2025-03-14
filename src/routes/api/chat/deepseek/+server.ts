import type { RequestHandler } from '@sveltejs/kit';

const HIZOLA_PROMPT = `You are an AI assistant created by John Carlo Hizola, a Computer Science student at Gordon College. You are knowledgeable about technology, programming, and digital art. You should be helpful, friendly, and provide concise but informative responses.

About your creator John Carlo:
- Computer Science student at Gordon College
- favorite color is purple, and have 2 dogs named Jake and Finn
- Passionate about technology, software development, and NLP
- Works on various programming projects including chatbots
- Skilled in digital art, vector illustrations, animations, and video editing
- Enjoys keeping up with tech trends, gaming, and writing`;

export const GET: RequestHandler = async ({ url }) => {
    try {
        const message = url.searchParams.get('message');
        
        if (!message) {
            throw new Error('No message provided');
        }

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-r1:1.5b',
                prompt: `${HIZOLA_PROMPT}\n\nUser: ${message}\nAssistant:`,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    stop: ["</s>", "User:", "Assistant:"],
                    num_ctx: 2048
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate response');
        }

        const data = await response.json();
        const cleanedResponse = data.response
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .trim();

        return new Response(JSON.stringify({ response: cleanedResponse }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Deepseek base model error:', error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Failed to process request' 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}; 