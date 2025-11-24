<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';
	import { fade, scale, fly } from 'svelte/transition';
	import { X, ChevronLeft, ChevronRight, LoaderCircle } from '@lucide/svelte';

	let works: RecordModel[] = $state([]);
	let selectedWork: RecordModel | null = $state(null);
	let selectedIndex = $state(0);

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

	function openLightbox(work: RecordModel, index: number) {
		selectedWork = work;
		selectedIndex = index;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		selectedWork = null;
		document.body.style.overflow = '';
	}

	function nextWork() {
		if (selectedIndex < works.length - 1) {
			selectedIndex++;
			selectedWork = works[selectedIndex];
		}
	}

	function prevWork() {
		if (selectedIndex > 0) {
			selectedIndex--;
			selectedWork = works[selectedIndex];
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (selectedWork) {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowRight') nextWork();
			if (e.key === 'ArrowLeft') prevWork();
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
			{#each works as work, index (work.id)}
				<button
					class="card p-0 overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer w-full break-inside-avoid group relative"
					onclick={() => openLightbox(work, index)}
					onkeydown={(e) => e.key === 'Enter' && openLightbox(work, index)}
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
								{#if work.title}
									<h3 class="text-white font-bold text-lg">{work.title}</h3>
								{/if}
							</div>
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

{#if selectedWork}
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
		{#if selectedIndex > 0}
			<button
				class="absolute left-4 top-1/2 -translate-y-1/2 z-20 btn-icon btn-icon-lg variant-filled-surface hover:scale-110 transition-transform"
				onclick={prevWork}
				transition:fly={{ x: -20, duration: 200 }}
			>
				<ChevronLeft class="w-6 h-6" />
			</button>
		{/if}

		{#if selectedIndex < works.length - 1}
			<button
				class="absolute right-4 top-1/2 -translate-y-1/2 z-20 btn-icon btn-icon-lg variant-filled-surface hover:scale-110 transition-transform"
				onclick={nextWork}
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
				{#if selectedWork.image}
					<img
						src={pb.files.getURL(selectedWork, selectedWork.image)}
						alt={selectedWork.title}
						class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
					/>
				{:else}
					<div class="p-10 opacity-50">No Image</div>
				{/if}
			</div>

			<!-- Info Panel -->
			{#if selectedWork.title || selectedWork.description}
				<div
					class="bg-surface-800/90 backdrop-blur-md rounded-container-token p-6 max-w-2xl mx-auto w-full"
				>
					{#if selectedWork.title}
						<h2 class="h2 font-bold mb-2">{selectedWork.title}</h2>
					{/if}
					{#if selectedWork.description}
						<p class="opacity-80 whitespace-pre-wrap">{selectedWork.description}</p>
					{/if}
					<div class="mt-4 text-sm opacity-60">
						{selectedIndex + 1} / {works.length}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
