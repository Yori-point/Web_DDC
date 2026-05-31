// @ts-nocheck

export function createSceneSetup({ THREE, canvas, bgColor }) {
	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false
	});

	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(bgColor, 1);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(bgColor);
	scene.fog = new THREE.FogExp2(bgColor, 0.011);

	const mapSceneGroup = new THREE.Group();
	mapSceneGroup.name = "map-scene-group";
	mapSceneGroup.visible = false;
	scene.add(mapSceneGroup);

	const camera = new THREE.PerspectiveCamera(
		48,
		window.innerWidth / window.innerHeight,
		0.1,
		2000
	);

	const clock = new THREE.Clock();

	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	raycaster.params.Points.threshold = 1.65;

	const ambientLight = new THREE.AmbientLight(0xa9c7e6, 0.92);
	scene.add(ambientLight);

	const keyLight = new THREE.DirectionalLight(0xe6f1fa, 1.55);
	keyLight.position.set(18, 38, 26);
	scene.add(keyLight);

	const violetBackLight = new THREE.DirectionalLight(0x5b7fa6, 0.95);
	violetBackLight.position.set(-28, 22, -24);
	scene.add(violetBackLight);

	return {
		renderer,
		scene,
		mapSceneGroup,
		camera,
		clock,
		raycaster,
		pointerNdc,
		ambientLight,
		keyLight,
		violetBackLight
	};
}

export function resizeScene({ renderer, camera }) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}