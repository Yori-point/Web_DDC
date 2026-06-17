// @ts-nocheck

export function makeInterviewList(chapters, categoryKey, labelPrefix) {
	const total = chapters[categoryKey]?.total ?? 10;
	const types = ["text", "image", "audio", "video"];

	return Array.from({ length: total }, (_, i) => {
		const type = types[i % types.length];

		return {
			id: i + 1,
			type,
			label: `${labelPrefix} ${i + 1}`,
			title: `Intervista ${i + 1}`,
			text: `Placeholder intervista ${i + 1} per ${chapters[categoryKey]?.title || categoryKey}.`
		};
	});
}

export function createInterviewsByCategory(chapters) {
	return {
		festa: makeInterviewList(chapters, "festa", "Celebrazione"),
		opportunita: makeInterviewList(chapters, "opportunita", "Opportunità"),
		trasformazione: makeInterviewList(chapters, "trasformazione", "Cambiamento"),
		criticita: makeInterviewList(chapters, "criticita", "Problemi"),
		relazioni: makeInterviewList(chapters, "relazioni", "Relazioni")
	};
}