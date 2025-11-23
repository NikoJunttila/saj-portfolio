<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// If user is not logged in and not on the login page, redirect to login
		if (!pb.authStore.isValid && page.url.pathname !== '/admin/login') {
			goto('/admin/login');
		}
	});

	// Reactive check for auth state changes
	$effect(() => {
		if (!pb.authStore.isValid && page.url.pathname !== '/admin/login') {
			goto('/admin/login');
		}
	});
</script>

{@render children()}
