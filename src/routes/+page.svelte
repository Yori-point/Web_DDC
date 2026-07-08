<script>
	import { onMount } from "svelte";

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
	}

	function closeDuomoInfo() {
		duomoInfoOpen = false;
		document.body.classList.remove("duomo-info-active");
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

	<RitualHint />
	<Intro />
	<OverviewUI />
	<CategoryBar />
	<InfoPanel />
	<ChapterView />

	{#if duomoInfoOpen}
		<section class="duomo-info-page" aria-label="Info progetto">
			<button class="duomo-info-brand" type="button" onclick={closeDuomoInfo}>
				Tracce
			</button>

			<a class="duomo-info-about" href="/about">
				ABOUT
			</a>

			<div class="duomo-info-copyright">
				© 2026 TRACCE
			</div>

			<div class="duomo-info-frame">
				<div class="duomo-info-image" aria-hidden="true"></div>

				<article class="duomo-info-copy">
					<h1>Dopo un grande evento,<br />qualcosa resta</h1>

					<p>
						<em>“Tracce”</em> nasce per raccogliere ciò che le Olimpiadi
						Milano-Cortina 2026 lasciano dietro di sé quando i riflettori si
						spengono: non il bilancio ufficiale, ma la memoria di chi li ha
						vissuti da vicino. Volontari, cittadini, lavoratori e spettatori
						intrecciano voci diverse, fatte di celebrazione e critica, di
						cambiamento e attesa.
					</p>

					<p>
						La raccolta delle testimonianze si è svolta a Milano e nelle zone
						limitrofe, un territorio che, pur restando ai margini delle gare vere
						e proprie, è stato punto nevralgico di tutte quelle attività
						collaterali che hanno alimentato l’atmosfera olimpica: un tessuto
						informale di vita quotidiana attorno all’evento, spesso invisibile
						nei racconti ufficiali.
					</p>

					<p>
						Ogni testimonianza si deposita come una particella. Ogni particella
						lascia una traccia. Insieme, compongono una mappa che non si legge in
						linea retta, ma si attraversa senza un ordine imposto. Dentro questo
						spazio nascono cinque territori che raccolgono i sentimenti
						principali emersi dalle testimonianze: Celebrazioni, Problemi,
						Relazioni, Cambiamento e Opportunità.
					</p>

					<p>
						Il sito raccoglie ciò che continua a muoversi nella memoria
						quotidiana, molto tempo dopo che i Giochi sono finiti.<br />
						Non una mappa da leggere, ma uno spazio da attraversare.
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
	background:
		radial-gradient(circle at 45% 42%, rgba(170, 190, 210, 0.08), transparent 38%),
		rgba(3, 8, 14, 0.86);

	backdrop-filter: blur(2px);
	-webkit-backdrop-filter: blur(2px);

	animation: duomoInfoFadeIn 0.42s ease both;
}

/* 左上角 Tracce */
.duomo-info-brand {
	position: fixed;
	left: var(--ui-padding-x, 36px);
	top: 34px;
	z-index: 240;

	padding: 0;
	border: none;
	background: transparent;

	font-family: var(--font-title);
	font-size: 44px;
	font-weight: 400;
	line-height: 1;
	letter-spacing: 0.01em;

	color: rgba(255, 255, 255, 0.92);
	cursor: pointer;

	-webkit-font-smoothing: antialiased;
	font-synthesis: none;

	transition:
		opacity 0.28s ease,
		transform 0.28s ease;
}

.duomo-info-brand:hover {
	opacity: 1;
	transform: translateX(-2px);
}

/* 右上角 ABOUT */
.duomo-info-about {
	position: fixed;
	right: var(--ui-padding-x, 36px);
	top: 42px;
	z-index: 240;

	font-family: var(--font-medium);
	font-size: 18px;
	font-weight: 400;
	line-height: 1;
	letter-spacing: 0.04em;
	text-transform: uppercase;

	color: rgba(255, 255, 255, 0.68);
	text-decoration: none;

	-webkit-font-smoothing: antialiased;
	font-synthesis: none;

	transition:
		opacity 0.28s ease,
		color 0.28s ease;
}

.duomo-info-about:hover {
	color: rgba(255, 255, 255, 0.94);
}

/* 左下角 copyright */
.duomo-info-copyright {
	position: fixed;
	left: var(--ui-padding-x, 36px);
	bottom: var(--ui-bottom-icon-offset, 34px);
	z-index: 240;

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

/* 竖向暗格背景，接近 Figma */
.duomo-info-frame::before {
	content: "";
	position: absolute;
	inset: 0;
	z-index: 0;

	background:
		linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 0,
			rgba(255, 255, 255, 0.04) 56px,
			rgba(0, 0, 0, 0.18) 56px,
			rgba(0, 0, 0, 0.18) 80px
		);

	opacity: 0.62;
	pointer-events: none;
}

/* 左侧山的暗影区域 */
.duomo-info-image {
	position: absolute;
	left: 0;
	bottom: -12px;
	width: 38%;
	height: 100%;
	z-index: 1;

	background:
		linear-gradient(90deg, rgba(4, 10, 18, 0.04), rgba(4, 10, 18, 0.68)),
		radial-gradient(circle at 30% 50%, rgba(200, 220, 235, 0.18), transparent 44%);

	opacity: 0.7;
	filter: blur(0.2px);
}

/* 文字按原本方框宽度重新摆，不显示方框 */
.duomo-info-copy {
	position: relative;
	z-index: 2;

	width: min(720px, 68%);
	margin-left: clamp(210px, 22vw, 280px);

	-webkit-font-smoothing: antialiased;
	font-synthesis: none;
}

.duomo-info-copy h1 {
	margin: 0 0 32px;

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

/* 打开 Duomo info 时，隐藏底部 category，避免和页面混在一起 */
:global(body.duomo-info-active .category-bar),
:global(body.duomo-info-active .corner-copyright),
:global(body.duomo-info-active .music-control) {
	opacity: 0 !important;
	visibility: hidden !important;
	pointer-events: none !important;
}

@media (max-width: 760px) {
	.duomo-info-page {
		padding: 90px 28px 40px;
		align-items: flex-start;
	}

	.duomo-info-brand {
		top: 30px;
		font-size: 34px;
	}

	.duomo-info-about {
		top: 38px;
		font-size: 15px;
	}

	.duomo-info-frame {
		width: 100%;
		height: auto;
		min-height: calc(100vh - 140px);
	}

	.duomo-info-frame::before {
		background:
			linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.035) 0,
				rgba(255, 255, 255, 0.035) 44px,
				rgba(0, 0, 0, 0.16) 44px,
				rgba(0, 0, 0, 0.16) 64px
			);
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

	@media (max-width: 760px) {
		.duomo-info-page {
			padding: 72px 22px 28px;
			align-items: flex-start;
		}

		.duomo-info-frame {
			width: 100%;
			height: auto;
			min-height: calc(100vh - 120px);
			padding: 42px 28px;
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
	}
</style>