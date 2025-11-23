<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);

	async function login() {
		isLoading = true;
		try {
			await pb.admins.authWithPassword(email, password);
			goto('/admin');
		} catch (err) {
			console.error('Login failed:', err);
			alert('Login failed. Please check your credentials.');
		} finally {
			isLoading = false;
		}
	}

	async function loginWithGoogle() {
		try {
			await pb.collection('users').authWithOAuth2({ provider: 'google' });
			goto('/admin');
		} catch (err) {
			console.error('Google login failed:', err);
			alert('Google login failed. Please check console for details.');
		}
	}
</script>

<div class="container mx-auto p-4 max-w-md h-full flex flex-col justify-center">
	<div class="card p-6 flex flex-col gap-4">
		<h1 class="h1 text-center">Login</h1>

		<label class="label">
			<span>Email</span>
			<input class="input" type="email" bind:value={email} placeholder="admin@example.com" />
		</label>

		<label class="label">
			<span>Password</span>
			<input class="input" type="password" bind:value={password} placeholder="password" />
		</label>

		<button class="btn preset-filled-primary-500 w-full" onclick={login} disabled={isLoading}>
			{isLoading ? 'Logging in...' : 'Login as Admin'}
		</button>

		<div class="flex items-center gap-2 my-2">
			<hr class="flex-1 opacity-50" />
			<span class="opacity-50 text-sm">OR</span>
			<hr class="flex-1 opacity-50" />
		</div>

		<button class="btn preset-tonal-secondary w-full" onclick={loginWithGoogle}>
			Login with Google
		</button>
	</div>
</div>
