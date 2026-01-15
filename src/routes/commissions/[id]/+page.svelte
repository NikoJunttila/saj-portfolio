<script lang="ts">
	import { page } from '$app/stores';
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';

	let commission: RecordModel | null = $state(null);
	let images: RecordModel[] = $state([]);

	$effect(() => {
		const id = $page.params.id;
		if (id) {
			// Fetch commission details
			pb.collection('commissions')
				.getOne(id)
				.then((record) => {
					commission = record;
				})
				.catch((err) => {
					console.error('Error fetching commission:', err);
				});

			// Fetch related images
			pb.collection('images')
				.getList(1, 50, {
					filter: `commission = "${id}"`,
					sort: 'sortindex'
				})
				.then((result) => {
					images = result.items;
				})
				.catch((err) => {
					console.error('Error fetching images:', err);
					// Debug: Fetch schema to verify field name
					pb.collections.getOne('images').then((collection) => {
						console.log('Images collection schema:', collection);
					});
				});
		}
	});
</script>

<div class="container mx-auto p-4">
	<!-- Back Button -->
	<a
		href="/commissions"
		class="inline-flex items-center gap-2 mb-6 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
			></path>
		</svg>
		Back to Commissions
	</a>

	{#if commission}
		<div class="mb-8 text-center text-wrap mx-4">
			<h1 class="h1 mb-2">{commission.title}</h1>
			<div class="flex flex-wrap gap-2 justify-center mb-4">
				{#if commission.type}
					<span
						class="badge variant-soft-primary
         whitespace-normal
         break-words
         min-w-0
         max-w-full"
					>
						Type: {commission.type}
					</span>
				{/if}
				{#if commission.status}
					<span class="badge variant-soft-primary break-words max-w-full">
						Status: {commission.status}
					</span>
				{/if}
			</div>
			{#if commission.client}
				<p class="text-sm opacity-70 mb-4">Client: {commission.client}</p>
			{/if}
			{#if commission.description}
				<p class="opacity-70 max-w-2xl mx-auto">{commission.description}</p>
			{/if}
			<img
				src={pb.files.getURL(commission, commission.image)}
				alt={commission.title || 'Commission Image'}
				class="bg-black/50 w-full aspect-square object-cover rounded-container-token"
			/>
		</div>

		{#if images.length !== 0}
			<h2 class="h2 mb-4">Commission Gallery</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each images as image (image.id)}
					<div class="card p-4 flex flex-col gap-2">
						<header>
							<img
								src={pb.files.getURL(image, image.image)}
								alt={image.title || 'Commission Image'}
								class="bg-black/50 w-full aspect-square object-cover rounded-container-token"
							/>
						</header>
						{#if image.title || image.description}
							<section class="p-2">
								{#if image.title}<h3 class="h3 font-bold">{image.title}</h3>{/if}
								{#if image.description}<p class="text-sm opacity-70">{image.description}</p>{/if}
							</section>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
