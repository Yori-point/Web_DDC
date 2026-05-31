// @ts-nocheck

export function updateCategoryProgressItem(categoryKey, explored, total) {
	const item = document.querySelector(`.category-item[data-key="${categoryKey}"]`);

	if (!item) return;

	const meta = item.querySelector(".category-meta");

	const percent = total > 0
		? Math.min(100, Math.round((explored / total) * 100))
		: 0;

	if (meta) {
		meta.textContent = `Esplorazione ${explored} / ${total}`;
	}

	item.style.setProperty("--progress", `${percent}%`);
}

export function updateOverallProgressText(explored, total) {
	const overallProgressText = document.getElementById("overallProgressText");

	if (!overallProgressText) return;

	overallProgressText.textContent = `${explored} / ${total}`;
}