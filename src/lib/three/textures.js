// @ts-nocheck

export function createGlowSprite(THREE, color, opacity = 1) {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 128;

	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 128, 128);

	const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 58);

	gradient.addColorStop(0.0, "rgba(255,255,255,0.95)");
	gradient.addColorStop(0.16, "rgba(255,255,255,0.62)");
	gradient.addColorStop(0.42, "rgba(255,255,255,0.18)");
	gradient.addColorStop(0.72, "rgba(255,255,255,0.035)");
	gradient.addColorStop(1.0, "rgba(255,255,255,0)");

	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(64, 64, 58, 0, Math.PI * 2);
	ctx.fill();

	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	const material = new THREE.SpriteMaterial({
		map: texture,
		color,
		transparent: true,
		opacity,
		alphaTest: 0.025,
		depthWrite: false,
		depthTest: false,
		blending: THREE.AdditiveBlending
	});

	return new THREE.Sprite(material);
}

export function createHookTexture(THREE) {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 128;

	const ctx = canvas.getContext("2d");

	const gradient = ctx.createRadialGradient(64, 64, 3, 64, 64, 47);
	gradient.addColorStop(0, "rgba(255,255,255,1)");
	gradient.addColorStop(0.34, "rgba(230,241,250,0.66)");
	gradient.addColorStop(1, "rgba(230,241,250,0)");

	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(64, 64, 48, 0, Math.PI * 2);
	ctx.fill();

	ctx.strokeStyle = "rgba(255,255,255,0.88)";
	ctx.lineWidth = 2.0;
	ctx.beginPath();
	ctx.arc(64, 64, 23, 0, Math.PI * 2);
	ctx.stroke();

	ctx.fillStyle = "rgba(255,255,255,0.78)";
	ctx.beginPath();
	ctx.arc(64, 64, 7, 0, Math.PI * 2);
	ctx.fill();

	return new THREE.CanvasTexture(canvas);
}

export function createSoftMistTexture(THREE) {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 64;

	const ctx = canvas.getContext("2d");

	const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
	gradient.addColorStop(0, "rgba(255,255,255,0.88)");
	gradient.addColorStop(0.28, "rgba(255,255,255,0.40)");
	gradient.addColorStop(0.6, "rgba(255,255,255,0.09)");
	gradient.addColorStop(1, "rgba(255,255,255,0)");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 64, 64);

	return new THREE.CanvasTexture(canvas);
}

export function createSnowFlakeTexture(THREE) {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 128;

	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 128, 128);

	// Soft irregular base glow
	const base = ctx.createRadialGradient(64, 64, 0, 64, 64, 54);
	base.addColorStop(0.0, "rgba(255,255,255,0.82)");
	base.addColorStop(0.18, "rgba(255,255,255,0.48)");
	base.addColorStop(0.42, "rgba(255,255,255,0.16)");
	base.addColorStop(0.72, "rgba(255,255,255,0.045)");
	base.addColorStop(1.0, "rgba(255,255,255,0)");

	ctx.fillStyle = base;
	ctx.beginPath();
	ctx.ellipse(64, 64, 34, 46, -0.18, 0, Math.PI * 2);
	ctx.fill();

	// Secondary offset glow, makes it less perfectly circular
	const side = ctx.createRadialGradient(51, 56, 0, 51, 56, 36);
	side.addColorStop(0.0, "rgba(255,255,255,0.36)");
	side.addColorStop(0.36, "rgba(255,255,255,0.12)");
	side.addColorStop(1.0, "rgba(255,255,255,0)");

	ctx.fillStyle = side;
	ctx.beginPath();
	ctx.ellipse(52, 58, 24, 32, 0.45, 0, Math.PI * 2);
	ctx.fill();

	// A tiny bright core, not too strong
	const core = ctx.createRadialGradient(64, 64, 0, 64, 64, 14);
	core.addColorStop(0.0, "rgba(255,255,255,0.55)");
	core.addColorStop(0.55, "rgba(255,255,255,0.16)");
	core.addColorStop(1.0, "rgba(255,255,255,0)");

	ctx.fillStyle = core;
	ctx.beginPath();
	ctx.arc(64, 64, 14, 0, Math.PI * 2);
	ctx.fill();

	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	return texture;
}

export function createSnowCrystalTexture(THREE) {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 128;

	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 128, 128);

	ctx.save();
	ctx.translate(64, 64);
	ctx.rotate(-0.12);

	// soft outer glow
	const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
	glow.addColorStop(0.0, "rgba(255,255,255,0.48)");
	glow.addColorStop(0.22, "rgba(255,255,255,0.22)");
	glow.addColorStop(0.58, "rgba(255,255,255,0.055)");
	glow.addColorStop(1.0, "rgba(255,255,255,0)");

	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(0, 0, 58, 0, Math.PI * 2);
	ctx.fill();

	// snowflake arms
	ctx.strokeStyle = "rgba(255,255,255,0.86)";
	ctx.lineWidth = 5.2;
	ctx.lineCap = "round";

	for (let i = 0; i < 6; i++) {
		ctx.save();
		ctx.rotate((Math.PI * 2 * i) / 6);

		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, -42);
		ctx.stroke();

		// small branches
		ctx.lineWidth = 3.2;

		ctx.beginPath();
		ctx.moveTo(0, -24);
		ctx.lineTo(-10, -34);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, -24);
		ctx.lineTo(10, -34);
		ctx.stroke();

		ctx.restore();
	}

	// bright core
	const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
	core.addColorStop(0, "rgba(255,255,255,0.95)");
	core.addColorStop(0.55, "rgba(255,255,255,0.46)");
	core.addColorStop(1, "rgba(255,255,255,0)");

	ctx.fillStyle = core;
	ctx.beginPath();
	ctx.arc(0, 0, 10, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();

	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	return texture;
}