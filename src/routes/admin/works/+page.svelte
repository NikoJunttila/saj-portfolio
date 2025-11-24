<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';

	let works: RecordModel[] = $state([]);

	$effect(() => {
		pb.collection('works')
			.getFullList({
				sort: '-created'
			})
			.then((records) => {
				works = records;
			})
			.catch((err) => {
				console.error('Error fetching works:', err);
			});
	});

	async function deleteWork(id: string) {
		if (!confirm('Are you sure you want to delete this work?')) return;

		try {
			await pb.collection('works').delete(id);
			works = works.filter((w) => w.id !== id);
		} catch (err) {
			console.error('Error deleting work:', err);
			alert('Failed to delete work');
		}
	}
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h1">Admin: Other Works</h1>
		<a href="/admin/works/create" class="btn preset-filled-primary-500">Bulk Create</a>
	</div>

	{#if works.length === 0}
		<p class="text-center opacity-50">No works found.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4">
			{#each works as work (work.id)}
				<div class="card p-4 flex items-center gap-4">
					{#if work.image}
						<img
							src={pb.files.getURL(work, work.image)}
							alt={work.title}
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
						<h3 class="h3 font-bold">{work.title || 'Untitled'}</h3>
						<p class="text-sm opacity-70 line-clamp-1">
							{work.description || 'No description'}
						</p>
					</div>

					<div class="flex gap-2">
						<a href="/admin/works/{work.id}" class="btn preset-filled-secondary-500"> Edit </a>
						<button class="btn preset-filled-error-500" onclick={() => deleteWork(work.id)}>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
