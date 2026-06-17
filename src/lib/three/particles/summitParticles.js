// @ts-nocheck

export function createSummitParticles({
	THREE,
	scene,
	animatedObjects,
	makePoints
}) {
	const summitGroup = new THREE.Group();
	summitGroup.name = "summit-particles";
	summitGroup.visible = false;
	scene.add(summitGroup);

	const groundCount = 18000;
	const groundPositions = [];
	const groundColors = [];

	for (let i = 0; i < groundCount; i++) {
		const x = THREE.MathUtils.randFloatSpread(120);
		const z = THREE.MathUtils.randFloat(-72, -12);

		const horizonCurve = Math.cos((x / 120) * Math.PI) * 1.1;
		const distanceLift = THREE.MathUtils.mapLinear(z, -72, -12, 2.8, -1.2);
		const noise = THREE.MathUtils.randFloatSpread(0.42);

		const y = horizonCurve + distanceLift + noise - 3.4;

		groundPositions.push(x, y, z);

		const brightness = THREE.MathUtils.randFloat(0.38, 0.82);
		groundColors.push(brightness, brightness, brightness);
	}

	const summitGround = makePoints(
		"summit-ground",
		groundPositions,
		groundColors,
		0.095,
		0
	);

	summitGround.material.depthWrite = false;
	summitGround.material.depthTest = true;
	summitGround.renderOrder = 80;
	summitGroup.add(summitGround);

	const airCount = 1800;
	const airPositions = [];
	const airColors = [];

	for (let i = 0; i < airCount; i++) {
		const x = THREE.MathUtils.randFloatSpread(120);
		const y = THREE.MathUtils.randFloat(2, 36);
		const z = THREE.MathUtils.randFloat(-80, 8);

		airPositions.push(x, y, z);

		const brightness = THREE.MathUtils.randFloat(0.28, 0.72);
		airColors.push(brightness, brightness, brightness);
	}

	const summitAir = makePoints(
		"summit-air",
		airPositions,
		airColors,
		0.038,
		0
	);

	summitAir.material.depthWrite = false;
	summitAir.material.depthTest = false;
	summitAir.renderOrder = 81;
	summitGroup.add(summitAir);

	animatedObjects.summitScene = summitGroup;
	animatedObjects.summitGround = summitGround;
	animatedObjects.summitAir = summitAir;
}

export function placeSummitParticlesAtMountain({
	THREE,
	animatedObjects,
	mountainPos,
	cameraDirection
}) {
	const summit = animatedObjects.summitScene;
	if (!summit || !mountainPos) return;

	const dir = cameraDirection.clone();
	dir.y = 0;

	if (dir.lengthSq() < 0.0001) {
		dir.set(0, 0, 1);
	}

	dir.normalize();

	// 把山顶粒子空间放在被点击的山附近，而不是世界中心。
	summit.position.copy(mountainPos);

	// 放到镜头看向的方向，也就是山后方
	summit.position.add(dir.clone().multiplyScalar(18));
    summit.position.y -= 3.2;

	// 让 summit 的远方朝向相机观看方向
	const angle = Math.atan2(dir.x, dir.z);
    summit.rotation.set(0, angle + Math.PI, 0);
}

export function resetSummitParticles({ animatedObjects }) {
	if (animatedObjects.summitScene) {
		animatedObjects.summitScene.visible = false;
	}

	if (animatedObjects.summitGround) {
		animatedObjects.summitGround.material.opacity = 0;
	}

	if (animatedObjects.summitAir) {
		animatedObjects.summitAir.material.opacity = 0;
	}
}

export function updateSummitParticlesTransition({
	THREE,
	animatedObjects,
	progress,
	smoothstep
}) {
	const summitFade = smoothstep(0.26, 0.88, progress);

	if (animatedObjects.summitScene) {
		animatedObjects.summitScene.visible = summitFade > 0.001;
	}

	if (animatedObjects.summitGround) {
		animatedObjects.summitGround.material.opacity = 0.82 * summitFade;
		animatedObjects.summitGround.material.size = THREE.MathUtils.lerp(
			0.055,
			0.095,
			summitFade
		);
	}

	if (animatedObjects.summitAir) {
		animatedObjects.summitAir.material.opacity = 0.28 * summitFade;
		animatedObjects.summitAir.material.size = THREE.MathUtils.lerp(
			0.026,
			0.038,
			summitFade
		);
	}
}