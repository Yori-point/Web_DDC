<script>
    // @ts-nocheck

	import { onMount } from "svelte";
	import * as THREE from "three";
	import { goto } from "$app/navigation";
	import ParticleTitle from "$lib/components/ParticleTitle.svelte";
	import { createSnowFlakeTexture } from "$lib/three/textures.js";

	let canvas;

	let activeAbout = $state(null);

	const defaultAbout = {
		title: "Tracce",
		paragraphs: [
			["Dopo un grande evento,", "qualcosa resta."],
			[
				"Non solo strutture,",
				"numeri o immagini ufficiali,",
				"ma frammenti più piccoli:",
				"una voce, uno sguardo,",
				"un incontro, una sensazione."
			],
			[
				"Milano Cortina 2026",
				"diventa qui un paesaggio",
				"da attraversare lentamente."
			],
			[
				"Ogni testimonianza",
				"si deposita come una particella.",
				"Ogni particella",
				"lascia una traccia."
			],
			[
				"Il sito raccoglie ciò",
				"che continua a muoversi",
				"nella memoria quotidiana."
			],
			[
				"Non una mappa da leggere,",
				"ma uno spazio da attraversare."
			]
		]
	};

	const people = [
		{
			name: "Jiaying Hu",
			x: 41,
			y: 56,
			title: "Jiaying Hu",
			paragraphs: [
				[
					"Dopo un grande evento sportivo,",
					"quello che resta",
					"non è solo il risultato."
				],
				[
					"Restano le voci,",
					"i gesti,",
					"le immagini che continuano",
					"a muoversi nella memoria."
				],
				[
					"Tifare per il proprio paese",
					"porta con sé un orgoglio forte."
				],
				[
					"Ma le Olimpiadi",
					"mi hanno fatto sentire altro:",
					"emozionarsi per una fatica,",
					"per un gesto,",
					"per un traguardo condiviso."
				],
				[
					"Nel progetto ho curato",
					"la direzione visiva,",
					"l’interfaccia",
					"e l’esperienza narrativa."
				]
			]
		},
		{
			name: "Yunwei Zhang",
			x: 54,
			y: 42,
			title: "Yunwei Zhang",
			paragraphs: [
				[
					"Dopo un grande evento sportivo,",
					"quello che resta",
					"non è solo il risultato."
				],
				[
					"Restano le voci,",
					"i gesti,",
					"le immagini che continuano",
					"a muoversi nella memoria."
				],
				[
					"Tifare per il proprio paese",
					"porta con sé un orgoglio forte."
				],
				[
					"Ma le Olimpiadi",
					"mi hanno fatto sentire altro:",
					"emozionarsi per una fatica,",
					"per un gesto,",
					"per un traguardo condiviso."
				],
				[
					"Nel progetto ho curato",
					"la direzione visiva,",
					"l’interfaccia",
					"e l’esperienza narrativa."
				]
			]
		},
		{
			name: "Isabella lena",
			x: 60,
			y: 70,
			title: "Isabella lena",
			paragraphs: [
				[
					"Dopo un grande evento sportivo,",
					"quello che resta",
					"non è solo il risultato."
				],
				[
					"Restano le voci,",
					"i gesti,",
					"le immagini che continuano",
					"a muoversi nella memoria."
				],
				[
					"Tifare per il proprio paese",
					"porta con sé un orgoglio forte."
				],
				[
					"Ma le Olimpiadi",
					"mi hanno fatto sentire altro:",
					"emozionarsi per una fatica,",
					"per un gesto,",
					"per un traguardo condiviso."
				],
				[
					"Nel progetto ho curato",
					"la direzione visiva,",
					"l’interfaccia",
					"e l’esperienza narrativa."
				]
			]
		},
		{
			name: "Laura Facchinetti",
			x: 75,
			y: 30,
			title: "Laura Facchinetti",
			paragraphs: [
                [
                    "Scoprire quante prospettive diverse",
                    "convivono attorno a uno stesso evento,",
                    "è stata la parte più sorprendente",
                    "di questo percorso."
                ],
                [
                    "Ogni testimonianza raccontava",
                    "gli stessi Giochi",
                    "in un modo",
                    "completamente diverso."
                ],
                [
                    "Mi sono occupata",
                    "dell'organizzazione del gruppo,",
                    "e della gestione dello stile",
                    "del progetto."
                ]
            ]
		},
		{
			name: "Matilde Pinarello",
			x: 90,
			y: 46,
			title: "Matilde Pinarello",
			paragraphs: [
				[
					"Dopo un grande evento sportivo,",
					"quello che resta",
					"non è solo il risultato."
				],
				[
					"Restano le voci,",
					"i gesti,",
					"le immagini che continuano",
					"a muoversi nella memoria."
				],
				[
					"Tifare per il proprio paese",
					"porta con sé un orgoglio forte."
				],
				[
					"Ma le Olimpiadi",
					"mi hanno fatto sentire altro:",
					"emozionarsi per una fatica,",
					"per un gesto,",
					"per un traguardo condiviso."
				],
				[
					"Nel progetto ho curato",
					"la direzione visiva,",
					"l’interfaccia",
					"e l’esperienza narrativa."
				]
			]
		},
		{
			name: "Giulia Croci",
			x: 81,
			y: 70,
			title: "Giulia Croci",
			paragraphs: [
				[
					"Dopo un grande evento sportivo,",
					"quello che resta",
					"non è solo il risultato."
				],
				[
					"Restano le voci,",
					"i gesti,",
					"le immagini che continuano",
					"a muoversi nella memoria."
				],
				[
					"Tifare per il proprio paese",
					"porta con sé un orgoglio forte."
				],
				[
					"Ma le Olimpiadi",
					"mi hanno fatto sentire altro:",
					"emozionarsi per una fatica,",
					"per un gesto,",
					"per un traguardo condiviso."
				],
				[
					"Nel progetto ho curato",
					"la direzione visiva,",
					"l’interfaccia",
					"e l’esperienza narrativa."
				]
			]
		}
	];

	const aboutContent = $derived(activeAbout || defaultAbout);
	const aboutTitleVariant = $derived(activeAbout ? "about-name" : "about");

    async function goBackToMap(event) {
		event.preventDefault();

		sessionStorage.setItem("tracce-open-map", "1");
		document.documentElement.classList.add("tracce-returning-map");

		await goto("/", {
			noScroll: true
		});
	}

	const MODEL_URL = "/about-meshopt.glb";

	const MODEL_TARGET_WIDTH = 96;
    const PARTICLE_COUNT = 180000;
    const PARTICLE_SIZE = 0.30;
	const ABOUT_SNOW_LAYERS = {
		far: {
			name: "about-far-snow",
			kind: "background",
			count: 3000,
			size: 0.28,
			opacity: 0.28,
			alphaTest: 0.012,
			speedScale: 0.35,
			minX: -80,
			maxX: 58,
			minZ: -78,
			maxZ: -30,
			wrapMinY: 1.2,
			wrapMaxY: 72,
			renderOrder: 22
		},
		mid: {
			name: "about-mid-snow",
			kind: "background",
			count: 3500,
			size: 0.42,
			opacity: 0.52,
			alphaTest: 0.008,
			speedScale: 0.65,
			minX: -25,
			maxX: 103,
			minZ: -36,
			maxZ: 10,
			wrapMinY: 1.2,
			wrapMaxY: 72,
			renderOrder: 23
		},
		near: {
			name: "about-near-fine-snow",
			kind: "background",
			count: 1900,
			size: 0.62,
			opacity: 0.42,
			alphaTest: 0.012,
			speedScale: 1,
			minX: 25,
			maxX: 115,
			minZ: 4,
			maxZ: 42,
			wrapMinY: 1.2,
			wrapMaxY: 72,
			renderOrder: 24
		},
		foreground: {
			name: "about-foreground-snow",
			kind: "foreground",
			count: 260,
			size: 0.9,
			opacity: 0.34,
			alphaTest: 0.015,
			minX: -48,
			maxX: 117,
			minZ: -73,
			maxZ: 33,
			wrapMinY: 1.2,
			wrapMaxY: 64,
			renderOrder: 25
		}
	};

	function wrapAboutSnow(value, min, max) {
		const range = max - min;
		return ((((value - min) % range) + range) % range) + min;
	}

	function createAboutSnow(config) {
		const positions = new Float32Array(config.count * 3);
		const base = new Float32Array(config.count * 3);
		const phases = new Float32Array(config.count);
		const amplitudes = new Float32Array(config.count);
		const lowLayers = new Uint8Array(config.count);

		for (let i = 0; i < config.count; i++) {
			const offset = i * 3;
			const x = THREE.MathUtils.randFloat(config.minX, config.maxX);
			const z = THREE.MathUtils.randFloat(config.minZ, config.maxZ);
			let y;

			if (config.kind === "background") {
				const lowLayer = Math.random() < 0.62;
				lowLayers[i] = lowLayer ? 1 : 0;
				y = lowLayer
					? THREE.MathUtils.randFloat(1.8, 18)
					: THREE.MathUtils.randFloat(18, 68);
				amplitudes[i] = lowLayer
					? 0.18 + Math.random() * 0.52
					: 0.06 + Math.random() * 0.34;
			} else {
				y = THREE.MathUtils.randFloat(3, 62);
				amplitudes[i] = 0.18 + Math.random() * 0.55;
			}

			positions[offset] = base[offset] = x;
			positions[offset + 1] = base[offset + 1] = y;
			positions[offset + 2] = base[offset + 2] = z;
			phases[i] = Math.random() * Math.PI * 2;
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

		const material = new THREE.PointsMaterial({
			map: createSnowFlakeTexture(THREE),
			alphaTest: config.alphaTest,
			color: 0xffffff,
			size: config.size,
			sizeAttenuation: true,
			transparent: true,
			opacity: config.opacity,
			depthWrite: false,
			depthTest: false,
			fog: false,
			blending: THREE.NormalBlending
		});

		const points = new THREE.Points(geometry, material);
		points.name = config.name;
		points.frustumCulled = false;
		points.renderOrder = config.renderOrder;

		return {
			points,
			kind: config.kind,
			count: config.count,
			base,
			phases,
			amplitudes,
			lowLayers,
			speedScale: config.speedScale ?? 1,
			wrapMinY: config.wrapMinY,
			wrapMaxY: config.wrapMaxY
		};
	}

	function updateAboutSnow(snow, t) {
		const positions = snow.points.geometry.attributes.position.array;

		for (let i = 0; i < snow.count; i++) {
			const offset = i * 3;
			const phase = snow.phases[i];
			const amplitude = snow.amplitudes[i];

			if (snow.kind === "background") {
				const layerTime = t * snow.speedScale;
				const fallSpeed = snow.lowLayers[i] ? 0.795 : 0.468;
				const driftA = Math.sin(layerTime * 0.32 + phase) * amplitude * 1.15;
				const driftB = Math.sin(layerTime * 0.17 + phase * 1.7) * amplitude * 0.75;
				const swayZ = Math.cos(layerTime * 0.24 + phase * 1.3) * amplitude * 0.7;

				positions[offset] = snow.base[offset] + driftA + driftB;
				positions[offset + 1] = wrapAboutSnow(
					snow.base[offset + 1] -
						layerTime * fallSpeed -
						Math.sin(layerTime * 0.2 + phase) * 0.45,
					snow.wrapMinY,
					snow.wrapMaxY
				);
				positions[offset + 2] = snow.base[offset + 2] + swayZ;
			} else {
				const swayX =
					Math.sin(t * 0.22 + phase) * amplitude * 1.25 +
					Math.cos(t * 0.11 + phase * 1.9) * amplitude * 0.8;
				const swayZ =
					Math.cos(t * 0.18 + phase) * amplitude * 0.7 +
					Math.sin(t * 0.09 + phase * 1.4) * amplitude * 0.45;
				const fall = 0.575 + Math.sin(phase) * 0.23;

				positions[offset] = snow.base[offset] + swayX;
				positions[offset + 1] = wrapAboutSnow(
					snow.base[offset + 1] - t * fall,
					snow.wrapMinY,
					snow.wrapMaxY
				);
				positions[offset + 2] = snow.base[offset + 2] + swayZ;
			}
		}

		snow.points.geometry.attributes.position.needsUpdate = true;
	}

	function createParticleTexture() {
		const textureCanvas = document.createElement("canvas");
		textureCanvas.width = 64;
		textureCanvas.height = 64;

		const ctx = textureCanvas.getContext("2d");
		const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

		gradient.addColorStop(0.0, "rgba(255,255,255,0.82)");
		gradient.addColorStop(0.22, "rgba(255,255,255,0.34)");
		gradient.addColorStop(0.55, "rgba(180,210,230,0.06)");
		gradient.addColorStop(1.0, "rgba(180,210,230,0)");

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 64, 64);

		const texture = new THREE.CanvasTexture(textureCanvas);
		texture.needsUpdate = true;

		return texture;
	}

	function collectTriangles(model) {
		const triangles = [];
		let totalArea = 0;

		const a = new THREE.Vector3();
		const b = new THREE.Vector3();
		const c = new THREE.Vector3();
		const ab = new THREE.Vector3();
		const ac = new THREE.Vector3();

		model.updateMatrixWorld(true);

		model.traverse((mesh) => {
			if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;

			const geometry = mesh.geometry;
			const position = geometry.attributes.position;
			const index = geometry.index;

			mesh.updateMatrixWorld(true);

			const triCount = index
				? index.count / 3
				: Math.floor(position.count / 3);

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
		});

		return { triangles, totalArea };
	}

	function sampleTriangle(triangles, totalArea) {
		const r = Math.random() * totalArea;

		let low = 0;
		let high = triangles.length - 1;

		while (low < high) {
			const mid = Math.floor((low + high) / 2);

			if (triangles[mid].cumulative < r) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}

		const tri = triangles[low];

		let u = Math.random();
		let v = Math.random();

		if (u + v > 1) {
			u = 1 - u;
			v = 1 - v;
		}

		return tri.a
			.clone()
			.add(tri.b.clone().sub(tri.a).multiplyScalar(u))
			.add(tri.c.clone().sub(tri.a).multiplyScalar(v));
	}

	function createMountainParticles(model) {
		const { triangles, totalArea } = collectTriangles(model);

		if (!triangles.length || totalArea <= 0) {
			console.warn("No triangles found in about.glb");
			return null;
		}

			const positions = [];
			const colors = [];

			let minX = Infinity;
			let maxX = -Infinity;
			let minY = Infinity;
			let maxY = -Infinity;
			let minZ = Infinity;
			let maxZ = -Infinity;

			triangles.forEach((tri) => {
				minX = Math.min(minX, tri.a.x, tri.b.x, tri.c.x);
				maxX = Math.max(maxX, tri.a.x, tri.b.x, tri.c.x);
				minY = Math.min(minY, tri.a.y, tri.b.y, tri.c.y);
				maxY = Math.max(maxY, tri.a.y, tri.b.y, tri.c.y);
				minZ = Math.min(minZ, tri.a.z, tri.b.z, tri.c.z);
				maxZ = Math.max(maxZ, tri.a.z, tri.b.z, tri.c.z);
			});

			const xRange = Math.max(maxX - minX, 0.0001);
			const yRange = Math.max(maxY - minY, 0.0001);
			const zRange = Math.max(maxZ - minZ, 0.0001);

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const p = sampleTriangle(triangles, totalArea);

			p.x += THREE.MathUtils.randFloatSpread(0.018);
			p.y += THREE.MathUtils.randFloatSpread(0.012);
			p.z += THREE.MathUtils.randFloatSpread(0.018);

			positions.push(p.x, p.y, p.z);

			const height = THREE.MathUtils.clamp((p.y - minY) / yRange, 0, 1);

            const ridge =
                0.5 +
                0.5 *
                    Math.sin(p.x * 0.18 + p.y * 0.28) *
                    Math.cos(p.z * 0.16 - p.x * 0.08);

	            const sparkle = Math.random() < 0.025 ? 0.14 : 0;

	            const middleTerrain = THREE.MathUtils.smoothstep(height, 0.14, 0.50);
	            const highRidges = THREE.MathUtils.smoothstep(height, 0.54, 0.84);
	            const ridgeDetail = ridge * (0.06 + highRidges * 0.16);

	            const xNormalized = THREE.MathUtils.clamp((p.x - minX) / xRange, 0, 1);
	            const zNormalized = THREE.MathUtils.clamp((p.z - minZ) / zRange, 0, 1);
	            const edgeDistance = Math.min(xNormalized, 1 - xNormalized) * 2;
	            const depthMiddle = 1 - Math.abs(zNormalized - 0.5) * 2;

	            const bottomFade = THREE.MathUtils.lerp(
	                0.18,
	                1,
	                THREE.MathUtils.smoothstep(height, 0.04, 0.34)
	            );
	            const sideFade = THREE.MathUtils.lerp(
	                0.72,
	                1,
	                THREE.MathUtils.smoothstep(edgeDistance, 0.03, 0.28)
	            );
	            const depthFade = THREE.MathUtils.lerp(
	                0.82,
	                1,
	                THREE.MathUtils.smoothstep(depthMiddle, 0.05, 0.70)
	            );

	            const brightness =
	                (0.24 +
	                    middleTerrain * 0.28 +
	                    highRidges * 0.46 +
	                    ridgeDetail +
	                    Math.random() * 0.025 +
	                    sparkle * (0.25 + highRidges * 0.75)) *
	                bottomFade *
	                sideFade *
	                depthFade;

            colors.push(
                Math.min(1, 0.9 * brightness),
                Math.min(1, 0.96 * brightness),
                Math.min(1, 1.08 * brightness)
            );
		}

		const geometry = new THREE.BufferGeometry();

		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(positions, 3)
		);

		geometry.setAttribute(
			"color",
			new THREE.Float32BufferAttribute(colors, 3)
		);

		const material = new THREE.PointsMaterial({
            map: createParticleTexture(),
	            alphaTest: 0.008,
            size: PARTICLE_SIZE,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
	            opacity: 1.8, //山透明度
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending
        });

		const points = new THREE.Points(geometry, material);
		points.name = "about-particle-mountain";
		points.frustumCulled = false;
		points.renderOrder = 20;

		return points;
	}

	function normalizeModel(model) {
		model.updateMatrixWorld(true);

		const box = new THREE.Box3().setFromObject(model);
		const size = box.getSize(new THREE.Vector3());
		const center = box.getCenter(new THREE.Vector3());

		const maxXZ = Math.max(size.x, size.z, 0.0001);
		const scale = MODEL_TARGET_WIDTH / maxXZ;

		const root = new THREE.Group();
		root.name = "about-model-root";

		model.position.set(-center.x, -box.min.y, -center.z);

		root.add(model);
		root.scale.set(
			scale,
			scale * 1.18,
			scale
		);

		root.position.set(55, -5, 0); //山的位置
        root.rotation.set(
            THREE.MathUtils.degToRad(7),
            THREE.MathUtils.degToRad(-10),
            0
        );

		return root;
	}

	onMount(async () => {
		document.body.classList.add("about-page-active");

        const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
			import("three/examples/jsm/loaders/GLTFLoader.js"),
			import("three/examples/jsm/libs/meshopt_decoder.module.js")
		]);

		await MeshoptDecoder.ready;

		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true
		});

		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x070e17, 0);

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x070e17, 0.012);

		const camera = new THREE.PerspectiveCamera(
			38,
			window.innerWidth / window.innerHeight,
			0.1,
			2000
		);

		camera.position.set(70, 7, 58);
		camera.lookAt(28, 5, 0);

		const ambient = new THREE.AmbientLight(0xc7d9ec, 1.2);
		scene.add(ambient);

		const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
		keyLight.position.set(20, 35, 45);
		scene.add(keyLight);

		const backLight = new THREE.DirectionalLight(0x6f91b4, 0.72);
		backLight.position.set(-30, 18, -30);
		scene.add(backLight);

		const aboutFarSnow = createAboutSnow(ABOUT_SNOW_LAYERS.far);
		const aboutMidSnow = createAboutSnow(ABOUT_SNOW_LAYERS.mid);
		const aboutNearSnow = createAboutSnow(ABOUT_SNOW_LAYERS.near);
		const aboutForegroundSnow = createAboutSnow(ABOUT_SNOW_LAYERS.foreground);
		scene.add(aboutFarSnow.points);
		scene.add(aboutMidSnow.points);
		scene.add(aboutNearSnow.points);
		scene.add(aboutForegroundSnow.points);

		const loader = new GLTFLoader();
		loader.setMeshoptDecoder(MeshoptDecoder);

		let mountainParticles = null;
		let disposed = false;
		let frame = 0;

		loader.load(
			MODEL_URL,
			(gltf) => {
				if (disposed) return;

				const model = gltf.scene;
                console.log("about.glb loaded:", gltf);

				const root = normalizeModel(model);

				scene.add(root);
				root.updateMatrixWorld(true);

				mountainParticles = createMountainParticles(root);

				if (mountainParticles) {
					scene.add(mountainParticles);
				}

				root.visible = false;
			},
			undefined,
			(error) => {
				console.error("about.glb load error:", error);
			}
		);

		function resize() {
			const width = window.innerWidth;
			const height = window.innerHeight;

			renderer.setSize(width, height);

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}

		function animate() {
			if (disposed) return;

			const t = performance.now() * 0.001;
			updateAboutSnow(aboutFarSnow, t);
			updateAboutSnow(aboutMidSnow, t);
			updateAboutSnow(aboutNearSnow, t);
			updateAboutSnow(aboutForegroundSnow, t);

			if (mountainParticles) {
				mountainParticles.rotation.y = Math.sin(t * 0.08) * 0.012;
				mountainParticles.rotation.x = Math.sin(t * 0.06) * 0.004;
			}

			renderer.render(scene, camera);
			frame = requestAnimationFrame(animate);
		}

		window.addEventListener("resize", resize);
		animate();

		return () => {
			disposed = true;

			document.body.classList.remove("about-page-active");

			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);

			scene.traverse((object) => {
				if (object.geometry) object.geometry.dispose();

				if (object.material) {
					if (object.material.map) object.material.map.dispose();
					object.material.dispose();
				}
			});

			renderer.dispose();
		};
	});
</script>

<svelte:head>
	<title>About / Tracce</title>
</svelte:head>

<section class="about-page">
	<a class="about-back" href="/" aria-label="Back to map" onclick={goBackToMap}>
		<span></span>
	</a>

	<div class="about-copy">
		<ParticleTitle
			text={aboutContent.title}
			variant={aboutTitleVariant}
			ariaLabel={aboutContent.title}
		/>

		<div class="about-text">
			{#each aboutContent.paragraphs as paragraph}
				<p>
					{#each paragraph as line, index}
						{line}{#if index < paragraph.length - 1}<br />{/if}
					{/each}
				</p>
			{/each}
		</div>
	</div>

	<div class="about-mountain-layer" aria-hidden="true">
		<canvas bind:this={canvas} class="about-canvas"></canvas>

		<div class="about-people">
			{#each people as person}
				<button
					class="about-person-dot glow-orb"
					type="button"
					style={`left: ${person.x}%; top: ${person.y}%;`}
					aria-label={person.name}
					onmouseenter={() => (activeAbout = person)}
					onmouseleave={() => (activeAbout = null)}
					onfocus={() => (activeAbout = person)}
					onblur={() => (activeAbout = null)}
				>
				</button>
			{/each}
		</div>
	</div>
</section>

<style>
	:global(body.about-page-active) {
		background: #070e17;
		overflow: hidden;
	}

	.about-page {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background:
			radial-gradient(circle at 76% 28%, rgba(130, 158, 184, 0.12), transparent 24%),
			radial-gradient(circle at 64% 82%, rgba(61, 113, 145, 0.16), transparent 28%),
			#070e17;
		color: #f2f5f7;
		font-family: var(--font-light);
		font-weight: 200;
	}

	.about-page::before {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.014) 1px, transparent 1px);
		background-size: 68px 68px;
		opacity: 0.22;
	}

	.about-page::after {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(
				90deg,
				rgba(7, 14, 23, 0.98) 0%,
				rgba(7, 14, 23, 0.86) 28%,
				rgba(7, 14, 23, 0.24) 55%,
				rgba(7, 14, 23, 0.08) 100%
			);
		z-index: 2;
	}

	.about-back {
		position: fixed;
		left: 42px;
		top: 42px;
		z-index: 20;
		width: 36px;
		height: 24px;
		display: flex;
		align-items: center;
		text-decoration: none;
		opacity: 0.72;
		transition:
			opacity 0.28s ease,
			transform 0.28s ease;
	}

	.about-back span,
	.about-back::before,
	.about-back::after {
		content: "";
		position: absolute;
		display: block;
		background: rgba(242, 245, 247, 0.82);
	}

	.about-back span {
		left: 0;
		top: 11px;
		width: 30px;
		height: 2px;
	}

	.about-back::before {
		left: 0;
		top: 11px;
		width: 13px;
		height: 2px;
		transform-origin: left center;
		transform: rotate(-42deg);
	}

	.about-back::after {
		left: 0;
		top: 11px;
		width: 13px;
		height: 2px;
		transform-origin: left center;
		transform: rotate(42deg);
	}

	.about-back:hover {
		opacity: 1;
		transform: translateX(-3px);
	}

	.about-copy {
		position: relative;
		z-index: 10;
		width: min(34vw, 440px);
		padding-left: 7vw;
		padding-top: 13.5vh;
		pointer-events: auto;
	}

	.about-copy :global(.particle-title--about) {
		margin: 0 0 7vh;

		width: 520px;
		height: 150px;

		font-family: var(--font-title);
		font-size: 112px;
		font-weight: 400;
		line-height: 0.88;
		letter-spacing: 0.08em;
		text-transform: none;

		--particle-title-align: left;
		--particle-title-padding-x: 0;

		--particle-title-rgb: 255,255,255;
		--particle-title-density: 3;
		--particle-title-radius: 82;
		--particle-title-push: 0.42;
		--particle-title-return: 0.09;
		--particle-title-friction: 0.86;
		--particle-title-dot-size: 1.02;
		--particle-title-opacity: 1;
		--particle-title-cursor-radius: 96;
		--particle-title-cursor-push: 1.35;
		--particle-title-ring-opacity: 0.72;
		--particle-title-ring-width: 1.4;
	}

	.about-copy :global(.particle-title--about-name) {
		margin: 0 0 7vh;

		width: 760px;
		height: 132px;

		font-family: var(--font-title);
		font-size: 48px;
		font-weight: 400;
		line-height: 0.88;
		letter-spacing: 0.05em;
		text-transform: none;

		--particle-title-align: left;
		--particle-title-padding-x: 0;

		--particle-title-rgb: 255,255,255;
		--particle-title-density: 3;
		--particle-title-radius: 82;
		--particle-title-push: 0.42;
		--particle-title-return: 0.09;
		--particle-title-friction: 0.86;
		--particle-title-dot-size: 0.98;
		--particle-title-opacity: 1;
		--particle-title-cursor-radius: 96;
		--particle-title-cursor-push: 1.35;
		--particle-title-ring-opacity: 0.72;
		--particle-title-ring-width: 1.4;
	}

	.about-text {
		font-family: var(--font-medium);
        font-weight: 400;
        font-style: italic;
        font-size: clamp(18px, 1.45vw, 25px);
        line-height: 0.87;
        letter-spacing: 0.01em;
        color: rgba(242, 245, 247, 0.88);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-synthesis: none;
	}

	.about-text p {
		margin: 0 0 26px;
	}

	.about-mountain-layer {
		position: absolute;
		inset: 0;
		z-index: 3;
	}

	.about-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		background: transparent;
	}

	.about-people {
		position: absolute;
		inset: 0;
		z-index: 8;
		pointer-events: none;
	}

	.about-person-dot {
		position: absolute;
		width: 82px;
		height: 82px;
		margin-left: -41px;
		margin-top: -41px;
		padding: 0;
		border: none;
		border-radius: 999px;
		background: transparent;
		box-shadow: none;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		pointer-events: auto;
		cursor: pointer;
		animation: about-dot-float 4.8s ease-in-out infinite;
	}

	.about-person-dot:nth-child(2) {
		animation-delay: -0.8s;
	}

	.about-person-dot:nth-child(3) {
		animation-delay: -1.4s;
	}

	.about-person-dot:nth-child(4) {
		animation-delay: -2.1s;
	}

	.about-person-dot:nth-child(5) {
		animation-delay: -2.8s;
	}

	.about-person-dot:nth-child(6) {
		animation-delay: -3.4s;
	}

	@keyframes about-dot-float {
		0%,
		100% {
			translate: 0 0;
		}

		50% {
			translate: 0 -8px;
		}
	}

	@media (max-width: 900px) {
		.about-copy {
			width: min(72vw, 420px);
			padding-left: 32px;
			padding-top: 96px;
		}

		.about-text {
			font-size: 18px;
		}

		.about-page::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
                linear-gradient(
                    90deg,
                    rgba(7, 14, 23, 0.98) 0%,
                    rgba(7, 14, 23, 0.82) 28%,
                    rgba(7, 14, 23, 0.16) 52%,
                    rgba(7, 14, 23, 0.02) 100%
                );
            z-index: 2;
        }
	}
</style>
