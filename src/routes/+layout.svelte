<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { pb } from '$lib/pocketbase';

	let { children } = $props();
	let isMenuOpen = $state(false);
	let isLoggedIn = $state(pb.authStore.isValid);
	let commissionsOpen = $state(false);

	function closeMenu() {
		isMenuOpen = false;
	}

	$effect(() => {
		// Auth state
		const unsubAuth = pb.authStore.onChange(() => {
			isLoggedIn = pb.authStore.isValid;
		});

		// Fetch initial settings
		pb.collection('settings')
			.getList(1, 1)
			.then((res) => {
				if (res.items.length > 0) {
					commissionsOpen = res.items[0].commissions_open;
				}
			})
			.catch(() => {});

		// Subscribe to settings changes
		pb.collection('settings')
			.subscribe('*', (e) => {
				if (e.action === 'update' || e.action === 'create') {
					commissionsOpen = e.record.commissions_open;
				}
			})
			.catch(() => {});

		return () => {
			unsubAuth();
			pb.collection('settings').unsubscribe('*');
		};
	});

	function handleLogout() {
		pb.authStore.clear();
		goto('/');
		closeMenu();
	}

	console.log('PocketBase initialized:', pb);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header
	class="p-4 border-b border-surface-500/30 mb-1 sticky top-0 z-50 w-full backdrop-blur-md bg-surface-900/90 transition-all duration-200"
>
	<div class="flex justify-between items-center">
		<!-- Mobile Brand -->
		<div class="md:hidden font-bold text-xl flex items-center gap-3">
			<a href="/" onclick={closeMenu}>SAJ</a>
			<!-- Mobile Status Indicator -->
			<a
				href="/contact"
				class="flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full {commissionsOpen
					? 'bg-success-500/20 text-success-300'
					: 'bg-error-500/20 text-error-300'}"
			>
				<div
					class="w-2 h-2 rounded-full {commissionsOpen ? 'bg-success-500' : 'bg-error-500'}"
				></div>
				{commissionsOpen ? 'OPEN' : 'CLOSED'}
			</a>
		</div>

		<!-- Desktop Navigation -->
		<nav class="hidden md:flex gap-4 items-center w-full">
			<a href="/" class="anchor">Home</a>
			<a href="/gallery" class="anchor">Gallery</a>
			<a href="/commissions" class="anchor">Commissions</a>
			<a href="/contact" class="anchor">Contact</a>

			<!-- Desktop Status Indicator -->
			<a
				href="/contact"
				class="ml-auto flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full {commissionsOpen
					? 'bg-success-500/20 text-success-300'
					: 'bg-error-500/20 text-error-300'}"
			>
				<div
					class="w-2 h-2 rounded-full {commissionsOpen ? 'bg-success-500' : 'bg-error-500'}"
				></div>
				Commissions {commissionsOpen ? 'Open' : 'Closed'}
			</a>

			{#if isLoggedIn}
				<div class="w-px h-6 bg-surface-500/30 mx-2"></div>
				<a href="/admin/commissions" class="anchor font-bold text-primary-500">Commissions</a>
				<a href="/admin/works" class="anchor font-bold text-primary-500">Works</a>
				<button class="btn preset-filled-surface-500 btn-sm" onclick={handleLogout}>Logout</button>
			{/if}
		</nav>

		<!-- Mobile Menu Button -->
		<button
			class="md:hidden btn-icon"
			onclick={() => (isMenuOpen = !isMenuOpen)}
			aria-label="Toggle menu"
		>
			<div class="space-y-1.5">
				<span
					class="block w-6 h-0.5 bg-surface-50 transition-transform duration-300 {isMenuOpen
						? 'rotate-45 translate-y-2'
						: ''}"
				></span>
				<span
					class="block w-6 h-0.5 bg-surface-50 transition-opacity duration-300 {isMenuOpen
						? 'opacity-0'
						: ''}"
				></span>
				<span
					class="block w-6 h-0.5 bg-surface-50 transition-transform duration-300 {isMenuOpen
						? '-rotate-45 -translate-y-2'
						: ''}"
				></span>
			</div>
		</button>
	</div>

	<!-- Mobile Navigation Menu -->
	{#if isMenuOpen}
		<nav class="md:hidden flex flex-col gap-4 pt-4 pb-2 border-t border-surface-500/30 mt-4">
			<a href="/" class="anchor text-lg" onclick={closeMenu}>Home</a>
			<a href="/gallery" class="anchor text-lg" onclick={closeMenu}>Gallery</a>
			<a href="/commissions" class="anchor text-lg" onclick={closeMenu}>Commissions</a>
			<a href="/contact" class="anchor text-lg" onclick={closeMenu}>Contact</a>
			{#if isLoggedIn}
				<hr class="border-surface-500/30" />
				<a
					href="/admin/commissions"
					class="anchor text-lg font-bold text-primary-500"
					onclick={closeMenu}>Admin Commissions</a
				>
				<a href="/admin/works" class="anchor text-lg font-bold text-primary-500" onclick={closeMenu}
					>Admin Works</a
				>
				<button
					class="btn preset-filled-surface-500 w-full"
					onclick={() => {
						handleLogout();
						closeMenu();
					}}>Logout</button
				>
			{/if}
		</nav>
	{/if}
</header>

{@render children()}
