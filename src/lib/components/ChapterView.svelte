<script>
	import MediaPanel from "$lib/components/MediaPanel.svelte";
</script>

<div id="chapterContainer" class="chapter-container hidden">
	<button id="backToMap" class="chapter-back" type="button" aria-label="Back to map">
		Tracce
	</button>

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