<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';
	import { fade, scale, fly } from 'svelte/transition';
	import { X, ChevronLeft, ChevronRight, LoaderCircle, Layers } from '@lucide/svelte';

	let works: RecordModel[] = $state([]);
	let selectedGroup: { id: string; items: RecordModel[] } | null = $state(null);
	let selectedImageIndex = $state(0);

	let groupedWorks = $derived.by(() => {
		const groups: { id: string; items: RecordModel[] }[] = [];
		const groupMap = new Map<string, { id: string; items: RecordModel[] }>();

		for (const work of works) {
			if (work.group_id) {
				if (groupMap.has(work.group_id)) {
					groupMap.get(work.group_id)!.items.push(work);
				} else {
					const group = { id: work.group_id, items: [work] };
					groupMap.set(work.group_id, group);
					groups.push(group);
				}
			} else {
				groups.push({ id: work.id, items: [work] });
			}
		}
		return groups;
	});

	// Pagination state
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let isLoading = $state(false);
	let hasMore = $state(true);
	const perPage = 20;

	// Intersection observer for infinite scroll
	let loadMoreTrigger: HTMLElement | undefined = $state();

	async function loadWorks(page: number) {
		if (isLoading || !hasMore) return;

		isLoading = true;
		try {
			const result = await pb.collection('works').getList(page, perPage, {
				sort: '-created'
			});

			if (page === 1) {
				works = result.items;
			} else {
				works = [...works, ...result.items];
			}

			totalPages = result.totalPages;
			totalItems = result.totalItems;
			hasMore = page < result.totalPages;
			currentPage = page;

			// Debug logging
			console.log(
				'Loaded page:',
				page,
				'Total pages:',
				result.totalPages,
				'Has more:',
				page < result.totalPages,
				'Items loaded:',
				works.length,
				'Total items:',
				result.totalItems
			);
		} catch (err) {
			console.error('Error fetching works:', err);
		} finally {
			isLoading = false;
		}
	}

	// Initial load - only run once
	let hasLoaded = $state(false);
	$effect(() => {
		if (!hasLoaded) {
			hasLoaded = true;
			loadWorks(1);
		}
	});

	// Intersection observer for infinite scroll
	$effect(() => {
		if (!loadMoreTrigger || !hasMore) return;

		console.log('Setting up intersection observer. hasMore:', hasMore);

		const observer = new IntersectionObserver(
			(entries) => {
				const isIntersecting = entries[0].isIntersecting;
				console.log(
					'Intersection changed:',
					isIntersecting,
					'hasMore:',
					hasMore,
					'isLoading:',
					isLoading
				);

				// Check conditions at the time of intersection
				// isLoading is read here but doesn't create a reactive dependency
				if (isIntersecting && !isLoading && hasMore) {
					console.log('Loading next page:', currentPage + 1);
					loadWorks(currentPage + 1);
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(loadMoreTrigger);

		return () => {
			console.log('Cleaning up intersection observer');
			observer.disconnect();
		};
	});

	function openLightbox(group: { id: string; items: RecordModel[] }) {
		selectedGroup = group;
		selectedImageIndex = 0;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		selectedGroup = null;
		selectedImageIndex = 0;
		document.body.style.overflow = '';
	}

	function nextImage() {
		if (selectedGroup && selectedImageIndex < selectedGroup.items.length - 1) {
			selectedImageIndex++;
		}
	}

	function prevImage() {
		if (selectedImageIndex > 0) {
			selectedImageIndex--;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (selectedGroup) {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowRight') nextImage();
			if (e.key === 'ArrowLeft') prevImage();
		}
	}}
/>

<div class="container mx-auto p-4">
	<div class="text-center mb-12">
		<h1 class="h1 mb-4">Gallery</h1>
		<p class="text-lg opacity-80 max-w-2xl mx-auto">
			Explore my collection of artwork and creative projects
		</p>
		{#if totalItems > 0}
			<p class="text-sm opacity-60 mt-2">
				Showing {works.length} of {totalItems} works
			</p>
		{/if}
	</div>

	{#if works.length === 0 && !isLoading}
		<p class="text-center opacity-50">No works found.</p>
	{:else}
		<!-- Masonry-style grid -->
		<div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
			{#each groupedWorks as group (group.id)}
				{@const work = group.items[0]}
				<button
					class="card p-0 overflow-visible hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer w-full break-inside-avoid group relative mb-4"
					onclick={() => openLightbox(group)}
					onkeydown={(e) => e.key === 'Enter' && openLightbox(group)}
				>
					{#if work.image}
						<div class="relative overflow-hidden">
							<img
								src={pb.files.getURL(work, work.image, { thumb: '600x600' })}
								alt={work.title || 'Work Image'}
								class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
							/>
							<!-- Overlay on hover -->
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
							>
								<div class="text-left">
									{#if work.title}
										<h3 class="text-white font-bold text-lg">{work.title}</h3>
									{/if}
								</div>
							</div>
							{#if group.items.length > 1}
								<div class="absolute top-2 right-2 z-10 bg-black/50 rounded-lg">
									<span
										class="badge variant-filled-surface shadow-lg flex gap-2 items-center font-bold text-3xl"
									>
										<Layers class="w-12 h-12" />
										{group.items.length}
									</span>
								</div>
								<!-- Stack effect layers -->
								<div
									class="absolute inset-0 bg-surface-200 dark:bg-surface-700 -z-10 translate-x-1 translate-y-1 rounded-container-token shadow-sm border border-surface-500/10"
								></div>
								<div
									class="absolute inset-0 bg-surface-300 dark:bg-surface-600 -z-20 translate-x-2 translate-y-2 rounded-container-token shadow-sm border border-surface-500/10"
								></div>
							{/if}
						</div>
					{:else}
						<div class="w-full aspect-square bg-surface-500/20 flex items-center justify-center">
							<span class="opacity-50">No Image</span>
						</div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Loading indicator and infinite scroll trigger -->
		{#if hasMore}
			<div bind:this={loadMoreTrigger} class="flex justify-center items-center py-12">
				{#if isLoading}
					<div class="flex items-center gap-3 text-primary-500">
						<LoaderCircle class="w-6 h-6 animate-spin" />
						<span class="text-lg">Loading more works...</span>
					</div>
				{:else}
					<div class="text-sm opacity-50">Scroll to load more...</div>
				{/if}
			</div>
		{:else if works.length > 0}
			<div class="text-center py-12 opacity-50">
				<p>You've reached the end of the gallery</p>
			</div>
		{/if}
	{/if}
</div>

{#if selectedGroup}
	{@const currentWork = selectedGroup.items[selectedImageIndex]}
	<!-- Lightbox Container -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/95 backdrop-blur-sm cursor-default"
			transition:fade={{ duration: 200 }}
			onclick={closeLightbox}
			role="button"
			tabindex="0"
			aria-label="Close lightbox"
			onkeydown={(e) => e.key === 'Enter' && closeLightbox()}
		></div>

		<!-- Navigation Buttons -->
		{#if selectedImageIndex > 0}
			<button
				class="absolute left-4 top-1/2 -translate-y-1/2 z-20 btn-icon btn-icon-lg variant-filled-surface hover:scale-110 transition-transform"
				onclick={prevImage}
				transition:fly={{ x: -20, duration: 200 }}
			>
				<ChevronLeft class="w-6 h-6" />
			</button>
		{/if}

		{#if selectedImageIndex < selectedGroup.items.length - 1}
			<button
				class="absolute right-4 top-1/2 -translate-y-1/2 z-20 btn-icon btn-icon-lg variant-filled-surface hover:scale-110 transition-transform"
				onclick={nextImage}
				transition:fly={{ x: 20, duration: 200 }}
			>
				<ChevronRight class="w-6 h-6" />
			</button>
		{/if}

		<!-- Content -->
		<div
			class="relative max-w-6xl w-full max-h-[90vh] flex flex-col gap-4 z-10"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Close Button -->
			<button
				class="absolute -top-12 right-0 btn-icon btn-icon-lg variant-filled-surface hover:scale-110 transition-transform z-20"
				onclick={closeLightbox}
			>
				<X class="w-6 h-6" />
			</button>

			<!-- Image Container -->
			<div
				class="flex-1 flex items-center justify-center bg-surface-900/50 backdrop-blur-md rounded-container-token overflow-hidden p-4"
			>
				{#if currentWork.image}
					{#key currentWork.id}
						<img
							src={pb.files.getURL(currentWork, currentWork.image)}
							alt={currentWork.title}
							class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
							transition:fade={{ duration: 200 }}
						/>
					{/key}
				{:else}
					<div class="p-10 opacity-50">No Image</div>
				{/if}
			</div>

			<!-- Info Panel -->
			{#if currentWork.title || currentWork.description || selectedGroup.items.length > 1}
				<div
					class="bg-surface-800/90 backdrop-blur-md rounded-container-token p-6 max-w-2xl mx-auto w-full"
				>
					{#if currentWork.title}
						<h2 class="h2 font-bold mb-2">{currentWork.title}</h2>
					{/if}
					{#if currentWork.description}
						<p class="opacity-80 whitespace-pre-wrap">{currentWork.description}</p>
					{/if}
					{#if selectedGroup.items.length > 1}
						<div class="mt-4 flex items-center justify-between text-sm opacity-60">
							<span>
								Image {selectedImageIndex + 1} of {selectedGroup.items.length}
							</span>
							<!-- Mini thumbnails could go here -->
							<div class="flex gap-1">
								{#each selectedGroup.items as _, i}
									<div
										class="w-2 h-2 rounded-full transition-colors {i === selectedImageIndex
											? 'bg-primary-500'
											: 'bg-surface-500'}"
									></div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
