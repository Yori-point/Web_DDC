// @ts-nocheck

function hashString(str) {
	let h = 2166136261;

	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}

	return h >>> 0;
}

function createSeededRandom(seedString) {
	let seed = hashString(seedString);

	return () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
}

function getIconMarkup(type) {
	if (type === "audio") {
		return `
			<span class="particle-icon">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V7.5a3.5 3.5 0 1 0-7 0V12a3.5 3.5 0 0 0 3.5 3.5Z"/>
					<path d="M6.5 11.5v.5a5.5 5.5 0 0 0 11 0v-.5"/>
					<path d="M12 17.5V21"/>
				</svg>
			</span>
		`;
	}

	if (type === "video") {
		return `
			<span class="particle-icon">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<rect x="3.5" y="6.5" width="12" height="11" rx="2"></rect>
					<path d="M15.5 10.2 20.5 7.8v8.4l-5-2.4Z"></path>
				</svg>
			</span>
		`;
	}

	if (type === "image") {
		return `
			<span class="particle-icon">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<rect x="4" y="5" width="16" height="14" rx="2"></rect>
					<circle cx="9" cy="10" r="1.3"></circle>
					<path d="M6.5 16 11 11.5l3.2 3.2 2.4-2.4L19.5 16"></path>
				</svg>
			</span>
		`;
	}

	return `<span class="interview-number">99</span>`;
}

function generateNodeLayout(interviews, categoryKey) {
	const total = interviews.length;
	const placed = [];

	const isMany = total > 45;
	const isMedium = total > 22 && total <= 45;

	const minSize = isMany ? 34 : isMedium ? 42 : 52;
	const maxSize = isMany ? 46 : isMedium ? 58 : 74;

	const virtualWidthVw = isMany ? 190 : isMedium ? 150 : 118;
	const virtualHeightVh = 72;

	const virtualWidthPx = window.innerWidth * (virtualWidthVw / 100);
	const virtualHeightPx = window.innerHeight * (virtualHeightVh / 100);

	interviews.forEach((item, index) => {
		const rand = createSeededRandom(`${categoryKey}-${item.id}-${index}`);

		const size = minSize + rand() * (maxSize - minSize);

		const minX = 5;
		const maxX = 95;
		const minY = 18;
		const maxY = 78;

		let x = 50;
		let y = 45;
		let found = false;

		for (let attempt = 0; attempt < 260; attempt++) {
			const tryX = minX + rand() * (maxX - minX);
			const tryY = minY + rand() * (maxY - minY);

			const tryXPx = (tryX / 100) * virtualWidthPx;
			const tryYPx = (tryY / 100) * virtualHeightPx;

			const isFarEnough = placed.every((p) => {
				const dx = tryXPx - p.xPx;
				const dy = tryYPx - p.yPx;
				const dist = Math.sqrt(dx * dx + dy * dy);

				const minDist = size / 2 + p.size / 2 + (isMany ? 10 : 16);

				return dist > minDist;
			});

			if (isFarEnough) {
				x = tryX;
				y = tryY;
				found = true;
				break;
			}
		}

		if (!found) {
			const cols = isMany ? 13 : isMedium ? 9 : 6;
			const row = Math.floor(index / cols);
			const col = index % cols;

			x = 6 + (col / Math.max(cols - 1, 1)) * 88;
			y = 20 + row * (isMany ? 12 : 15);

			x += Math.sin(index * 1.7) * 2.8;
			y += Math.cos(index * 1.3) * 2.4;
		}

		const xPx = (x / 100) * virtualWidthPx;
		const yPx = (y / 100) * virtualHeightPx;

		placed.push({
			x,
			y,
			xPx,
			yPx,
			size,
			floatDuration: 6.8 + rand() * 2.8,
			floatDelay: -rand() * 5
		});
	});

	return {
		nodes: placed,
		virtualWidthVw
	};
}

export function renderInterviewNodes({
	categoryKey,
	interviews,
	exploredSet,
	onSelect
}) {
	const container = document.getElementById("interviewNodes");

	if (!container) return;

	container.innerHTML = "";

	const layoutData = generateNodeLayout(interviews, categoryKey);
	const layout = layoutData.nodes;

	container.style.setProperty("--interview-width", `${layoutData.virtualWidthVw}vw`);

	interviews.forEach((item, index) => {
		const button = document.createElement("button");
		const nodeLayout = layout[index];

		button.className = `media-node interview-node interview-${item.type}`;

		if (exploredSet?.has(item.id)) {
			button.classList.add("is-viewed");
		}

		button.dataset.category = categoryKey;
		button.dataset.id = item.id;
		button.setAttribute("aria-label", item.title);

		button.style.left = `${nodeLayout.x}%`;
		button.style.top = `${nodeLayout.y}%`;
		button.style.setProperty("--node-size", `${nodeLayout.size}px`);
		button.style.setProperty("--float-duration", `${nodeLayout.floatDuration}s`);
		button.style.setProperty("--float-delay", `${nodeLayout.floatDelay}s`);

		button.innerHTML = getIconMarkup(item.type);

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

	const next = current + (target - current) * 0.04;
	container.style.setProperty("--pan-x", `${next}px`);

	return next;
}