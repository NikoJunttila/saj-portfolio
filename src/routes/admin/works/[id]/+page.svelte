<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';

	let work: RecordModel | null = $state(null);
	let title = $state('');
	let description = $state('');
	let groupId = $state('');
	let newImage: File | null = $state(null);
	let isSaving = $state(false);

	$effect(() => {
		const id = page.params.id;
		if (!id) {
			goto('/admin/works');
			return;
		}
		pb.collection('works')
			.getOne(id)
			.then((record) => {
				work = record;
				title = record.title;
				description = record.description;
				groupId = record.group_id;
			})
			.catch((err) => {
				console.error('Error fetching work:', err);
				alert('Failed to load work');
				goto('/admin/works');
			});
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			newImage = target.files[0];
		}
	}

	async function save() {
		if (!work) return;
		isSaving = true;

		try {
			const formData = new FormData();
			formData.append('title', title);
			formData.append('description', description);
			if (groupId) {
				formData.append('group_id', groupId);
			} else {
				formData.append('group_id', '');
			}
			if (newImage) {
				formData.append('image', newImage);
			}

			await pb.collection('works').update(work.id, formData);
			alert('Work updated successfully!');
			goto('/admin/works');
		} catch (err) {
			console.error('Error updating work:', err);
			alert('Failed to update work');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="h1 mb-6">Edit Work</h1>

	{#if work}
		<div class="card p-4 space-y-4 max-w-2xl mx-auto">
			<div class="flex justify-center mb-4">
				{#if newImage}
					<img
						src={URL.createObjectURL(newImage)}
						alt="New Preview"
						class="max-h-64 rounded-container-token"
					/>
				{:else if work.image}
					<img
						src={pb.files.getURL(work, work.image)}
						alt={work.title}
						class="max-h-64 rounded-container-token"
					/>
				{:else}
					<div
						class="w-full h-64 bg-surface-500/20 rounded-container-token flex items-center justify-center"
					>
						<span class="opacity-50">No Image</span>
					</div>
				{/if}
			</div>

			<label class="label">
				<span>Title</span>
				<input class="input" type="text" bind:value={title} disabled={isSaving} />
			</label>

			<label class="label">
				<span>Description</span>
				<textarea class="textarea" rows="4" bind:value={description} disabled={isSaving}></textarea>
			</label>

			<label class="label">
				<span>Group ID</span>
				<div class="flex gap-2">
					<input
						class="input"
						type="text"
						bind:value={groupId}
						disabled={isSaving}
						placeholder="Optional group ID"
					/>
					<button
						class="btn-icon preset-tonal"
						onclick={() => (groupId = crypto.randomUUID())}
						disabled={isSaving}
						title="Generate new Group ID"
					>
						🎲
					</button>
				</div>
			</label>

			<label class="label">
				<span>Change Image</span>
				<input
					class="input"
					type="file"
					accept="image/*"
					onchange={handleFileSelect}
					disabled={isSaving}
				/>
			</label>

			<div class="flex justify-end gap-4 pt-4">
				<a href="/admin/works" class="btn preset-tonal" aria-disabled={isSaving}>Cancel</a>
				<button class="btn preset-filled-primary-500" onclick={save} disabled={isSaving}>
					{#if isSaving}
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<div class="flex justify-center p-8">
			<p>Loading...</p>
		</div>
	{/if}
</div>
