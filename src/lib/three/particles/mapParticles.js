// @ts-nocheck

export function makePoints({
	THREE,
	scene,
	name,
	positions,
	colors,
	size,
	opacity
}) {
	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

	if (colors) {
		geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
	}

	const mat = new THREE.PointsMaterial({
		size,
		sizeAttenuation: true,
		transparent: true,
		opacity,
		vertexColors: Boolean(colors),
		depthWrite: false,
		depthTest: false,
		blending: THREE.NormalBlending
	});

	const points = new THREE.Points(geo, mat);
	points.name = name;
	scene.add(points);

	return points;
}

function collectMeshTriangles({ THREE, mesh }) {
	const geometry = mesh.geometry;
	const position = geometry.attributes.position;
	const index = geometry.index;

	if (!position) return null;

	mesh.updateMatrixWorld(true);

	const triangles = [];
	let totalArea = 0;

	const a = new THREE.Vector3();
	const b = new THREE.Vector3();
	const c = new THREE.Vector3();
	const ab = new THREE.Vector3();
	const ac = new THREE.Vector3();

	const triCount = index ? index.count / 3 : Math.floor(position.count / 3);

	for (let i = 0; i < triCount; i++) {
		const ia = index ? index.getX(i * 3) : i * 3;
		const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
		const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

		a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
		b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
		c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);

		ab.subVectors(b, a);
		ac.subVectors(c, a);

		const area = ab.cross(ac).length() * 0.5;

		if (area > 0.000001) {
			totalArea += area;
			triangles.push({
				a: a.clone(),
				b: b.clone(),
				c: c.clone(),
				area,
				cumulative: totalArea
			});
		}
	}

	return {
		position,
		triangles,
		totalArea
	};
}

function samplePointFromTriangles({ triangles, totalArea }) {
	const r = Math.random() * totalArea;

	let low = 0;
	let high = triangles.length - 1;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (triangles[mid].cumulative < r) low = mid + 1;
		else high = mid;
	}

	const tri = triangles[low];

	let u = Math.random();
	let v = Math.random();

	if (u + v > 1) {
		u = 1 - u;
		v = 1 - v;
	}

	return tri.a.clone()
		.add(tri.b.clone().sub(tri.a).multiplyScalar(u))
		.add(tri.c.clone().sub(tri.a).multiplyScalar(v));
}

function createPointCloud({
	THREE,
	mapSceneGroup,
	name,
	positions,
	colors,
	texture,
	alphaTest,
	size,
	opacity,
	depthTest,
	renderOrder
}) {
	const particleGeometry = new THREE.BufferGeometry();

	particleGeometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3)
	);

	particleGeometry.setAttribute(
		"color",
		new THREE.Float32BufferAttribute(colors, 3)
	);

	const particleMaterial = new THREE.PointsMaterial({
		map: texture,
		alphaTest,
		size,
		sizeAttenuation: true,
		vertexColors: true,
		transparent: true,
		opacity,
		depthWrite: false,
		depthTest,
		blending: THREE.NormalBlending
	});

	const points = new THREE.Points(particleGeometry, particleMaterial);
	points.name = name;
	points.renderOrder = renderOrder;

	mapSceneGroup.add(points);

	return points;
}

export function createDenseMapPointsFromMesh({
	THREE,
	mesh,
	count = 32000,
	mapSceneGroup,
	createSoftMistTexture
}) {
	const collected = collectMeshTriangles({ THREE, mesh });
	if (!collected) return null;

	const { position, triangles, totalArea } = collected;

	const positions = [];
	const colors = [];

	if (triangles.length) {
		for (let i = 0; i < count; i++) {
			const p = samplePointFromTriangles({ triangles, totalArea });

			p.x += THREE.MathUtils.randFloatSpread(0.012);
			p.y += -0.025 + THREE.MathUtils.randFloatSpread(0.004);
			p.z += THREE.MathUtils.randFloatSpread(0.012);

			positions.push(p.x, p.y, p.z);

			const brightness = 0.62 + Math.random() * 0.28;

			colors.push(
				0.72 * brightness,
				0.84 * brightness,
				0.96 * brightness
			);
		}
	} else {
		for (let i = 0; i < position.count; i++) {
			const p = new THREE.Vector3()
				.fromBufferAttribute(position, i)
				.applyMatrix4(mesh.matrixWorld);

			positions.push(p.x, p.y, p.z);

			const brightness = 0.58 + Math.random() * 0.32;

			colors.push(
				0.78 * brightness,
				0.90 * brightness,
				1.0 * brightness
			);
		}
	}

	const points = createPointCloud({
		THREE,
		mapSceneGroup,
		name: `dense-map-points-${mesh.name || "city"}`,
		positions,
		colors,
		texture: createSoftMistTexture(THREE),
		alphaTest: 0.025,
		size: 0.18,
		opacity: 0.82,
		depthTest: false,
		renderOrder: 30
	});

	points.userData = {
		baseOpacity: 0.82,
		baseSize: 0.18
	};

	return points;
}

export function createTerrainBaseParticlesFromMesh({
	THREE,
	mesh,
	count = 90000,
	mapSceneGroup,
	createSoftMistTexture
}) {
	const collected = collectMeshTriangles({ THREE, mesh });
	if (!collected) return null;

	const { triangles, totalArea } = collected;
	if (!triangles.length) return null;

	const positions = [];
	const colors = [];

	for (let i = 0; i < count; i++) {
		const p = samplePointFromTriangles({ triangles, totalArea });

		p.x += THREE.MathUtils.randFloatSpread(0.08);
		p.y += THREE.MathUtils.randFloatSpread(0.045);
		p.z += THREE.MathUtils.randFloatSpread(0.08);

		positions.push(p.x, p.y, p.z);

		const wave =
			0.5 +
			0.5 * Math.sin(p.x * 0.18 + p.z * 0.11) *
			Math.cos(p.z * 0.13 - p.x * 0.07);

		const brightness = 0.36 + wave * 0.22 + Math.random() * 0.16;

		colors.push(
			0.58 * brightness,
			0.74 * brightness,
			0.82 * brightness
		);
	}

	const points = createPointCloud({
		THREE,
		mapSceneGroup,
		name: `terrain-base-particles-${mesh.name || "terrain"}`,
		positions,
		colors,
		texture: createSoftMistTexture(THREE),
		alphaTest: 0.025,
		size: 0.34,
		opacity: 0.68,
		depthTest: true,
		renderOrder: 12
	});

	points.userData = {
		baseOpacity: 0.74,
		baseSize: 0.30
	};

	return points;
}

export function createDuomoParticlesFromMesh({
	THREE,
	mesh,
	count = 18000,
	mapSceneGroup,
	createSoftMistTexture
}) {
	const collected = collectMeshTriangles({ THREE, mesh });
	if (!collected) return null;

	const { triangles, totalArea } = collected;
	if (!triangles.length) return null;

	const positions = [];
	const colors = [];

	for (let i = 0; i < count; i++) {
		const p = samplePointFromTriangles({ triangles, totalArea });

		p.x += THREE.MathUtils.randFloatSpread(0.04);
		p.y += THREE.MathUtils.randFloatSpread(0.04);
		p.z += THREE.MathUtils.randFloatSpread(0.04);

		positions.push(p.x, p.y, p.z);

		const brightness = 0.86 + Math.random() * 0.22;

		colors.push(
			1.0 * brightness,
			0.96 * brightness,
			0.88 * brightness
		);
	}

	const points = createPointCloud({
		THREE,
		mapSceneGroup,
		name: `duomo-particles-${mesh.name || "duomo"}`,
		positions,
		colors,
		texture: createSoftMistTexture(THREE),
		alphaTest: 0.04,
		size: 0.32,
		opacity: 0.95,
		depthTest: true,
		renderOrder: 32
	});

	points.userData = {
		baseOpacity: 0.95,
		baseSize: 0.32
	};

	return points;
}

export function createMountainParticlesFromMesh({
	THREE,
	mesh,
	count = 18000,
	categoryKey = null,
	mapSceneGroup,
	animatedObjects,
	createSoftMistTexture,
	getLegacyArea
}) {
	const collected = collectMeshTriangles({ THREE, mesh });
	if (!collected) return null;

	const { triangles, totalArea } = collected;
	if (!triangles.length) return null;

	const positions = [];
	const colors = [];

	for (let i = 0; i < count; i++) {
		const p = samplePointFromTriangles({ triangles, totalArea });

		p.x += THREE.MathUtils.randFloatSpread(0.10);
		p.y += THREE.MathUtils.randFloatSpread(0.10);
		p.z += THREE.MathUtils.randFloatSpread(0.10);

		positions.push(p.x, p.y, p.z);

		const ridge =
			0.5 +
			0.5 * Math.sin(p.x * 0.20 + p.y * 0.35 + p.z * 0.08);

		const brightness = 0.72 + ridge * 0.22 + Math.random() * 0.16;

		colors.push(
			0.92 * brightness,
			0.97 * brightness,
			1.0 * brightness
		);
	}

	const points = createPointCloud({
		THREE,
		mapSceneGroup,
		name: `particle-${mesh.name || "mountain"}`,
		positions,
		colors,
		texture: createSoftMistTexture(THREE),
		alphaTest: 0.055,
		size: 0.44,
		opacity: 0.96,
		depthTest: true,
		renderOrder: 24
	});

	const area = categoryKey ? getLegacyArea(categoryKey) : null;

	points.userData = {
		key: categoryKey,
		color: area ? area.color : 0xffffff,
		baseSize: 0.44,
		baseOpacity: 0.96,
		baseColors: points.geometry.attributes.color.array.slice()
	};

	animatedObjects.mountainParticles.push(points);

	return points;
}