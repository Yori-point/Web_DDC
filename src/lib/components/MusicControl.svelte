<script lang="ts">
	import { onMount } from "svelte";

	type TrackKey =
		| "overall"
		| "festa"
		| "relazioni"
		| "criticita"
		| "opportunita"
		| "trasformazione";

	const TRACKS: Record<TrackKey, string> = {
		overall: "/music/overall.mp3",
		festa: "/music/festa.mp3",
		relazioni: "/music/relazioni.mp3",
		criticita: "/music/criticita.mp3",
		opportunita: "/music/opportunita.mp3",
		trasformazione: "/music/trasformazione.mp3"
	};

	let audio = $state<HTMLAudioElement | null>(null);
	let currentKey = $state<TrackKey>("overall");
	let isPlaying = $state(false);
	let userPaused = $state(false);

	let mediaPaused = $state(false);
	let wasPlayingBeforeMedia = $state(false);

	function normalizeTrackKey(key: unknown): TrackKey {
		if (typeof key === "string" && key in TRACKS) {
			return key as TrackKey;
		}

		return "overall";
	}

	async function playCurrent() {
		if (!audio) return;

		try {
			await audio.play();
			isPlaying = true;
		} catch (error) {
			isPlaying = false;
			console.warn("Music autoplay blocked or music file missing:", error);
		}
	}

	function pauseCurrent() {
		if (!audio) return;

		audio.pause();
		isPlaying = false;
	}

	async function setTrack(key: unknown, shouldPlay = true) {
		if (!audio) return;

		const nextKey = normalizeTrackKey(key);
		const nextSrc = TRACKS[nextKey];

		if (currentKey !== nextKey) {
			currentKey = nextKey;
			audio.pause();
			audio.src = nextSrc;
			audio.currentTime = 0;
		}

		if (shouldPlay && !userPaused && !mediaPaused) {
			await playCurrent();
		}
	}

	function toggleMusic() {
		if (!audio) return;

		if (isPlaying) {
			userPaused = true;
			pauseCurrent();
			return;
		}

		userPaused = false;
		playCurrent();
	}

	onMount(() => {
		audio = new Audio(TRACKS.overall);
		audio.loop = true;
		audio.volume = 0.45;
		audio.preload = "auto";

		const handleStart = (event: Event) => {
			const customEvent = event as CustomEvent<{ key?: TrackKey }>;

			userPaused = false;
			setTrack(customEvent.detail?.key || "overall", true);
		};

		const handleTrack = (event: Event) => {
			const customEvent = event as CustomEvent<{ key?: TrackKey }>;

			setTrack(customEvent.detail?.key || "overall", !userPaused);
		};

		const handleStop = () => {
			pauseCurrent();
		};

		const handleMediaPause = () => {
			if (!mediaPaused) {
				wasPlayingBeforeMedia = isPlaying;
				mediaPaused = true;
			}

			if (isPlaying) {
				pauseCurrent();
			}
		};

		const handleMediaResume = () => {
			if (!mediaPaused) return;

			const shouldResume = wasPlayingBeforeMedia && !userPaused;

			mediaPaused = false;
			wasPlayingBeforeMedia = false;

			if (shouldResume) {
				playCurrent();
			}
		};

		window.addEventListener("tracce:music-start", handleStart);
		window.addEventListener("tracce:music-track", handleTrack);
		window.addEventListener("tracce:music-stop", handleStop);
		window.addEventListener("tracce:music-pause-for-media", handleMediaPause);
		window.addEventListener("tracce:music-resume-after-media", handleMediaResume);

		return () => {
			window.removeEventListener("tracce:music-start", handleStart);
			window.removeEventListener("tracce:music-track", handleTrack);
			window.removeEventListener("tracce:music-stop", handleStop);
			window.removeEventListener("tracce:music-pause-for-media", handleMediaPause);
			window.removeEventListener("tracce:music-resume-after-media", handleMediaResume);

			if (audio) {
				audio.pause();
				audio.src = "";
				audio = null;
			}
		};
	});
</script>

<button
	id="musicControlBtn"
	class="music-control-btn"
	class:is-playing={isPlaying}
	class:is-paused={!isPlaying}
	type="button"
	aria-label={isPlaying ? "Pause music" : "Play music"}
	aria-pressed={isPlaying}
	onclick={toggleMusic}
>
	<span style="--h: 4.5px; --delay: 0s"></span>
	<span style="--h: 15.3px; --delay: -0.25s"></span>
	<span style="--h: 27px; --delay: -0.5s"></span>
	<span style="--h: 13.5px; --delay: -0.75s"></span>
	<span style="--h: 7.2px; --delay: -1s"></span>
</button>

<style>
	.music-control-btn {
		all: unset;

		position: fixed;
		right: var(--ui-padding-x);
		bottom: var(--ui-bottom-icon-offset);

		width: var(--icon-button-size);
		height: var(--icon-button-size);

		z-index: 96;

		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;

		cursor: pointer;
		pointer-events: auto;

		border: none !important;
		background: transparent !important;
		box-shadow: none !important;
		outline: none !important;
		border-radius: 0 !important;

		-webkit-appearance: none;
		appearance: none;
		-webkit-tap-highlight-color: transparent;

		opacity: 0;
		visibility: hidden;

		transition:
			opacity 0.35s ease,
			visibility 0.35s ease;
	}

	.music-control-btn span {
		display: block;
		width: 2.12px;
		height: var(--h);
		border-radius: 999px;

		background: rgba(242, 245, 247, 0.7);
		transform-origin: center;
		box-shadow: none;

		transition:
			background 0.32s ease,
			box-shadow 0.32s ease,
			opacity 0.32s ease,
			transform 0.32s ease;
	}

	.music-control-btn.is-playing span {
		opacity: 0.56;
		background: rgba(242, 245, 247, 0.7);
		animation: music-pulse 1.15s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	.music-control-btn.is-paused span {
		opacity: 1;
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.12);
		animation: none;
	}

	.music-control-btn:hover,
	.music-control-btn:focus,
	.music-control-btn:focus-visible,
	.music-control-btn:active {
		border: none !important;
		background: transparent !important;
		box-shadow: none !important;
		outline: none !important;
		filter: none !important;
	}

	.music-control-btn:hover span,
	.music-control-btn:focus-visible span {
		opacity: 1;
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.12);
	}

	:global(body.overview-active:not(.intro-active):not(.ritual-active):not(.is-transitioning)) .music-control-btn,
	:global(body.chapter-active.chapter-nodes-active:not(.intro-active):not(.ritual-active):not(.is-transitioning)) .music-control-btn {
		opacity: 1 !important;
		visibility: visible !important;
		pointer-events: auto !important;
	}

	:global(body.intro-active) .music-control-btn,
	:global(body.ritual-active) .music-control-btn,
	:global(body.is-transitioning) .music-control-btn,
	:global(body.chapter-active.summit-title-active) .music-control-btn,
	:global(body.chapter-active.chapter-nodes-preenter) .music-control-btn {
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}

	@keyframes music-pulse {
		0%,
		100% {
			transform: scaleY(0.55);
		}

		45% {
			transform: scaleY(1.18);
		}

		70% {
			transform: scaleY(0.82);
		}
	}
</style>