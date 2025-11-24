<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';

	let commissions: RecordModel[] = $state([]);
	let commissionsOpen = $state(false);
	let settingsId = $state('');

	$effect(() => {
		// Fetch commissions
		pb.collection('commissions')
			.getFullList({
				sort: '-created'
			})
			.then((records) => {
				commissions = records;
			})
			.catch((err) => {
				console.error('Error fetching commissions:', err);
			});

		// Fetch settings
		pb.collection('settings')
			.getList(1, 1)
			.then((result) => {
				if (result.items.length > 0) {
					commissionsOpen = result.items[0].commissions_open;
					settingsId = result.items[0].id;
				}
			})
			.catch((err) => {
				console.log('Settings fetch error (collection might not exist yet):', err);
			});
	});

	async function toggleCommissions() {
		try {
			if (settingsId) {
				await pb.collection('settings').update(settingsId, { commissions_open: commissionsOpen });
			} else {
				const record = await pb
					.collection('settings')
					.create({ commissions_open: commissionsOpen });
				settingsId = record.id;
			}
		} catch (e) {
			console.error('Error updating settings:', e);
			alert(
				"Failed to update settings. Please ensure a 'settings' collection exists with a 'commissions_open' (boolean) field."
			);
		}
	}

	async function deleteCommission(id: string) {
		if (confirm('Are you sure you want to delete this commission?')) {
			try {
				await pb.collection('commissions').delete(id);
				commissions = commissions.filter((c) => c.id !== id);
			} catch (err) {
				console.error('Error deleting commission:', err);
				alert('Failed to delete commission');
			}
		}
	}
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-8">
		<h1 class="h1">Manage Commissions</h1>
		<div class="flex items-center gap-4">
			<label class="flex items-center gap-2 cursor-pointer label">
				<span>Commissions Open</span>
				<input
					class="checkbox"
					type="checkbox"
					bind:checked={commissionsOpen}
					onchange={toggleCommissions}
				/>
			</label>
			<a href="/admin/commissions/new" class="btn variant-filled-primary">Add New</a>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each commissions as commission (commission.id)}
			<div class="card p-4 flex flex-col gap-2">
				<header>
					{#if commission.image}
						<img
							src={pb.files.getURL(commission, commission.image)}
							alt={commission.title || 'Commission Image'}
							class="bg-black/50 w-full aspect-square object-cover rounded-container-token"
						/>
					{/if}
				</header>
				<section class="p-2">
					<h3 class="h3 font-bold">{commission.title || 'Untitled'}</h3>
					<p class="text-sm opacity-70">Client: {commission.client_name}</p>
					<p class="text-sm opacity-70">Status: {commission.status}</p>
				</section>
				<footer class="flex justify-end gap-2 mt-auto">
					<a href="/admin/commissions/{commission.id}" class="btn variant-filled-secondary btn-sm"
						>Edit</a
					>
					<button
						class="btn variant-filled-error-500 btn-sm"
						onclick={() => deleteCommission(commission.id)}>Delete</button
					>
				</footer>
			</div>
		{/each}
	</div>
</div>
