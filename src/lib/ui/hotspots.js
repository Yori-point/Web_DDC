// @ts-nocheck

export function createHotspotButtons({
	legacyAreas,
	hookHeightByKey,
	hotspotLayer,
	findHookByKey,
	onHover,
	onLeave,
	onSelect,
	onDuomoHover,
	onDuomoLeave,
	onDuomoClick
}) {
	if (!hotspotLayer) return [];

	hotspotLayer.innerHTML = "";

	const hotspotButtons = legacyAreas.map((area) => {
		const button = document.createElement("button");

		button.type = "button";
		button.className = `hotspot-btn hotspot-${area.key}`;
		button.dataset.key = area.key;

		button.innerHTML = `
			<span class="hotspot-dot"></span>
			<span class="hotspot-label">
				<strong>${area.title}</strong>
				<small>${area.text}</small>
			</span>
		`;

		button.addEventListener("mouseenter", () => {
			onHover?.(area.key);
		});

		button.addEventListener("mouseleave", () => {
			onLeave?.();
		});

		button.addEventListener("pointerdown", (event) => {
			event.stopPropagation();
		});

		button.addEventListener("pointerup", (event) => {
			event.stopPropagation();
		});

		button.addEventListener("click", (event) => {
			event.stopPropagation();

			onLeave?.();
			button.blur();

			document.body.classList.remove(
				"category-hover-active",
				"summit-title-active"
			);

			const hook = findHookByKey(area.key);
			const y = hookHeightByKey[area.key] || 9.5;

			onSelect?.({
				id: area.id,
				key: area.key,
				title: area.title,
				text: area.text,
				pos: hook ? hook.userData.pos.clone() : null,
				fallback: {
					x: area.x,
					y,
					z: area.z
				}
			});
		});

		hotspotLayer.appendChild(button);

		return {
			button,
			area
		};
	});

		const duomoButton = document.createElement("button");

		duomoButton.type = "button";
		duomoButton.className = "duomo-hover-btn";
		duomoButton.setAttribute("aria-label", "Duomo hover area");

		duomoButton.addEventListener("mouseenter", () => {
			onDuomoHover?.();
		});

		duomoButton.addEventListener("mouseleave", () => {
			onDuomoLeave?.();
		});

		duomoButton.addEventListener("pointerdown", (event) => {
			event.stopPropagation();
		});

		duomoButton.addEventListener("pointerup", (event) => {
			event.stopPropagation();
		});

		duomoButton.addEventListener("click", (event) => {
			event.stopPropagation();

			onDuomoLeave?.();
			duomoButton.blur();

			document.body.classList.remove(
				"category-hover-active",
				"summit-title-active"
			);

			onDuomoClick?.();
		});

		hotspotLayer.appendChild(duomoButton);

		// If user clicks the hotspotLayer (not on an existing button), detect
		// whether the click falls inside the Duomo screen bbox and trigger
		// onDuomoClick. This covers clicks that hit map geometry/roads under
		// Duomo that might not land on the small duomo button element.
		hotspotLayer.addEventListener('click', (event) => {
			// if click already hit a hotspot or the duomo button, let its handler run
			if (event.target.closest && (event.target.closest('.hotspot-btn') || event.target.closest('.duomo-hover-btn'))) return;

			const db = duomoButton._bbox;
			if (!db) return;

			const x = event.clientX;
			const y = event.clientY;

			if (x >= db.minX && x <= db.maxX && y >= db.minY && y <= db.maxY) {
				event.stopPropagation();
				onDuomoClick?.();
			}
		});

	return hotspotButtons;
}

export function updateHotspotButtonPositions({
	hotspotLayer,
	hotspotButtons,
	appState,
	camera,
	hookHeightByKey,
	findHookByKey,
	duomoObject,
	THREE
}) {
	if (!hotspotLayer) return;

	const shouldShow =
		appState.view === "overview" &&
		!document.body.classList.contains("intro-active");

	hotspotLayer.classList.toggle("is-visible", shouldShow);

	if (!shouldShow) {
		return;
	}

	const worldPosition = new THREE.Vector3();

	hotspotButtons.forEach(({ button, area }) => {
		const hook = findHookByKey(area.key);

		if (hook) {
			hook.getWorldPosition(worldPosition);
		} else {
			worldPosition.set(area.x, hookHeightByKey[area.key] || 9.5, area.z);
		}

		worldPosition.project(camera);

		const screenX = (worldPosition.x * 0.5 + 0.5) * window.innerWidth;
		const screenY = (-worldPosition.y * 0.5 + 0.5) * window.innerHeight;

		const isBehindCamera = worldPosition.z > 1;

		button.style.left = `${screenX}px`;
		button.style.top = `${screenY}px`;
		button.classList.toggle("is-hidden", isBehindCamera);
	});

		const duomoButton = hotspotLayer.querySelector(".duomo-hover-btn");

		if (duomoButton) {
			if (!duomoObject) {
				duomoButton.classList.add("is-hidden");
				return;
			}

			// Try to compute a screen-space bounding box for the Duomo mesh so the
			// hover button covers the whole visible building instead of a single point.
			try {
				const box = new THREE.Box3().setFromObject(duomoObject);
				const min = box.min;
				const max = box.max;

				// collect 8 corners
				const corners = [
					new THREE.Vector3(min.x, min.y, min.z),
					new THREE.Vector3(min.x, min.y, max.z),
					new THREE.Vector3(min.x, max.y, min.z),
					new THREE.Vector3(min.x, max.y, max.z),
					new THREE.Vector3(max.x, min.y, min.z),
					new THREE.Vector3(max.x, min.y, max.z),
					new THREE.Vector3(max.x, max.y, min.z),
					new THREE.Vector3(max.x, max.y, max.z)
				];

				let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
				let anyBehind = false;

				for (const c of corners) {
					const v = c.clone();
					v.project(camera);
					if (v.z > 1) anyBehind = true;
					const sx = (v.x * 0.5 + 0.5) * window.innerWidth;
					const sy = (-v.y * 0.5 + 0.5) * window.innerHeight;
					minX = Math.min(minX, sx);
					minY = Math.min(minY, sy);
					maxX = Math.max(maxX, sx);
					maxY = Math.max(maxY, sy);
				}

				if (anyBehind || !isFinite(minX)) {
					duomoButton.classList.add('is-hidden');
					return;
				}

				const padX = 40; // safety padding
				const padY = 30;
				const boxLeft = minX - padX;
				const boxTop = minY - padY;
				const boxRight = maxX + padX;
				const boxBottom = maxY + padY;
				const boxWidth = Math.max(80, boxRight - boxLeft);
				const boxHeight = Math.max(60, boxBottom - boxTop);
				const centerX = (boxLeft + boxRight) / 2;
				const centerY = (boxTop + boxBottom) / 2;

				// store bbox for click-detection
				duomoButton._bbox = {
					minX: boxLeft,
					minY: boxTop,
					maxX: boxRight,
					maxY: boxBottom
				};

				duomoButton.style.left = `${centerX}px`;
				duomoButton.style.top = `${centerY}px`;
				duomoButton.style.width = `${boxWidth}px`;
				duomoButton.style.height = `${boxHeight}px`;
				duomoButton.classList.remove('is-hidden');
			} catch (err) {
				// fallback: single point
				duomoObject.getWorldPosition(worldPosition);
				worldPosition.y += 2.2;
				worldPosition.project(camera);
				const screenX = (worldPosition.x * 0.5 + 0.5) * window.innerWidth;
				const screenY = (-worldPosition.y * 0.5 + 0.5) * window.innerHeight;
				duomoButton.style.left = `${screenX}px`;
				duomoButton.style.top = `${screenY}px`;
				// small bbox around point as fallback
				duomoButton._bbox = {
					minX: screenX - 24,
					minY: screenY - 24,
					maxX: screenX + 24,
					maxY: screenY + 24
				};
				duomoButton.classList.remove('is-hidden');
			}
		}
}