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
	animateCursorSnow,
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

	enterSummitImmerse,
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

		animateCursorSnow(t);

		if (
			appState.view === "overview" ||
			appState.view === "transition" ||
			appState.view === "particle-ritual"
		) {
			animateSnow(t);
			animateForegroundSnow(t);
		}

		if (appState.view === "overview" || appState.view === "transition") {
			animateTerrain(t);
			animateHooks(t);
			animateLines(t);

			if (appState.view === "overview") {
				applyMarkerHoverVisual();
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

			const oneMinusT = 1 - eased;

			// Quadratic Bézier for camera position
			camera.position.set(
				oneMinusT * oneMinusT * appState.cameraStart.x +
					2 * oneMinusT * eased * appState.cameraMid.x +
					eased * eased * appState.cameraEnd.x,

				oneMinusT * oneMinusT * appState.cameraStart.y +
					2 * oneMinusT * eased * appState.cameraMid.y +
					eased * eased * appState.cameraEnd.y,

				oneMinusT * oneMinusT * appState.cameraStart.z +
					2 * oneMinusT * eased * appState.cameraMid.z +
					eased * eased * appState.cameraEnd.z
			);

			// Quadratic Bézier for look-at target
			orbit.target.set(
				oneMinusT * oneMinusT * appState.targetStart.x +
					2 * oneMinusT * eased * appState.targetMid.x +
					eased * eased * appState.targetEnd.x,

				oneMinusT * oneMinusT * appState.targetStart.y +
					2 * oneMinusT * eased * appState.targetMid.y +
					eased * eased * appState.targetEnd.y,

				oneMinusT * oneMinusT * appState.targetStart.z +
					2 * oneMinusT * eased * appState.targetMid.z +
					eased * eased * appState.targetEnd.z
			);

			camera.lookAt(orbit.target);

			if (progress >= 1 && appState.targetChapter) {
				enterSummitImmerse(appState.targetChapter);
			}
		}

		if (appState.view === 'summit-immerse') {
			const immerseElapsed = t - appState.summitImmerseStart;
			if (immerseElapsed >= appState.summitImmerseDuration && appState.targetChapter) {
				enterChapter(appState.targetChapter);
			}
		}

		updateHotspotButtons();

		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}

	animate();
}