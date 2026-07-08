<script>
	import { onMount } from "svelte";

	import Intro from "$lib/components/Intro.svelte";
	import OverviewUI from "$lib/components/OverviewUI.svelte";
	import CategoryBar from "$lib/components/CategoryBar.svelte";
	import InfoPanel from "$lib/components/InfoPanel.svelte";
	import ChapterView from "$lib/components/ChapterView.svelte";
	import RitualHint from "$lib/components/RitualHint.svelte";

	import { initScene } from "$lib/three/initScene.js";

	onMount(() => {
		const cleanup = initScene();

		return () => {
			if (cleanup) cleanup();
		};
	});
</script>

<div id="app">
	<canvas id="scene"></canvas>
	<div id="hotspotLayer" class="hotspot-layer"></div>

	<RitualHint />
	<Intro />
	<OverviewUI />
	<CategoryBar />
	<InfoPanel />
	<ChapterView />
</div>