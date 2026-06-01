// @ts-nocheck

export function startAnimationLoop({
	THREE,
	renderer,
	scene,
	camera,
	clock,
	appState,
	animatedObjects,
	orbit,

	animateTerrain,
	animateSnow,
	animateForegroundSnow,
	animateHooks,
	animateLines,
	applyMarkerHoverVisual,
	updateOverviewCameraByPointer,
	animateIntroCloud,
	animateIntroRings,
	animateRitualSnow,
	animateChapterCloud,
	updateHotspotButtons,
	updateInterviewPan,

	enterChapter,
	easeInOutCubic,

	getInterviewPanCurrent,
	setInterviewPanCurrent,
	getInterviewPanTarget
}) {
	function animate() {
		const t = clock.getElapsedTime();

		const nextInterviewPan = updateInterviewPan(
			getInterviewPanCurrent(),
			getInterviewPanTarget()
		);

		setInterviewPanCurrent(nextInterviewPan);

		if (appState.view === "overview" || appState.view === "transition") {
			animateTerrain(t);
			animateSnow(t);
			animateForegroundSnow(t);
			animateHooks(t);
			animateLines(t);
			applyMarkerHoverVisual();

			if (appState.view === "overview") {
				updateOverviewCameraByPointer();
			}
		}

		animateIntroCloud(t);
		animateIntroRings(t);
		animateRitualSnow(t);
		animateChapterCloud(t);

		if (appState.view === "transition") {
			const elapsed = t - appState.transitionStart;
			const progress = THREE.MathUtils.clamp(
				elapsed / appState.transitionDuration,
				0,
				1
			);

			const eased = easeInOutCubic(progress);

			camera.position.lerpVectors(
				appState.cameraStart,
				appState.cameraEnd,
				eased
			);

			orbit.target.lerpVectors(
				appState.targetStart,
				appState.targetEnd,
				eased
			);

			camera.lookAt(orbit.target);

			if (animatedObjects.chapterCloud) {
				animatedObjects.chapterCloud.material.opacity = THREE.MathUtils.lerp(
					0.05,
					0.95,
					progress
				);

				animatedObjects.chapterCloud.material.size = THREE.MathUtils.lerp(
					0.08,
					0.26,
					progress
				);
			}

			if (progress >= 1 && appState.targetChapter) {
				enterChapter(appState.targetChapter);
			}
		}

		updateHotspotButtons();

		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}

	animate();
}