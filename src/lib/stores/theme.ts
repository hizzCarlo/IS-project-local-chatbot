import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) return stored;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable<Theme>(getInitialTheme());

// Update localStorage and document class when theme changes
theme.subscribe((value) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value);
        if (value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}); 