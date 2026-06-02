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

export function createIntroButtonBackgroundDataUrl(color = "#F2F5F7") {
	const canvas = document.createElement("canvas");
	const size = 200;
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext("2d");
	const center = size / 2;
	const innerRadius = size * 0.32;

	ctx.clearRect(0, 0, size, size);

	const innerGradient = ctx.createRadialGradient(center, center, innerRadius * 0.08, center, center, innerRadius);
	innerGradient.addColorStop(0, "rgba(255,255,255,1)");
	innerGradient.addColorStop(0.24, "rgba(255,255,255,0.95)");
	innerGradient.addColorStop(0.42, "rgba(242,245,247,0.82)");
	innerGradient.addColorStop(0.72, "rgba(242,245,247,0.4)");
	innerGradient.addColorStop(1, "rgba(242,245,247,0.08)");

	ctx.fillStyle = innerGradient;
	ctx.beginPath();
	ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
	ctx.fill();

	ctx.strokeStyle = "rgba(255,255,255,0.8)";
	ctx.lineWidth = size * 0.015;
	ctx.beginPath();
	ctx.arc(center, center, innerRadius * 0.55, 0, Math.PI * 2);
	ctx.stroke();

	ctx.fillStyle = "rgba(255,255,255,0.76)";
	ctx.beginPath();
	ctx.arc(center, center, size * 0.035, 0, Math.PI * 2);
	ctx.fill();

	return canvas.toDataURL();
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

	const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 58);
	gradient.addColorStop(0.0, "rgba(255,255,255,0.95)");
	gradient.addColorStop(0.18, "rgba(255,255,255,0.62)");
	gradient.addColorStop(0.45, "rgba(255,255,255,0.18)");
	gradient.addColorStop(1.0, "rgba(255,255,255,0)");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 128, 128);

	return new THREE.CanvasTexture(canvas);
}