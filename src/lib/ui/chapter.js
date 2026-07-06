// @ts-nocheck

export function updateChapterCopy(chapter) {
	const chapterNumber = document.getElementById("chapterNumber");
	const chapterTitle = document.getElementById("chapterTitle");
	const chapterSubtitle = document.getElementById("chapterSubtitle");

	if (chapterNumber) chapterNumber.textContent = chapter.id;
	if (chapterTitle) chapterTitle.textContent = chapter.title;
	if (chapterSubtitle) chapterSubtitle.textContent = chapter.subtitle;
}

export function showChapterContainer() {
	const chapterContainer = document.getElementById("chapterContainer");

	if (!chapterContainer) return;

	chapterContainer.classList.remove("hidden");
	document.body.classList.add("chapter-active");
}

export function hideChapterContainer() {
	const chapterContainer = document.getElementById("chapterContainer");

	if (!chapterContainer) return;

	chapterContainer.classList.add("hidden");
	document.body.classList.remove("chapter-active");
}

export function clearChapterState() {
	const mediaPanel = document.getElementById("mediaPanel");
	const mediaMap = document.querySelector(".chapter-media-map");
	const interviewNodes = document.getElementById("interviewNodes");
	const hoverIntro = document.getElementById("chapterHoverIntro");

	if (mediaPanel) {
		mediaPanel.classList.add("hidden");
		mediaPanel.setAttribute("aria-hidden", "true");
	}

	if (mediaMap) {
		mediaMap.classList.remove("has-open");
	}

	if (interviewNodes) {
		interviewNodes.innerHTML = "";
		interviewNodes.style.removeProperty("--pan-x");
		interviewNodes.style.removeProperty("--interview-width");
	}

	if (hoverIntro) {
		hoverIntro.classList.remove("is-visible");
		hoverIntro.setAttribute("aria-hidden", "true");
	}

	document.body.classList.remove(
		"media-detail-open",
		"media-av-open",
		"category-hover-active",
		"summit-title-active",
		"chapter-nodes-preenter",
		"chapter-nodes-active"
	);
}

export function prepareChapterSwitch() {
	const mediaPanel = document.getElementById("mediaPanel");
	const mediaMap = document.querySelector(".chapter-media-map");
	const interviewNodes = document.getElementById("interviewNodes");
	const hoverIntro = document.getElementById("chapterHoverIntro");

	if (mediaPanel) {
		mediaPanel.classList.add("hidden");
		mediaPanel.setAttribute("aria-hidden", "true");
	}

	if (mediaMap) {
		mediaMap.classList.remove("has-open");
	}

	if (interviewNodes) {
		interviewNodes.innerHTML = "";
		interviewNodes.style.removeProperty("--pan-x");
		interviewNodes.style.removeProperty("--interview-width");
	}

	if (hoverIntro) {
		hoverIntro.classList.remove("is-visible");
		hoverIntro.setAttribute("aria-hidden", "true");
	}

	document.body.classList.remove(
		"media-detail-open",
		"media-av-open",
		"category-hover-active",
		"summit-title-active",
		"chapter-nodes-active"
	);

	if (document.body.classList.contains("chapter-active")) {
		document.body.classList.add("chapter-nodes-preenter");
	}
}