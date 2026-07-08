<script>
	import { onMount } from "svelte";
	import ParticleTitle from "$lib/components/ParticleTitle.svelte";

	onMount(() => {
		document.body.classList.add("intro-active");
	});

	function enterOverview() {
		const intro = document.getElementById("intro");

		if (intro) {
			intro.classList.add("hidden");
		}

		document.body.classList.remove("intro-active");
	}

	/**
	 * @param {number} seed
	 * @returns {number}
	 */
	function seededRandom(seed) {
		const x = Math.sin(seed * 999) * 10000;
		return x - Math.floor(x);
	}

	const introSnowflakes = Array.from({ length: 320 }, (_, index) => {
		/** @param {number} n */
		const r = (n) => seededRandom(index * 23 + n);

		const seed = r(1);
		const type = seed > 0.88 ? "crystal" : seed > 0.58 ? "blur" : "dot";

		return {
			type,
			direction: r(3) > 0.82 ? "up" : "down",
			x: Math.round(r(4) * 100),
			y: Math.round(r(5) * 100),

			size:
				type === "blur"
					? Math.round(10 + r(7) * 54)
					: Math.round(2 + r(8) * 4),

			duration: Math.round(14 + r(9) * 28),
			delay: Math.round(r(10) * -28),

			opacity:
				type === "crystal"
					? 0.16 + r(11) * 0.22
					: type === "blur"
						? 0.08 + r(12) * 0.18
						: 0.18 + r(13) * 0.36,

			drift: Math.round(-90 + r(14) * 180),

			blur:
				type === "crystal"
					? 0.2 + r(15) * 0.8
					: type === "blur"
						? 2.5 + r(15) * 6
						: 0.4 + r(16) * 1.4,

			rotate: Math.round(r(17) * 360)
		};
	});
</script>

<div id="intro" class="intro">
	<div class="intro-snow-layer" aria-hidden="true">
		{#each introSnowflakes as flake}
			<span
				class={`intro-snow intro-snow--${flake.type} ${flake.direction === "up" ? "is-up" : "is-down"}`}
				style={`
					left: ${flake.x}vw;
					top: ${flake.y}vh;
					--snow-size: ${flake.size}px;
					--snow-duration: ${flake.duration}s;
					--snow-delay: ${flake.delay}s;
					--snow-opacity: ${flake.opacity};
					--snow-drift: ${flake.drift}px;
					--snow-blur: ${flake.blur}px;
					--snow-rotate: ${flake.rotate}deg;
				`}
			></span>
		{/each}
	</div>

	<div class="intro-content">
		<div class="intro-rings">
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
		</div>

		<div class="intro-header">
			MILANO CORTINA 2026 | LEGACY OLIMPICHE
		</div>

		<ParticleTitle text="Tracce" variant="intro" ariaLabel="Tracce" />

		<p class="intro-text">
			Un viaggio tra frammenti e memorie. <br />Attraversa una mappa di voci e testimonianze per scoprire ciò che resta<br /> dell’esperienza olimpica.
		</p>

		<button id="enterBtn" class="enter-btn glow-orb" aria-label="Esplora la mappa" onclick={enterOverview}>
			<span class="enter-glow"></span>
		</button>

		<div class="intro-enter-hint">
			ESPLORA LA MAPPA
		</div>
	</div>

	<div class="intro-footer">
		Milano Cortina 2026 / Legacy Olimpiche
	</div>
</div>
