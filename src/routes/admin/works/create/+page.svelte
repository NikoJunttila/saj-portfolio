<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	let files: FileList | null = $state(null);
	let items: { file: File; title: string; description: string }[] = $state([]);
	let isUploading = $state(false);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const newItems = Array.from(target.files).map((file) => ({
				file,
				title: file.name.split('.')[0], // Default title from filename
				description: ''
			}));
			items = [...items, ...newItems];
			// Reset input so same files can be selected again if needed (though unlikely for this flow)
			target.value = '';
		}
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	async function uploadAll() {
		if (items.length === 0) return;
		isUploading = true;

		try {
			// Upload sequentially to preserve order if needed, or parallel for speed.
			// Parallel is better for UX here.
			const promises = items.map((item) => {
				const formData = new FormData();
				formData.append('image', item.file);
				formData.append('title', item.title);
				formData.append('description', item.description);
				// Add default values if needed, e.g. enabled=true
				formData.append('enabled', 'true');

				return pb.collection('works').create(formData, { requestKey: null });
			});

			await Promise.all(promises);
			alert('All items uploaded successfully!');
			goto('/admin/works');
		} catch (err) {
			console.error('Error uploading items:', err);
			alert('Some items failed to upload. Check console for details.');
		} finally {
			isUploading = false;
		}
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="h1 mb-6">Bulk Create Works</h1>

	<div class="card p-4 mb-6 space-y-4">
		<label class="label">
			<span class="font-bold">Select Images</span>
			<input
				class="input"
				type="file"
				multiple
				accept="image/*"
				onchange={handleFileSelect}
				disabled={isUploading}
			/>
		</label>
		<p class="text-sm opacity-70">Select multiple images to start. You can edit details below.</p>
	</div>

	{#if items.length > 0}
		<div class="grid grid-cols-1 gap-4 mb-6">
			{#each items as item, i}
				<div class="card p-4 flex gap-4 items-start">
					<div class="w-32 aspect-square bg-surface-500/20 rounded-container-token overflow-hidden">
						<img
							src={URL.createObjectURL(item.file)}
							alt="Preview"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="flex-1 space-y-2">
						<label class="label">
							<span>Title</span>
							<input class="input" type="text" bind:value={item.title} disabled={isUploading} />
						</label>
						<label class="label">
							<span>Description</span>
							<textarea
								class="textarea"
								rows="2"
								bind:value={item.description}
								disabled={isUploading}
							></textarea>
						</label>
					</div>
					<button
						class="btn-icon preset-filled-error-500"
						onclick={() => removeItem(i)}
						disabled={isUploading}
					>
						✕
					</button>
				</div>
			{/each}
		</div>

		<div class="flex justify-end gap-4">
			<a href="/admin/works" class="btn preset-tonal" aria-disabled={isUploading}>Cancel</a>
			<button class="btn preset-filled-primary-500" onclick={uploadAll} disabled={isUploading}>
				{#if isUploading}
					Uploading...
				{:else}
					Upload All ({items.length})
				{/if}
			</button>
		</div>
	{/if}
</div>
