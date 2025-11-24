<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';
	import { fade, scale } from 'svelte/transition';

	let works: RecordModel[] = $state([]);
	let selectedWork: RecordModel | null = $state(null);

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

	function openLightbox(work: RecordModel) {
		selectedWork = work;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		selectedWork = null;
		document.body.style.overflow = '';
	}
</script>

<svelte:window onkeydown={(e) => selectedWork && e.key === 'Escape' && closeLightbox()} />

<div class="container mx-auto p-4">
	<h1 class="h1 mb-8 text-center">Gallery</h1>

	{#if works.length === 0}
		<p class="text-center opacity-50">No works found.</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each works as work (work.id)}
				<button
					class="card p-0 overflow-hidden hover:brightness-110 transition-all cursor-pointer text-left w-full"
					onclick={() => openLightbox(work)}
					onkeydown={(e) => e.key === 'Enter' && openLightbox(work)}
				>
					{#if work.image}
						<img
							src={pb.files.getURL(work, work.image, { thumb: '400x400' })}
							alt={work.title || 'Work Image'}
							class="w-full aspect-square object-cover"
						/>
					{:else}
						<div class="w-full aspect-square bg-surface-500/20 flex items-center justify-center">
							<span class="opacity-50">No Image</span>
						</div>
					{/if}
				</button>
			{/each}
		</div>
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
			class="absolute inset-0 bg-black/90 cursor-default"
			transition:fade={{ duration: 200 }}
			onclick={closeLightbox}
			role="button"
			tabindex="0"
			aria-label="Close lightbox"
			onkeydown={(e) => e.key === 'Enter' && closeLightbox()}
		></div>

		<!-- Content -->
		<div
			class="relative max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6 bg-surface-800 rounded-container-token p-6 shadow-2xl z-10"
			transition:scale={{ duration: 200, start: 0.9 }}
		>
			<button
				class="btn-icon btn-icon-sm absolute top-2 right-2 md:top-4 md:right-4 variant-filled-surface z-10"
				onclick={closeLightbox}
			>
				✕
			</button>

			<div
				class="flex-1 flex items-center justify-center bg-black/20 rounded-container-token overflow-hidden"
			>
				{#if selectedWork.image}
					<img
						src={pb.files.getURL(selectedWork, selectedWork.image)}
						alt={selectedWork.title}
						class="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain"
					/>
				{:else}
					<div class="p-10 opacity-50">No Image</div>
				{/if}
			</div>

			<div class="md:w-1/3 flex flex-col justify-center gap-4">
				<div>
					<h2 class="h2 font-bold mb-2">{selectedWork.title || 'Untitled'}</h2>
					{#if selectedWork.description}
						<p class="opacity-80 whitespace-pre-wrap">{selectedWork.description}</p>
					{:else}
						<p class="opacity-50 italic">No description provided.</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
