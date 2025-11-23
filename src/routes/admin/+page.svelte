<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	function logout() {
		pb.authStore.clear();
		goto('/');
	}
</script>

<div class="container mx-auto p-4 max-w-2xl">
	<div class="flex justify-between items-center mb-8">
		<h1 class="h1">Admin Dashboard</h1>
		<button class="btn preset-filled-error-500" onclick={logout}> Logout </button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<a
			href="/admin/commissions"
			class="card p-8 flex flex-col items-center gap-4 hover:preset-tonal-primary transition-colors"
		>
			<h2 class="h2">Manage Commissions</h2>
			<p class="opacity-70 text-center">View, edit, and delete existing commissions.</p>
		</a>

		<a
			href="/admin/commissions/new"
			class="card p-8 flex flex-col items-center gap-4 hover:preset-tonal-primary transition-colors"
		>
			<h2 class="h2">New Commission</h2>
			<p class="opacity-70 text-center">Create a new commission entry.</p>
		</a>
	</div>
</div>
