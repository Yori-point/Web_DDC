// @ts-nocheck

export function createHotspotButtons({
	legacyAreas,
	hookHeightByKey,
	hotspotLayer,
	findHookByKey,
	onHover,
	onLeave,
	onSelect
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

	return hotspotButtons;
}

export function updateHotspotButtonPositions({
	hotspotLayer,
	hotspotButtons,
	appState,
	camera,
	hookHeightByKey,
	findHookByKey,
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
}