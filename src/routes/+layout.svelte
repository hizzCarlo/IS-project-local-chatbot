<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// This logic can be moved to theme.ts store
		if (!localStorage.getItem('theme')) {
			const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme.set(systemPrefersDark ? 'dark' : 'light');
		}
	});
</script>

<div class="min-h-screen">
	{@render children()}
</div>
