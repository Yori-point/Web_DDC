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
	// pos is the hotspot / glow point, usually above the mountain.
	// Move down to create a mountain-level anchor, not a sky-level anchor.
	const anchor = pos.clone();
	anchor.y -= 6.5;

	const outward = new THREE.Vector3(anchor.x, 0, anchor.z);

	if (outward.lengthSq() < 0.0001) {
		outward.set(
			Math.sin(overviewCamera.yaw),
			0,
			Math.cos(overviewCamera.yaw)
		);
	}

	outward.normalize();

	// Camera stays outside the point cloud.
	// Do not go below 15, otherwise particles become huge.
	const cameraPos = anchor.clone()
		.add(outward.clone().multiplyScalar(18));

	cameraPos.y = anchor.y + 2.2;

	// Look above the selected mountain, not back to the whole map.
	const target = anchor.clone()
		.add(outward.clone().multiplyScalar(-4));

	target.y = anchor.y + 13;

	return {
		cameraPos,
		target
	};
}