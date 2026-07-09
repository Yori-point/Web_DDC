// @ts-nocheck
import { legacyAreas } from "$lib/data/legacyAreas.js";

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

function hexToRgb(hex) {
	return {
		r: (hex >> 16) & 255,
		g: (hex >> 8) & 255,
		b: hex & 255
	};
}

function getCategoryColor(categoryKey) {
	const area = legacyAreas.find((item) => item.key === categoryKey);
	const rgb = hexToRgb(area?.color ?? 0x93ABDB);

	return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

function normalizeText(text) {
	return String(text ?? "")
		.replace(/\s+/g, " ")
		.trim();
}

function formatQuote(text) {
	const value = normalizeText(text);

	if (!value) return "";

	if (
		value.startsWith("“") ||
		value.startsWith("«") ||
		value.startsWith('"')
	) {
		return value;
	}

	return `“${value}”`;
}

function showInterviewHoverIntro(item, categoryKey) {
	const area = legacyAreas.find((areaItem) => areaItem.key === categoryKey);
	const intro = document.getElementById("chapterHoverIntro");
	const title = document.getElementById("chapterHoverTitle");
	const text = document.getElementById("chapterHoverText");
	const credit = document.getElementById("chapterHoverCredit");

	if (!intro || !title || !text) return;

	title.textContent = normalizeText(
		item.hoverLabel ||
		item.label ||
		area?.title ||
		"Intervista"
	);

	text.textContent = formatQuote(
		item.previewText ||
		item.hoverText ||
		item.sintesi ||
		item.text ||
		area?.hoverText ||
		area?.text ||
		""
	);

	if (credit) {
		credit.textContent = normalizeText(
			item.hoverCredit ||
			item.personName ||
			item.title ||
			""
		);
	}

	intro.classList.add("is-visible");
	intro.setAttribute("aria-hidden", "false");
}

function hideChapterHoverIntro() {
	const intro = document.getElementById("chapterHoverIntro");

	if (!intro) return;

	intro.classList.remove("is-visible");
	intro.setAttribute("aria-hidden", "true");
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
	const isCelebrazioni = categoryKey === "celebrazioni";
	const minSize = 65.25;
	const maxSize = 99.6;
	const virtualWidthVw = total <= 15 ? 100 : total > 45 ? 190 : total > 22 ? 150 : 118;
	const virtualHeightVh = 72;
	const virtualWidthPx = window.innerWidth * (virtualWidthVw / 100);
	const virtualHeightPx = window.innerHeight * (virtualHeightVh / 100);
	const layoutLeft = 8;
	const layoutRight = 92;
	const layoutTop = isCelebrazioni ? 52 : 18;
	const layoutBottom = isCelebrazioni ? 88 : 78;
	const usableWidth = layoutRight - layoutLeft;
	const usableHeight = layoutBottom - layoutTop;
	const layoutCenterY = isCelebrazioni ? 76 : 48;

	function halton(index, base) {
		let result = 0;
		let fraction = 1 / base;
		let value = index;

		while (value > 0) {
			result += fraction * (value % base);
			value = Math.floor(value / base);
			fraction /= base;
		}

		return result;
	}

	function isInsideHoverTextZone(x, y) {
		return x > 30 && x < 70 && y > 34 && y < 66;
	}

	const nodes = interviews.map((item, index) => {
		const rand = createSeededRandom(`${categoryKey}-${item.id}-${index}`);

		return {
			item,
			index,
			rand,
			size: minSize + rand() * (maxSize - minSize)
		};
	});

	const orderedNodes = [...nodes].sort((a, b) => b.size - a.size || a.index - b.index);
	const sequenceOffset = Math.floor(createSeededRandom(`${categoryKey}-scatter-${total}`)() * 1000);

	orderedNodes.forEach((node, placedIndex) => {
		const { rand, size } = node;
		let x = 50;
		let y = 45;
		let found = false;
		const depthBand = isCelebrazioni ? placedIndex % 4 : placedIndex % 5;

		for (let attempt = 0; attempt < Math.max(180, total * 8); attempt++) {
			const sequenceIndex = sequenceOffset + placedIndex * 37 + attempt * 11 + 1;
			const candidateX = layoutLeft + halton(sequenceIndex, 2) * usableWidth;
			let candidateY = layoutTop + halton(sequenceIndex, 3) * usableHeight;

			if (isCelebrazioni) {
				const groundPull = 0.45 + depthBand * 0.12;
				candidateY = layoutCenterY + (candidateY - layoutCenterY) * groundPull;
				candidateY += Math.sin(sequenceIndex * 1.08) * 3.4;
				candidateY += (rand() - 0.5) * 5.5;
			} else {
				candidateY += (rand() - 0.5) * usableHeight * 0.06;
			}

			const jitterX = (rand() - 0.5) * usableWidth * (isCelebrazioni ? 0.085 : 0.06);
			const finalX = Math.max(layoutLeft, Math.min(layoutRight, candidateX + jitterX));
			const finalY = Math.max(layoutTop, Math.min(layoutBottom, candidateY));

			if (isInsideHoverTextZone(finalX, finalY)) {
				continue;
			}

			const tryXPx = (finalX / 100) * virtualWidthPx;
			const tryYPx = (finalY / 100) * virtualHeightPx;
			const minGap = isCelebrazioni ? 12 : total > 45 ? 10 : 14;

			const isFarEnough = placed.every((p) => {
				const dx = tryXPx - p.xPx;
				const dy = tryYPx - p.yPx;
				const dist = Math.sqrt(dx * dx + dy * dy);

				return dist > size / 2 + p.size / 2 + minGap;
			});

			if (isFarEnough) {
				x = finalX;
				y = finalY;
				found = true;
				break;
			}
		}

		if (!found) {
			const fallbackIndex = sequenceOffset + placedIndex * 53 + 1;
			x = layoutLeft + halton(fallbackIndex, 2) * usableWidth;
			y = layoutTop + halton(fallbackIndex, 3) * usableHeight;

			if (isCelebrazioni) {
				y = layoutCenterY + (y - layoutCenterY) * 0.42;
				y += Math.sin(fallbackIndex * 1.08) * 3.5;
				y += (rand() - 0.5) * 4.5;
			} else {
				y += (rand() - 0.5) * 6;
			}

			x += (rand() - 0.5) * 8;

			if (isInsideHoverTextZone(x, y)) {
				y = isCelebrazioni ? layoutBottom - 10 - rand() * 4 : y < 50 ? layoutTop + 8 + rand() * 4 : layoutBottom - 8 - rand() * 4;
				x += x < 50 ? -8 : 8;
			}
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

	window.setActiveCategoryByKey?.(categoryKey);

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

		button.innerHTML = "";
		button.style.setProperty("--node-color-rgb", getCategoryColor(categoryKey));

		button.addEventListener("mouseenter", () => {
			showInterviewHoverIntro(item, categoryKey);
		});

		button.addEventListener("mouseleave", () => {
			hideChapterHoverIntro();
		});

		button.addEventListener("focus", () => {
			showInterviewHoverIntro(item, categoryKey);
		});

		button.addEventListener("blur", () => {
			hideChapterHoverIntro();
		});

		button.addEventListener("click", (event) => {
			event.stopPropagation();
			hideChapterHoverIntro();

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

	const next = current + (target - current) * 0.02;
	container.style.setProperty("--pan-x", `${next}px`);

	return next;
}
