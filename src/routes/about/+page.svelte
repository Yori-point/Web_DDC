<script>
    // @ts-nocheck

	import { onMount } from "svelte";
	import * as THREE from "three";
	import { goto } from "$app/navigation";
	import ParticleTitle from "$lib/components/ParticleTitle.svelte";
	import { createSnowFlakeTexture } from "$lib/three/textures.js";

	let canvas;

	let activeAbout = $state(null);

	onMount(() => {
		document.body.classList.remove(
			"intro-active",
			"overview-active",
			"chapter-active",
			"chapter-nodes-active",
			"chapter-nodes-preenter",
			"summit-title-active",
			"ritual-active",
			"is-transitioning",
			"category-menu-open",
			"category-hover-active",
			"media-detail-open",
			"media-av-open",
			"duomo-hover-active"
		);
	});

	const defaultAbout = {
		title: "Tracce",
		meta: "PAESAGGIO DI MEMORIE · MILANO CORTINA 2026",
		paragraphs: [
			[
				"Milano Cortina 2026 lascia una legacy fatta non solo di infrastrutture, ma di storie che continuano a circolare dopo la fine dei Giochi."
			],
			[
				"Per raccogliere queste voci abbiamo lavorato sul campo: interviste dirette, sondaggi online, questionari, ogni strumento utile ad ampliare il coro di chi ha attraversato i Giochi da prospettive diverse."
			],
			[
				"Il sito che ne è nato vuole rendere giustizia a questa moltitudine, trasformando chi lo visita in parte attiva del racconto, non solo in spettatore."
			],
			[
				"Ogni voce lascia una traccia,",
				"ogni traccia racconta un punto di vista."
			]
		]
	};

	const people = [
		{
			id: "jiaying-hu",
			name: "Jiaying Hu",
			meta: "DIREZIONE VISIVA · INTERFACCIA · ESPERIENZA NARRATIVA",
			x: 41,
			y: 56,
			title: "Jiaying Hu",
			paragraphs: [
				[
					"All’inizio vedevo le Olimpiadi",
					"come qualcosa di grande,",
					"quasi distante dalla vita quotidiana."
				],
				[
					"Ascoltando le persone,",
					"ho capito che un evento così",
					"viene vissuto in modi molto diversi:",
					"entusiasmo, orgoglio,",
					"cambiamento o semplice curiosità."
				],
				[
					"Questa varietà di sguardi",
					"è stata la parte più interessante",
					"del progetto per me."
				],
				[
					"Mi ha fatto capire",
					"che non esiste una sola memoria",
					"di un evento collettivo."
				],
				[
					"Ho curato la progettazione grafica",
					"e visiva del sito,",
					"lo sviluppo del prototipo su Figma",
					"e l’implementazione dei contenuti",
					"nel codice."
				]
			]
		},
		{
			id: "yunwei-zhang",
			name: "Yunwei Zhang",
			meta: "DIREZIONE VISIVA · INTERFACCIA · ESPERIENZA NARRATIVA",
			x: 54,
			y: 42,
			title: "Yunwei Zhang",
			paragraphs: [
				[
					"Ho sempre visto le Olimpiadi",
					"come qualcosa che va oltre",
					"la competizione."
				],
				[
					"Dopo un incidente,",
					"il mio sguardo sullo sport",
					"è cambiato:",
					"tra entusiasmo, limite",
					"e ostinazione."
				],
				[
					"Per me raccontare lo sport",
					"significa osservare",
					"ciò che resta nei corpi,",
					"nelle città e nella memoria."
				],
				[
					"Ho curato lo sviluppo tecnico",
					"del sito,",
					"le funzionalità interattive,",
					"parte della modellazione 3D,",
					"la gestione della musica",
					"e la realizzazione finale",
					"del progetto."
				]
			]
		},
		{
			id: "isabella-lena",
			name: "Isabella lena",
			meta: "DIREZIONE VISIVA · INTERFACCIA · ESPERIENZA NARRATIVA",
			x: 60,
			y: 70,
			title: "Isabella lena",
			paragraphs: [
				[
					"Le Olimpiadi invernali",
					"hanno creato una sorta di",
					"mondo sospeso, separato",
					"dalla routine quotidiana."
				],
				[
					"Guardare una gara era",
					"un momento di condivisione,",
					"capace di offrire sempre",
					"nuovi spunti di conversazione."
				],
				[
					"Questo progetto mi ha dato",
					"l’opportunità di esplorare",
					"prospettive distanti dalla mia",
					"e di capire come le persone",
					"hanno percepito questo evento."
				],
				[
					"Ho curato l’organizzazione generale",
					"del gruppo di lavoro",
					"e lo sviluppo del prototipo su Figma,",
					"contribuendo anche",
					"a implementare i contenuti nel codice."
				]
			]
		},
		{
			id: "laura-facchinetti",
			name: "Laura Facchinetti",
			meta: "ORGANIZZAZIONE DEL GRUPPO · GESTIONE DELLO STILE",
			x: 75,
			y: 30,
			title: "Laura Facchinetti",
            paragraphs: [
                [
                    "Scoprire quante prospettive diverse",
					"convivono attorno a uno stesso evento",
                    "è stata la parte più sorprendente",
                    "di questo percorso."
                ],
                [
                    "Ogni testimonianza raccontava",
                    "gli stessi Giochi",
					"in un modo completamente diverso,",
					"mostrando quanto un evento collettivo",
					"possa essere vissuto",
					"attraverso sensibilità lontane."
                ],
				[
					"Lavorare su queste voci",
					"mi ha fatto capire quanto sia importante",
					"dare spazio non solo al grande racconto,",
					"ma anche alle percezioni più personali."
				],
                [
					"Ho curato l’organizzazione",
					"del gruppo di lavoro",
					"e lo stile del progetto,",
					"contribuendo anche",
					"alla progettazione del modello su Figma."
                ]
            ]
		},
		{
			id: "matilde-pinarello",
			name: "Matilde Pinarello",
			meta: "DIREZIONE VISIVA · INTERFACCIA · ESPERIENZA NARRATIVA",
			x: 90,
			y: 46,
			title: "Matilde Pinarello",
			paragraphs: [
				[
					"Avendo praticato sport",
					"per tutta la vita,",
					"considero le Olimpiadi",
					"come un traguardo desiderato",
					"da ogni atleta",
					"e uno dei più grandi onori."
				],
				[
					"Tifare per la propria nazionale",
					"e assistere alle performance",
					"delle ragazze e dei ragazzi",
					"è sempre una grande emozione."
				],
				[
					"Questo progetto mi ha dato",
					"la possibilità di osservare",
					"lo sport da una prospettiva nuova."
				],
				[
					"Ho curato lo stile generale",
					"del sito e la colonna sonora,",
					"oltre allo sviluppo",
					"del prototipo su Figma."
				]
			]
		},
		{
			id: "giulia-croci",
			name: "Giulia Croci",
			meta: "DIREZIONE VISIVA · INTERFACCIA · ESPERIENZA NARRATIVA",
			x: 81,
			y: 70,
			title: "Giulia Croci",
			paragraphs: [
				[
					"Le Olimpiadi sono",
					"un momento immancabile",
					"nella mia famiglia",
					"ormai da anni."
				],
				[
					"Assistere a tutte le gare",
					"ha reso l’inverno",
					"qualcosa di magico."
				],
				[
					"Mi piacerebbe riuscire",
					"a diventare come i migliori",
					"snowboarder al mondo,",
					"ma quando ci ho provato",
					"mi sono rotta un braccio:",
					"sarà per la prossima!"
				],
				[
					"Ho curato la modellazione 3D",
					"su Blender",
					"e contribuito alla progettazione",
					"del modello su Figma,",
					"supportando l’organizzazione",
					"dei contenuti."
				]
			]
		}
	];

	const aboutContent = $derived(activeAbout || defaultAbout);
	const aboutLead = $derived(aboutContent.paragraphs[0] || []);
	const aboutBody = $derived(
		activeAbout
			? aboutContent.paragraphs.slice(1, -1)
			: aboutContent.paragraphs.slice(1)
	);
	const aboutContribution = $derived(
		activeAbout
			? aboutContent.paragraphs[aboutContent.paragraphs.length - 1]
			: null
	);

	function showPersonPreview(person) {
		activeAbout = person;
	}

	function clearPersonPreview() {
		activeAbout = null;
	}

    async function goBackToMap(event) {
		event.preventDefault();

		const returnView = sessionStorage.getItem("tracce-about-return-view");
		const chapterKey = sessionStorage.getItem("tracce-about-return-chapter");

		if (returnView === "chapter" && chapterKey) {
			sessionStorage.setItem("tracce-open-chapter", chapterKey);
			sessionStorage.removeItem("tracce-open-map");

			document.documentElement.classList.add("tracce-returning-chapter");
			document.documentElement.classList.remove("tracce-returning-map");
		} else {
			sessionStorage.setItem("tracce-open-map", "1");
			sessionStorage.removeItem("tracce-open-chapter");

			document.documentElement.classList.add("tracce-returning-map");
			document.documentElement.classList.remove("tracce-returning-chapter");
		}

		await goto("/", {
			noScroll: true
		});
	}

	const MODEL_URL = "/about-meshopt.glb";

	const MODEL_TARGET_WIDTH = 96;
    const PARTICLE_COUNT = 180000;
    const PARTICLE_SIZE = 0.38;
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

		gradient.addColorStop(0.0, "rgba(255,255,255,0.92)");
		gradient.addColorStop(0.18, "rgba(255,255,255,0.46)");
		gradient.addColorStop(0.48, "rgba(180,210,230,0.08)");
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

	            const middleTerrain = THREE.MathUtils.smoothstep(height, 0.20, 0.58);
	            const highRidges = THREE.MathUtils.smoothstep(height, 0.56, 0.82);
	            const ridgeDetail = ridge * (0.035 + highRidges * 0.20);

	            const xNormalized = THREE.MathUtils.clamp((p.x - minX) / xRange, 0, 1);
	            const zNormalized = THREE.MathUtils.clamp((p.z - minZ) / zRange, 0, 1);
	            const edgeDistance = Math.min(xNormalized, 1 - xNormalized) * 2;
	            const depthMiddle = 1 - Math.abs(zNormalized - 0.5) * 2;

	            const bottomFade = THREE.MathUtils.lerp(
	                0.06,
	                1,
	                THREE.MathUtils.smoothstep(height, 0.12, 0.50)
	            );
	            const sideFade = THREE.MathUtils.lerp(
	                0.35,
	                1,
	                THREE.MathUtils.smoothstep(edgeDistance, 0.04, 0.36)
	            );
	            const depthFade = THREE.MathUtils.lerp(
	                0.75,
	                1,
	                THREE.MathUtils.smoothstep(depthMiddle, 0.05, 0.70)
	            );

	            const brightness =
	                (0.72 +
	                    middleTerrain * 0.12 +
	                    highRidges * 0.36 +
	                    ridgeDetail +
	                    Math.random() * 0.004) *
	                bottomFade *
	                sideFade *
	                depthFade;

            colors.push(
                Math.min(1, 0.98 * brightness),
                Math.min(1, 1.03 * brightness),
                Math.min(1, 1.10 * brightness)
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
	            alphaTest: 0.004,
            size: PARTICLE_SIZE,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
	            opacity: 1.5, //山透明度
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

		root.position.set(53, -5, 0); //山的位置
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

	onMount(() => {
		document.body.classList.remove(
			"intro-active",
			"overview-active",
			"chapter-active",
			"chapter-nodes-active",
			"chapter-nodes-preenter",
			"summit-title-active",
			"ritual-active",
			"is-transitioning",
			"category-menu-open",
			"category-hover-active",
			"media-detail-open",
			"media-av-open",
			"duomo-hover-active"
		);
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
		{#if activeAbout}
			<h1 class="about-name-title">{aboutContent.title}</h1>
		{:else}
			<ParticleTitle text={aboutContent.title} variant="about" ariaLabel={aboutContent.title} />
		{/if}

		<div class="about-text" class:is-default={!activeAbout}>
			<p class="about-lead">
				{#each aboutLead as line, index}
					{line}{#if index < aboutLead.length - 1}<br />{/if}
				{/each}
			</p>

			<div class="about-body">
				{#each aboutBody as paragraph}
					<p>
						{#each paragraph as line, index}
							{line}{#if index < paragraph.length - 1}<br />{/if}
						{/each}
					</p>
				{/each}
			</div>

			{#if aboutContribution}
				<div class="about-contribution">
					<p class="about-contribution-text">
						{aboutContribution.join(" ")}
					</p>
				</div>
			{/if}
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
					onmouseenter={() => showPersonPreview(person)}
					onmouseleave={clearPersonPreview}
					onfocus={() => showPersonPreview(person)}
					onblur={clearPersonPreview}
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
		--about-safe-padding: clamp(72px, 7vw, 96px);

		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background:
			radial-gradient(circle at 76% 28%, rgba(130, 158, 184, 0.12), transparent 24%),
			linear-gradient(
				to top,
				rgba(7, 14, 23, 0.48) 0%,
				rgba(7, 14, 23, 0.12) 22%,
				transparent 46%
			),
			#070e17;
		color: rgba(242, 245, 247, 0.82);
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
		position: absolute;
		left: var(--about-safe-padding);
		top: var(--about-safe-padding);
		z-index: 10;
		width: clamp(300px, 28vw, 356px);
		max-width: calc(100vw - var(--about-safe-padding) - var(--about-safe-padding));
		max-height: calc(100dvh - var(--about-safe-padding) - var(--about-safe-padding));
		pointer-events: none;
	}

	.about-copy::before {
		content: "";
		position: absolute;
		z-index: -1;
		top: -4vh;
		right: -9vw;
		bottom: -5vh;
		left: -5vw;
		pointer-events: none;
		background: linear-gradient(
			90deg,
			rgba(7, 14, 23, 0.38) 0%,
			rgba(7, 14, 23, 0.16) 62%,
			rgba(7, 14, 23, 0) 100%
		);
		filter: blur(16px);
	}

	.about-copy :global(.particle-title--about) {
		margin: 0 0 clamp(12px, 1.4vw, 18px);

		width: 760px;
		height: 132px;

		font-family: var(--font-title);
		font-size: 58px; 
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

	.about-name-title {
		margin: 0 0 7vh;

		width: 760px;
		height: 132px;

		display: flex;
		align-items: center;

		font-family: var(--font-title);
		font-size: 48px;
		font-weight: 400;
		line-height: 0.9;
		letter-spacing: 0.045em;
		text-transform: none;

		color: rgba(255, 255, 255, 0.92);
		text-shadow:
			0 0 14px rgba(255, 255, 255, 0.18),
			0 0 32px rgba(210, 226, 238, 0.12);

		pointer-events: none;
	}

	.about-text {
		max-width: 356px;
		font-family: var(--font-medium);
        font-weight: 400;
        font-style: italic;
        letter-spacing: 0.01em;
        -webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-synthesis: none;
		word-break: normal;
		overflow-wrap: normal;
		hyphens: none;
	}

	.about-text.is-default {
		width: clamp(300px, 24vw, 340px);
		max-width: calc(100vw - var(--about-safe-padding) - var(--about-safe-padding));
	}

	.about-text.is-default .about-lead,
	.about-text.is-default .about-body {
		line-height: 1.22;
	}

	.about-text.is-default .about-lead,
	.about-text.is-default .about-body p {
		margin-bottom: clamp(24px, 3vh, 34px);
	}

	.about-lead {
		margin: 0 0 clamp(22px, 2.4vh, 30px);
		font-family: "Omnes", sans-serif;
		font-size: clamp(18px, 1.35vw, 20px);
		font-style: normal;
		font-weight: 400;
		line-height: 1.12;
		color: rgba(242, 245, 247, 0.94);
	}

	.about-body {
		font-family: "Omnes", sans-serif;
		font-size: clamp(18px, 1.35vw, 20px);
		font-style: normal;
		font-weight: 400;
		line-height: 1.12;
		color: rgba(242, 245, 247, 0.94);
	}

	.about-body p {
		margin: 0 0 clamp(22px, 2.4vh, 30px);
	}

	.about-contribution {
		max-width: clamp(300px, 30vw, 390px);
		margin-top: clamp(22px, 2.6vh, 30px);
		color: rgba(242, 245, 247, 0.72);
	}

	.about-contribution-text {
		margin: 0;
		font-family: "Omnes", sans-serif;
		font-size: clamp(18px, 1.35vw, 20px);
		font-style: normal;
		font-weight: 400;
		line-height: 1.12;
		color: rgba(242, 245, 247, 0.72);
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
	}

	.about-person-dot:hover,
	.about-person-dot:focus-visible {
		z-index: 2;
		transform: none !important;
		background: transparent !important;
		border-color: transparent !important;
		box-shadow: none !important;
		animation: none !important;
	}

	.about-people:hover .about-person-dot:not(:hover):not(:focus-visible) {
		opacity: 0.85;
	}

	@media (max-width: 900px) {
		.about-page {
			--about-safe-padding: clamp(32px, 7vw, 72px);
		}

		.about-copy {
			width: min(72vw, 356px);
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
