// @ts-nocheck

const CURSOR_SNOW_COUNT = 160;
const CURSOR_SNOW_LIFE = 0.85;
const EMIT_PER_MOVE = 7;

function getCameraBasis({ THREE, camera }) {
	const right = new THREE.Vector3();
	const up = new THREE.Vector3();
	const forward = new THREE.Vector3();

	camera.matrixWorld.extractBasis(right, up, forward);
	forward.multiplyScalar(-1).normalize();

	return { right: right.normalize(), up: up.normalize(), forward };
}

function getPointerWorldPosition({ THREE, camera, event, distance = 18 }) {
	const ndc = new THREE.Vector3(
		(event.clientX / window.innerWidth) * 2 - 1,
		-(event.clientY / window.innerHeight) * 2 + 1,
		0.5
	);

	ndc.unproject(camera);

	const dir = ndc.sub(camera.position).normalize();

	return camera.position.clone().add(dir.multiplyScalar(distance));
}

export function createCursorSnowTrail({
	THREE,
	scene,
	camera,
	animatedObjects,
	createSnowFlakeTexture,
	createSnowCrystalTexture
}) {
	const positions = new Float32Array(CURSOR_SNOW_COUNT * 3);
	const colors = new Float32Array(CURSOR_SNOW_COUNT * 3);
	const velocities = new Float32Array(CURSOR_SNOW_COUNT * 3);
	const life = new Float32Array(CURSOR_SNOW_COUNT);

	for (let i = 0; i < CURSOR_SNOW_COUNT; i++) {
		positions[i * 3] = 0;
		positions[i * 3 + 1] = -9999;
		positions[i * 3 + 2] = 0;

		colors[i * 3] = 0;
		colors[i * 3 + 1] = 0;
		colors[i * 3 + 2] = 0;

		life[i] = 0;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

	const material = new THREE.PointsMaterial({
		map: createSnowCrystalTexture
			? createSnowCrystalTexture(THREE)
			: createSnowFlakeTexture(THREE),
		alphaTest: 0.01,
		size: 0.46,
		sizeAttenuation: true,
		vertexColors: true,
		transparent: true,
		opacity: 0.38,
		depthWrite: false,
		depthTest: false,
		blending: THREE.NormalBlending
	});

	const points = new THREE.Points(geometry, material);
	points.name = "cursor-snow-trail";
	points.renderOrder = 120;
    points.frustumCulled = false;

	scene.add(points);

	animatedObjects.cursorSnow = points;
	animatedObjects.cursorSnowLife = life;
	animatedObjects.cursorSnowVelocity = velocities;
	animatedObjects.cursorSnowIndex = 0;
	animatedObjects.cursorSnowLastEmit = 0;
}

export function emitCursorSnowTrail({
	THREE,
	camera,
	animatedObjects,
	event
}) {
	const points = animatedObjects.cursorSnow;
	const life = animatedObjects.cursorSnowLife;
	const velocity = animatedObjects.cursorSnowVelocity;

	if (!points || !life || !velocity) return;

	const now = performance.now();

	// 防止鼠标事件太密导致粒子过多
	if (now - animatedObjects.cursorSnowLastEmit < 10) return;
	animatedObjects.cursorSnowLastEmit = now;

	const positions = points.geometry.attributes.position.array;
	const colors = points.geometry.attributes.color.array;

	const base = getPointerWorldPosition({
		THREE,
		camera,
		event,
		distance: 17
	});

	const { right, up, forward } = getCameraBasis({ THREE, camera });

	for (let k = 0; k < EMIT_PER_MOVE; k++) {
		const i = animatedObjects.cursorSnowIndex % CURSOR_SNOW_COUNT;
		animatedObjects.cursorSnowIndex++;

		const spreadX = THREE.MathUtils.randFloatSpread(0.75);
		const spreadY = THREE.MathUtils.randFloatSpread(0.52);

		const p = base.clone()
			.add(right.clone().multiplyScalar(spreadX))
			.add(up.clone().multiplyScalar(spreadY));

		positions[i * 3] = p.x;
		positions[i * 3 + 1] = p.y;
		positions[i * 3 + 2] = p.z;

		const vx =
			right.x * THREE.MathUtils.randFloatSpread(0.9) +
			up.x * THREE.MathUtils.randFloat(-0.08, 0.35) +
			forward.x * THREE.MathUtils.randFloat(-0.12, 0.2);

		const vy =
			right.y * THREE.MathUtils.randFloatSpread(0.9) +
			up.y * THREE.MathUtils.randFloat(-0.08, 0.35) +
			forward.y * THREE.MathUtils.randFloat(-0.12, 0.2) -
			0.18;

		const vz =
			right.z * THREE.MathUtils.randFloatSpread(0.9) +
			up.z * THREE.MathUtils.randFloat(-0.08, 0.35) +
			forward.z * THREE.MathUtils.randFloat(-0.12, 0.2);

		velocity[i * 3] = vx;
		velocity[i * 3 + 1] = vy;
		velocity[i * 3 + 2] = vz;

		life[i] = CURSOR_SNOW_LIFE + Math.random() * 0.25;

		const brightness = 0.78 + Math.random() * 0.22;

		colors[i * 3] = brightness;
		colors[i * 3 + 1] = brightness;
		colors[i * 3 + 2] = brightness;
	}

	points.geometry.attributes.position.needsUpdate = true;
	points.geometry.attributes.color.needsUpdate = true;
}

export function animateCursorSnowTrail({
	THREE,
	camera,
	animatedObjects,
	t
}) {
	const points = animatedObjects.cursorSnow;
	const life = animatedObjects.cursorSnowLife;
	const velocity = animatedObjects.cursorSnowVelocity;

	if (!points || !life || !velocity) return;

	const positions = points.geometry.attributes.position.array;
	const colors = points.geometry.attributes.color.array;

	for (let i = 0; i < CURSOR_SNOW_COUNT; i++) {
		if (life[i] <= 0) {
			positions[i * 3 + 1] = -9999;
			continue;
		}

		life[i] -= 0.018;

		const fade = THREE.MathUtils.clamp(life[i] / CURSOR_SNOW_LIFE, 0, 1);
		const softFade = fade * fade;

		positions[i * 3] += velocity[i * 3] * 0.035;
		positions[i * 3 + 1] += velocity[i * 3 + 1] * 0.035;
		positions[i * 3 + 2] += velocity[i * 3 + 2] * 0.035;

		// 缓慢下落，像雪被鼠标扰动后飘散
		velocity[i * 3 + 1] -= 0.0035;

		// 横向轻微摆动
		positions[i * 3] += Math.sin(t * 3.2 + i * 0.7) * 0.006;
		positions[i * 3 + 2] += Math.cos(t * 2.6 + i * 0.5) * 0.004;

		const brightness = 0.95 * softFade;

		colors[i * 3] = brightness;
		colors[i * 3 + 1] = brightness;
		colors[i * 3 + 2] = brightness;
	}

	points.geometry.attributes.position.needsUpdate = true;
	points.geometry.attributes.color.needsUpdate = true;
}