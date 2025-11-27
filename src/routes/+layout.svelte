<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { pb } from '$lib/pocketbase';
	import { onNavigate } from '$app/navigation';

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

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header
	style="view-transition-name: header;"
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

<footer
	style="view-transition-name: footer;"
	class="mt-auto border-t border-surface-300/50 dark:border-surface-700/50 bg-surface-50/95 dark:bg-surface-900/95 text-surface-900 dark:text-surface-50"
>
	<div class="container mx-auto p-8">
		<!-- Social Media Links -->
		<div class="flex justify-center gap-6 mb-6">
			<a
				href="https://instagram.com"
				target="_blank"
				rel="noopener noreferrer"
				class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				aria-label="Instagram"
			>
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
					></path>
				</svg>
			</a>

			<!-- Discord -->
			<a
				href="https://discord.com"
				target="_blank"
				rel="noopener noreferrer"
				class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				aria-label="Discord"
			>
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
					></path>
				</svg>
			</a>
		</div>

		<!-- Creator Credit -->
		<div class="flex justify-center items-center text-xs opacity-60">
			<p class="flex items-center gap-1">
				<a
					href="https://github.com/NikoJunttila"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
					aria-label="github"
				>
					website created by
					<svg class="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						></path>
					</svg>
				</a>
			</p>
		</div>
	</div>
</footer>
