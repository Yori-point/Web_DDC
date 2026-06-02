<script>
	import { onMount } from "svelte";
	import { createIntroButtonBackgroundDataUrl } from "$lib/three/textures.js";

	let enterIconStyle = $state("");

	onMount(() => {
		document.body.classList.add("intro-active");
		enterIconStyle = `background-image: url(${createIntroButtonBackgroundDataUrl()});`;
	});

	function enterOverview() {
		const intro = document.getElementById("intro");

		if (intro) {
			intro.classList.add("hidden");
		}

		document.body.classList.remove("intro-active");
	}
</script>

<div id="intro" class="intro">
	<div class="intro-content">
		<div class="intro-rings">
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
		</div>

		<div class="intro-footer">
			Milano Cortina 2026 | Legacy Olimpiche
		</div>

		<h1 class="intro-title">Tracce</h1>

		<p class="intro-text">
			Un viaggio tra frammenti e memorie. <br>
			Attraversa una mappa di voci e testimonianze per scoprire ciò
			che resta dell’esperienza olimpica.
		</p>

		<button id="enterBtn" class="enter-btn" aria-label="Esplora la mappa" onclick={enterOverview}>
			<span class="enter-icon-shell" style={enterIconStyle}>
				<span class="enter-icon">↓</span>
			</span>
			<span class="enter-label">ESPLORA LA MAPPA</span>
		</button>
	</div>
</div>