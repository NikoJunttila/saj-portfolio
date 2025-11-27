<script lang="ts">
	import { Instagram, Coffee, Mail } from '@lucide/svelte';
	import { siteConfig } from '$lib/config';
</script>

<div class="container mx-auto p-4 max-w-4xl">
	<div class="text-center mb-12">
		<h1 class="h1 mb-4">Get in Touch</h1>
		<p class="text-xl opacity-80 max-w-2xl mx-auto">
			Let's connect! Reach out for commissions, collaborations, or just to say hi.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
		<!-- Instagram Card -->
		<a
			href={siteConfig.socials.instagram}
			target="_blank"
			rel="noopener noreferrer"
			class="card p-8 hover:scale-105 transition-transform duration-200 flex flex-col items-center gap-4 text-center group"
		>
			<div
				class="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors"
			>
				<Instagram class="w-8 h-8 text-primary-500" />
			</div>
			<div>
				<h2 class="h3 mb-2">Instagram</h2>
				<p class="opacity-70 mb-4">
					Follow my latest work and send me a DM for commission inquiries
				</p>
				<span class="btn preset-filled-primary-500">Visit Instagram</span>
			</div>
		</a>

		<!-- Ko-fi Card -->
		<a
			href={siteConfig.socials.kofi}
			target="_blank"
			rel="noopener noreferrer"
			class="card p-8 hover:scale-105 transition-transform duration-200 flex flex-col items-center gap-4 text-center group"
		>
			<div
				class="w-16 h-16 rounded-full bg-secondary-500/20 flex items-center justify-center group-hover:bg-secondary-500/30 transition-colors"
			>
				<Coffee class="w-8 h-8 text-secondary-500" />
			</div>
			<div>
				<h2 class="h3 mb-2">Ko-fi</h2>
				<p class="opacity-70 mb-4">Support my work and get exclusive content</p>
				<span class="btn preset-filled-secondary-500">Support on Ko-fi</span>
			</div>
		</a>
	</div>

	<!-- Commission Info Card -->
	<div class="card p-8 text-center bg-surface-800/50">
		<div class="flex justify-center mb-4">
			<div class="w-12 h-12 rounded-full bg-tertiary-500/20 flex items-center justify-center">
				<Mail class="w-6 h-6 text-tertiary-500" />
			</div>
		</div>
		<h2 class="h2 mb-4">Commission Inquiries</h2>
		<p class="text-lg opacity-80 max-w-xl mx-auto mb-6">
			Interested in commissioning a piece? Send me a direct message on Instagram with your ideas,
			reference images, and budget. I'll get back to you as soon as possible!
		</p>
		<div class="flex flex-wrap gap-4 justify-center">
			<a href="/commissions" class="btn preset-tonal-primary-500"> View Portfolio </a>
			<a
				href={siteConfig.socials.instagram}
				target="_blank"
				rel="noopener noreferrer"
				class="btn preset-filled-primary-500"
			>
				Message on Instagram
			</a>
		</div>
	</div>
</div>
