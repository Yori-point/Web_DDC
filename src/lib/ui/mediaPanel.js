// @ts-nocheck

function normalizeText(text) {
	return String(text ?? "").trim();
}

function pickMediaSrc(value, type) {
	if (!Array.isArray(value)) return value || "";

	const EXTENSIONS = {
		video: [".mp4", ".mov", ".webm"],
		audio: [".mp3", ".m4a", ".wav", ".ogg"],
		image: [".jpg", ".jpeg", ".png", ".webp"]
	};

	const extensions = EXTENSIONS[type] || [];

	return (
		value.find((src) =>
			extensions.some((ext) => String(src).toLowerCase().includes(ext))
		) ||
		value[0] ||
		""
	);
}

function formatAudioTime(seconds) {
	if (!Number.isFinite(seconds)) return "0:00";

	const minutes = Math.floor(seconds / 60);
	const rest = Math.floor(seconds % 60);

	return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function updateAudioUI() {
	const audio = document.getElementById("mediaPanelAudio");
	const audioShell = document.getElementById("mediaPanelAudioShell");
	const audioToggle = document.getElementById("mediaAudioToggle");
	const audioProgress = document.getElementById("mediaAudioProgress");
	const audioTime = document.getElementById("mediaAudioTime");

	if (!audio) return;

	const duration = audio.duration || 0;
	const current = audio.currentTime || 0;
	const percent = duration ? (current / duration) * 100 : 0;

	audioShell?.classList.toggle("is-playing", !audio.paused);

	if (audioToggle) {
		audioToggle.textContent = audio.paused ? "▶" : "Ⅱ";
		audioToggle.setAttribute("aria-label", audio.paused ? "Play audio" : "Pause audio");
	}

	if (audioProgress) {
		audioProgress.style.setProperty("--progress", `${percent}%`);
	}

	if (audioTime) {
		audioTime.textContent = `${formatAudioTime(current)} / ${formatAudioTime(duration)}`;
	}
}

function normalizeMediaType(value) {
	const text = String(value ?? "").toLowerCase();

	if (text.includes("video")) return "video";
	if (text.includes("audio")) return "audio";
	if (text.includes("foto")) return "image";
	if (text.includes("photo")) return "image";
	if (text.includes("image")) return "image";
	if (text.includes("testo")) return "text";
	if (text.includes("text")) return "text";

	return "";
}

function getMediaType(item) {
	const declaredType = normalizeMediaType(item?.type || item?.fileType || item?.label);

	if (declaredType) return declaredType;

	const media = item?.media ?? {};
	const src = Array.isArray(media.src) ? media.src[0] : media.src;

	const value = `
		${media.type || ""}
		${src || ""}
		${media.video || ""}
		${media.audio || ""}
		${media.image || ""}
		${media.cover || ""}
	`.toLowerCase();

	if (value.includes("video") || value.includes(".mp4") || value.includes(".mov")) {
		return "video";
	}

	if (value.includes("audio") || value.includes(".mp3") || value.includes(".m4a")) {
		return "audio";
	}

	if (
		value.includes("image") ||
		value.includes("foto") ||
		value.includes(".jpg") ||
		value.includes(".jpeg") ||
		value.includes(".png") ||
		value.includes(".webp")
	) {
		return "image";
	}

	return "text";
}

function getMediaSrc(item, type) {
	const media = item?.media ?? {};

	if (type === "video") return media.video || pickMediaSrc(media.src, "video");
	if (type === "audio") return media.audio || pickMediaSrc(media.src, "audio");
	if (type === "image") return media.image || media.cover || pickMediaSrc(media.src, "image");

	return "";
}

function pauseBackgroundMusicForMedia(type) {
	if (type !== "audio" && type !== "video") {
		window.dispatchEvent(new CustomEvent("tracce:music-resume-after-media"));
		return;
	}

	window.dispatchEvent(new CustomEvent("tracce:music-pause-for-media"));
}

function resumeBackgroundMusicAfterMedia() {
	window.dispatchEvent(new CustomEvent("tracce:music-resume-after-media"));
}

function resetMediaElements() {
	const stage = document.getElementById("mediaStage");
	const video = document.getElementById("mediaPanelVideo");
	const image = document.getElementById("mediaPanelImage");
	const audioShell = document.getElementById("mediaPanelAudioShell");
	const audio = document.getElementById("mediaPanelAudio");

	stage?.classList.remove("is-hidden");

	if (video) {
		video.pause?.();
		video.removeAttribute("src");
		video.load?.();
		video.hidden = true;
	}

	if (image) {
		image.removeAttribute("src");
		image.alt = "";
		image.hidden = true;
	}

	if (audio) {
		audio.pause?.();
		audio.removeAttribute("src");
		audio.load?.();
	}

	const audioToggle = document.getElementById("mediaAudioToggle");
	const audioProgress = document.getElementById("mediaAudioProgress");
	const audioTime = document.getElementById("mediaAudioTime");

	if (audioToggle) audioToggle.textContent = "▶";
	if (audioProgress) audioProgress.style.setProperty("--progress", "0%");
	if (audioTime) audioTime.textContent = "0:00 / 0:00";

	if (audioShell) {
		audioShell.hidden = true;
		audioShell.classList.remove("is-playing");
		audioShell.style.backgroundImage = "";
	}
}

export function openMediaPanel(item) {
	const mediaPanel = document.getElementById("mediaPanel");
	const mediaMap = document.querySelector(".chapter-media-map");

	const mediaPanelTitle = document.getElementById("mediaPanelTitle");
	const mediaPanelText = document.getElementById("mediaPanelText");

	const stage = document.getElementById("mediaStage");
	const video = document.getElementById("mediaPanelVideo");
	const image = document.getElementById("mediaPanelImage");
	const audioShell = document.getElementById("mediaPanelAudioShell");
	const audio = document.getElementById("mediaPanelAudio");

	if (!mediaPanel) return;

	const type = getMediaType(item);
	const src = getMediaSrc(item, type);
	const media = item?.media ?? {};

	resetMediaElements();
	pauseBackgroundMusicForMedia(type);

	resetMediaElements();

	mediaPanel.classList.remove("is-text", "is-image", "is-audio", "is-video");
	mediaPanel.classList.add(`is-${type}`);

	if (mediaMap) mediaMap.classList.add("has-open");

	if (mediaPanelTitle) {
		mediaPanelTitle.textContent = normalizeText(
			item.detailTitle ||
			item.personName ||
			item.title ||
			"Intervista"
		);
	}

	if (mediaPanelText) {
		mediaPanelText.textContent = normalizeText(
			item.detailText ||
			item.text ||
			item.sintesi ||
			""
		);
	}

	if (type === "video" && video && src) {
		video.src = src;
		video.hidden = false;
	}

	if (type === "image" && image && src) {
		image.src = src;
		image.alt = item.title || item.personName || "Interview image";
		image.hidden = false;
	}

	if (type === "audio" && audioShell && audio && src) {
		audio.src = src;
		audioShell.hidden = false;
		updateAudioUI();
	}

	if (type === "text") {
		stage?.classList.add("is-hidden");
	}

	mediaPanel.classList.remove("hidden");
	mediaPanel.setAttribute("aria-hidden", "false");
}

export function closeMediaPanel() {
	const mediaPanel = document.getElementById("mediaPanel");
	const mediaMap = document.querySelector(".chapter-media-map");

	resetMediaElements();
	resumeBackgroundMusicAfterMedia();

	if (mediaPanel) {
		mediaPanel.classList.add("hidden");
		mediaPanel.setAttribute("aria-hidden", "true");
	}

	if (mediaMap) mediaMap.classList.remove("has-open");

	document.querySelectorAll(".interview-node").forEach((node) => {
		node.classList.remove("is-active");
	});
}

export function bindMediaPanelClose() {
	const mediaPanel = document.getElementById("mediaPanel");
	const audio = document.getElementById("mediaPanelAudio");
	const audioToggle = document.getElementById("mediaAudioToggle");
	const audioProgress = document.getElementById("mediaAudioProgress");

	function handlePanelPointerDown(event) {
		const panel = document.getElementById("mediaPanel");

		if (!panel || panel.classList.contains("hidden")) return;

		const clickedClose = event.target.closest("#closeMediaPanel");
		const clickedContent = event.target.closest(".media-detail-inner");
		const clickedNode = event.target.closest(".interview-node");

		if (clickedNode) return;

		if (clickedClose) {
			event.preventDefault();
			event.stopPropagation();
			closeMediaPanel();
			return;
		}

		// 点文字、图片、视频、音频播放器区域，不关闭
		if (clickedContent) return;

		// 点 media panel 的空白区域，关闭
		closeMediaPanel();
	}

	function handleAudioToggle(event) {
		event?.preventDefault();
		event?.stopPropagation();

		if (!audio || !audio.src) return;

		if (audio.paused) {
			audio.play?.();
		} else {
			audio.pause?.();
		}

		updateAudioUI();
	}

	function handleAudioProgress(event) {
		event?.preventDefault();
		event?.stopPropagation();

		if (!audio || !audio.duration || !audioProgress) return;

		const rect = audioProgress.getBoundingClientRect();
		const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);

		audio.currentTime = ratio * audio.duration;
		updateAudioUI();
	}

	mediaPanel?.addEventListener("pointerdown", handlePanelPointerDown);

	audioToggle?.addEventListener("click", handleAudioToggle);
	audioProgress?.addEventListener("pointerdown", handleAudioProgress);

	audio?.addEventListener("play", updateAudioUI);
	audio?.addEventListener("pause", updateAudioUI);
	audio?.addEventListener("timeupdate", updateAudioUI);
	audio?.addEventListener("loadedmetadata", updateAudioUI);
	audio?.addEventListener("ended", updateAudioUI);

	return () => {
		mediaPanel?.removeEventListener("pointerdown", handlePanelPointerDown);

		audioToggle?.removeEventListener("click", handleAudioToggle);
		audioProgress?.removeEventListener("pointerdown", handleAudioProgress);

		audio?.removeEventListener("play", updateAudioUI);
		audio?.removeEventListener("pause", updateAudioUI);
		audio?.removeEventListener("timeupdate", updateAudioUI);
		audio?.removeEventListener("loadedmetadata", updateAudioUI);
		audio?.removeEventListener("ended", updateAudioUI);
	};
}