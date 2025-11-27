<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { pb } from '$lib/pocketbase';

	let isDark = $state(false);

	$effect(() => {
		const mode = localStorage.getItem('mode') || 'light';
		isDark = mode === 'dark';
	});

	const toggleTheme = () => {
		isDark = !isDark;
		const mode = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-mode', mode);
		localStorage.setItem('mode', mode);
	};

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
	class="p-4 border-b border-surface-300/50 dark:border-surface-700/50 sticky top-0 z-50 w-full backdrop-blur-md bg-surface-50/95 dark:bg-surface-900/95 text-surface-900 dark:text-surface-50 transition-all duration-200"
>
	<div class="flex justify-between items-center">
		<!-- Mobile Brand -->
		<div class="md:hidden font-bold text-xl flex items-center gap-3">
			<a
				href="/"
				onclick={closeMenu}
				class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">SAJ</a
			>
			<!-- Mobile Status Indicator -->
			<a
				href="/contact"
				class="flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full {commissionsOpen
					? 'bg-success-500/20 text-success-700 dark:text-success-300'
					: 'bg-error-500/20 text-error-700 dark:text-error-300'}"
			>
				<div
					class="w-2 h-2 rounded-full {commissionsOpen ? 'bg-success-500' : 'bg-error-500'}"
				></div>
				{commissionsOpen ? 'OPEN' : 'CLOSED'}
			</a>
		</div>

		<!-- Desktop Navigation -->
		<nav class="hidden md:flex gap-6 items-center w-full">
			<a
				href="/"
				class="anchor font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				>Home</a
			>
			<a
				href="/gallery"
				class="anchor font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				>Gallery</a
			>
			<a
				href="/commissions"
				class="anchor font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				>Commissions</a
			>
			<a
				href="/contact"
				class="anchor font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				>Contact</a
			>

			<!-- Desktop Status Indicator -->
			<a
				href="/contact"
				class="ml-auto flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full {commissionsOpen
					? 'bg-success-500/20 text-success-700 dark:text-success-300'
					: 'bg-error-500/20 text-error-700 dark:text-error-300'}"
			>
				<div
					class="w-2 h-2 rounded-full {commissionsOpen ? 'bg-success-500' : 'bg-error-500'}"
				></div>
				Commissions {commissionsOpen ? 'Open' : 'Closed'}
			</a>

			{#if isLoggedIn}
				<div class="w-px h-6 bg-surface-300 dark:bg-surface-700 mx-2"></div>
				<a
					href="/admin/commissions"
					class="anchor font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
					>Commissions</a
				>
				<a
					href="/admin/works"
					class="anchor font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
					>Works</a
				>
				<button class="btn preset-filled-primary-600 btn-sm" onclick={handleLogout}>Logout</button>
			{/if}
		</nav>

		<!-- Theme Toggle Button -->
		<button
			onclick={toggleTheme}
			class="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-surface-500/20 active:scale-95"
			aria-label="Toggle theme"
			title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<!-- Sun Icon (Light Mode) -->
			<svg
				class="absolute w-5 h-5 transition-all duration-300 {isDark
					? 'rotate-90 scale-0 opacity-0'
					: 'rotate-0 scale-100 opacity-100'}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<circle cx="12" cy="12" r="4" stroke-width="2"></circle>
				<path
					stroke-linecap="round"
					stroke-width="2"
					d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
				></path>
			</svg>
			<!-- Moon Icon (Dark Mode) -->
			<svg
				class="absolute w-5 h-5 transition-all duration-300 {isDark
					? 'rotate-0 scale-100 opacity-100'
					: '-rotate-90 scale-0 opacity-0'}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
				></path>
			</svg>
		</button>

		<!-- Mobile Menu Button -->
		<button
			class="md:hidden btn-icon"
			onclick={() => (isMenuOpen = !isMenuOpen)}
			aria-label="Toggle menu"
		>
			<div class="space-y-1.5">
				<span
					class="block w-6 h-0.5 bg-surface-900 dark:bg-surface-50 transition-transform duration-300 {isMenuOpen
						? 'rotate-45 translate-y-2'
						: ''}"
				></span>
				<span
					class="block w-6 h-0.5 bg-surface-900 dark:bg-surface-50 transition-opacity duration-300 {isMenuOpen
						? 'opacity-0'
						: ''}"
				></span>
				<span
					class="block w-6 h-0.5 bg-surface-900 dark:bg-surface-50 transition-transform duration-300 {isMenuOpen
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
