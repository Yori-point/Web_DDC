<script>
	import MediaPanel from "$lib/components/MediaPanel.svelte";
</script>

<div id="chapterContainer" class="chapter-container hidden">
	<button id="backToMap" class="chapter-back">← MAPPA</button>

	<div class="chapter-meta">
		<span id="chapterNumber">02</span>
		<span>LEGACY TRACE</span>
	</div>

	<div class="chapter-copy">
		<h2 id="chapterTitle">Lavoro / Opportunità</h2>
		<p id="chapterSubtitle">Direzioni che aprono il futuro.</p>
	</div>

	<div class="chapter-media-map">
		<div id="interviewNodes" class="interview-nodes"></div>
		<MediaPanel />
	</div>
</div>