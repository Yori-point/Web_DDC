<script>
    // @ts-nocheck

	import { onMount } from "svelte";
	import * as THREE from "three";

	let canvas;

	const people = [
		{ name: "名字1", x: 43, y: 45 },
		{ name: "名字2", x: 55, y: 31 },
		{ name: "名字3", x: 66, y: 55 },
		{ name: "名字4", x: 73, y: 17 },
		{ name: "名字5", x: 88, y: 49 },
		{ name: "名字6", x: 76, y: 67 }
	];

    function goBackToMap(event) {
        event.preventDefault();

        sessionStorage.setItem("tracce-open-map", "1");
        window.location.href = "/";
    }

	const MODEL_URL = "/about.glb";

	const MODEL_TARGET_WIDTH = 108;
    const PARTICLE_COUNT = 180000;
    const PARTICLE_SIZE = 0.34;

	function createParticleTexture() {
		const textureCanvas = document.createElement("canvas");
		textureCanvas.width = 64;
		textureCanvas.height = 64;

		const ctx = textureCanvas.getContext("2d");
		const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

		gradient.addColorStop(0.0, "rgba(255,255,255,0.95)");
		gradient.addColorStop(0.22, "rgba(255,255,255,0.48)");
		gradient.addColorStop(0.55, "rgba(180,210,230,0.10)");
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

		let minY = Infinity;
		let maxY = -Infinity;

		triangles.forEach((tri) => {
			minY = Math.min(minY, tri.a.y, tri.b.y, tri.c.y);
			maxY = Math.max(maxY, tri.a.y, tri.b.y, tri.c.y);
		});

		const yRange = Math.max(maxY - minY, 0.0001);

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

            const sparkle = Math.random() < 0.08 ? 0.28 : 0;

            const brightness =
                0.78 +
                height * 0.32 +
                ridge * 0.22 +
                Math.random() * 0.16 +
                sparkle;

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
            alphaTest: 0.002,
            size: PARTICLE_SIZE,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 1,
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
		root.scale.setScalar(scale);

		root.position.set(24, -5, 0); //山的位置
        root.rotation.set(
            THREE.MathUtils.degToRad(-2),
            THREE.MathUtils.degToRad(24),
            0
        );

		return root;
	}

	onMount(async () => {
		document.body.classList.add("about-page-active");

        const { GLTFLoader } = await import(
            "three/examples/jsm/loaders/GLTFLoader.js"
        );

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

		camera.position.set(18, 18, 82);
		camera.lookAt(20, 4, 0);

		const ambient = new THREE.AmbientLight(0xc7d9ec, 1.2);
		scene.add(ambient);

		const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
		keyLight.position.set(20, 35, 45);
		scene.add(keyLight);

		const backLight = new THREE.DirectionalLight(0x6f91b4, 0.72);
		backLight.position.set(-30, 18, -30);
		scene.add(backLight);

		const loader = new GLTFLoader();

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
		<h1>Tracce</h1>

		<div class="about-text">
			<p>
				Dopo un grande evento,<br />
				qualcosa resta.
			</p>

			<p>
				Non solo strutture,<br />
				numeri o immagini ufficiali,<br />
				ma frammenti più piccoli:<br />
				una voce, uno sguardo,<br />
				un incontro, una sensazione.
			</p>

			<p>
				Milano Cortina 2026<br />
				diventa qui un paesaggio<br />
				da attraversare lentamente.
			</p>

			<p>
				Ogni testimonianza<br />
				si deposita come una particella.<br />
				Ogni particella<br />
				lascia una traccia.
			</p>

			<p>
				Il sito raccoglie ciò<br />
				che continua a muoversi<br />
				nella memoria quotidiana.
			</p>

			<p>
				Non una mappa da leggere,<br />
				ma uno spazio da attraversare.
			</p>
		</div>
	</div>

	<div class="about-mountain-layer" aria-hidden="true">
		<canvas bind:this={canvas} class="about-canvas"></canvas>

		<div class="about-people">
			{#each people as person}
				<button
					class="about-person-dot"
					type="button"
					style={`left: ${person.x}%; top: ${person.y}%;`}
					aria-label={person.name}
				>
					<span class="about-dot-core"></span>
					<span class="about-dot-ring"></span>
					<span class="about-person-name">{person.name}</span>
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

	.about-copy h1 {
		margin: 0 0 7vh;
		font-family: var(--font-title);
		font-size: clamp(54px, 6.4vw, 94px);
		font-weight: 400;
		line-height: 0.86;
		letter-spacing: -0.055em;
		color: rgba(242, 245, 247, 0.96);
		text-shadow:
			0 0 18px rgba(242, 245, 247, 0.08),
			0 0 44px rgba(169, 199, 230, 0.08);
	}

	.about-text {
		font-family: var(--font-quote);
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

	.about-dot-core {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 38px;
		height: 38px;
		border-radius: 999px;
		transform: translate(-50%, -50%);
		background: rgba(255, 255, 255, 0.96);
		box-shadow:
			0 0 18px rgba(255, 255, 255, 0.82),
			0 0 44px rgba(220, 238, 255, 0.42),
			0 0 88px rgba(180, 210, 236, 0.22);
	}

	.about-dot-ring {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 76px;
		height: 76px;
		border-radius: 999px;
		transform: translate(-50%, -50%);
		border: 1px solid rgba(242, 245, 247, 0.34);
		box-shadow:
			0 0 20px rgba(242, 245, 247, 0.12),
			inset 0 0 18px rgba(242, 245, 247, 0.08);
		opacity: 0.68;
		transition:
			transform 0.28s ease,
			opacity 0.28s ease,
			border-color 0.28s ease;
	}

	.about-person-name {
		position: absolute;
		left: 50%;
		top: -8px;
		transform: translate(-50%, 10px);
		padding: 5px 10px 6px;
		border: 1px solid rgba(242, 245, 247, 0.2);
		border-radius: 999px;
		background: rgba(7, 14, 23, 0.36);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		font-family: var(--font-light);
		font-size: 15px;
		font-weight: 200;
		letter-spacing: 0.04em;
		color: rgba(242, 245, 247, 0.94);
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.22s ease,
			transform 0.22s ease;
	}

	.about-person-dot:hover,
	.about-person-dot:focus-visible {
		transform: none;
	}

	.about-person-dot:hover .about-dot-ring,
	.about-person-dot:focus-visible .about-dot-ring {
		transform: translate(-50%, -50%) scale(1.14);
		opacity: 0.96;
		border-color: rgba(242, 245, 247, 0.58);
	}

	.about-person-dot:hover .about-person-name,
	.about-person-dot:focus-visible .about-person-name {
		opacity: 1;
		transform: translate(-50%, -10px);
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

		.about-copy h1 {
			margin-bottom: 42px;
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