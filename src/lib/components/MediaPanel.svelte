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
				<div class="media-waveform" aria-hidden="true">
					<span></span><span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span><span></span>
				</div>

				<div class="media-audio-controls">
					<button id="mediaAudioToggle" class="media-audio-toggle" type="button" aria-label="Play audio">
						▶
					</button>

					<button id="mediaAudioProgress" class="media-audio-progress" type="button" aria-label="Seek audio"></button>

					<div id="mediaAudioTime" class="media-audio-time">0:00 / 0:00</div>
				</div>

				<audio id="mediaPanelAudio" class="media-audio-player" preload="metadata"></audio>
			</div>
		</section>
	</div>
</div>