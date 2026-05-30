<script>
	import { onMount } from "svelte";

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

		<h1 class="intro-title">Tracce</h1>

		<p class="intro-text">
			Un paesaggio di voci, tracce e testimonianze racconta ciò<br />
			che resta dell’esperienza olimpica tra città e montagna.
		</p>

		<button id="enterBtn" class="enter-btn" aria-label="Entra" onclick={enterOverview}>
			<span class="enter-snowflake">❄</span>
		</button>
	</div>

	<div class="intro-footer">
		Milano Cortina 2026 / Legacy Olimpiche
	</div>
</div>