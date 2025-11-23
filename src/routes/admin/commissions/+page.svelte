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

					<a href="/admin/commissions/{commission.id}" class="btn preset-filled-secondary-500">
						Edit
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>
