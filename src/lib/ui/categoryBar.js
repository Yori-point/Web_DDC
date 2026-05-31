// @ts-nocheck

export function bindCategoryBar({ legacyAreas, hookHeightByKey, onSelectCategory }) {
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

	categoryItems.forEach((item) => {
		item.addEventListener("click", handleCategoryClick);
	});

	return () => {
		categoryItems.forEach((item) => {
			item.removeEventListener("click", handleCategoryClick);
		});
	};
}