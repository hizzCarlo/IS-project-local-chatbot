<script lang="ts">
    import { onMount } from 'svelte';
    import type { ChatMessage } from '$lib/types';
    import { theme } from '$lib/stores/theme';

    let messages: ChatMessage[] = [];
    let inputMessage = '';
    let chatContainer: HTMLDivElement;
    let isLoading = false;

    function toggleTheme() {
        theme.update(t => t === 'light' ? 'dark' : 'light');
    }

    async function handleSubmit() {
        if (!inputMessage.trim()) return;

        messages = [...messages, { role: 'user', content: inputMessage }];
        const currentMessage = inputMessage;
        inputMessage = '';
        isLoading = true;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: currentMessage })
            });

            const data = await response.json();
            if (data.error) {
                messages = [...messages, { role: 'assistant', content: `Error: ${data.error}` }];
            } else {
                messages = [...messages, { role: 'assistant', content: data.response }];
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            messages = [...messages, { 
                role: 'assistant', 
                content: 'Sorry, there was an error processing your message.' 
            }];
        } finally {
            isLoading = false;
        }
    }

    $: if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
</script>

<div class="chat-container {$theme}">
    <header>
        <div class="header-content">
            <div class="logo-container">
                <img src="/r1d2.png" alt="R1D2" class="logo" />
            </div>
            <div class="header-text">
                <h1>Hi, I'm R1D2.</h1>
                <p>How can I help you today?</p>
            </div>
            <button class="theme-toggle" on:click={toggleTheme}>
                {#if $theme === 'light'}
                    🌙
                {:else}
                    ☀️
                {/if}
            </button>
        </div>
    </header>

    <div class="messages" bind:this={chatContainer}>
        {#each messages as message}
            <div class="message {message.role}">
                <div class="message-content">
                    {message.content}
                </div>
            </div>
        {/each}
        {#if isLoading}
            <div class="message assistant">
                <div class="message-content loading">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        {/if}
    </div>

    <form on:submit|preventDefault={handleSubmit}>
        <div class="input-container">
            <input
                type="text"
                bind:value={inputMessage}
                placeholder="Message DeepSeek"
                disabled={isLoading}
            />
            <div class="input-buttons">
                
                <button type="submit" class="send-button" disabled={isLoading}>
                    <span class="send-icon"> SEND ↑</span>
                </button>
            </div>
        </div>
    </form>
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        transition: background-color 0.3s, color 0.3s;
    }

    .chat-container.light {
        background-color: #ffffff;
        color: #000000;
    }

    .chat-container.dark {
        background-color: #1a1a1a;
        color: #ffffff;
    }

    header {
        padding: 2rem;
        border-bottom: 1px solid var(--border-color);
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .logo-container {
        width: 40px;
        height: 40px;
        background-color: #000000;
        border-radius: 50%;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .light .logo-container {
        background-color: #000000;
        border-color: #ffffff;
    }

    .logo {
        width: 32px;  
        height: 32px;
        border-radius: 50%;
        object-fit: contain;
    }

    .header-text h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;
    }

    .header-text p {
        margin: 0.25rem 0 0;
        color: #888;
        font-size: 0.9rem;
    }

    .theme-toggle {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.5rem;
    }

    .messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .input-container {
        margin: 1rem;
        background-color: var(--bg-secondary);
        border-radius: 8px;
        padding: 0.75rem;
    }

    .light .input-container {
        background-color: #f0f0f0;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        background-color: transparent;
        border: none;
        color: inherit;
        font-size: 1rem;
    }

    .light input::placeholder {
        color: #666;
    }

    .dark input::placeholder {
        color: #888;
    }

    .input-buttons {
        display: flex;
        gap: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);
        margin-top: 0.5rem;
    }

    .model-button, .search-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #333;
        border: none;
        border-radius: 6px;
        color: #fff;
        font-size: 0.9rem;
        cursor: pointer;
    }

    .send-button {
        margin-left: auto;
        padding: 0.5rem 1rem;
        background-color: var(--accent-color);
        border: none;
        border-radius: 6px;
        color: inherit;
        cursor: pointer;
    }

    .light .send-button {
        background-color: #e0e0e0;
    }

    .message {
        display: flex;
        margin-bottom: 1rem;
    }

    .message.user {
        justify-content: flex-end;
    }

    .message-content {
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        white-space: pre-wrap;
    }

    .user .message-content {
        background-color: #000;
        color: #fff;
    }

    .light .user .message-content {
        background-color: #2563eb;
        color: #fff;
    }

    .assistant .message-content {
        background-color: #f0f0f0;
        color: #000;
    }

    .dark .assistant .message-content {
        background-color: #2a2a2a;
        color: #fff;
    }

    .loading {
        display: flex;
        gap: 0.25rem;
    }

    .loading span {
        animation: bounce 1s infinite;
    }

    .loading span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .loading span:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
</style> 