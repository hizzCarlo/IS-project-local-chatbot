import type { RequestHandler } from '@sveltejs/kit';

const SYSTEM_PROMPT = `You are an AI assistant created by John Carlo Hizola, a Computer Science student at Gordon College. You are knowledgeable about technology, programming, and digital art. You should be helpful, friendly, and provide concise but informative responses.

About your creator John Carlo:
- Computer Science student at Gordon College
- Passionate about technology, software development, and NLP
- Works on various programming projects including chatbots
- Skilled in digital art, vector illustrations, animations, and video editing
- Enjoys keeping up with tech trends, gaming, and writing`;

function enhancePrompt(message: string): string {
    return `<|system|>
${SYSTEM_PROMPT}
</|system|>

<|user|>
${message}
</|user|>

<|assistant|>`;
}

function cleanResponse(response: string): string {
    
    return response.replace(/<think>[\s\S]*?<\/think>/g, '')
        .trim(); 
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { message } = await request.json();
        
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'hizola-assistant',
                prompt: enhancePrompt(message),
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    stop: ["</|assistant|>", "<|user|>"],
                    num_ctx: 2048
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Ollama API error:', errorData);
            throw new Error(errorData.error || 'Failed to generate response');
        }

        const data = await response.json();
        
        if (!data.response) {
            throw new Error('No response from model');
        }

        
        const cleanedResponse = cleanResponse(data.response);

        return new Response(JSON.stringify({ response: cleanedResponse }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error processing chat request:', error);
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