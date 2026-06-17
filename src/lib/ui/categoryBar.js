// @ts-nocheck

export function bindCategoryBar({
	legacyAreas,
	hookHeightByKey,
	onSelectCategory,
	onHoverCategory,
	onLeaveCategory
}) {
	const categoryItems = document.querySelectorAll(".category-item");

	function handleCategoryClick(event) {
		const item = event.currentTarget;
		const key = item.dataset.key;

		const area = legacyAreas.find((a) => a.key === key);

		if (!area) return;

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
	}

	function handleCategoryEnter(event) {
		const item = event.currentTarget;
		const key = item.dataset.key;

		if (!key) return;

		onHoverCategory?.(key);
	}

	function handleCategoryLeave() {
		onLeaveCategory?.();
	}

	categoryItems.forEach((item) => {
		item.addEventListener("click", handleCategoryClick);
		item.addEventListener("mouseenter", handleCategoryEnter);
		item.addEventListener("mouseleave", handleCategoryLeave);
	});

	return () => {
		categoryItems.forEach((item) => {
			item.removeEventListener("click", handleCategoryClick);
			item.removeEventListener("mouseenter", handleCategoryEnter);
			item.removeEventListener("mouseleave", handleCategoryLeave);
		});
	};
}