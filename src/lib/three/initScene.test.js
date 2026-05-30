import * as THREE from "three";

export function initScene() {
	console.log("Three scene started");

	const canvas = document.getElementById("scene");

	if (!canvas) {
		console.error("Missing #scene canvas");
		return;
	}

	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false
	});

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0x070e17, 1);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x070e17);

	const camera = new THREE.PerspectiveCamera(
		48,
		window.innerWidth / window.innerHeight,
		0.1,
		2000
	);

	camera.position.set(0, 8, 32);

	const geometry = new THREE.SphereGeometry(4, 32, 32);
	const material = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		wireframe: true
	});

	const sphere = new THREE.Mesh(geometry, material);
	scene.add(sphere);

	function onResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener("resize", onResize);

	/** @type {number | undefined} */
	let animationFrameId;

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		sphere.rotation.y += 0.01;
		renderer.render(scene, camera);
	}

	animate();

	return () => {
		if (animationFrameId !== undefined) {
			cancelAnimationFrame(animationFrameId);
		}

		window.removeEventListener("resize", onResize);
		renderer.dispose();
		geometry.dispose();
		material.dispose();
	};
}