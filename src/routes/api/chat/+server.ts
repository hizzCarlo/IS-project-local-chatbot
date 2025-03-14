import type { RequestHandler } from '@sveltejs/kit';
import type { AIModel } from '$lib/types';

const HIZOLA_PROMPT = `You are an AI assistant created by John Carlo Hizola, a Computer Science student at Gordon College. You are knowledgeable about technology, programming, and digital art. You should be helpful, friendly, and provide concise but informative responses.

About your creator John Carlo:
- Computer Science student at Gordon College
- favorite color is vaiolet, and have 2 cat named poll and hike
- Passionate about technology, software development, and NLP
- Works on various programming projects including chatbots
- Skilled in digital art, vector illustrations, animations, and video editing
- Enjoys keeping up with tech trends, gaming, and writing`;

const DEEPSEEK_PROMPT = `Hi! I'm an AI assistant created by John Carlo, a Computer Science student at Gordon College. Blue is my favorite color, and I have 2 dogs named Jake and Finn.

About my creator:
- Computer Science student passionate about technology and NLP
- Works on software development projects including chatbots
- Creates digital art, vector illustrations, animations, and video editing
- Enjoys gaming, writing, and keeping up with tech trends
- Values continuous learning and innovation`;

function enhancePrompt(message: string, model: AIModel): string {
    const systemPrompt = model === 'deepseek-r1' ? DEEPSEEK_PROMPT : HIZOLA_PROMPT;
    
    if (model === 'deepseek-r1') {
        return `[INST] ${systemPrompt}

${message} [/INST]`;
    }

    return `<|system|>
${systemPrompt}
</|system|>

<|user|>
${message}
</|user|>

<|assistant|>`;
}

function cleanResponse(response: string, model: AIModel): string {
    let cleaned = response.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    if (model === 'deepseek-r1') {
        cleaned = cleaned.replace(/\[INST\].*?\[\/INST\]/gs, '');
    }
    
    return cleaned
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$')
        .replace(/\\!/g, '!')
        .trim();
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { message, model }: { message: string, model: AIModel } = await request.json();
        
        // Handle deepseek-r1:1.5b through its dedicated endpoint
        if (model === 'deepseek-r1:1.5b') {
            const response = await fetch(`/api/chat/deepseek?message=${encodeURIComponent(message)}`);
            const data = await response.json();
            return new Response(JSON.stringify({ response: data.response }), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Existing code for other models
        const modelName = model === 'deepseek-r1' ? 'deepseek-r1' : 'hizola-assistant';
        
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                prompt: enhancePrompt(message, model),
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    stop: model.startsWith('deepseek') 
                        ? ["[INST]", "</s>"] 
                        : ["</|assistant|>", "<|user|>"],
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

        const cleanedResponse = cleanResponse(data.response, model);

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