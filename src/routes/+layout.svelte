<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { pb } from '$lib/pocketbase';

	let { children } = $props();
	let isLoggedIn = $state(pb.authStore.isValid);

	$effect(() => {
		return pb.authStore.onChange(() => {
			isLoggedIn = pb.authStore.isValid;
		});
	});

	function handleLogout() {
		pb.authStore.clear();
		goto('/');
	}

	console.log('PocketBase initialized:', pb);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header
	class="p-4 flex gap-4 border-b border-surface-500/30 mb-1 items-center sticky top-0 z-50 w-full backdrop-blur-md bg-surface-900/90 transition-all duration-200"
>
	<a href="/" class="anchor">Home</a>
	<a href="/gallery" class="anchor">Gallery</a>
	<a href="/commissions" class="anchor">Commissions</a>
	<a href="/contact" class="anchor">Contact</a>
	{#if isLoggedIn}
		<a href="/admin/commissions" class="anchor font-bold text-primary-500">Commissions</a>
		<a href="/admin/works" class="anchor font-bold text-primary-500">Works</a>
		<button class="btn preset-filled-surface-500 btn-sm" onclick={handleLogout}>Logout</button>
	{/if}
</header>

{@render children()}
