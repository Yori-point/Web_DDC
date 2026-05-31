// @ts-nocheck

export function updateCamera({
	THREE,
	camera,
	orbit,
	windowWidth = window.innerWidth,
	windowHeight = window.innerHeight
}) {
	orbit.pitch = Math.max(0.08, Math.min(1.05, orbit.pitch));
	orbit.radius = Math.max(34, Math.min(145, orbit.radius));

	const topViewBoost =
		THREE.MathUtils.smoothstep(orbit.pitch, 0.52, 0.95) * 68;

	const aspect = windowWidth / windowHeight;
	const responsiveBoost = aspect < 1.05 ? 22 : 0;

	const effectiveRadius = orbit.radius + topViewBoost + responsiveBoost;

	const x = Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * effectiveRadius;
	const y = orbit.target.y + Math.sin(orbit.pitch) * effectiveRadius;
	const z = Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * effectiveRadius;

	camera.position.set(x, y, z);
	camera.lookAt(orbit.target);
}

export function updateOverviewCameraByPointer({
	THREE,
	appState,
	orbit,
	overviewCamera,
	updateCameraFn
}) {
	if (appState.view !== "overview") return;

	appState.overviewPointerX = THREE.MathUtils.lerp(
		appState.overviewPointerX,
		appState.overviewPointerTargetX,
		0.026
	);

	appState.overviewPointerY = THREE.MathUtils.lerp(
		appState.overviewPointerY,
		appState.overviewPointerTargetY,
		0.026
	);

	orbit.yaw =
		overviewCamera.yaw +
		appState.overviewPointerX * overviewCamera.maxYawOffset;

	orbit.pitch =
		overviewCamera.pitch -
		appState.overviewPointerY * overviewCamera.maxPitchOffset;

	orbit.radius = overviewCamera.radius;
	orbit.target.copy(overviewCamera.target);

	updateCameraFn();
}

export function getChapterCameraView({
	THREE,
	pos,
	overviewCamera
}) {
	const target = pos.clone();
	target.y += 7.5;

	const yaw = overviewCamera.yaw;
	const pitch = 0.16;
	const radius = 34;

	const x = Math.sin(yaw) * Math.cos(pitch) * radius;
	const y = Math.sin(pitch) * radius;
	const z = Math.cos(yaw) * Math.cos(pitch) * radius;

	const cameraPos = target.clone().add(new THREE.Vector3(x, y, z));

	cameraPos.y = Math.max(cameraPos.y, pos.y + 7);

	return {
		cameraPos,
		target
	};
}