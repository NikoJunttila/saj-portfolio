<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';

	let commissions: RecordModel[] = $state([]);

	$effect(() => {
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
	});

	async function deleteCommission(id: string) {
		if (!confirm('Are you sure you want to delete this commission?')) return;

		try {
			await pb.collection('commissions').delete(id);
			commissions = commissions.filter((c) => c.id !== id);
		} catch (err) {
			console.error('Error deleting commission:', err);
			alert('Failed to delete commission');
		}
	}
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h1">Admin: Commissions</h1>
		<a href="/admin/commissions/new" class="btn preset-filled-primary-500">Create New</a>
	</div>

	{#if commissions.length === 0}
		<p class="text-center opacity-50">No commissions found.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4">
			{#each commissions as commission (commission.id)}
				<div class="card p-4 flex items-center gap-4">
					{#if commission.image}
						<img
							src={pb.files.getURL(commission, commission.image)}
							alt={commission.title}
							class="w-16 h-16 object-cover rounded-container-token"
						/>
					{:else}
						<div
							class="w-16 h-16 bg-surface-500/20 rounded-container-token flex items-center justify-center"
						>
							<span class="text-xs">No Img</span>
						</div>
					{/if}

					<div class="flex-1">
						<h3 class="h3 font-bold">{commission.title || 'Untitled'}</h3>
						<p class="text-sm opacity-70 line-clamp-1">
							{commission.description || 'No description'}
						</p>
					</div>

					<div class="flex gap-2">
						<a href="/admin/commissions/{commission.id}" class="btn preset-filled-secondary-500">
							Edit
						</a>
						<button
							class="btn preset-filled-error-500"
							onclick={() => deleteCommission(commission.id)}
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
