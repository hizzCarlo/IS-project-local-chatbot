export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export type AIModel = 'hizola-assistant' | 'deepseek-r1' | 'deepseek-r1:1.5b'; 