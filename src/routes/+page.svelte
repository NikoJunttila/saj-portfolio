<script lang="ts">
	// Landing Page
	let selectedImage: string | null = $state(null);
	import { fly, fade } from 'svelte/transition';
</script>

<!-- Hero Section -->
<section class="relative h-screen w-full overflow-hidden">
	<!-- Video Background -->
	<img
		class="absolute top-0 left-0 w-full h-full object-cover z-0"
		src="/city_streets.webp"
		alt="City streets"
	/>

	<!-- Overlay -->
	<div
		class="absolute top-0 left-0 w-full h-full bg-black/20 z-10 flex flex-col items-center justify-center text-center"
	>
		<div
			class="bg-black/30 p-6 md:p-10 rounded-3xl backdrop-blur-sm max-w-5xl w-[90%] md:w-auto mx-auto mb-8"
		>
			<h1
				in:fly={{ y: 20, duration: 800, delay: 200 }}
				class="h1 text-2xl md:text-6xl lg:text-8xl font-bold text-white mb-4 drop-shadow-xl leading-tight"
			>
				Art Commissions
			</h1>
			<p
				in:fly={{ y: 20, duration: 800, delay: 400 }}
				class="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto drop-shadow-lg font-medium"
			>
				Bring your characters to life with high-quality, custom illustrations.
			</p>
		</div>
		<a
			in:fly={{ y: 20, duration: 800, delay: 600 }}
			href="/commissions"
			class="btn preset-filled-primary-500 btn-lg text-lg px-8 py-4 shadow-xl hover:scale-105 transition-transform"
		>
			Commission Me
		</a>
	</div>
</section>

<!-- Info Section -->
<section class="container mx-auto px-4 py-16">
	<p class="text-lg opacity-80 leading-relaxed mb-8">
		Please review my terms of service before commissioning. I work closely with clients to ensure
		the final piece meets their expectations. Turnaround time varies depending on complexity, but I
		strive to keep you updated every step of the way.
	</p>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
		<div class="space-y-4">
			<h2 class="h2 text-4xl font-bold">My Style</h2>
			<p class="text-lg opacity-80 leading-relaxed">
				I specialize in character design and illustration, focusing on expressive poses and vibrant
				colors. Whether you need a reference sheet, a full illustration, or a simple sketch, I'm
				here to help you visualize your ideas.
			</p>
		</div>
		<button
			class="card p-2 variant-glass-surface shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 cursor-zoom-in"
			onclick={() => (selectedImage = '/comm_ref.webp')}
		>
			<img
				src="/comm_ref.webp"
				alt="Commission Reference"
				class="w-full h-auto rounded-container-token"
			/>
		</button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
		<button
			class="card p-2 variant-glass-surface shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-500 order-2 md:order-1 cursor-zoom-in"
			onclick={() => (selectedImage = '/comm_sheet.gif')}
		>
			<img
				src="/comm_sheet.gif"
				alt="Additional Info"
				class="w-full h-auto rounded-container-token"
			/>
		</button>
		<div class="space-y-4 order-1 md:order-2">
			<h2 class="h2 text-4xl font-bold">Commission sheet</h2>
			<p class="text-lg opacity-80 leading-relaxed">lorem ipsum</p>
		</div>
	</div>

	<div class="grid pt-2 grid-cols-1 md:grid-cols-2 gap-8 items-center">
		<div class="space-y-4">
			<h2 class="h2 text-4xl font-bold">Process & Terms</h2>
			<p class="text-lg opacity-80 leading-relaxed">
				Please review my terms of service before commissioning. I work closely with clients to
				ensure the final piece meets their expectations. Turnaround time varies depending on
				complexity, but I strive to keep you updated every step of the way.
			</p>
			<a href="/contact" class="btn preset-tonal-secondary mt-4"> Get in Touch </a>
		</div>
		<button
			class="card p-2 variant-glass-surface shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-500 order-2 md:order-1 cursor-zoom-in"
			onclick={() => (selectedImage = '/additional_info.webp')}
		>
			<img
				src="/additional_info.webp"
				alt="Additional Info"
				class="w-full h-auto rounded-container-token"
			/>
		</button>
	</div>
</section>

<!-- Lightbox Modal -->
{#if selectedImage}
	<button
		class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
		onclick={() => (selectedImage = null)}
		aria-label="Close lightbox"
	>
		<img
			src={selectedImage}
			alt="Full screen view"
			class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
		/>
	</button>
{/if}
