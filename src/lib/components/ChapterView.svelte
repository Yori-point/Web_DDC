<script>
	import MediaPanel from "$lib/components/MediaPanel.svelte";
</script>

<div id="chapterContainer" class="chapter-container hidden">
	<button id="backToMap" class="chapter-back" type="button" aria-label="Back to map"></button>

	<div id="summitTitleOverlay" class="summit-title-overlay hidden" aria-hidden="true">
		<h1 id="summitTitleText" class="summit-title-text">Sezione</h1>
		<canvas id="summitTitleCanvas" class="summit-title-canvas"></canvas>

		<div class="summit-scroll-hint">
			<span>Scorri tra le tracce</span>
			<span class="summit-scroll-arrow">↓</span>
		</div>
	</div>

	<div id="chapterHoverIntro" class="chapter-hover-intro" aria-hidden="true">
		<div id="chapterHoverTitle" class="chapter-hover-title"></div>
		<p id="chapterHoverText" class="chapter-hover-text"></p>
		<div id="chapterHoverCredit" class="chapter-hover-credit"></div>
	</div>

	<div class="chapter-media-map">
		<div id="interviewNodes" class="interview-nodes"></div>
		<MediaPanel />
	</div>
</div>