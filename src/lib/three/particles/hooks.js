// @ts-nocheck

export function createLegendHelperDots({
	THREE,
	legacyAreas,
	hookHeightByKey,
	mapSceneGroup,
	createGlowSprite
}) {
	legacyAreas.forEach((area) => {
		const glow = createGlowSprite(THREE, area.color, 0.28);

		const y = hookHeightByKey[area.key] || 9.5;

		glow.position.set(area.x, y, area.z);
		glow.scale.set(4.8, 4.8, 1);

		glow.renderOrder = 35;
		mapSceneGroup.add(glow);
	});
}

export function createLegacyHooks({
	THREE,
	legacyAreas,
	hookHeightByKey,
	mapSceneGroup,
	animatedObjects,
	createHookTexture
}) {
	const texture = createHookTexture(THREE);

	legacyAreas.forEach((area) => {
		const y = hookHeightByKey[area.key] || 9.5;

		const sprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: texture,
				color: area.color,
				transparent: true,
				opacity: 0.86,
				alphaTest: 0.025,
				depthWrite: false,
				depthTest: false,
				blending: THREE.NormalBlending
			})
		);

		sprite.position.set(area.x, y, area.z);
		sprite.scale.set(2.4, 2.4, 1);

		sprite.userData = {
			id: area.id,
			key: area.key,
			title: area.title,
			text: area.text,
			pos: sprite.position.clone()
		};

		animatedObjects.hooks.push(sprite);
		mapSceneGroup.add(sprite);
	});
}

export function animateHooks({
	animatedObjects,
	appState,
	t
}) {
	animatedObjects.hooks.forEach((hook, index) => {
		hook.position.y =
			hook.userData.pos.y + Math.sin(t * 1.25 + index * 0.9) * 0.34;

		if (hook === appState.hoverHookObject) return;

		hook.material.opacity = 0.78 + Math.sin(t * 1.9 + index) * 0.11;

		const s = 4.7 + Math.sin(t * 1.2 + index) * 0.18;
		hook.scale.set(s, s, 1);
	});
}

export function applyMarkerHoverVisual({
	THREE,
	BG_COLOR,
	scene,
	ambientLight,
	keyLight,
	violetBackLight,
	animatedObjects,
	appState
}) {
	const hoveredHook = appState.hoverHookObject;
	const hoveredKey = hoveredHook?.userData?.key || null;
	const isHovering = appState.view === "overview" && !!hoveredHook;

	scene.background.set(BG_COLOR);
	scene.fog.color.set(BG_COLOR);

	ambientLight.intensity = 0.92;
	keyLight.intensity = 1.55;
	violetBackLight.intensity = 0.95;

	animatedObjects.mountainParticles.forEach((points) => {
		const mat = points.material;

		const isTargetMountain =
			isHovering &&
			points.userData.key &&
			points.userData.key === hoveredKey;

		if (points.userData.baseColors && points.geometry.attributes.color) {
			const colors = points.geometry.attributes.color.array;
			const baseColors = points.userData.baseColors;

			const targetColor = new THREE.Color(points.userData.color || 0xffffff);

			for (let i = 0; i < colors.length; i += 3) {
				const br = baseColors[i];
				const bg = baseColors[i + 1];
				const bb = baseColors[i + 2];

				if (isTargetMountain) {
					const mix = 0.58;
					const glow = 1.18;

					colors[i] = THREE.MathUtils.lerp(br * 0.88, targetColor.r * glow, mix);
					colors[i + 1] = THREE.MathUtils.lerp(bg * 0.88, targetColor.g * glow, mix);
					colors[i + 2] = THREE.MathUtils.lerp(bb * 0.88, targetColor.b * glow, mix);
				} else {
					colors[i] = br;
					colors[i + 1] = bg;
					colors[i + 2] = bb;
				}
			}

			points.geometry.attributes.color.needsUpdate = true;
		}

		if (isTargetMountain) {
			mat.opacity = 1.0;
			mat.size = (points.userData.baseSize || 0.44) * 1.08;
			points.renderOrder = 42;
		} else {
			mat.opacity = points.userData.baseOpacity || 0.96;
			mat.size = points.userData.baseSize || 0.44;
			points.renderOrder = 24;
		}

		mat.color.set(0xffffff);
		mat.blending = THREE.NormalBlending;
		mat.needsUpdate = true;
	});

	animatedObjects.pulseLines.forEach((line) => {
		if (!line.material.userData.baseOpacity) {
			line.material.userData.baseOpacity = line.material.opacity;
		}

		line.material.opacity = line.material.userData.baseOpacity;
	});

	if (animatedObjects.snow) {
		animatedObjects.snow.material.opacity = 0.5;
	}

	animatedObjects.hooks.forEach((hook) => {
		const isTarget = isHovering && hook.userData.key === hoveredKey;

		if (isTarget) {
			hook.material.opacity = 1.0;
			hook.scale.set(5.2, 5.2, 1);
			hook.renderOrder = 70;
		} else {
			hook.material.opacity = 0.86;
			hook.scale.set(4.7, 4.7, 1);
			hook.renderOrder = 35;
		}
	});

	document.body.style.cursor = isHovering ? "pointer" : "";
}