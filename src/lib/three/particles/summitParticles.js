// @ts-nocheck

function createRoundDotTexture(THREE) {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 64;

	const ctx = canvas.getContext("2d");
	const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

	gradient.addColorStop(0.0, "rgba(255,255,255,1)");
	gradient.addColorStop(0.35, "rgba(255,255,255,0.65)");
	gradient.addColorStop(1.0, "rgba(255,255,255,0)");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 64, 64);

	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	return texture;
}

function makeSummitPoints({
	THREE,
	name,
	positions,
	colors,
	size,
	opacity,
	texture
}) {
	const geometry = new THREE.BufferGeometry();

	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3)
	);

	geometry.setAttribute(
		"color",
		new THREE.Float32BufferAttribute(colors, 3)
	);

	const material = new THREE.PointsMaterial({
		map: texture,
		size,
		sizeAttenuation: true,
		vertexColors: true,
		transparent: true,
		opacity,
		depthWrite: false,
		depthTest: false,
		blending: THREE.AdditiveBlending
	});

	const points = new THREE.Points(geometry, material);
	points.name = name;

	return points;
}

function pseudoNoise(x, z) {
	const n1 =
		Math.sin(x * 1.73 + z * 0.61) * 0.5 +
		Math.cos(x * 0.41 - z * 1.17) * 0.3 +
		Math.sin(x * 0.13 - z * 0.27) * 0.2;
	const n2 =
		Math.sin(x * 0.09 + z * 1.46 + 1.7) * 0.28 +
		Math.cos(x * 0.73 - z * 0.34 + 0.9) * 0.22 +
		Math.sin(x * 1.21 + z * 0.18 - 2.1) * 0.16;
	const n3 =
		Math.sin(x * 2.14 - z * 1.08 + 0.4) * 0.18 +
		Math.cos(x * 0.36 + z * 0.72 - 1.2) * 0.12;

	return n1 * 0.6 + n2 * 0.3 + n3 * 0.1;
}

export function createSummitParticles({
	THREE,
	scene,
	animatedObjects
}) {
	const dotTexture = createRoundDotTexture(THREE);

	const foregroundPositions = [];
	const foregroundColors = [];
	const foregroundBase = [];
	const foregroundPhase = [];

	const midgroundPositions = [];
	const midgroundColors = [];
	const midgroundBase = [];
	const midgroundPhase = [];

	const ridgePositions = [];
	const ridgeColors = [];
	const ridgeBase = [];
	const ridgePhase = [];

	const airPositions = [];
	const airColors = [];
	const airBase = [];
	const airPhase = [];

	function addForegroundParticle(x, y, z, brightness) {
		foregroundPositions.push(x, y, z);
		foregroundBase.push(x, y, z);
		foregroundPhase.push(Math.random() * Math.PI * 2);
		foregroundColors.push(1.0 * brightness, 1.0 * brightness, 1.0 * brightness);
	}

	function addMidgroundParticle(x, y, z, brightness) {
		midgroundPositions.push(x, y, z);
		midgroundBase.push(x, y, z);
		midgroundPhase.push(Math.random() * Math.PI * 2);
		midgroundColors.push(1.0 * brightness, 1.0 * brightness, 1.0 * brightness);
	}

	function addRidgeParticle(x, y, z, brightness) {
		ridgePositions.push(x, y, z);
		ridgeBase.push(x, y, z);
		ridgePhase.push(Math.random() * Math.PI * 2);
		ridgeColors.push(1.0 * brightness, 1.0 * brightness, 1.0 * brightness);
	}

	function ridgeHeight(x, z) {
		const peakA = Math.exp(-Math.pow((x + 22) / 10, 2)) * 5.2;
		const peakB = Math.exp(-Math.pow((x + 7) / 8, 2)) * 3.6;
		const peakC = Math.exp(-Math.pow((x - 10) / 9, 2)) * 4.8;
		const peakD = Math.exp(-Math.pow((x - 25) / 12, 2)) * 3.2;

		const longWave =
			Math.sin(x * 0.11 + z * 0.035) * 0.75 +
			Math.cos(x * 0.19 - z * 0.04) * 0.42;

		const farRise = THREE.MathUtils.clamp((z - 12) / 34, 0, 1) * 1.2;
		const noise = pseudoNoise(x * 0.32, z * 0.26) * 0.45;

		return -0.8 + peakA + peakB + peakC + peakD + longWave + farRise + noise;
	}

	function widthAtDepth(depth) {
		return THREE.MathUtils.lerp(54, 24, depth);
	}

	for (let i = 0; i < 5600; i++) {
		const depth = Math.pow(Math.random(), 1.65);
		const z = THREE.MathUtils.lerp(-22, -7, depth);
		const width = THREE.MathUtils.lerp(76, 30, depth);
		const seedX = THREE.MathUtils.randFloatSpread(width);

		const x =
			seedX +
			Math.sin(z * 0.32 + depth * 7.2) * 1.9 +
			Math.cos(seedX * 0.18) * 0.8;

		const y =
			THREE.MathUtils.lerp(-9.4, -3.6, depth) +
			Math.sin(x * 0.12 + z * 0.22) * 0.36 +
			THREE.MathUtils.randFloat(-0.22, 0.22);

		const brightness = 0.9 + Math.random() * 0.3;
		addForegroundParticle(x, y, z, brightness);
	}

	for (let i = 0; i < 14500; i++) {
		const r = Math.random();

		let z;
		let x;
		let y;
		let brightness;

		// 1. 前景山脊：最近、最低、最宽
		if (r < 0.34) {
			const depth = Math.random();

			z = THREE.MathUtils.lerp(-24, -14, depth);

			const width = THREE.MathUtils.lerp(78, 54, depth);
			const seedX = THREE.MathUtils.randFloatSpread(width);

			x =
				seedX - 10 +
				Math.sin(z * 0.09 + depth * 2.2) * 1.4 +
				Math.cos(seedX * 0.05) * 0.6;

			const frontRidge =
				-9.15 +
				depth * 0.65 +
				(x + 26) * 0.04 +
				Math.sin(x * 0.04 + z * 0.06) * 0.16 +
				pseudoNoise(x * 0.14, z * 0.2) * 0.14;

			const isLine = Math.random() < 0.72;

			if (isLine) {
				y = frontRidge + THREE.MathUtils.randFloat(-0.075, 0.075);
				brightness = 0.62 + Math.random() * 0.2;
			} else {
				y = THREE.MathUtils.randFloat(-9.6, frontRidge - 0.28);
				brightness = 0.32 + Math.random() * 0.14;
			}
		}

		// 2. 中景山脊：中间距离，比前景高
		else if (r < 0.68) {
			const depth = Math.random();

			z = THREE.MathUtils.lerp(-3, 9, depth);

			const width = THREE.MathUtils.lerp(58, 38, depth);
			const seedX = THREE.MathUtils.randFloatSpread(width);

			x =
				seedX +
				Math.sin(z * 0.1 + depth * 2.8) * 1.2 +
				Math.cos(seedX * 0.05 + z * 0.08) * 0.5;

			const mainPeak = Math.exp(-Math.pow((x + 2) / 11, 2)) * 1.55;
			const sidePeak = Math.exp(-Math.pow((x - 14) / 14, 2)) * 0.45;

			const middleRidge =
				-6.95 +
				depth * 1.0 +
				mainPeak +
				sidePeak +
				Math.sin(x * 0.05 - z * 0.08) * 0.18 +
				pseudoNoise(x * 0.18, z * 0.22) * 0.18;

			const isLine = Math.random() < 0.7;

			if (isLine) {
				y = middleRidge + THREE.MathUtils.randFloat(-0.07, 0.07);
				brightness = 0.58 + Math.random() * 0.2;
			} else {
				y = THREE.MathUtils.randFloat(-8.2, middleRidge - 0.35);
				brightness = 0.3 + Math.random() * 0.14;
			}
		}

		// 3. 后景山脊：最远、最高，低于真正 summitRidge
		else if (r < 0.92) {
			const depth = Math.random();

			z = THREE.MathUtils.lerp(13, 27, depth);

			const width = THREE.MathUtils.lerp(44, 26, depth);
			const seedX = THREE.MathUtils.randFloatSpread(width);

			x =
				seedX +
				Math.sin(z * 0.12 + depth * 3.8) * 1.6 +
				Math.cos(seedX * 0.05 - z * 0.08) * 0.9;

			const backRidge =
				ridgeHeight(x, z) -
				2.65 +
				Math.sin(x * 0.075 + z * 0.08) * 0.32 +
				pseudoNoise(x * 0.2, z * 0.22) * 0.24;

			const isLine = Math.random() < 0.68;

			if (isLine) {
				y = backRidge + THREE.MathUtils.randFloat(-0.065, 0.065);
				brightness = 0.56 + Math.random() * 0.18;
			} else {
				y = THREE.MathUtils.randFloat(-6.7, backRidge - 0.45);
				brightness = 0.28 + Math.random() * 0.13;
			}
		}

		// 少量填充雪粒：只填下方，不抢三条山脊
		else {
			const depth = Math.random();

			z = THREE.MathUtils.lerp(-16, 24, depth);

			const width = THREE.MathUtils.lerp(70, 28, depth);
			x = THREE.MathUtils.randFloatSpread(width);

			y = THREE.MathUtils.randFloat(-9.4, -4.7);
			brightness = 0.22 + Math.random() * 0.12;
		}

		addMidgroundParticle(x, y, z, brightness);
	}

	for (let i = 0; i < 5800; i++) {
		const depth = Math.random();
		const z = THREE.MathUtils.lerp(18, 46, depth);
		const width = THREE.MathUtils.lerp(46, 24, depth);
		const seedX = THREE.MathUtils.randFloatSpread(width);

		const x =
			seedX +
			Math.sin(z * 0.16 + depth * 7.5) * 3.1 +
			Math.cos(depth * 12 + seedX * 0.05) * 1.4;

		const ridge =
			ridgeHeight(x, z) +
			Math.sin(z * 0.13 + x * 0.08) * 0.42 +
			Math.cos(x * 0.16 - z * 0.06) * 0.24;
		const y =
			ridge - 1.25 +
			Math.sin(z * 0.11 + x * 0.05) * 0.18 +
			THREE.MathUtils.randFloat(-0.16, 0.16);

		const brightness =
			0.62 +
			(1 - depth) * 0.22 +
			Math.random() * 0.18;

		addRidgeParticle(x, y, z, brightness);
	}

	for (let i = 0; i < 170; i++) {
		const x = THREE.MathUtils.randFloatSpread(78);
		const y = THREE.MathUtils.randFloat(8, 32);
		const z = THREE.MathUtils.randFloat(8, 55);

		airPositions.push(x, y, z);
		airBase.push(x, y, z);
		airPhase.push(Math.random() * Math.PI * 2);

		const brightness = 0.1 + Math.random() * 0.18;
		airColors.push(0.78 * brightness, 0.9 * brightness, 1.0 * brightness);
	}

	animatedObjects.summitForegroundBase = new Float32Array(foregroundBase);
	animatedObjects.summitForegroundPhase = new Float32Array(foregroundPhase);
	animatedObjects.summitGroundBase = new Float32Array(midgroundBase);
	animatedObjects.summitGroundPhase = new Float32Array(midgroundPhase);
	animatedObjects.summitRidgeBase = new Float32Array(ridgeBase);
	animatedObjects.summitRidgePhase = new Float32Array(ridgePhase);
	animatedObjects.summitAirBase = new Float32Array(airBase);
	animatedObjects.summitAirPhase = new Float32Array(airPhase);

	const summitScene = new THREE.Group();
	summitScene.name = "summit-particle-scene";
	summitScene.visible = false;
	summitScene.position.y += 0;
	scene.add(summitScene);

	animatedObjects.summitScene = summitScene;

	const foreground = makeSummitPoints({
		THREE,
		name: "summit-foreground-particles",
		positions: foregroundPositions,
		colors: foregroundColors,
		size: 0.11,
		opacity: 0,
		texture: dotTexture
	});

	const ground = makeSummitPoints({
		THREE,
		name: "summit-ground-particles",
		positions: midgroundPositions,
		colors: midgroundColors,
		size: 0.075,
		opacity: 0,
		texture: dotTexture
	});

	const ridge = makeSummitPoints({
		THREE,
		name: "summit-ridge-particles",
		positions: ridgePositions,
		colors: ridgeColors,
		size: 0.095,
		opacity: 0,
		texture: dotTexture
	});

	const air = makeSummitPoints({
		THREE,
		name: "summit-air-particles",
		positions: airPositions,
		colors: airColors,
		size: 0.055,
		opacity: 0,
		texture: dotTexture
	});

	summitScene.add(foreground);
	summitScene.add(ground);
	summitScene.add(ridge);
	summitScene.add(air);

	foreground.renderOrder = 88;
	ground.renderOrder = 89;
	ridge.renderOrder = 90;
	air.renderOrder = 91;

	foreground.visible = true;
	ground.visible = true;
	ridge.visible = true;
	air.visible = true;

	foreground.frustumCulled = false;
	ground.frustumCulled = false;
	ridge.frustumCulled = false;
	air.frustumCulled = false;

	foreground.material.transparent = true;
	ground.material.transparent = true;
	ridge.material.transparent = true;
	air.material.transparent = true;

	animatedObjects.summitForeground = foreground;
	animatedObjects.summitGround = ground;
	animatedObjects.summitRidge = ridge;
	animatedObjects.summitAir = air;
}

export function placeSummitParticlesAtMountain({
	THREE,
	animatedObjects,
	mountainPos,
	cameraDirection,
	cameraPosition = null,
	targetPosition = null
}) {
	const group = animatedObjects.summitScene;
	if (!group) return;

	group.visible = true;

	if (cameraPosition && targetPosition) {
		const forward = targetPosition.clone().sub(cameraPosition);

		if (forward.lengthSq() < 0.0001) {
			forward.set(0, 0, -1);
		}

		forward.normalize();

		group.position.copy(cameraPosition);
		group.position.add(forward.clone().multiplyScalar(9.5));
		group.position.y = cameraPosition.y - 7.5;

		group.rotation.set(0, Math.atan2(forward.x, forward.z), 0);
		group.scale.set(1.0, 1.0, 1.0);

		return;
	}

	group.position.copy(mountainPos);
	group.position.add(cameraDirection.clone().multiplyScalar(-0.8));
	group.position.y -= 0.4;

	const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
	group.rotation.set(0, angle, 0);

	group.scale.set(0.98, 0.9, 1.02);
}

export function updateSummitParticlesTransition({
	THREE,
	animatedObjects,
	progress,
	smoothstep
}) {
	const foreground = animatedObjects.summitForeground;
	const ground = animatedObjects.summitGround;
	const ridge = animatedObjects.summitRidge;
	const air = animatedObjects.summitAir;

	if (!foreground || !ground || !ridge || !air) return;

	const appear = smoothstep(0.18, 0.78, progress);

	foreground.material.opacity = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0, 0.9, appear),
		0,
		1
	);
	foreground.material.size = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0.06, 0.18, appear),
		0,
		1
	);

	ground.material.opacity = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0, 1.0, appear),
		0,
		1
	);
	ground.material.size = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0.04, 0.09, appear),
		0,
		1
	);

	ridge.material.opacity = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0, 1.0, appear),
		0,
		1
	);
	ridge.material.size = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0.04, 0.11, appear),
		0,
		1
	);

	air.material.opacity = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0, 0.18, appear),
		0,
		1
	);
	air.material.size = THREE.MathUtils.clamp(
		THREE.MathUtils.lerp(0.04, 0.07, appear),
		0,
		1
	);
}

export function animateSummitParticles({
	THREE,
	animatedObjects,
	t,
	appState
}) {
	const foreground = animatedObjects.summitForeground;
	const ground = animatedObjects.summitGround;
	const ridge = animatedObjects.summitRidge;
	const air = animatedObjects.summitAir;

	if (!foreground || !ground || !ridge || !air) return;
	if (!animatedObjects.summitScene?.visible) return;

	function animateLayer(layer, base, phase, baseAmp, yAmp, zAmp) {
		const arr = layer.geometry.attributes.position.array;
		for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
			const z = base[i + 2];
			const perspective = THREE.MathUtils.clamp((z + 10) / 56, 0, 1);
			const amp = THREE.MathUtils.lerp(baseAmp, 0.04, perspective);

			arr[i] = base[i] + Math.sin(t * 0.08 + phase[p]) * amp;
			arr[i + 1] = base[i + 1] + Math.sin(t * 0.1 + phase[p]) * amp * yAmp;
			arr[i + 2] = base[i + 2] + Math.cos(t * 0.06 + phase[p]) * amp * zAmp;
		}

		layer.geometry.attributes.position.needsUpdate = true;
	}

	animateLayer(
		foreground,
		animatedObjects.summitForegroundBase,
		animatedObjects.summitForegroundPhase,
		0.06,
		0.35,
		0.22
	);

	animateLayer(
		ground,
		animatedObjects.summitGroundBase,
		animatedObjects.summitGroundPhase,
		0.035,
		0.28,
		0.18
	);

	animateLayer(
		ridge,
		animatedObjects.summitRidgeBase,
		animatedObjects.summitRidgePhase,
		0.015,
		0.12,
		0.08
	);

	const airArr = air.geometry.attributes.position.array;
	const airBase = animatedObjects.summitAirBase;
	const airPhase = animatedObjects.summitAirPhase;

	for (let i = 0, p = 0; i < airArr.length; i += 3, p++) {
		airArr[i] = airBase[i] + Math.sin(t * 0.18 + airPhase[p]) * 0.32;
		airArr[i + 1] = airBase[i + 1] + Math.sin(t * 0.15 + airPhase[p]) * 0.22;
		airArr[i + 2] = airBase[i + 2] + Math.cos(t * 0.16 + airPhase[p]) * 0.28;
	}

	air.geometry.attributes.position.needsUpdate = true;

	if (appState.view === "chapter" || appState.view === "summit-immerse") {
		foreground.material.opacity = 1.0;
		foreground.material.size = 0.19;

		ground.material.opacity = 1.0;
		ground.material.size = 0.118;

		ridge.material.opacity = 1.0;
		ridge.material.size = 0.13;

		air.material.opacity = appState.view === "summit-immerse" ? 0.3 : 0.2;
		air.material.size = 0.07;
	}
}

export function resetSummitParticles({ animatedObjects }) {
	if (animatedObjects.summitScene) {
		animatedObjects.summitScene.visible = false;
	}

	if (animatedObjects.summitForeground) {
		animatedObjects.summitForeground.material.opacity = 0;
	}

	if (animatedObjects.summitGround) {
		animatedObjects.summitGround.material.opacity = 0;
	}

	if (animatedObjects.summitRidge) {
		animatedObjects.summitRidge.material.opacity = 0;
	}

	if (animatedObjects.summitAir) {
		animatedObjects.summitAir.material.opacity = 0;
	}
}