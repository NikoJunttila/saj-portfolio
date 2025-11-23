<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pb } from '$lib/pocketbase';

	let { children } = $props();

	console.log('PocketBase initialized:', pb);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="p-4 flex gap-4 border-b border-surface-500/30 mb-4">
	<a href="/" class="anchor">Home</a>
	<a href="/gallery" class="anchor">Gallery</a>
	<a href="/commissions" class="anchor">Commissions</a>
	<a href="/contact" class="anchor">Contact</a>
</header>

{@render children()}
