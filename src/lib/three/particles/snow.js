// @ts-nocheck

export function createSnowParticles({
	THREE,
	WORLD,
	mapSceneGroup,
	animatedObjects,
	createSnowFlakeTexture,
	createSnowCrystalTexture
}) {
	const positions = [];
	const base = [];
	const phases = [];
	const amps = [];

	for (let i = 0; i < WORLD.snowCount; i++) {
		const x = THREE.MathUtils.randFloatSpread(150);

		const lowLayer = Math.random() < 0.62;

		const y = lowLayer
			? THREE.MathUtils.randFloat(1.8, 18)
			: THREE.MathUtils.randFloat(18, 68);

		const z = THREE.MathUtils.randFloatSpread(100);

		positions.push(x, y, z);
		base.push(x, y, z);
		phases.push(Math.random() * Math.PI * 2);
		amps.push(lowLayer ? 0.18 + Math.random() * 0.52 : 0.06 + Math.random() * 0.34);
	}

	animatedObjects.snowBase = new Float32Array(base);
	animatedObjects.snowPhase = new Float32Array(phases);
	animatedObjects.snowAmp = new Float32Array(amps);

	const snowGeometry = new THREE.BufferGeometry();
	snowGeometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3)
	);

	const snowMaterial = new THREE.PointsMaterial({
		map: createSnowFlakeTexture(THREE),
		alphaTest: 0.001,
		color: 0xffffff,
		size: 0.5,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0.38,
		depthWrite: false,
		depthTest: false,
		blending: THREE.NormalBlending
	});

	const snowPoints = new THREE.Points(snowGeometry, snowMaterial);
	snowPoints.name = "dense-floating-snow";
	snowPoints.renderOrder = 5;

	mapSceneGroup.add(snowPoints);
	animatedObjects.snow = snowPoints;
}

export function createForegroundSnowParticles({
	THREE,
	mapSceneGroup,
	animatedObjects,
	createSnowFlakeTexture,
	createSnowCrystalTexture
}) {
	const positions = [];
	const base = [];
	const phases = [];
	const amps = [];

	const count = 680;

	for (let i = 0; i < count; i++) {
		const x = THREE.MathUtils.randFloatSpread(165);
		const y = THREE.MathUtils.randFloat(3, 62);
		const z = THREE.MathUtils.randFloat(-48, 58);

		positions.push(x, y, z);
		base.push(x, y, z);
		phases.push(Math.random() * Math.PI * 2);
		amps.push(0.18 + Math.random() * 0.55);
	}

	animatedObjects.foregroundSnowBase = new Float32Array(base);
	animatedObjects.foregroundSnowPhase = new Float32Array(phases);
	animatedObjects.foregroundSnowAmp = new Float32Array(amps);

	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

	const mat = new THREE.PointsMaterial({
		map: createSnowCrystalTexture
			? createSnowCrystalTexture(THREE)
			: createSnowFlakeTexture(THREE),
		alphaTest: 0.001,
		color: 0xffffff,
		size: 1.9,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0.5,
		depthWrite: false,
		depthTest: false,
		blending: THREE.NormalBlending
	});

	const points = new THREE.Points(geo, mat);
	points.name = "foreground-large-snow";
	points.renderOrder = 7;

	mapSceneGroup.add(points);
	animatedObjects.foregroundSnow = points;
}

function wrap(value, min, max) {
	const range = max - min;
	return ((((value - min) % range) + range) % range) + min;
}

export function animateSnowParticles({ animatedObjects, t }) {
	const snow = animatedObjects.snow;
	if (!snow) return;

	const arr = snow.geometry.attributes.position.array;
	const base = animatedObjects.snowBase;
	const phase = animatedObjects.snowPhase;
	const amp = animatedObjects.snowAmp;

	for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
		const baseX = base[i];
		const baseY = base[i + 1];
		const baseZ = base[i + 2];

		const isLowLayer = baseY < 18;
		const fallSpeed = isLowLayer ? 0.22 : 0.13;

		const driftA = Math.sin(t * 0.32 + phase[p]) * amp[p] * 1.15;
		const driftB = Math.sin(t * 0.17 + phase[p] * 1.7) * amp[p] * 0.75;
		const swayZ = Math.cos(t * 0.24 + phase[p] * 1.3) * amp[p] * 0.7;

		arr[i] = baseX + driftA + driftB;
		arr[i + 1] = wrap(baseY - t * fallSpeed - Math.sin(t * 0.2 + phase[p]) * 0.45, 1.2, 72);
		arr[i + 2] = baseZ + swayZ;
	}

	snow.geometry.attributes.position.needsUpdate = true;
	snow.position.set(0, 0, 0);
}

export function animateForegroundSnowParticles({ animatedObjects, t }) {
	const snow = animatedObjects.foregroundSnow;
	if (!snow) return;

	const arr = snow.geometry.attributes.position.array;
	const base = animatedObjects.foregroundSnowBase;
	const phase = animatedObjects.foregroundSnowPhase;
	const amp = animatedObjects.foregroundSnowAmp;

	for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
		const baseX = base[i];
		const baseY = base[i + 1];
		const baseZ = base[i + 2];

		const swayX =
			Math.sin(t * 0.22 + phase[p]) * amp[p] * 1.25 +
			Math.cos(t * 0.11 + phase[p] * 1.9) * amp[p] * 0.8;

		const swayZ =
			Math.cos(t * 0.18 + phase[p]) * amp[p] * 0.7 +
			Math.sin(t * 0.09 + phase[p] * 1.4) * amp[p] * 0.45;

		const fall = 0.2 + Math.sin(phase[p]) * 0.08;

		arr[i] = baseX + swayX;
		arr[i + 1] = wrap(baseY - t * fall, 1.2, 64);
		arr[i + 2] = baseZ + swayZ;
	}

	snow.geometry.attributes.position.needsUpdate = true;
	snow.position.set(0, 0, 0);
}