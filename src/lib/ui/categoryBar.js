// @ts-nocheck

import { prepareChapterSwitch } from "$lib/ui/chapter.js";

export function bindCategoryBar({
	legacyAreas,
	hookHeightByKey,
	onSelectCategory,
	onHoverCategory,
	onLeaveCategory
}) {
	const categoryItems = document.querySelectorAll(".category-item");
	const hoverOverlay = document.getElementById("categoryHoverOverlay");
	const hoverText = document.getElementById("categoryHoverText");
	const categoryBar = document.getElementById("categoryBar");

	function getAreaByKey(key) {
		return legacyAreas.find((area) => area.key === key);
	}

	function formatHoverText(text) {
		return (text || "")
			.replace(/\\n/g, "\n")
			.trim();
	}

	function showCategoryHoverByKey(key) {
		const area = getAreaByKey(key);
		if (!area) return;

		const text = formatHoverText(area.hoverText || area.text || "");

		if (hoverText) {
			hoverText.textContent = text;
		}

		if (hoverOverlay) {
			hoverOverlay.setAttribute("aria-hidden", "false");
		}

		document.body.classList.add("category-hover-active");

		categoryItems.forEach((item) => {
			item.classList.toggle("is-hovered", item.dataset.key === key);
		});
	}

	function hideCategoryHoverText() {
	if (hoverText) {
		hoverText.textContent = "";
	}

	if (hoverOverlay) {
		hoverOverlay.setAttribute("aria-hidden", "true");
	}

	document.body.classList.remove("category-hover-active");

	categoryItems.forEach((item) => {
		item.classList.remove("is-hovered");
	});
}

function setActiveCategoryByKey(key) {
	categoryItems.forEach((item) => {
		item.classList.toggle("is-active", item.dataset.key === key);
	});
}

function clearActiveCategory() {
	categoryItems.forEach((item) => {
		item.classList.remove("is-active");
	});
}

function showOnlyCategoryHighlight(key) {
	categoryItems.forEach((item) => {
		item.classList.toggle("is-hovered", item.dataset.key === key);
	});
}

function clearOnlyCategoryHighlight() {
	categoryItems.forEach((item) => {
		item.classList.remove("is-hovered");
	});
}

window.showCategoryHoverByKey = showCategoryHoverByKey;
window.hideCategoryHoverText = hideCategoryHoverText;
window.setActiveCategoryByKey = setActiveCategoryByKey;
window.clearActiveCategory = clearActiveCategory;

	function handleCategoryClick(event) {
		const item = event.currentTarget;
		const key = item.dataset.key;

		const area = getAreaByKey(key);

		if (!area) return;

		if (document.body.classList.contains("chapter-active")) {
			prepareChapterSwitch();
		}

		setActiveCategoryByKey(key);

		const y = hookHeightByKey[key] || 9.5;

		onSelectCategory?.({
			id: area.id,
			key: area.key,
			title: area.title,
			text: area.text,
			x: area.x,
			y,
			z: area.z
		});

		hideCategoryHoverText();
	}

	function handleCategoryEnter(event) {
		const item = event.currentTarget;
		const key = item.dataset.key;

		if (!key) return;

		if (document.body.classList.contains("chapter-active")) {
			showOnlyCategoryHighlight(key);
			return;
		}

		showCategoryHoverByKey(key);
		onHoverCategory?.(key);
	}

	function handleCategoryLeave() {
		if (document.body.classList.contains("chapter-active")) {
			clearOnlyCategoryHighlight();
			return;
		}

		hideCategoryHoverText();
		onLeaveCategory?.();
	}

	categoryItems.forEach((item) => {
		item.addEventListener("click", handleCategoryClick);
		item.addEventListener("mouseenter", handleCategoryEnter);
		item.addEventListener("mouseleave", handleCategoryLeave);
	});

	return () => {
		hideCategoryHoverText();

		delete window.showCategoryHoverByKey;
		delete window.hideCategoryHoverText;
		delete window.setActiveCategoryByKey;
		delete window.clearActiveCategory;

		categoryItems.forEach((item) => {
			item.removeEventListener("click", handleCategoryClick);
			item.removeEventListener("mouseenter", handleCategoryEnter);
			item.removeEventListener("mouseleave", handleCategoryLeave);
		});
	};
}