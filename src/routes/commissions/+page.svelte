<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';
	import { siteConfig } from '$lib/config';
	import { MessageCircle, Palette, Clock } from '@lucide/svelte';

	let commissions: RecordModel[] = $state([]);

	$effect(() => {
		pb.collection('commissions')
			.getFullList({
				sort: '-created',
				filter: 'enabled = true'
			})
			.then((records) => {
				commissions = records;
			})
			.catch((err) => {
				console.error('Error fetching commissions:', err);
			});
	});
</script>

<div class="container mx-auto p-4">
	<!-- Hero Section -->
	<div class="text-center mb-12">
		<h1 class="h1 mb-6">Commissions</h1>
		<div
			class="card p-8 max-w-3xl mx-auto bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-2 border-primary-500/20"
		>
			<div class="flex justify-center mb-6">
				<div class="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
					<MessageCircle class="w-8 h-8 text-primary-500" />
				</div>
			</div>
			<h2 class="h2 mb-4">Ready to Commission?</h2>
			<p class="text-lg mb-6 opacity-90">
				Interested in commissioning a piece? Contact me via Instagram DMs to discuss your project,
				share your ideas, and get a personalized quote!
			</p>
			<a href={siteConfig.socials.instagram} class="btn preset-filled-primary-500 btn-lg">
				Contact Me on Instagram
			</a>
		</div>
	</div>

	<!-- Portfolio Section -->
	<div class="mb-8">
		<h2 class="h2 text-center mb-8">Recent Commissions</h2>
		{#if commissions.length === 0}
			<div class="card p-12 text-center">
				<p class="opacity-50 text-lg">No commissions to display yet.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each commissions as commission (commission.id)}
					<a
						href="/commissions/{commission.id}"
						class="card p-0 overflow-hidden hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group"
					>
						<!-- Image -->
						<div class="relative overflow-hidden">
							{#if commission.image}
								<img
									src={pb.files.getURL(commission, commission.image, { thumb: '500x500' })}
									alt={commission.title || 'Commission Image'}
									class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
								/>
								<!-- Gradient Overlay -->
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								></div>
							{:else}
								<div
									class="bg-surface-500/20 w-full aspect-square rounded-t-container-token flex items-center justify-center"
								>
									<span class="opacity-50">No Image</span>
								</div>
							{/if}
						</div>

						<!-- Content -->
						<div class="p-5 space-y-3">
							<h3 class="h3 font-bold line-clamp-1 group-hover:text-primary-500 transition-colors">
								{commission.title || 'Untitled'}
							</h3>

							<!-- Badges -->
							<div class="flex flex-wrap gap-2">
								{#if commission.type}
									<span class="badge variant-soft-secondary text-xs flex items-center gap-1">
										<Palette class="w-3 h-3" />
										{commission.type}
									</span>
								{/if}
								{#if commission.status}
									<span class="badge variant-soft-primary text-xs flex items-center gap-1">
										<Clock class="w-3 h-3" />
										{commission.status}
									</span>
								{/if}
							</div>

							<!-- Client -->
							{#if commission.client}
								<p class="text-sm opacity-70 italic">
									for {commission.client}
								</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Call to Action Footer -->
	<div class="card p-8 text-center bg-surface-800/50 max-w-2xl mx-auto mt-12">
		<h3 class="h3 mb-4">Don't See What You're Looking For?</h3>
		<p class="opacity-80 mb-6">
			Every commission is unique! Reach out to discuss your custom project and let's bring your
			vision to life.
		</p>
		<a href="/contact" class="btn preset-tonal-primary-500"> Get in Touch </a>
	</div>
</div>
