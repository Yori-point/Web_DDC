// @ts-nocheck

import { mediaMap } from "./mediaMap.js";

import { opportunita } from "./interviews/01-opportunita.js";
import { cambiamento } from "./interviews/02-cambiamento.js";
import { relazioni } from "./interviews/03-relazioni.js";
import { celebrazioni } from "./interviews/04-celebrazioni.js";
import { problemi } from "./interviews/05-problemi.js";

const RAW_BY_CATEGORY = {
	opportunita,
	trasformazione: cambiamento,
	relazioni,
	festa: celebrazioni,
	criticita: problemi
};

const TYPE_LABELS = {
	text: "Testo",
	image: "Foto",
	audio: "Audio",
	video: "Video"
};

function normalizeType(type) {
	if (!type) return "text";

	const value = String(type).toLowerCase();

	if (value.includes("video")) return "video";
	if (value.includes("audio")) return "audio";
	if (value.includes("foto")) return "image";
	if (value.includes("photo")) return "image";
	if (value.includes("image")) return "image";

	return "text";
}

function getTypeFromMedia(media) {
	if (!media) return null;

	const src = Array.isArray(media.src) ? media.src[0] : media.src;
	const value = `${media.type || ""} ${src || ""}`.toLowerCase();

	if (value.includes(".mp4") || value.includes("video")) return "video";
	if (value.includes(".m4a") || value.includes(".mp3") || value.includes("audio")) return "audio";
	if (value.includes(".jpg") || value.includes(".jpeg") || value.includes(".png") || value.includes("image")) return "image";

	return null;
}

function buildInterview(item, categoryKey) {
	const media = mediaMap[item.id] ?? null;
	const type = normalizeType(item.type || getTypeFromMedia(media) || item.fileType);
	const label = item.label || TYPE_LABELS[type] || "Testo";
	const title = item.title || item.personName || `Intervista ${item.id}`;

	return {
		...item,
		id: String(item.id),
		category: categoryKey,
		type,
		label,
		title,
		media,
		hoverLabel: item.hoverLabel || label,
		hoverText: item.hoverText || item.sintesi || item.text || "",
		hoverCredit: item.hoverCredit || item.personName || title,
		text: item.text || item.sintesi || "",
		visible: item.visible !== false
	};
}

function getInterviewsByCategory(categoryKey, chapters) {
	const max = chapters?.[categoryKey]?.total ?? Infinity;

	return (RAW_BY_CATEGORY[categoryKey] || [])
		.filter((item) => item.visible !== false)
		.map((item) => buildInterview(item, categoryKey))
		.slice(0, max);
}

export function createInterviewsByCategory(chapters) {
	return {
		festa: getInterviewsByCategory("festa", chapters),
		opportunita: getInterviewsByCategory("opportunita", chapters),
		trasformazione: getInterviewsByCategory("trasformazione", chapters),
		criticita: getInterviewsByCategory("criticita", chapters),
		relazioni: getInterviewsByCategory("relazioni", chapters)
	};
}