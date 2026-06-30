// @ts-nocheck

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
	const menuBtn = document.getElementById("categoryMenuBtn");

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

function setCategoryMenuOpen(isOpen) {
	document.body.classList.toggle("category-menu-open", isOpen);

	if (menuBtn) {
		menuBtn.setAttribute("aria-expanded", String(isOpen));
	}
}

function toggleCategoryMenu(event) {
	event.stopPropagation();

	const isOpen = document.body.classList.contains("category-menu-open");
	setCategoryMenuOpen(!isOpen);
}

function closeCategoryMenu() {
	setCategoryMenuOpen(false);
}

function handleDocumentClick(event) {
	if (!document.body.classList.contains("category-menu-open")) return;

	const target = event.target;

	if (menuBtn?.contains(target) || categoryBar?.contains(target)) return;

	closeCategoryMenu();
}

function handleDocumentKeydown(event) {
	if (event.key === "Escape") {
		closeCategoryMenu();
	}
}

window.closeCategoryMenu = closeCategoryMenu;

	function handleCategoryClick(event) {
		const item = event.currentTarget;
		const key = item.dataset.key;

		const area = getAreaByKey(key);

		if (!area) return;

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
		closeCategoryMenu();
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

	menuBtn?.addEventListener("click", toggleCategoryMenu);
	document.addEventListener("click", handleDocumentClick);
	document.addEventListener("keydown", handleDocumentKeydown);

	return () => {
		hideCategoryHoverText();
		closeCategoryMenu();

		delete window.showCategoryHoverByKey;
		delete window.hideCategoryHoverText;
		delete window.setActiveCategoryByKey;
		delete window.clearActiveCategory;
		delete window.closeCategoryMenu;

		menuBtn?.removeEventListener("click", toggleCategoryMenu);
		document.removeEventListener("click", handleDocumentClick);
		document.removeEventListener("keydown", handleDocumentKeydown);

		categoryItems.forEach((item) => {
			item.removeEventListener("click", handleCategoryClick);
			item.removeEventListener("mouseenter", handleCategoryEnter);
			item.removeEventListener("mouseleave", handleCategoryLeave);
		});
	};
}