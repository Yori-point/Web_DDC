// @ts-nocheck

export function renderInterviewNodes({
	categoryKey,
	interviews,
	exploredSet,
	onSelect
}) {
	const container = document.getElementById("interviewNodes");

	if (!container) return;

	container.innerHTML = "";

	interviews.forEach((item, index) => {
		const button = document.createElement("button");

		button.className = `media-node interview-node interview-${item.type}`;

		if (exploredSet?.has(item.id)) {
			button.classList.add("is-viewed");
		}

		button.dataset.category = categoryKey;
		button.dataset.id = item.id;
		button.setAttribute("aria-label", item.title);

		const total = interviews.length;

		const virtualWidth = total > 40 ? 190 : total > 20 ? 155 : 115;
		container.style.setProperty("--interview-width", `${virtualWidth}vw`);

		const cols = total > 40 ? 12 : total > 20 ? 8 : 5;
		const rows = Math.ceil(total / cols);

		const col = index % cols;
		const row = Math.floor(index / cols);

		const xBase = 7 + (col / Math.max(cols - 1, 1)) * 86;
		const yBase = 34 + (row / Math.max(rows - 1, 1)) * 46;

		const offsetX = Math.sin(index * 1.7) * 2.8;
		const offsetY = Math.cos(index * 2.1) * 3.2;

		button.style.left = `${xBase + offsetX}%`;
		button.style.top = `${yBase + offsetY}%`;
		button.style.animationDelay = `${index * -0.12}s`;

		const iconByType = {
			text: "”",
			audio: "▶",
			video: "▦"
		};

		const iconClassByType = {
			text: "particle-quote",
			audio: "particle-play",
			video: "particle-grid"
		};

		button.innerHTML = `
			<span class="particle-icon ${iconClassByType[item.type] || "particle-quote"}">
				${iconByType[item.type] || "”"}
			</span>
		`;

		button.addEventListener("click", (event) => {
			event.stopPropagation();

			document.querySelectorAll(".interview-node").forEach((node) => {
				node.classList.remove("is-active");
			});

			button.classList.add("is-active");
			button.classList.add("is-viewed");

			onSelect?.(item, button);
		});

		container.appendChild(button);
	});
}

export function updateInterviewPan(current, target) {
	const container = document.getElementById("interviewNodes");

	if (!container) return current;

	const next = current + (target - current) * 0.06;
	container.style.setProperty("--pan-x", `${next}px`);

	return next;
}