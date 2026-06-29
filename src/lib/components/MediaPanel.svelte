<div id="mediaPanel" class="media-panel hidden" aria-hidden="true">
	<button id="closeMediaPanel" class="media-close" type="button" aria-label="Close detail">×</button>

	<div class="media-detail-inner">
		<aside class="media-detail-copy">
			<h2 id="mediaPanelTitle" class="media-detail-title">Gianluca</h2>
			<p id="mediaPanelText" class="media-detail-text"></p>
		</aside>

		<section id="mediaStage" class="media-stage" aria-label="Interview media">
			<video
				id="mediaPanelVideo"
				class="media-video"
				controls
				playsinline
				hidden
			></video>

			<img
				id="mediaPanelImage"
				class="media-image"
				src=""
				alt=""
				hidden
			/>

			<div id="mediaPanelAudioShell" class="media-audio-shell" hidden>
				<div class="media-waveform" aria-hidden="true"></div>
				<audio id="mediaPanelAudio" class="media-audio-player" controls></audio>
			</div>
		</section>
	</div>
</div>