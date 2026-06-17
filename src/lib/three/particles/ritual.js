// @ts-nocheck

export function createIntroParticleRings({
	THREE,
	scene,
	animatedObjects,
	createSoftMistTexture,
	getLegacyPoint
}) {
	const positions = [];
	const colors = [];
	const base = [];
	const phases = [];
	const amps = [];

	const countPerRing = 9000;
	const ringRadius = 9.8;
	const ringThickness = 3.2;

	const ringData = [
		{ x: -14.4, y: 6.0, z: -6.2, color: new THREE.Color(0x88c4e8) },
		{ x: 0, y: 6.0, z: -6.2, color: new THREE.Color(0xe8c860) },
		{ x: 14.4, y: 6.0, z: -6.2, color: new THREE.Color(0xe0eaf4) },
		{ x: -7.2, y: 3.05, z: 5.7, color: new THREE.Color(0x88c8a8) },
		{ x: 7.2, y: 3.05, z: 5.7, color: new THREE.Color(0xe89ab0) }
	];

	for (let ringIndex = 0; ringIndex < ringData.length; ringIndex++) {
		const ring = ringData[ringIndex];

		for (let i = 0; i < countPerRing; i++) {
			const a = Math.random() * Math.PI * 2;

			const w1 = 0.5 + 0.5 * Math.sin(a * 1.8 + ringIndex * 2.3);
			const w2 = 0.5 + 0.5 * Math.sin(a * 4.1 + ringIndex * 0.8 + 1.0);
			const opFactor = w1 * 0.45 + w2 * 0.30 + Math.random() * 0.25;

			const radSpread = ringThickness * THREE.MathUtils.lerp(0.78, 0.34, opFactor);

			const organicWobble =
				Math.sin(a * 2.2 + ringIndex * 1.7) * 0.28 +
				Math.sin(a * 5.1 + ringIndex * 0.9) * 0.14;

			const tubeAngle = Math.random() * Math.PI * 2;
			const tubeRadius = ringThickness * (0.18 + Math.pow(Math.random(), 0.7) * 0.56);

			const radialTube = Math.cos(tubeAngle) * tubeRadius;
			const verticalTube = Math.sin(tubeAngle) * tubeRadius * 0.34;
			const depthTube = Math.sin(tubeAngle) * tubeRadius * 0.12;

			const r =
				ringRadius +
				organicWobble +
				radialTube +
				THREE.MathUtils.randFloatSpread(radSpread * 0.36);

			const x =
				ring.x +
				Math.cos(a) * r +
				THREE.MathUtils.randFloatSpread(0.34);

			const y =
				ring.y +
				verticalTube +
				Math.sin(a * 3.0 + ringIndex) * 0.16 +
				THREE.MathUtils.randFloatSpread(0.26);

			const z =
				ring.z +
				Math.sin(a) * r +
				Math.cos(a) * depthTube +
				THREE.MathUtils.randFloatSpread(0.34);

			positions.push(x, y, z);
			base.push(x, y, z);
			phases.push(Math.random() * Math.PI * 2);
			amps.push(0.04 + Math.random() * 0.14);

			const brightness = 0.42 + opFactor * 0.40;
			const c = ring.color.clone();

			colors.push(c.r * brightness, c.g * brightness, c.b * brightness);
		}
	}

	const dustCount = 420;

	for (let i = 0; i < dustCount; i++) {
		const angle = Math.random() * Math.PI * 2;
		const radius = 10 + Math.random() * 22;
		const dx = Math.cos(angle) * radius + THREE.MathUtils.randFloatSpread(4);
		const dy = 4.8 + THREE.MathUtils.randFloat(-2.5, 3.5);
		const dz = Math.sin(angle) * radius * 0.5 + THREE.MathUtils.randFloatSpread(6);

		positions.push(dx, dy, dz);
		base.push(dx, dy, dz);
		phases.push(Math.random() * Math.PI * 2);
		amps.push(0.05 + Math.random() * 0.18);

		const m = 0.06 + Math.random() * 0.08;
		colors.push(0.78 * m, 0.88 * m, 1.0 * m);
	}

	animatedObjects.introRingsCountPerRing = countPerRing;
	updateIntroRingTargetsFromCurrentHotspots({
		animatedObjects,
		getLegacyPoint
	});

	animatedObjects.introRingsBase = new Float32Array(base);
	animatedObjects.introRingsPhase = new Float32Array(phases);
	animatedObjects.introRingsAmp = new Float32Array(amps);

	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

	const mat = new THREE.PointsMaterial({
		map: createSoftMistTexture(THREE),
		alphaTest: 0.005,
		size: 0.46,
		sizeAttenuation: true,
		vertexColors: true,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		depthTest: false,
		blending: THREE.NormalBlending
	});

	const rings = new THREE.Points(geo, mat);

	rings.name = "intro-particle-rings";
	rings.visible = false;
	rings.renderOrder = 150;
	rings.position.set(0.8, 0.15, 0);
	rings.scale.set(1.18, 1.10, 1.12);
	rings.rotation.y = 0;
	rings.rotation.z = 0;

	scene.add(rings);
	animatedObjects.introRings = rings;
}

export function updateIntroRingTargetsFromCurrentHotspots({
	animatedObjects,
	getLegacyPoint
}) {
	const p02 = getLegacyPoint("opportunita");
	const p01 = getLegacyPoint("festa");
	const p03 = getLegacyPoint("trasformazione");
	const p04 = getLegacyPoint("criticita");
	const p05 = getLegacyPoint("relazioni");

	animatedObjects.introRingsTargets = [
		{ cx: -14.4, cy: 6.0, cz: -6.2, tx: p02.x, ty: p02.y, tz: p02.z },
		{ cx: 0.0, cy: 6.0, cz: -6.2, tx: p01.x, ty: p01.y, tz: p01.z },
		{ cx: 14.4, cy: 6.0, cz: -6.2, tx: p03.x, ty: p03.y, tz: p03.z },
		{ cx: -7.2, cy: 3.05, cz: 5.7, tx: p04.x, ty: p04.y, tz: p04.z },
		{ cx: 7.2, cy: 3.05, cz: 5.7, tx: p05.x, ty: p05.y, tz: p05.z }
	];
}

export function createRitualForegroundSnow({
	THREE,
	scene,
	animatedObjects,
	createSoftMistTexture
}) {
	const fineCount = 1400;
	const finePos = [];
	const fineBase = [];
	const finePhase = [];
	const fineAmp = [];

	for (let i = 0; i < fineCount; i++) {
		const x = THREE.MathUtils.randFloatSpread(75);
		const y = Math.random() < 0.65
			? THREE.MathUtils.randFloat(-18, 3)
			: THREE.MathUtils.randFloat(3, 16);
		const z = 18 + Math.random() * 44;

		finePos.push(x, y, z);
		fineBase.push(x, y, z);
		finePhase.push(Math.random() * Math.PI * 2);
		fineAmp.push(0.12 + Math.random() * 0.38);
	}

	const fineGeo = new THREE.BufferGeometry();
	fineGeo.setAttribute("position", new THREE.Float32BufferAttribute(finePos, 3));

	const fineMat = new THREE.PointsMaterial({
		color: 0xccdae6,
		size: 0.11,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		depthTest: false,
		blending: THREE.NormalBlending
	});

	const fineSnow = new THREE.Points(fineGeo, fineMat);
	fineSnow.name = "ritual-snow-fine";
	fineSnow.visible = false;
	fineSnow.renderOrder = 160;
	scene.add(fineSnow);

	animatedObjects.ritualSnowFine = fineSnow;
	animatedObjects.ritualSnowFineBase = new Float32Array(fineBase);
	animatedObjects.ritualSnowFinePhase = new Float32Array(finePhase);
	animatedObjects.ritualSnowFineAmp = new Float32Array(fineAmp);

	const largeCount = 38;
	const largePos = [];
	const largeBase = [];
	const largePhase = [];
	const largeAmp = [];

	for (let i = 0; i < largeCount; i++) {
		const x = THREE.MathUtils.randFloatSpread(50);
		const y = THREE.MathUtils.randFloat(-12, 8);
		const z = 52 + Math.random() * 16;

		largePos.push(x, y, z);
		largeBase.push(x, y, z);
		largePhase.push(Math.random() * Math.PI * 2);
		largeAmp.push(0.25 + Math.random() * 0.45);
	}

	const largeGeo = new THREE.BufferGeometry();
	largeGeo.setAttribute("position", new THREE.Float32BufferAttribute(largePos, 3));

	const largeMat = new THREE.PointsMaterial({
		map: createSoftMistTexture(THREE),
		alphaTest: 0.005,
		color: 0xdde6ee,
		size: 0.55,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		depthTest: false,
		blending: THREE.NormalBlending
	});

	const largeSnow = new THREE.Points(largeGeo, largeMat);
	largeSnow.name = "ritual-snow-large";
	largeSnow.visible = false;
	largeSnow.renderOrder = 162;
	scene.add(largeSnow);

	animatedObjects.ritualSnowLarge = largeSnow;
	animatedObjects.ritualSnowLargeBase = new Float32Array(largeBase);
	animatedObjects.ritualSnowLargePhase = new Float32Array(largePhase);
	animatedObjects.ritualSnowLargeAmp = new Float32Array(largeAmp);
}

export function animateIntroRings({
	THREE,
	t,
	appState,
	animatedObjects,
	ritualHint,
	mapSceneGroup,
	setMapSceneOpacity,
	easeInOutCubic,
	smoothstep,

	orbit,
	ritualCamera,
	overviewCamera,
	updateCamera
}) {
	const rings = animatedObjects.introRings;
	if (!rings || !rings.visible) return;

	const arr = rings.geometry.attributes.position.array;
	const base = animatedObjects.introRingsBase;
	const phase = animatedObjects.introRingsPhase;
	const amp = animatedObjects.introRingsAmp;
	const targets = animatedObjects.introRingsTargets;
	const cpRing = animatedObjects.introRingsCountPerRing;

	const progress = appState.ritualScrollProgress;
	const morphProgress = smoothstep(0.18, 0.96, progress);
	const land = easeInOutCubic(morphProgress);

	if (ritualHint) {
		const hintFade = smoothstep(0.02, 0.24, progress);
		ritualHint.style.opacity = String(1 - hintFade);

		if (progress > 0.28) {
			ritualHint.classList.add("hidden");
		} else {
			ritualHint.classList.remove("hidden");
		}
	}

	if (mapSceneGroup) {
		mapSceneGroup.visible = true;
		const reveal = THREE.MathUtils.lerp(
			0.12,
			1,
			smoothstep(0.42, 0.94, progress)
		);
		setMapSceneOpacity(reveal);
	}

	// 相机过渡
	if (orbit && ritualCamera && overviewCamera && updateCamera) {
		const cameraProgress = smoothstep(0.32, 0.96, progress);

		orbit.yaw = THREE.MathUtils.lerp(
			ritualCamera.yaw,
			overviewCamera.yaw,
			cameraProgress
		);

		orbit.pitch = THREE.MathUtils.lerp(
			ritualCamera.pitch,
			overviewCamera.pitch,
			cameraProgress
		);

		orbit.radius = THREE.MathUtils.lerp(
			ritualCamera.radius,
			overviewCamera.radius,
			cameraProgress
		);

		orbit.target
			.copy(ritualCamera.target)
			.lerp(overviewCamera.target, cameraProgress);

		updateCamera();
	}

	appState.ritualPointerX = THREE.MathUtils.lerp(
		appState.ritualPointerX,
		appState.ritualPointerTargetX,
		0.06
	);

	appState.ritualPointerY = THREE.MathUtils.lerp(
		appState.ritualPointerY,
		appState.ritualPointerTargetY,
		0.06
	);

	for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
		const bx = base[i];
		const by = base[i + 1];
		const bz = base[i + 2];

		const shimX = Math.sin(t * 0.50 + phase[p]) * amp[p] * 0.22 * (1 - land);
		const shimY = Math.cos(t * 0.42 + phase[p] * 1.1) * amp[p] * 0.07 * (1 - land);
		const shimZ = Math.sin(t * 0.38 + phase[p] * 0.9) * amp[p] * 0.22 * (1 - land);

		const gIdx =
			targets && cpRing > 0 && p < cpRing * 5
				? Math.floor(p / cpRing)
				: -1;

		if (gIdx >= 0) {
			const target = targets[gIdx];

			const ringScale = THREE.MathUtils.lerp(1.0, 0.018, land);

			const localX = bx - target.cx;
			const localY = by - target.cy;
			const localZ = bz - target.cz;

			const targetX = target.tx + localX * ringScale;
			const targetY = target.ty + localY * ringScale;
			const targetZ = target.tz + localZ * ringScale;

			arr[i] = THREE.MathUtils.lerp(bx, targetX, land) + shimX;
			arr[i + 1] = THREE.MathUtils.lerp(by, targetY, land) + shimY;
			arr[i + 2] = THREE.MathUtils.lerp(bz, targetZ, land) + shimZ;
		} else {
			arr[i] = bx + shimX;
			arr[i + 1] = by - progress * 10 + shimY;
			arr[i + 2] = bz + shimZ;
		}
	}

	rings.geometry.attributes.position.needsUpdate = true;

	const groupScaleX = THREE.MathUtils.lerp(1.18, 1.0, land);
	const groupScaleY = THREE.MathUtils.lerp(1.10, 1.0, land);
	const groupScaleZ = THREE.MathUtils.lerp(1.12, 1.0, land);

	rings.scale.set(groupScaleX, groupScaleY, groupScaleZ);

	rings.rotation.x = 0;
	rings.rotation.y = 0;
	rings.rotation.z = 0;

	rings.position.set(
		appState.ritualPointerX * 0.35 * (1 - land),
		appState.ritualPointerY * 0.20 * (1 - land),
		0
	);

	if (appState.view === "particle-ritual") {
		const disappear = smoothstep(0.86, 1.0, progress);

		const targetOpacity = THREE.MathUtils.lerp(0.72, 0.0, disappear);

		rings.material.opacity = THREE.MathUtils.lerp(
			rings.material.opacity,
			targetOpacity,
			0.08
		);

		const landingSize = THREE.MathUtils.lerp(0.46, 0.12, land);
		const targetSize = THREE.MathUtils.lerp(landingSize, 0.0, disappear);

		rings.material.size = targetSize;
	}
}

export function animateRitualSnow({
	THREE,
	t,
	appState,
	animatedObjects
}) {
	const isRitual = appState.view === "particle-ritual";

	function wrapVal(v, lo, hi) {
		const range = hi - lo;
		return ((((v - lo) % range) + range) % range) + lo;
	}

	const fine = animatedObjects.ritualSnowFine;

	if (fine && fine.visible) {
		const arr = fine.geometry.attributes.position.array;
		const base = animatedObjects.ritualSnowFineBase;
		const phase = animatedObjects.ritualSnowFinePhase;
		const amp = animatedObjects.ritualSnowFineAmp;

		for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
			arr[i] = base[i] + Math.sin(t * 0.28 + phase[p]) * amp[p] * 1.4;
			arr[i + 1] = wrapVal(base[i + 1] - t * 0.20, -20, 18);
			arr[i + 2] = base[i + 2];
		}

		fine.geometry.attributes.position.needsUpdate = true;

		fine.material.opacity = THREE.MathUtils.lerp(
			fine.material.opacity,
			isRitual ? 0.46 : 0,
			0.025
		);

		if (!isRitual && fine.material.opacity < 0.005) {
			fine.visible = false;
		}
	}

	const large = animatedObjects.ritualSnowLarge;

	if (large && large.visible) {
		const arr = large.geometry.attributes.position.array;
		const base = animatedObjects.ritualSnowLargeBase;
		const phase = animatedObjects.ritualSnowLargePhase;
		const amp = animatedObjects.ritualSnowLargeAmp;

		for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
			arr[i] = base[i] + Math.sin(t * 0.16 + phase[p]) * amp[p] * 0.9;
			arr[i + 1] = wrapVal(base[i + 1] - t * 0.09, -14, 10);
			arr[i + 2] = base[i + 2];
		}

		large.geometry.attributes.position.needsUpdate = true;

		large.material.opacity = THREE.MathUtils.lerp(
			large.material.opacity,
			isRitual ? 0.28 : 0,
			0.025
		);

		if (!isRitual && large.material.opacity < 0.005) {
			large.visible = false;
		}
	}
}