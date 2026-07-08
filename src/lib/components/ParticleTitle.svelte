<script>
	// @ts-nocheck

	import { onMount } from "svelte";

	let {
		text = "Tracce",
		variant = "default",
		ariaLabel = text
	} = $props();

	let wrap;
	let canvas;
	let ctx;

	let width = 0;
	let height = 0;
	let dpr = 1;

	let particles = [];
	let frame;
	let resizeObserver;
	let rebuildTimer;

	let mounted = false;
	let ready = $state(false);

	const pointer = {
		x: -9999,
		y: -9999,
		active: false
	};

	let settings = {
		rgb: "255,255,255",
		radius: 78,
		push: 0.42,
		returnForce: 0.09,
		friction: 0.86,
		dotSize: 0.95,
		opacity: 0.95,
		density: 3,

		cursorRadius: 92,
		cursorPush: 1.35,
		ringOpacity: 0.72,
		ringWidth: 1.4
	};

	function readNumber(value, fallback) {
		const number = Number.parseFloat(value);
		return Number.isFinite(number) ? number : fallback;
	}

	function readStyleNumber(style, name, fallback) {
		return readNumber(style.getPropertyValue(name), fallback);
	}

	function getTextSettings(style) {
		const fontSize = readNumber(style.fontSize, 96);
		const fontWeight = style.fontWeight || "400";

		let fontFamily = style.fontFamily || '"Americana"';
		let letterSpacing = readNumber(style.letterSpacing, fontSize * 0.08);

		if (style.letterSpacing === "normal") {
			letterSpacing = fontSize * 0.08;
		}

		return {
			fontSize,
			fontWeight,
			fontFamily,
			letterSpacing,
			offsetY: readStyleNumber(style, "--particle-title-offset-y", 0),
			align: style.getPropertyValue("--particle-title-align").trim() || "center",
			paddingX: readStyleNumber(style, "--particle-title-padding-x", 0)
		};
	}

	async function waitForFont(style) {
		if (!document.fonts) return;

		const textSettings = getTextSettings(style);
		const label = text || "Tracce";

		try {
			await document.fonts.load(
				`${textSettings.fontWeight} ${textSettings.fontSize}px "Americana"`,
				label
			);

			await document.fonts.ready;

			const isLoaded = document.fonts.check(
				`${textSettings.fontWeight} ${textSettings.fontSize}px "Americana"`,
				label
			);

			if (!isLoaded) {
				await new Promise((resolve) => setTimeout(resolve, 120));
			}
		} catch (error) {
			console.warn("Americana font loading skipped:", error);
		}
	}

	function createParticleSprite() {
		const sprite = document.createElement("canvas");
		sprite.width = 32;
		sprite.height = 32;

		const spriteCtx = sprite.getContext("2d");
		if (!spriteCtx) return null;

		const gradient = spriteCtx.createRadialGradient(16, 16, 0, 16, 16, 16);

		gradient.addColorStop(0.0, "rgba(255,255,255,1)");
		gradient.addColorStop(0.24, "rgba(255,255,255,0.86)");
		gradient.addColorStop(0.52, "rgba(255,255,255,0.32)");
		gradient.addColorStop(1.0, "rgba(255,255,255,0)");

		spriteCtx.fillStyle = gradient;
		spriteCtx.fillRect(0, 0, 32, 32);

		return sprite;
	}

	function drawTextToCanvas(targetCtx, targetWidth, targetHeight, pixelRatio, style) {
		const label = text || "";
		const chars = Array.from(label);

		const textSettings = getTextSettings(style);

		const fontSize = textSettings.fontSize * pixelRatio;
		const spacing = textSettings.letterSpacing * pixelRatio;
		const offsetY = textSettings.offsetY * pixelRatio;

		targetCtx.clearRect(0, 0, targetWidth, targetHeight);
		targetCtx.imageSmoothingEnabled = true;

		targetCtx.fillStyle = "#ffffff";
		targetCtx.textBaseline = "middle";
		targetCtx.textAlign = "left";
		targetCtx.font = `${textSettings.fontWeight} ${fontSize}px ${textSettings.fontFamily}`;

		const textWidth =
			chars.reduce((total, char) => total + targetCtx.measureText(char).width, 0) +
			spacing * Math.max(chars.length - 1, 0);

		let x = (targetWidth - textWidth) / 2;

		if (textSettings.align === "left") {
			x = textSettings.paddingX * pixelRatio;
		}

		if (textSettings.align === "right") {
			x = targetWidth - textWidth - textSettings.paddingX * pixelRatio;
		}

		const y = targetHeight / 2 + offsetY;

		for (const char of chars) {
			targetCtx.fillText(char, x, y);
			x += targetCtx.measureText(char).width + spacing;
		}
	}

	async function rebuildParticles() {
		if (!wrap || !canvas) return;

		ready = false;

		const rect = wrap.getBoundingClientRect();

		width = Math.max(1, rect.width);
		height = Math.max(1, rect.height);
		dpr = Math.min(window.devicePixelRatio || 1, 2);

		canvas.width = Math.ceil(width * dpr);
		canvas.height = Math.ceil(height * dpr);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		canvas.style.background = "transparent";

		ctx = canvas.getContext("2d", { alpha: true });
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.imageSmoothingEnabled = true;

		const style = getComputedStyle(wrap);

		settings = {
			rgb: style.getPropertyValue("--particle-title-rgb").trim() || "255,255,255",
			density: readStyleNumber(style, "--particle-title-density", 3),
			radius: readStyleNumber(style, "--particle-title-radius", 78),
			push: readStyleNumber(style, "--particle-title-push", 0.42),
			returnForce: readStyleNumber(style, "--particle-title-return", 0.09),
			friction: readStyleNumber(style, "--particle-title-friction", 0.86),
			dotSize: readStyleNumber(style, "--particle-title-dot-size", 1.18),
			opacity: readStyleNumber(style, "--particle-title-opacity", 1.05),

			cursorRadius: readStyleNumber(style, "--particle-title-cursor-radius", 92),
			cursorPush: readStyleNumber(style, "--particle-title-cursor-push", 1.35),
			ringOpacity: readStyleNumber(style, "--particle-title-ring-opacity", 0.72),
			ringWidth: readStyleNumber(style, "--particle-title-ring-width", 1.4)
		};

		await waitForFont(style);

		const offscreen = document.createElement("canvas");
		offscreen.width = canvas.width;
		offscreen.height = canvas.height;

		const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
		drawTextToCanvas(offCtx, offscreen.width, offscreen.height, dpr, style);

		const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
		const data = imageData.data;

		const scanGap = Math.max(2, Math.floor(1.65 * dpr));
		const candidates = [];
		const nextParticles = [];
		const sprite = createParticleSprite();

		for (let y = 0; y < offscreen.height; y += scanGap) {
			for (let x = 0; x < offscreen.width; x += scanGap) {
				const index = (y * offscreen.width + x) * 4;
				const alpha = data[index + 3];

				if (alpha > 42) {
					candidates.push({ x, y, alpha });
				}
			}
		}

		const particleLimit = Math.min(
			candidates.length,
			Math.floor(candidates.length * 0.72)
		);

		for (let i = 0; i < particleLimit; i++) {
			const point = candidates[Math.floor(Math.random() * candidates.length)];
			if (!point) continue;

			const targetX = point.x / dpr;
			const targetY = point.y / dpr;

			const alphaFactor = point.alpha / 255;
			const brightness = 0.96 + Math.random() * 0.08;

			nextParticles.push({
				x: targetX + (Math.random() - 0.5) * 1.6,
				y: targetY + (Math.random() - 0.5) * 1.3,
				tx: targetX,
				ty: targetY,
				vx: 0,
				vy: 0,
				size: settings.dotSize * (0.72 + Math.random() * 0.7),
				alphaBase: alphaFactor * (0.92 + Math.random() * 0.08),
				phase: Math.random() * Math.PI * 2,
				brightness,
				sprite
			});
		}

		particles = nextParticles;
		ready = true;
	}

	function scheduleRebuild() {
		if (!mounted) return;

		clearTimeout(rebuildTimer);

		rebuildTimer = setTimeout(() => {
			rebuildParticles();
		}, 60);
	}

	function animate(time = 0) {
		if (!ctx) {
			frame = requestAnimationFrame(animate);
			return;
		}

		ctx.clearRect(0, 0, width, height);

		for (const p of particles) {
			if (pointer.active) {
				const dx = p.x - pointer.x;
				const dy = p.y - pointer.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				const radius = settings.cursorRadius;

				if (distance < radius && distance > 0.001) {
					const force =
						Math.pow(1 - distance / radius, 2) *
						settings.cursorPush;

					p.vx += (dx / distance) * force;
					p.vy += (dy / distance) * force;
				}
			}

			p.vx += (p.tx - p.x) * settings.returnForce;
			p.vy += (p.ty - p.y) * settings.returnForce;

			p.vx *= settings.friction;
			p.vy *= settings.friction;

			p.x += p.vx + Math.sin(time * 0.0012 + p.phase) * 0.01;
			p.y += p.vy + Math.cos(time * 0.001 + p.phase) * 0.008;

			const flicker = 0.88 + Math.sin(time * 0.002 + p.phase) * 0.12;
			const alpha = settings.opacity * p.alphaBase * p.brightness * flicker;

			const movement = Math.min(Math.abs(p.vx) + Math.abs(p.vy), 7) / 7;
			const radius = p.size * (1 + movement * 0.18);

			ctx.globalAlpha = Math.min(1, alpha);

			if (p.sprite) {
				ctx.drawImage(
					p.sprite,
					p.x - radius,
					p.y - radius,
					radius * 2,
					radius * 2
				);
			} else {
				ctx.beginPath();
				ctx.fillStyle = `rgba(${settings.rgb}, ${alpha})`;
				ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.globalAlpha = 1;
		}

		frame = requestAnimationFrame(animate);
	}

	function handlePointerMove(event) {
		if (!wrap) return;

		const rect = wrap.getBoundingClientRect();

		pointer.x = event.clientX - rect.left;
		pointer.y = event.clientY - rect.top;
		pointer.active =
			pointer.x >= -settings.cursorRadius &&
			pointer.x <= rect.width + settings.cursorRadius &&
			pointer.y >= -settings.cursorRadius &&
			pointer.y <= rect.height + settings.cursorRadius;
	}

	function handlePointerLeave() {
		pointer.active = false;
		pointer.x = -9999;
		pointer.y = -9999;
	}

	onMount(() => {
		mounted = true;

		window.addEventListener("pointermove", handlePointerMove, { passive: true });
		window.addEventListener("pointerleave", handlePointerLeave);

		resizeObserver = new ResizeObserver(scheduleRebuild);
		resizeObserver.observe(wrap);

		rebuildParticles();
		frame = requestAnimationFrame(animate);

		return () => {
			mounted = false;

			clearTimeout(rebuildTimer);
			cancelAnimationFrame(frame);

			resizeObserver?.disconnect();

			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerleave", handlePointerLeave);
		};
	});

	$effect(() => {
		text;

		if (mounted) {
			ready = false;
			scheduleRebuild();
		}
	});
</script>

<div
	bind:this={wrap}
	class={`particle-title particle-title--${variant}`}
	class:is-ready={ready}
	aria-label={ariaLabel}
	role="img"
>
	<canvas bind:this={canvas} class="particle-title-canvas" aria-hidden="true"></canvas>
</div>

<style>
	.particle-title {
		position: relative;
		display: block;
		pointer-events: none;
		background: transparent !important;
		overflow: visible;
		opacity: 0;
		transition: opacity 0.35s ease;
	}

	.particle-title.is-ready {
		opacity: 1;
	}

	.particle-title-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
		background: transparent !important;
		mix-blend-mode: normal;
		image-rendering: auto;
	}
</style>
