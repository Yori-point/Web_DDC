// @ts-nocheck

export function setMapSceneOpacity({ THREE, mapSceneGroup, progress }) {
	const p = THREE.MathUtils.clamp(progress, 0, 1);

	mapSceneGroup.traverse((obj) => {
		if (!obj.material) return;

		const materials = Array.isArray(obj.material)
			? obj.material
			: [obj.material];

		materials.forEach((mat) => {
			if (mat.userData.baseOpacity === undefined) {
				mat.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1;
			}

			mat.transparent = true;
			mat.opacity = mat.userData.baseOpacity * p;

			// When fully transparent, avoid invisible objects blocking the rings.
			mat.depthWrite = p > 0.15;
		});
	});
}