<script lang="ts">
	import { FileIcon } from '@lucide/svelte';
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	let title = $state('');
	let description = $state('');
	let mainImageFiles: File[] = $state([]);
	let files: File[] = $state([]);
	let isSubmitting = $state(false);

	async function createCommission() {
		if (!title) {
			alert('Please enter a title');
			return;
		}
		if (mainImageFiles.length === 0) {
			alert('Please select a main image');
			return;
		}

		isSubmitting = true;

		try {
			// 1. Create the commission record with main image
			const commissionFormData = new FormData();
			commissionFormData.append('title', title);
			commissionFormData.append('description', description);
			commissionFormData.append('image', mainImageFiles[0]);

			const commission = await pb.collection('commissions').create(commissionFormData);

			// 2. Upload images linked to the commission
			for (const file of files) {
				const formData = new FormData();
				formData.append('image', file);
				formData.append('commission', commission.id);
				// We can optionally add title/description to individual images if needed,
				// but for now we'll just link them to the commission.
				formData.append('title', file.name);

				await pb.collection('images').create(formData);
			}

			alert('Commission created successfully!');
			goto('/gallery'); // Or redirect to the new commission page if we had one
		} catch (err) {
			console.error('Error creating commission:', err);
			alert('Failed to create commission. See console for details.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto p-4 max-w-2xl">
	<h1 class="h1 mb-6 text-center">New Commission</h1>

	<div class="flex flex-col gap-4">
		<label class="label">
			<span>Title</span>
			<input class="input" type="text" bind:value={title} placeholder="Commission Title" />
		</label>
		<label class="label">
			<span>Description</span>
			<textarea class="textarea" bind:value={description} placeholder="Commission Description"
			></textarea>
		</label>

		<div class="card p-4">
			<h3 class="h3 mb-2">Main Image</h3>
			<FileUpload onFileChange={(e) => (mainImageFiles = e.acceptedFiles)} maxFiles={1}>
				<FileUpload.Label>Upload main image</FileUpload.Label>
				<FileUpload.Dropzone>
					<FileIcon class="size-10" />
					<span>Select file or drag here.</span>
					<FileUpload.Trigger class="btn preset-filled-primary-500">Browse Files</FileUpload.Trigger
					>
					<FileUpload.HiddenInput />
				</FileUpload.Dropzone>
				<FileUpload.ItemGroup>
					<FileUpload.Context>
						{#snippet children(fileUpload)}
							{#each fileUpload().acceptedFiles as file (file.name)}
								<FileUpload.Item {file}>
									<FileUpload.ItemName>{file.name}</FileUpload.ItemName>
									<FileUpload.ItemSizeText>{file.size} bytes</FileUpload.ItemSizeText>
									<FileUpload.ItemDeleteTrigger />
								</FileUpload.Item>
							{/each}
						{/snippet}
					</FileUpload.Context>
				</FileUpload.ItemGroup>
			</FileUpload>
		</div>

		<div class="card p-4">
			<h3 class="h3 mb-2">Gallery Images</h3>
			<FileUpload onFileChange={(e) => (files = e.acceptedFiles)} maxFiles={20}>
				<FileUpload.Label>Upload gallery images</FileUpload.Label>
				<FileUpload.Dropzone>
					<FileIcon class="size-10" />
					<span>Select files or drag here.</span>
					<FileUpload.Trigger class="btn preset-filled-primary-500">Browse Files</FileUpload.Trigger
					>
					<FileUpload.HiddenInput />
				</FileUpload.Dropzone>
				<FileUpload.ItemGroup>
					<FileUpload.Context>
						{#snippet children(fileUpload)}
							{#each fileUpload().acceptedFiles as file (file.name)}
								<FileUpload.Item {file}>
									<FileUpload.ItemName>{file.name}</FileUpload.ItemName>
									<FileUpload.ItemSizeText>{file.size} bytes</FileUpload.ItemSizeText>
									<FileUpload.ItemDeleteTrigger />
								</FileUpload.Item>
							{/each}
						{/snippet}
					</FileUpload.Context>
				</FileUpload.ItemGroup>
			</FileUpload>
		</div>

		<button
			onclick={createCommission}
			class="btn preset-filled-primary-500 w-full"
			disabled={isSubmitting}
		>
			{isSubmitting ? 'Creating...' : 'Create Commission'}
		</button>
	</div>
</div>
