// @ts-nocheck
import { opportunita } from "../data/interviews/01-opportunita.js";
import { cambiamento } from "../data/interviews/02-cambiamento.js";
import { relazioni } from "../data/interviews/03-relazioni.js";
import { celebrazioni } from "../data/interviews/04-celebrazioni.js";
import { problemi } from "../data/interviews/05-problemi.js";

function normalizeText(text) {
	return String(text ?? "").trim();
}

function getTextParagraphs(text) {
	return String(text ?? "")
		.replace(/\r\n/g, "\n")
		.split(/\n+/)
		.map((line) => line.trim())
		.filter(Boolean);
}

const DETAIL_TEXT_LIMITS = {
	text: {
		maxParagraphs: 5,
		maxCharacters: 760
	},
	default: {
		maxParagraphs: 4,
		maxCharacters: 540
	}
};

function trimParagraphToLength(text, maxCharacters) {
	if (text.length <= maxCharacters) return text;

	const slice = text.slice(0, maxCharacters);
	const sentenceEnd = Math.max(
		slice.lastIndexOf("."),
		slice.lastIndexOf("!"),
		slice.lastIndexOf("?")
	);

	if (sentenceEnd > maxCharacters * 0.45) {
		return slice.slice(0, sentenceEnd + 1).trim();
	}

	const commaEnd = Math.max(slice.lastIndexOf(","), slice.lastIndexOf(";"));

	if (commaEnd > maxCharacters * 0.45) {
		return `${slice.slice(0, commaEnd).trim()}…`;
	}

	const wordEnd = slice.lastIndexOf(" ");
	return `${slice.slice(0, wordEnd > 0 ? wordEnd : maxCharacters).trim()}…`;
}

function getLimitedTextParagraphs(paragraphs, type) {
	const limit = type === "text" ? DETAIL_TEXT_LIMITS.text : DETAIL_TEXT_LIMITS.default;
	const limited = [];
	let characterCount = 0;

	for (const paragraph of paragraphs) {
		if (limited.length >= limit.maxParagraphs) break;

		const nextCharacterCount = characterCount + paragraph.length;

		if (limited.length > 0 && nextCharacterCount > limit.maxCharacters) break;

		if (limited.length === 0 && nextCharacterCount > limit.maxCharacters) {
			limited.push(trimParagraphToLength(paragraph, limit.maxCharacters));
			break;
		}

		limited.push(paragraph);
		characterCount = nextCharacterCount;
	}

	return limited;
}

function renderDetailText(container, text, type) {
	const paragraphs = getLimitedTextParagraphs(getTextParagraphs(text), type);

	container.replaceChildren();

	paragraphs.forEach((paragraphText) => {
		const paragraph = document.createElement("p");
		paragraph.textContent = paragraphText;
		container.appendChild(paragraph);
	});
}

function findInterviewSource(item) {
	const lists = [opportunita, cambiamento, relazioni, celebrazioni, problemi];

	// Try to find by id first
	if (item && item.id) {
		const id = String(item.id);
		for (const list of lists) {
			const found = list.find((it) => String(it.id) === id);
			if (found) return found;
		}
	}

	// Try to find by title or personName
	const title = (item && (item.title || item.personName || item.person || "")).toLowerCase();
	if (title) {
		for (const list of lists) {
			const found = list.find((it) => String(it.title || it.personName || "").toLowerCase() === title);
			if (found) return found;
		}
	}

	return null;
}

function getContainerHeight(container) {
	// use scrollHeight for accurate content height
	return Math.ceil(container.scrollHeight || container.getBoundingClientRect().height);
}

function trimElementTextToFit(container, el, targetHeight) {
	const original = String(el.textContent || "").trim();
	if (!original) return false;

	let lo = 0;
	let hi = original.length;
	let best = "";

	// If container already fits, nothing to do
	if (getContainerHeight(container) <= targetHeight) return true;

	// Binary search for max substring length that fits
	while (lo <= hi) {
		const mid = Math.floor((lo + hi) / 2);
		el.textContent = original.slice(0, mid).trim() + (mid < original.length ? "…" : "");

		const h = getContainerHeight(container);
		if (h <= targetHeight) {
			best = el.textContent;
			lo = mid + 1;
		} else {
			hi = mid - 1;
		}
	}

	if (best) {
		el.textContent = best;
		return true;
	}

	// If nothing fits, remove element
	el.remove();
	return false;
}

function appendParagraphsToFill(container, paragraphs, targetHeight, maxAppend = 6) {
	if (!paragraphs || !paragraphs.length) return 0;

	let appended = 0;

	// If container already exceeds target, aggressively trim/remove last paragraph(s)
	function shrinkToFit() {
		let attempts = 0;
		while (getContainerHeight(container) > targetHeight && attempts < 20) {
			const ps = Array.from(container.querySelectorAll("p"));
			if (!ps.length) break;

			const last = ps[ps.length - 1];
			const trimmed = trimElementTextToFit(container, last, targetHeight);
			if (!trimmed) {
				// couldn't trim (was removed), continue loop
			}
			attempts++;
		}
	}

	if (getContainerHeight(container) > targetHeight) {
		shrinkToFit();
		if (getContainerHeight(container) > targetHeight) return appended;
	}

	for (const para of paragraphs) {
		if (appended >= maxAppend) break;

		const p = document.createElement("p");
		p.textContent = para;
		container.appendChild(p);
		appended++;

		const h = getContainerHeight(container);
		if (h >= targetHeight) {
			// If we've exceeded or reached, attempt to trim this paragraph to fit exactly
			if (h > targetHeight) {
				trimElementTextToFit(container, p, targetHeight);
			}
			// After trimming, ensure we don't stay larger
			if (getContainerHeight(container) > targetHeight) {
				shrinkToFit();
			}
			break;
		}
	}

	return appended;
}

function fillDetailTextUsingData(item, type) {
	const container = document.getElementById("mediaPanelText");
	const stage = document.getElementById("mediaStage");

	if (!container || !stage) return;

	const mediaHeight = stage.clientHeight;
	const textHeight = container.clientHeight;

	if (textHeight >= mediaHeight - 8) return; // already tall enough

	// Find source interview (same item) or similar in same category
	const source = findInterviewSource(item) || item;

	const fullText = String(source.detailText || source.text || source.sintesi || "");
	let paras = getTextParagraphs(fullText);

	// If we already rendered some paragraphs, avoid duplicating them
	const existing = Array.from(container.querySelectorAll("p")).map((p) => p.textContent || "");
	paras = paras.filter((p) => !existing.includes(p));

	// If still not enough and item has a category, try other interviews in same category
	if ((!paras || paras.length === 0) && item && item.category) {
		const lists = {
			opportunita,
			trasformazione: cambiamento,
			relazioni,
			festa: celebrazioni,
			criticita: problemi
		};

		const list = lists[item.category] || [];
		for (const it of list) {
			const more = getTextParagraphs(it.detailText || it.text || it.sintesi || "");
			paras = paras.concat(more.filter((p) => !existing.includes(p)));
			if (paras.length) break;
		}
	}

	// Fallback: gather from all lists
	if (!paras || paras.length === 0) {
		const all = [].concat(opportunita, cambiamento, relazioni, celebrazioni, problemi);
		for (const it of all) {
			const more = getTextParagraphs(it.detailText || it.text || it.sintesi || "");
			paras = paras.concat(more.filter((p) => !existing.includes(p)));
			if (paras.length >= 6) break;
		}
	}

	// Append until we reach target height or run out
	appendParagraphsToFill(container, paras, mediaHeight, 8);

	// Remove any previous spacer
	Array.from(container.querySelectorAll(".media-text-spacer")).forEach((el) => el.remove());

	// If still shorter, insert an invisible spacer to make heights match exactly
	const finalH = getContainerHeight(container);
	const remaining = Math.max(0, Math.round(mediaHeight - finalH));
	// If we somehow still exceed target, remove last paragraphs until fit
	if (finalH > mediaHeight) {
		shrinkToFit();
	}

	const finalH2 = getContainerHeight(container);
	const remaining2 = Math.max(0, Math.round(mediaHeight - finalH2));
	if (remaining2 > 0) {
		const spacer = document.createElement("div");
		spacer.className = "media-text-spacer";
		spacer.style.height = `${remaining2}px`;
		spacer.style.width = "100%";
		spacer.style.pointerEvents = "none";
		spacer.style.opacity = "0";
		container.appendChild(spacer);
	}
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
		// remove any ready flag
		const mediaPanel = document.getElementById("mediaPanel");
		mediaPanel?.classList.remove("media-video-ready");
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
		renderDetailText(
			mediaPanelText,
			item.detailText ||
			item.text ||
			item.sintesi ||
			"",
			type
		);
	}

	// After rendering text, try to fill left column to match media height using interview data
	function scheduleFill() {
		// run on next frames to ensure layout settled
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				fillDetailTextUsingData(item, type);
			});
		});
	}

	if (type === "video" && video && src) {
		video.src = src;
		// keep video hidden until first frame is available to avoid showing
		// browser black frame or stage box-shadow before content
		video.hidden = true;

		// ensure ready flag removed until we have first frame
		mediaPanel.classList.remove("media-video-ready");

		// when first frame/data is available, reveal video, show vignette and fill text
		const onVideoFrame = () => {
			video.hidden = false;
			mediaPanel.classList.add("media-video-ready");
			fillDetailTextUsingData(item, type);
			video.removeEventListener("loadeddata", onVideoFrame);
			video.removeEventListener("canplay", onVideoFrame);
		};

		video.addEventListener("loadeddata", onVideoFrame);
		video.addEventListener("canplay", onVideoFrame);

		// also schedule a fallback
		scheduleFill();
	}

	if (type === "image" && image && src) {
		image.src = src;
		image.alt = item.title || item.personName || "Interview image";
		image.hidden = false;

		const onImageLoad = () => {
			fillDetailTextUsingData(item, type);
			image.removeEventListener("load", onImageLoad);
		};

		image.addEventListener("load", onImageLoad);
		// also schedule a fallback
		scheduleFill();
	}

	if (type === "audio" && audioShell && audio && src) {
		audio.src = src;
		audioShell.hidden = false;
		updateAudioUI();

		// audio doesn't change stage size much, schedule fill
		scheduleFill();
	}

	if (type === "text") {
		stage?.classList.add("is-hidden");
	}

	document.body.classList.add("media-detail-open");
	document.body.classList.toggle("media-av-open", type === "audio" || type === "video");
	document.body.classList.remove("category-menu-open");

	mediaPanel.classList.remove("hidden");
	mediaPanel.setAttribute("aria-hidden", "false");
}

export function closeMediaPanel() {
	const mediaPanel = document.getElementById("mediaPanel");
	const mediaMap = document.querySelector(".chapter-media-map");

	resetMediaElements();
	resumeBackgroundMusicAfterMedia();

	document.body.classList.remove("media-detail-open");
	document.body.classList.remove("media-av-open");

	if (mediaPanel) {
		// remove media-type classes immediately so stage overlays disappear
		mediaPanel.classList.remove("is-text", "is-image", "is-audio", "is-video");
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
