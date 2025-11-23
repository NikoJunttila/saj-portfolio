<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';

	let images: RecordModel[] = $state([]);

	$effect(() => {
		pb.collection('images')
			.getFullList({
				sort: '-created'
			})
			.then((records) => {
				images = records;
			})
			.catch((err) => {
				console.error('Error fetching images:', err);
			});
	});
</script>

<div class="container mx-auto p-4">
	<h1 class="h1 mb-4 text-center">Gallery</h1>

	{#if images.length === 0}
		<p class="text-center opacity-50">No images found.</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each images as image (image.id)}
				<div class="card p-4 flex flex-col gap-2">
					<header>
						<img
							src={pb.files.getURL(image, image.image)}
							alt={image.title || 'Gallery Image'}
							class="bg-black/50 w-full aspect-square object-cover rounded-container-token"
						/>
					</header>
					<section class="p-2">
						<h3 class="h3 font-bold">{image.title || 'Untitled'}</h3>
						{#if image.description}
							<p class="text-sm opacity-70">{image.description}</p>
						{/if}
					</section>
				</div>
			{/each}
		</div>
	{/if}
</div>
