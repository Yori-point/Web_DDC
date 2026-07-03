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
		density: 3
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

	function drawTextToCanvas(targetCtx, targetWidth, targetHeight, pixelRatio, style) {
		const label = text || "";
		const chars = Array.from(label);

		const textSettings = getTextSettings(style);

		const fontSize = textSettings.fontSize * pixelRatio;
		const spacing = textSettings.letterSpacing * pixelRatio;
		const offsetY = textSettings.offsetY * pixelRatio;

		targetCtx.clearRect(0, 0, targetWidth, targetHeight);
		targetCtx.imageSmoothingEnabled = false;

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
		ctx.imageSmoothingEnabled = false;

		const style = getComputedStyle(wrap);

		settings = {
			rgb: style.getPropertyValue("--particle-title-rgb").trim() || "242,245,247",
			density: readStyleNumber(style, "--particle-title-density", 3),
			radius: readStyleNumber(style, "--particle-title-radius", 78),
			push: readStyleNumber(style, "--particle-title-push", 0.42),
			returnForce: readStyleNumber(style, "--particle-title-return", 0.09),
			friction: readStyleNumber(style, "--particle-title-friction", 0.86),
			dotSize: readStyleNumber(style, "--particle-title-dot-size", 0.95),
			opacity: readStyleNumber(style, "--particle-title-opacity", 0.95)
		};

		await waitForFont(style);

		const offscreen = document.createElement("canvas");
		offscreen.width = canvas.width;
		offscreen.height = canvas.height;

		const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
		drawTextToCanvas(offCtx, offscreen.width, offscreen.height, dpr, style);

		const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
		const data = imageData.data;

		const step = Math.max(2, Math.round(settings.density * dpr));
		const nextParticles = [];

		for (let y = 0; y < offscreen.height; y += step) {
			for (let x = 0; x < offscreen.width; x += step) {
				const index = (y * offscreen.width + x) * 4;
				const alpha = data[index + 3];

				if (alpha > 80) {
					const targetX = x / dpr;
					const targetY = y / dpr;

					const brightness = 0.72 + Math.random() * 0.28;

					nextParticles.push({
						x: targetX + (Math.random() - 0.5) * 1.2,
						y: targetY + (Math.random() - 0.5) * 1.2,
						tx: targetX,
						ty: targetY,
						vx: 0,
						vy: 0,
						size: settings.dotSize * (0.75 + Math.random() * 0.55),
						phase: Math.random() * Math.PI * 2,
						brightness
					});
				}
			}
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
				const radius = settings.radius;

				if (distance < radius && distance > 0.001) {
					const force = (1 - distance / radius) * settings.push;

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

			const flicker = 0.9 + Math.sin(time * 0.002 + p.phase) * 0.1;
			const alpha = settings.opacity * p.brightness * flicker;

			ctx.beginPath();
			ctx.fillStyle = `rgba(${settings.rgb}, ${alpha})`;
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.fill();
		}

		frame = requestAnimationFrame(animate);
	}

	function handlePointerMove(event) {
		if (!wrap) return;

		const rect = wrap.getBoundingClientRect();

		pointer.x = event.clientX - rect.left;
		pointer.y = event.clientY - rect.top;
		pointer.active =
			pointer.x >= -90 &&
			pointer.x <= rect.width + 90 &&
			pointer.y >= -90 &&
			pointer.y <= rect.height + 90;
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