<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import Intro from "$lib/components/Intro.svelte";
	import OverviewUI from "$lib/components/OverviewUI.svelte";
	import CategoryBar from "$lib/components/CategoryBar.svelte";
	import InfoPanel from "$lib/components/InfoPanel.svelte";
	import ChapterView from "$lib/components/ChapterView.svelte";
	import RitualHint from "$lib/components/RitualHint.svelte";

	import { initScene } from "$lib/three/initScene.js";

	let duomoInfoOpen = $state(false);

	function openDuomoInfo() {
		duomoInfoOpen = true;
		document.body.classList.add("duomo-info-active");

		window.dispatchEvent(new CustomEvent("tracce:duomo-info-open"));
	}

	function closeDuomoInfo() {
		duomoInfoOpen = false;
		document.body.classList.remove("duomo-info-active");

		window.dispatchEvent(new CustomEvent("tracce:duomo-info-close"));

		// also simulate clicking the global back-to-map control so the app returns to overview
		// this will trigger the existing handler attached to #backToMap in the scene init
		document.getElementById('backToMap')?.click();

		// fallback: ensure we navigate to the root map if the click handler is not present
		setTimeout(() => {
			try { goto('/'); } catch (e) { /* ignore */ }
		}, 60);
	}

	function goToAboutFromDuomo() {
		sessionStorage.setItem("tracce-about-return-view", "map");
		sessionStorage.removeItem("tracce-about-return-chapter");
	}

	onMount(() => {
		const cleanup = initScene();

		window.addEventListener("tracce:open-duomo-info", openDuomoInfo);

		return () => {
			window.removeEventListener("tracce:open-duomo-info", openDuomoInfo);
			document.body.classList.remove("duomo-info-active");

			if (cleanup) cleanup();
		};
	});
</script>

<div id="app">
	<canvas id="scene"></canvas>
	<div id="hotspotLayer" class="hotspot-layer"></div>

	<OverviewUI />

	<div class:site-ui-hidden={duomoInfoOpen}>
		<RitualHint />
		<Intro />
		<CategoryBar />
		<InfoPanel />
		<ChapterView />
	</div>

	{#if duomoInfoOpen}
		<section class="duomo-info-page" aria-label="Info progetto">
			<button
				class="duomo-info-close-hit"
				type="button"
				aria-label="Torna alla mappa"
				onclick={closeDuomoInfo}
			><h1 class="duomo-brand">Tracce</h1></button>

			<a
				class="duomo-info-about-hit"
				href="/about"
				aria-label="About"
				onclick={goToAboutFromDuomo}
			></a>

			<div class="duomo-info-copyright">
			© 2026 TRACCE
		</div>

			<div class="duomo-info-frame">
				<div class="duomo-info-image" aria-hidden="true"></div>

				<article class="duomo-info-copy">
					<h1>Dopo un grande evento,<br />qualcosa resta</h1>

					<p>
						Le Olimpiadi di Milano Cortina 2026 hanno racchiuso il territorio in
						una grande bolla, un tempo sospeso in cui la grandiosità della festa ha
						camminato fianco a fianco con la fragilità della quotidianità.
					</p>

					<p>
						Le voci che abbiamo raccolto rivelano una realtà dalle anime
						speculari, profondamente divisa tra la magia del palcoscenico mondiale
						e il peso dei suoi riflessi sulla vita di tutti i giorni.
					</p>

					<p>
						C’è chi in quella sospensione ha subito il labirinto delle strade
						bloccate, il silenzio dei trasporti interrotti e le porte sbarrate
						dell’Università Bicocca, vivendo il passaggio della fiaccola olimpica
						come un intralcio caotico che ha oscurato i bisogni dei residenti.
					</p>

					<p>
						Eppure, nello stesso identico istante, per molti quella bolla si è
						fatta orizzonte e promessa: una vetrina preziosa per i propri sogni
						commerciali, una palestra per mescolare lingue straniere e
						prospettive, una scintilla che ha riacceso l’entusiasmo e il valore
						dello sport nei più giovani.
						Questo sito vuole essere il custode di un simile mosaico umano, un
						racconto sincero dove il disagio e il riscatto convivono, restituendo
						la verità profonda di un evento che ha cambiato per sempre il respiro
						della nostra comunità.
					</p>
				</article>
			</div>
		</section>
	{/if}
</div>

<style>
	.duomo-info-page {
		position: fixed;
		inset: 0;
		z-index: 220;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 80px;

		color: rgba(255, 255, 255, 0.94);

		background: rgba(3, 8, 14, 0.34);

		backdrop-filter: none;
		-webkit-backdrop-filter: none;

		animation: duomoInfoFadeIn 0.42s ease both;
	}

	.duomo-info-close-hit {
			position: fixed;
			left: var(--ui-padding-x, 36px);
			top: 28px;
			z-index: 260;

			/* override global button styles so we can show a large brand-like title */
			min-width: 0;
			width: auto;
			height: auto;
			padding: 0 6px;
			border: none !important;
			background: transparent !important;
			box-shadow: none !important;
			backdrop-filter: none !important;
			pointer-events: auto;

			cursor: pointer;
		}

	.duomo-info-close-hit .duomo-brand {
		margin: 0;
		font-family: 'Americana', var(--font-title);
		font-size: 32px;
		font-weight: 400;
		letter-spacing: 0.04em;
		line-height: 0.9;
		color: #f2f5f7;
		opacity: 1;
		text-shadow: 0 0 22px rgba(242, 245, 247, 0.06);
		-webkit-font-smoothing: antialiased;
		font-synthesis: none;
	}

	.duomo-info-about-hit {
		position: fixed;
		right: var(--ui-padding-x, 40px);
		top: 0;
		z-index: 260;

		width: 120px;
		height: var(--ui-header-height, 88px);

		display: block;

		background: transparent;
		border: none;
		box-shadow: none;
		text-decoration: none;

		cursor: pointer;
	}

	/* 这个 frame 只负责排版，不再显示方框 */
	.duomo-info-frame {
		position: relative;

		width: min(1120px, calc(100vw - 160px));
		height: min(560px, calc(100vh - 160px));

		display: flex;
		align-items: center;

		padding: 0;
		overflow: visible;

		background: transparent;
		border: none;
		box-shadow: none;

		animation: duomoInfoZoomIn 0.52s cubic-bezier(0.18, 0.84, 0.24, 1) both;
	}

	/* 文字按原本方框宽度重新摆，不显示方框 */
	.duomo-info-copy {
		position: relative;
		z-index: 2;

		width: min(720px, 68%);
		margin-left: clamp(160px, 17vw, 230px);

		-webkit-font-smoothing: antialiased;
		font-synthesis: none;
	}

	.duomo-info-copy h1 {
		margin: 0 0 44px;

		font-family: var(--font-title);
		font-size: clamp(50px, 4.7vw, 68px);
		font-weight: 400;
		line-height: 0.98;
		letter-spacing: -0.035em;

		color: rgba(255, 255, 255, 0.96);
	}

	.duomo-info-copy p {
		margin: 0 0 22px;

		font-family: var(--font-light);
		font-size: clamp(17px, 1.25vw, 23px);
		font-style: italic;
		font-weight: 300;
		line-height: 1.16;

		color: rgba(255, 255, 255, 0.88);
	}

	.duomo-info-copy p:last-child {
			margin-bottom: 0;
		}

		.site-ui-hidden {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.duomo-info-copyright {
		position: fixed;
		left: var(--ui-padding-x);
		bottom: var(--ui-bottom-icon-offset);

		height: var(--icon-button-size);

		z-index: 240;
		pointer-events: none;

		display: flex;
		align-items: center;
		justify-content: flex-start;

		font-family: var(--font-medium);
		font-size: 14px;
		font-weight: 400;
		line-height: 1;
		letter-spacing: 0.08em;
		text-transform: uppercase;

		color: rgba(255, 255, 255, 0.46);

		-webkit-font-smoothing: antialiased;
		font-synthesis: none;
	}

	:global(body.duomo-info-active .category-bar),
	:global(body.duomo-info-active .category-item),
	:global(body.duomo-info-active .category-hover-overlay) {
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}

	/* hide the top-left brand/logo while duomo info is active to avoid duplicate 'Tracce' text */
	:global(body.duomo-info-active .ui.top-left) {
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}
	:global(body.chapter-active .category-hover-overlay),
	:global(body.chapter-active .hotspot-layer),
	:global(body.chapter-active .hotspot-btn),
	:global(body.chapter-active .duomo-hover-btn) {
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}

	@keyframes duomoInfoFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes duomoInfoZoomIn {
		from {
			opacity: 0;
			transform: scale(0.94) translateY(12px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	:global(body.duomo-info-active) {
		overflow: hidden;
	}

	@media (max-width: 760px) {
		.duomo-info-page {
			padding: 90px 28px 40px;
			align-items: flex-start;
		}

		.duomo-info-frame {
			width: 100%;
			height: auto;
			min-height: calc(100vh - 140px);
		}

		.duomo-info-image {
			width: 100%;
			opacity: 0.28;
		}

		.duomo-info-copy {
			width: 100%;
			margin-left: 0;
		}

		.duomo-info-copy h1 {
			font-size: 42px;
		}

		.duomo-info-copy p {
			font-size: 16px;
			line-height: 1.28;
		}
	}
</style>