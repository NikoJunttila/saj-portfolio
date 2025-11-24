<script lang="ts">
	import { page } from '$app/state';
	import { pb } from '$lib/pocketbase';
	import { FileIcon } from '@lucide/svelte';
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import type { RecordModel } from 'pocketbase';

	let commission: RecordModel | null = $state(null);
	let images: RecordModel[] = $state([]);

	// Form state
	let title = $state('');
	let description = $state('');
	let type = $state('');
	let status = $state('');
	let client = $state('');
	let enabled = $state(false);
	let mainImageFiles: File[] = $state([]);
	let newGalleryFiles: File[] = $state([]);
	let isSaving = $state(false);

	const id = page.params.id ?? '';

	async function loadData() {
		try {
			commission = await pb.collection('commissions').getOne(id);
			if (commission) {
				title = commission.title || '';
				description = commission.description || '';
				type = commission.type || '';
				status = commission.status || '';
				client = commission.client || '';
				enabled = commission.enabled;
			}

			const result = await pb.collection('images').getList(1, 50, {
				filter: `commission = "${id}"`,
				sort: 'sortindex'
			});
			images = result.items;
		} catch (err) {
			console.error('Error loading data:', err);
		}
	}

	$effect(() => {
		if (id) loadData();
	});

	async function saveCommission() {
		isSaving = true;
		try {
			const formData = new FormData();
			formData.append('title', title || '');
			formData.append('description', description || '');
			formData.append('type', type || '');
			formData.append('status', status || '');
			formData.append('client', client || '');
			formData.append('enabled', enabled.toString());
			if (mainImageFiles.length > 0) {
				formData.append('image', mainImageFiles[0]);
			}

			await pb.collection('commissions').update(id, formData);

			// Upload new gallery images
			for (const file of newGalleryFiles) {
				const imgFormData = new FormData();
				imgFormData.append('image', file);
				imgFormData.append('commission', id);
				imgFormData.append('title', file.name);
				// Default sortindex to end of list? Or 0. Let's leave it default for now.
				await pb.collection('images').create(imgFormData);
			}

			// Clear file inputs
			mainImageFiles = [];
			newGalleryFiles = [];

			await loadData(); // Reload to show changes
			alert('Saved successfully!');
		} catch (err) {
			console.error('Error saving:', err);
			alert('Error saving changes.');
		} finally {
			isSaving = false;
		}
	}

	async function deleteImage(imageId: string) {
		if (!confirm('Are you sure you want to delete this image?')) return;
		try {
			await pb.collection('images').delete(imageId);
			await loadData();
		} catch (err) {
			console.error('Error deleting image:', err);
			alert('Error deleting image.');
		}
	}

	async function updateImageMetadata(image: RecordModel) {
		try {
			await pb.collection('images').update(image.id, {
				title: image.title,
				description: image.description,
				sortindex: image.sortindex
			});
			// Optional: show a small toast or indicator
		} catch (err) {
			console.error('Error updating image metadata:', err);
			alert('Error updating image details.');
		}
	}
</script>

<div class="container mx-auto p-4 max-w-4xl">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h1">Edit Commission</h1>
		<a href="/admin/commissions" class="btn preset-tonal">Back to List</a>
	</div>

	{#if commission}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- Commission Details -->
			<div class="flex flex-col gap-4">
				<h2 class="h2">Details</h2>
				<label class="label flex items-center gap-2">
					<span>Enabled</span>
					<input class="checkbox" type="checkbox" bind:checked={enabled} />
				</label>
				<label class="label">
					<span>Title</span>
					<input class="input" type="text" bind:value={title} />
				</label>
				<label class="label">
					<span>Client</span>
					<input class="input" type="text" bind:value={client} />
				</label>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label class="label">
						<span>Type</span>
						<input class="input" type="text" bind:value={type} />
					</label>
					<label class="label">
						<span>Status</span>
						<input class="input" type="text" bind:value={status} />
					</label>
				</div>
				<label class="label">
					<span>Description</span>
					<textarea class="textarea" bind:value={description} rows="4"></textarea>
				</label>

				<div class="card p-4">
					<h3 class="h3 mb-2">Main Image</h3>
					{#if commission.image}
						<img
							src={pb.files.getURL(commission, commission.image)}
							alt="Current Main"
							class="w-32 h-32 object-cover rounded-container-token mb-2"
						/>
					{/if}
					<FileUpload onFileChange={(e) => (mainImageFiles = e.acceptedFiles)} maxFiles={1}>
						<FileUpload.Label>Replace Main Image</FileUpload.Label>
						<FileUpload.Dropzone>
							<FileIcon class="size-8" />
							<span>Select new file to replace.</span>
							<FileUpload.HiddenInput />
						</FileUpload.Dropzone>
					</FileUpload>
				</div>
			</div>

			<!-- Gallery Management -->
			<div class="flex flex-col gap-4">
				<h2 class="h2">Gallery Images</h2>

				<!-- Add New Images -->
				<div class="card p-4">
					<h3 class="h3 mb-2">Add New Images</h3>
					<FileUpload onFileChange={(e) => (newGalleryFiles = e.acceptedFiles)} maxFiles={20}>
						<FileUpload.Label>Upload images</FileUpload.Label>
						<FileUpload.Dropzone>
							<FileIcon class="size-8" />
							<span>Select files.</span>
							<FileUpload.HiddenInput />
						</FileUpload.Dropzone>
						<FileUpload.ItemGroup>
							<FileUpload.Context>
								{#snippet children(fileUpload)}
									{#each fileUpload().acceptedFiles as file (file.name)}
										<FileUpload.Item {file}>
											<FileUpload.ItemName>{file.name}</FileUpload.ItemName>
											<FileUpload.ItemDeleteTrigger />
										</FileUpload.Item>
									{/each}
								{/snippet}
							</FileUpload.Context>
						</FileUpload.ItemGroup>
					</FileUpload>
				</div>

				<!-- Existing Images List -->
				<div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
					{#each images as image (image.id)}
						<div class="card p-2 flex gap-4 items-start">
							<img
								src={pb.files.getURL(image, image.image)}
								alt={image.title}
								class="w-24 h-24 object-cover rounded-container-token"
							/>
							<div class="flex-1 flex flex-col gap-2">
								<div class="flex gap-2">
									<input
										class="input py-1 px-2 text-sm flex-1"
										type="text"
										bind:value={image.title}
										placeholder="Image Title"
										onblur={() => updateImageMetadata(image)}
									/>
									<label for="sortindex">Sort</label>
									<input
										id="sortindex"
										class="input py-1 px-2 text-sm w-20"
										type="number"
										bind:value={image.sortindex}
										placeholder="Sort"
										onblur={() => updateImageMetadata(image)}
									/>
								</div>
								<textarea
									class="textarea py-1 px-2 text-sm"
									bind:value={image.description}
									placeholder="Image Description"
									rows="2"
									onblur={() => updateImageMetadata(image)}
								></textarea>
								<button
									class="btn preset-filled-error-500 btn-sm self-end"
									onclick={() => deleteImage(image.id)}
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="mt-8 border-t border-surface-500/30 pt-4">
			<button
				onclick={saveCommission}
				class="btn preset-filled-primary-500 w-full md:w-auto"
				disabled={isSaving}
			>
				{isSaving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	{:else}
		<p>Loading...</p>
	{/if}
</div>
