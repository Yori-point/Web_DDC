// @ts-nocheck

function normalizeText(text) {
	return String(text ?? "").trim();
}

function getMediaType(item) {
	const media = item?.media ?? {};
	const value = `${item?.type || ""} ${media.type || ""} ${media.src || ""}`.toLowerCase();

	if (media.video || value.includes("video") || value.includes(".mp4") || value.includes(".mov")) {
		return "video";
	}

	if (media.audio || value.includes("audio") || value.includes(".mp3") || value.includes(".m4a")) {
		return "audio";
	}

	if (
		media.image ||
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

	if (type === "video") return media.video || media.src || "";
	if (type === "audio") return media.audio || media.src || "";
	if (type === "image") return media.image || media.src || media.cover || "";

	return "";
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

	if (audioShell) {
		audioShell.hidden = true;
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

		if (media.cover) {
			audioShell.style.backgroundImage = `
				linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.55)),
				url("${media.cover}")
			`;
		}
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
	const closeMediaPanelButton = document.getElementById("closeMediaPanel");
	const mediaPanel = document.getElementById("mediaPanel");

	function handleClose(event) {
		event?.preventDefault();
		event?.stopPropagation();

		closeMediaPanel();
	}

	function handleOutsideClick(event) {
		const panel = document.getElementById("mediaPanel");

		if (!panel || panel.classList.contains("hidden")) return;

		const clickedInsidePanel = event.target.closest("#mediaPanel");
		const clickedNode = event.target.closest(".interview-node");

		if (clickedInsidePanel || clickedNode) return;

		closeMediaPanel();
	}

	closeMediaPanelButton?.addEventListener("click", handleClose);
	mediaPanel?.addEventListener("click", (event) => event.stopPropagation());

	window.addEventListener("pointerdown", handleOutsideClick);

	return () => {
		closeMediaPanelButton?.removeEventListener("click", handleClose);
		window.removeEventListener("pointerdown", handleOutsideClick);
	};
}