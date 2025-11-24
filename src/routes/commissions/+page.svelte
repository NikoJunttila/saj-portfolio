<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';

	let commissions: RecordModel[] = $state([]);

	$effect(() => {
		pb.collection('commissions')
			.getFullList({
				sort: '-created',
				filter: 'enabled = true'
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
	<h1 class="h1 mb-4 text-center">Commissions</h1>

	{#if commissions.length === 0}
		<p class="text-center opacity-50">No commissions found.</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each commissions as commission (commission.id)}
				<a
					href="/commissions/{commission.id}"
					class="card p-4 flex flex-col gap-2 hover:bg-surface-500/10 transition-colors"
				>
					<header>
						{#if commission.image}
							<img
								src={pb.files.getURL(commission, commission.image, { thumb: '400x400' })}
								alt={commission.title || 'Commission Image'}
								class="bg-black/50 w-full aspect-square object-cover rounded-container-token"
							/>
						{:else}
							<div
								class="bg-surface-500/20 w-full aspect-square rounded-container-token flex items-center justify-center"
							>
								<span class="opacity-50">No Image</span>
							</div>
						{/if}
					</header>
					<section class="p-2 text-center space-y-2">
						<h3 class="h3 font-bold">{commission.title || 'Untitled'}</h3>
						<div class="flex flex-wrap gap-2 justify-center">
							{#if commission.type}
								<span class="badge variant-soft-secondary">Type: {commission.type}</span>
							{/if}
							{#if commission.status}
								<span class="badge variant-soft-primary">Status: {commission.status}</span>
							{/if}
						</div>
						{#if commission.client}
							<p class="text-sm opacity-70">Client: {commission.client}</p>
						{/if}
					</section>
				</a>
			{/each}
		</div>
	{/if}
</div>
