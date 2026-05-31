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

	if (mediaPanel) mediaPanel.classList.add("hidden");
	if (mediaMap) mediaMap.classList.remove("has-open");

	document.querySelectorAll(".interview-node").forEach((node) => {
		node.classList.remove("is-active");
	});
}