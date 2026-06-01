// @ts-nocheck

export function createChapterCloudParticles({
	THREE,
	animatedObjects,
	COLORS,
	makePoints
}) {
	const positions = [];
	const colors = [];
	const base = [];
	const phases = [];
	const amps = [];

	for (let i = 0; i < 14000; i++) {
		const radius = Math.pow(Math.random(), 0.62) * 92;
		const angle = Math.random() * Math.PI * 2;

		const x = Math.cos(angle) * radius;
		const y =
			Math.random() < 0.72
				? THREE.MathUtils.randFloat(-10, 8)
				: THREE.MathUtils.randFloat(8, 38);
		const z = Math.sin(angle) * radius + THREE.MathUtils.randFloat(-60, 36);

		positions.push(x, y, z);
		base.push(x, y, z);

		const c = COLORS.ice.clone().lerp(
			COLORS.white,
			0.35 + Math.random() * 0.55
		);

		const intensity = 0.34 + Math.random() * 0.54;

		colors.push(c.r * intensity, c.g * intensity, c.b * intensity);

		phases.push(Math.random() * Math.PI * 2);
		amps.push(0.18 + Math.random() * 0.92);
	}

	animatedObjects.chapterBase = new Float32Array(base);
	animatedObjects.chapterPhase = new Float32Array(phases);
	animatedObjects.chapterAmp = new Float32Array(amps);

	animatedObjects.chapterCloud = makePoints(
		"chapter-cloud-particles",
		positions,
		colors,
		0.11,
		0.72
	);

	animatedObjects.chapterCloud.visible = false;
	animatedObjects.chapterCloud.renderOrder = 80;
}

export function animateChapterCloudParticles({
	THREE,
	t,
	appState,
	animatedObjects
}) {
	const cloud = animatedObjects.chapterCloud;
	if (!cloud || !cloud.visible) return;

	const arr = cloud.geometry.attributes.position.array;
	const base = animatedObjects.chapterBase;
	const phase = animatedObjects.chapterPhase;
	const amp = animatedObjects.chapterAmp;

	const isTransition = appState.view === "transition";
	const transitionSpeed = isTransition ? 4.2 : 0.42;

	for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
		arr[i] =
			base[i] +
			Math.sin(t * 0.36 + phase[p]) * amp[p] * 1.8;

		arr[i + 1] =
			base[i + 1] +
			Math.sin(t * 0.28 + phase[p]) * amp[p] * 0.7;

		arr[i + 2] += transitionSpeed;

		if (arr[i + 2] > 62) {
			arr[i + 2] = -120;
		}
	}

	cloud.geometry.attributes.position.needsUpdate = true;

	if (isTransition) {
		const elapsed = t - appState.transitionStart;
		const progress = THREE.MathUtils.clamp(
			elapsed / appState.transitionDuration,
			0,
			1
		);

		cloud.material.opacity = THREE.MathUtils.lerp(0.05, 0.92, progress);
		cloud.material.size = THREE.MathUtils.lerp(0.08, 0.32, progress);
	} else {
		cloud.material.opacity = 0.62 + Math.sin(t * 0.8) * 0.08;
		cloud.material.size = 0.13 + Math.sin(t * 0.7) * 0.015;
	}
}