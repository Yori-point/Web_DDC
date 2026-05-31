// @ts-nocheck

export function loadUnifiedMapModel({
	THREE,
	GLTFLoader,
	bgColor,
	mapSceneGroup,
	onUpdateLegacyAreaFromObject,
	onCreateLegendHelperDots,
	onCreateLegacyHooks,
	onCreateHotspotButtons,
	onCreateMountainParticlesFromMesh,
	onCreateDenseMapPointsFromMesh,
	onCreateTerrainBaseParticlesFromMesh,
	onCreateDuomoParticlesFromMesh,
	getKeyFromName
}) {
	const loader = new GLTFLoader();

	loader.load(
		"/mountain_map.glb",
		(gltf) => {
			const model = gltf.scene;
			model.name = "unified-map-model";

			model.position.set(0, 5.8, 0);
			model.rotation.set(0, 0, 0);
			model.scale.set(2, 2, 2);
			model.updateMatrixWorld(true);

			// First read Blender hotspot positions.
			model.traverse((child) => {
				const meshName = child.name.toLowerCase();

				if (meshName.startsWith("hotspot_")) {
					onUpdateLegacyAreaFromObject?.(child);
					child.visible = false;
				}
			});

			// Then create web hotspot / glow elements.
			onCreateLegendHelperDots?.();
			onCreateLegacyHooks?.();
			onCreateHotspotButtons?.();

			// Convert GLB meshes into particle systems.
			model.traverse((child) => {
				if (!child.isMesh) return;

				const meshName = child.name.toLowerCase();

				const isMountain = meshName.startsWith("mountain_");
				const isMapLine = meshName.includes("map_line");
				const isTerrainBase = meshName.includes("terrain_base");
				const isDuomo = meshName.includes("duomo");

				if (isMountain) {
					const key = getKeyFromName(meshName);
					const vertexCount = child.geometry?.attributes?.position?.count || 0;

					const particleCount = Math.min(
						52000,
						Math.max(22000, Math.floor(vertexCount * 5.0))
					);

					onCreateMountainParticlesFromMesh?.(child, particleCount, key);

					child.visible = false;
					child.material = new THREE.MeshBasicMaterial({
						color: bgColor,
						transparent: true,
						opacity: 0,
						depthWrite: false
					});

					console.log("Converted named mountain:", child.name, key, particleCount);
					return;
				}

				if (isMapLine) {
					const vertexCount = child.geometry?.attributes?.position?.count || 0;

					const mapPointCount = Math.min(
						240000,
						Math.max(90000, Math.floor(vertexCount * 34))
					);

					onCreateDenseMapPointsFromMesh?.(child, mapPointCount);

					child.visible = false;
					child.material = new THREE.MeshBasicMaterial({
						color: bgColor,
						transparent: true,
						opacity: 0,
						depthWrite: false
					});

					child.castShadow = false;
					child.receiveShadow = false;

					console.log("Converted Map_Line to dense points:", child.name, mapPointCount);
					return;
				}

				if (isTerrainBase) {
					const vertexCount = child.geometry?.attributes?.position?.count || 0;

					const terrainPointCount = Math.min(
						260000,
						Math.max(130000, Math.floor(vertexCount * 30))
					);

					onCreateTerrainBaseParticlesFromMesh?.(child, terrainPointCount);

					child.visible = false;
					child.material = new THREE.MeshBasicMaterial({
						color: bgColor,
						transparent: true,
						opacity: 0,
						depthWrite: false
					});

					child.castShadow = false;
					child.receiveShadow = false;

					console.log(
						"Converted Terrain_Base to soft particles:",
						child.name,
						terrainPointCount
					);
					return;
				}

				if (isDuomo) {
					const vertexCount = child.geometry?.attributes?.position?.count || 0;

					const duomoPointCount = Math.min(
						42000,
						Math.max(16000, Math.floor(vertexCount * 10))
					);

					onCreateDuomoParticlesFromMesh?.(child, duomoPointCount);

					child.visible = false;
					child.material = new THREE.MeshBasicMaterial({
						color: bgColor,
						transparent: true,
						opacity: 0,
						depthWrite: false
					});

					child.castShadow = false;
					child.receiveShadow = false;

					console.log("Converted Duomo to particles:", child.name, duomoPointCount);
					return;
				}

				// Hide auxiliary meshes.
				child.visible = false;
			});

			mapSceneGroup.add(model);
			document.body.classList.add("model-loaded");
			console.log("New mountain_map GLB loaded:", model);
		},
		undefined,
		(error) => {
			console.error("mountain_map GLB load error:", error);
		}
	);
}