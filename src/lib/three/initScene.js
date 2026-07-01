// @ts-nocheck

import { CHAPTERS } from "$lib/data/chapters.js";
import { legacyAreas, hookHeightByKey } from "$lib/data/legacyAreas.js";
import { createInterviewsByCategory } from "$lib/data/interviews.js";

import { bindInfoPanel } from "$lib/ui/panel.js";

import {
	updateChapterCopy,
	showChapterContainer,
	hideChapterContainer,
	clearChapterState
} from "$lib/ui/chapter.js";

import {
	updateCategoryProgressItem,
	updateOverallProgressText
} from "$lib/ui/progress.js";

import {
	openMediaPanel,
	bindMediaPanelClose
} from "$lib/ui/mediaPanel.js";

import {
	renderInterviewNodes as renderInterviewNodeList,
	updateInterviewPan
} from "$lib/ui/interviewNodes.js";

import { bindCategoryBar } from "$lib/ui/categoryBar.js";

import {
	createHotspotButtons as createHotspotButtonList,
	updateHotspotButtonPositions
} from "$lib/ui/hotspots.js";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import {
	createGlowSprite,
	createHookTexture,
	createSoftMistTexture,
	createSnowFlakeTexture,
  createSnowCrystalTexture
} from "$lib/three/textures.js";

import {
	updateCamera as updateCameraController,
	updateOverviewCameraByPointer as updateOverviewCameraByPointerController,
} from "$lib/three/cameraController.js";

import {
	createSceneSetup,
	resizeScene
} from "$lib/three/sceneSetup.js";

import { setMapSceneOpacity as setMapSceneOpacityController } from "$lib/three/mapOpacity.js";
import { loadUnifiedMapModel } from "$lib/three/mapModel.js";

import {
	createSnowParticles,
	createForegroundSnowParticles,
	animateSnowParticles,
	animateForegroundSnowParticles
} from "$lib/three/particles/snow.js";

import {
	createCursorSnowTrail,
	emitCursorSnowTrail,
	animateCursorSnowTrail
} from "$lib/three/particles/cursorSnow.js";

import {
	createIntroParticleRings as createIntroParticleRingsModule,
	updateIntroRingTargetsFromCurrentHotspots as updateIntroRingTargetsModule,
	createRitualForegroundSnow as createRitualForegroundSnowModule,
  animateIntroRings as animateIntroRingsModule,
	animateRitualSnow as animateRitualSnowModule
} from "$lib/three/particles/ritual.js";

import {
	createChapterCloudParticles,
	animateChapterCloudParticles
} from "$lib/three/particles/chapterCloud.js";

import {
	createLegendHelperDots as createLegendHelperDotsModule,
	createLegacyHooks as createLegacyHooksModule,
	animateHooks as animateHooksModule,
	applyMarkerHoverVisual as applyMarkerHoverVisualModule
} from "$lib/three/particles/hooks.js";

import {
	makePoints as makePointsModule,
	createDenseMapPointsFromMesh as createDenseMapPointsFromMeshModule,
	createTerrainBaseParticlesFromMesh as createTerrainBaseParticlesFromMeshModule,
	createDuomoParticlesFromMesh as createDuomoParticlesFromMeshModule,
	createMountainParticlesFromMesh as createMountainParticlesFromMeshModule
} from "$lib/three/particles/mapParticles.js";

import {
	createSummitParticles,
	placeSummitParticlesAtMountain,
	resetSummitParticles,
	updateSummitParticlesTransition,
  animateSummitParticles
} from "$lib/three/particles/summitParticles.js";

import { startAnimationLoop } from "$lib/three/animationLoop.js";
  
export function initScene() {
	console.log("Olympic Tracce scene started");

	const BG_COLOR = 0x070e17;

	const shouldOpenMapFromAbout =
		sessionStorage.getItem("tracce-open-map") === "1";

	sessionStorage.removeItem("tracce-open-map");

	document.body.classList.remove(
		"intro-active",
		"overview-active",
		"chapter-active",
		"ritual-active",
		"is-transitioning",
		"category-menu-open"
	);

	if (shouldOpenMapFromAbout) {
		document.body.classList.add("overview-active");
	} else {
		document.body.classList.add("intro-active");
	}

  const canvas = document.getElementById('scene');

  if (!canvas) {
	console.error("Missing #scene canvas.");
	return;
  }

  const cleanupInfoPanel = bindInfoPanel();
  const cleanupMediaPanel = bindMediaPanelClose();
  const cleanupCategoryBar = bindCategoryBar({
    legacyAreas,
    hookHeightByKey,
    onSelectCategory: (area) => {
      startChapterTransition({
        id: area.id,
        key: area.key,
        title: area.title,
        text: area.text,
        pos: new THREE.Vector3(
          area.x,
          hookHeightByKey[area.key] || 9.5,
          area.z
        )
      });
    },
    onHoverCategory: (key) => {
      appState.hoverHookObject = findHookByKey(key);
      window.showCategoryHoverByKey?.(key);
      syncCategoryHoverUI();
    },
    onLeaveCategory: () => {
      if (appState.view === "overview") {
        appState.hoverHookObject = null;
        window.hideCategoryHoverText?.();
        syncCategoryHoverUI();
      }
    }
  });

  const {
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
  } = createSceneSetup({
    THREE,
    canvas,
    bgColor: BG_COLOR
  });

  const appState = {
    view: 'intro',
    transitionStart: 0,
    transitionDuration: 2.1,
    targetChapter: null,

    summitImmerseStart: 0,
    summitImmerseDuration: 0.8,

    hoverHookObject: null,

    ritualStartTime: 0,
    ritualScrollProgress: 0,
    ritualPointerX: 0,
    ritualPointerY: 0,
    ritualPointerTargetX: 0,
    ritualPointerTargetY: 0,
    overviewPointerX: 0,
    overviewPointerY: 0,
    overviewPointerTargetX: 0,
    overviewPointerTargetY: 0,
    summitPanCurrent: 0,
    summitPanTarget: 0,

    cameraStart: new THREE.Vector3(),
    cameraMid: new THREE.Vector3(),
    cameraEnd: new THREE.Vector3(),
    targetStart: new THREE.Vector3(),
    targetMid: new THREE.Vector3(),
    targetEnd: new THREE.Vector3()
  };

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  const WORLD = {
    width: 96,
    depth: 58,
    particleCount: 76000,
    networkCount: 620,
    snowCount: 8400,
    maxTry: 220000
  };

  const COLORS = {
  white: new THREE.Color(0xffffff),
  snow: new THREE.Color(0xffffff),
  ice: new THREE.Color(0xffffff),
  blue: new THREE.Color(0x303840),
  deep: new THREE.Color(0x303840),
  memory: new THREE.Color(0xffffff),
  dim: new THREE.Color(0x303840),
  dark: new THREE.Color(0x2A3F56)
  };

  function getLegacyArea(key) {
    return legacyAreas.find(area => area.key === key);
  }

  function getLegacyPoint(key) {
    const area = getLegacyArea(key);

    if (!area) {
      return { x: 0, y: 9.5, z: 0 };
    }

    return {
      x: area.x,
      y: hookHeightByKey[key] || 9.5,
      z: area.z
    };
  }

  function getKeyFromName(name) {
    const n = name.toLowerCase();

    if (n.includes('festa')) return 'festa';
    if (n.includes('opportunita')) return 'opportunita';
    if (n.includes('trasformazione')) return 'trasformazione';
    if (n.includes('criticita')) return 'criticita';
    if (n.includes('relazioni')) return 'relazioni';

    return null;
  }

  function updateLegacyAreaFromObject(obj) {
    const key = getKeyFromName(obj.name);
    if (!key) return;

    const area = getLegacyArea(key);
    if (!area) return;

    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);

    area.x = worldPos.x;
    area.z = worldPos.z;
    hookHeightByKey[key] = worldPos.y;

    console.log('Hotspot updated from GLB:', key, worldPos);
  }

  function applyMarkerHoverVisual() {
    applyMarkerHoverVisualModule({
      THREE,
      BG_COLOR,
      scene,
      ambientLight,
      keyLight,
      violetBackLight,
      animatedObjects,
      appState
    });

    syncCategoryHoverUI();
  }

  const MAP_FINAL_CAMERA = {
  yaw: 4.0, //地图视角
  pitch: 0.26,
  radius: 66,
  target: new THREE.Vector3(0.4, 2.1, 1.2)
};

const orbit = {
  yaw: MAP_FINAL_CAMERA.yaw,
  pitch: MAP_FINAL_CAMERA.pitch,
  radius: MAP_FINAL_CAMERA.radius,
  target: MAP_FINAL_CAMERA.target.clone()
};

const OVERVIEW_CAMERA = {
  yaw: MAP_FINAL_CAMERA.yaw,
  pitch: MAP_FINAL_CAMERA.pitch,
  radius: MAP_FINAL_CAMERA.radius,
  target: MAP_FINAL_CAMERA.target.clone(),

  maxYawOffset: THREE.MathUtils.degToRad(18),
  maxPitchOffset: THREE.MathUtils.degToRad(6)
};

const RITUAL_CAMERA = {
  // 五环阶段用正视角，不沿用地图斜视角
  yaw: 0,
  pitch: 0.26,
  radius: 66,
  target: new THREE.Vector3(0, 4.2, 0)
};

  function updateCamera() {
    updateCameraController({
      THREE,
      camera,
      orbit
    });
  }

  function updateOverviewCameraByPointer() {
    updateOverviewCameraByPointerController({
      THREE,
      appState,
      orbit,
      overviewCamera: OVERVIEW_CAMERA,
      updateCameraFn: updateCamera
    });
  }

  function smoothstep(edge0, edge1, x) {
      const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
  }

  function makePoints(name, positions, colors, size, opacity) {
    return makePointsModule({
      THREE,
      scene,
      name,
      positions,
      colors,
      size,
      opacity
    });
  }

  const animatedObjects = {
    terrain: null,
    terrainBase: null,
    terrainPhase: null,
    terrainAmp: null,
    mountainParticles: [],
    snow: null,
    snowBase: null,
    snowPhase: null,
    snowAmp: null,
    foregroundSnow: null,
    foregroundSnowBase: null,
    foregroundSnowPhase: null,
    foregroundSnowAmp: null,
    hooks: [],
    pulseLines: [],

    introRings: null,
    introRingsBase: null,
    introRingsPhase: null,
    introRingsAmp: null,
    introRingsCountPerRing: 0,
    introRingsTargets: null,

    ritualSnowFine: null,
    ritualSnowFineBase: null,
    ritualSnowFinePhase: null,
    ritualSnowFineAmp: null,
    ritualSnowLarge: null,
    ritualSnowLargeBase: null,
    ritualSnowLargePhase: null,
    ritualSnowLargeAmp: null,

    chapterCloud: null,
    chapterBase: null,
    chapterPhase: null,
    chapterAmp: null,

    // GLB summit scene shown after zooming into a mountain.
    summitScene: null,
    summitModel: null,
    summitModelRoot: null,
    summitModelMaterials: [],
    summitModelReady: false,

    cursorSnow: null,
    cursorSnowLife: null,
    cursorSnowVelocity: null,
    cursorSnowIndex: 0,
    cursorSnowLastEmit: 0
  };

  function createLegacyHooks() {
    createLegacyHooksModule({
      THREE,
      legacyAreas,
      hookHeightByKey,
      mapSceneGroup,
      animatedObjects,
      createHookTexture
    });
  }

  function createSnow() {
    createSnowParticles({
      THREE,
      WORLD,
      mapSceneGroup: scene,
      animatedObjects,
      createSnowFlakeTexture,
      createSnowCrystalTexture
    });
  }

  function createForegroundSnow() {
    createForegroundSnowParticles({
      THREE,
      mapSceneGroup: scene,
      animatedObjects,
      createSnowFlakeTexture,
      createSnowCrystalTexture
    });
  }

  function createCursorSnow() {
    createCursorSnowTrail({
      THREE,
      scene,
      camera,
      animatedObjects,
      createSnowFlakeTexture,
      createSnowCrystalTexture
    });
  }

  function createChapterCloud() {
    createChapterCloudParticles({
      THREE,
      animatedObjects,
      COLORS,
      makePoints
    });
  }

  function createSummitScene() {
    createSummitParticles({
      THREE,
      scene,
      animatedObjects,
      makePoints
    });
  }

  function createIntroParticleRings() {
    createIntroParticleRingsModule({
      THREE,
      scene,
      animatedObjects,
      createSoftMistTexture,
      getLegacyPoint
    });
  }

  function updateIntroRingTargetsFromCurrentHotspots() {
    updateIntroRingTargetsModule({
      animatedObjects,
      getLegacyPoint
    });
  }

  function createRitualForegroundSnow() {
    createRitualForegroundSnowModule({
      THREE,
      scene,
      animatedObjects,
      createSoftMistTexture
    });
  }

  function createLegendHelperDots() {
    createLegendHelperDotsModule({
      THREE,
      legacyAreas,
      hookHeightByKey,
      mapSceneGroup,
      createGlowSprite
    });
  }

  function createDenseMapPointsFromMesh(mesh, count = 32000) {
    return createDenseMapPointsFromMeshModule({
      THREE,
      mesh,
      count,
      mapSceneGroup,
      createSoftMistTexture
    });
  }

  function createTerrainBaseParticlesFromMesh(mesh, count = 90000) {
    return createTerrainBaseParticlesFromMeshModule({
      THREE,
      mesh,
      count,
      mapSceneGroup,
      createSoftMistTexture
    });
  }

  function createDuomoParticlesFromMesh(mesh, count = 18000) {
    return createDuomoParticlesFromMeshModule({
      THREE,
      mesh,
      count,
      mapSceneGroup,
      createSoftMistTexture
    });
  }

  function createMountainParticlesFromMesh(mesh, count = 18000, categoryKey = null) {
    return createMountainParticlesFromMeshModule({
      THREE,
      mesh,
      count,
      categoryKey,
      mapSceneGroup,
      animatedObjects,
      createSoftMistTexture,
      getLegacyArea
    });
  }

  function createUnifiedMapModel() {
    loadUnifiedMapModel({
      THREE,
      GLTFLoader,
      bgColor: BG_COLOR,
      mapSceneGroup,
      onUpdateLegacyAreaFromObject: updateLegacyAreaFromObject,
      onCreateLegendHelperDots: createLegendHelperDots,
      onCreateLegacyHooks: createLegacyHooks,
      onCreateHotspotButtons: createHotspotButtons,
      onCreateMountainParticlesFromMesh: createMountainParticlesFromMesh,
      onCreateDenseMapPointsFromMesh: createDenseMapPointsFromMesh,
      onCreateTerrainBaseParticlesFromMesh: createTerrainBaseParticlesFromMesh,
      onCreateDuomoParticlesFromMesh: createDuomoParticlesFromMesh,
      getKeyFromName
    });
  }

  function createWorld() {
    createUnifiedMapModel();

    createSnow();
    createForegroundSnow();
    createCursorSnow();
    
    createIntroParticleRings();
    createRitualForegroundSnow();
    createChapterCloud();
    createSummitScene();

    // Intro 阶段隐藏地图，只保留全局雪花背景
    mapSceneGroup.visible = false;
  }

  createWorld();

  if (shouldOpenMapFromAbout) {
    document.getElementById("intro")?.classList.add("hidden");
    returnToOverview();
  }

  function setMapSceneOpacity(progress) {
    setMapSceneOpacityController({
      THREE,
      mapSceneGroup,
      progress
    });
  }

  const backToMap = document.getElementById('backToMap');

  const INTERVIEWS_BY_CATEGORY = createInterviewsByCategory(CHAPTERS);

  const SUMMIT_TITLE_LABELS = {
    festa: "Celebrazioni",
    opportunita: "Opportunità",
    trasformazione: "Cambiamento",
    criticita: "Problemi",
    relazioni: "Relazioni"
  };

  const summitTitleParticles = {
    canvas: null,
    ctx: null,
    text: "",
    particles: [],
    mouseX: -9999,
    mouseY: -9999,
    active: false,
    raf: null,
    dpr: 1,
    sprite: null
  };

  function getSummitDisplayTitle(chapter) {
    return SUMMIT_TITLE_LABELS[chapter.key] || chapter.title || chapter.key || "";
  }

  function createSummitTitleParticleSprite() {
    const sprite = document.createElement("canvas");
    sprite.width = 64;
    sprite.height = 64;

    const ctx = sprite.getContext("2d");
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

    gradient.addColorStop(0.0, "rgba(242,245,247,0.82)");
    gradient.addColorStop(0.22, "rgba(210,226,238,0.36)");
    gradient.addColorStop(0.52, "rgba(170,198,220,0.10)");
    gradient.addColorStop(1.0, "rgba(170,198,220,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return sprite;
  }

  function randSpread(value) {
    return (Math.random() - 0.5) * value;
  }

  function setupSummitParticleTitle(text) {
    const canvas = document.getElementById("summitTitleCanvas");
    const title = document.getElementById("summitTitleText");

    if (!canvas || !title) return;

    title.textContent = text;
    title.dataset.text = text;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    summitTitleParticles.canvas = canvas;
    summitTitleParticles.ctx = ctx;
    summitTitleParticles.text = text;
    summitTitleParticles.particles = [];
    summitTitleParticles.dpr = dpr;
    summitTitleParticles.sprite = null;

    const offscreen = document.createElement("canvas");
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;

    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    const fontSize = Math.min(canvas.width * 0.12, canvas.height * 0.54);

    offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
    offCtx.fillStyle = "white";
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";

    // 如果你的 @font-face 名字叫 Americana，就把 Americano 改成 Americana
    offCtx.font = `400 ${fontSize}px Americano, sans-serif`;

    if ("letterSpacing" in offCtx) {
      offCtx.letterSpacing = "0.085em";
    }

    offCtx.fillText(
      text.toUpperCase(),
      offscreen.width / 2,
      offscreen.height / 2
    );

    const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imageData.data;

    const candidates = [];
    const scanGap = Math.max(2, Math.floor(1.8 * dpr));

    for (let y = 0; y < offscreen.height; y += scanGap) {
      for (let x = 0; x < offscreen.width; x += scanGap) {
        const index = (y * offscreen.width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 55) {
          candidates.push({ x, y, alpha });
        }
      }
    }

    const particleCount = Math.min(15000, candidates.length);

    for (let i = 0; i < particleCount; i++) {
      const point = candidates[Math.floor(Math.random() * candidates.length)];
      if (!point) continue;

      const baseX = point.x + randSpread(scanGap * 0.25);
      const baseY = point.y + randSpread(scanGap * 0.25);

      summitTitleParticles.particles.push({
        x: baseX + randSpread(1.2 * dpr),
        y: baseY + randSpread(1.0 * dpr),
        baseX,
        baseY,
        vx: 0,
        vy: 0,
        radius: (Math.random() * 0.75 + 0.65) * dpr,
        alpha: (point.alpha / 255) * (Math.random() * 0.18 + 0.62),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function animateSummitParticleTitle() {
    const state = summitTitleParticles;
    const { canvas, ctx, sprite } = state;

    if (!canvas || !ctx || !state.active) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";

    const time = performance.now() * 0.001;
    const repelRadius = 86 * state.dpr;
    const repelStrength = 2.7 * state.dpr;

    state.particles.forEach((p) => {
      const dx = p.x - state.mouseX;
      const dy = p.y - state.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < repelRadius) {
        const force = Math.pow(1 - dist / repelRadius, 1.8) * repelStrength;
        const angle = Math.atan2(dy, dx);

        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
      }

      const floatX = Math.sin(time * 0.55 + p.phase) * 0.24 * state.dpr;
      const floatY = Math.cos(time * 0.48 + p.phase) * 0.22 * state.dpr;

      p.vx += (p.baseX + floatX - p.x) * 0.014;
      p.vy += (p.baseY + floatY - p.y) * 0.014;

      p.vx *= 0.88;
      p.vy *= 0.88;

      p.x += p.vx;
      p.y += p.vy;

      const movement = Math.min(Math.abs(p.vx) + Math.abs(p.vy), 7) / 7;
      const radius = p.radius * (1 + movement * 0.12);
      const alpha = Math.min(1, p.alpha + movement * 0.08);

      ctx.globalAlpha = alpha;

      if (sprite) {
        ctx.drawImage(
          sprite,
          p.x - radius,
          p.y - radius,
          radius * 2,
          radius * 2
        );
      } else {
        ctx.beginPath();
        ctx.fillStyle = "rgba(242,245,247,0.95)";
        ctx.arc(p.x, p.y, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    state.raf = requestAnimationFrame(animateSummitParticleTitle);
  }

  function startSummitParticleTitle() {
    if (summitTitleParticles.raf) {
      cancelAnimationFrame(summitTitleParticles.raf);
    }

    summitTitleParticles.active = true;
    animateSummitParticleTitle();
  }

  function stopSummitParticleTitle() {
    summitTitleParticles.active = false;

    if (summitTitleParticles.raf) {
      cancelAnimationFrame(summitTitleParticles.raf);
      summitTitleParticles.raf = null;
    }

    const { canvas, ctx } = summitTitleParticles;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function updateSummitTitleParticlesPointer(event) {
    const canvas = summitTitleParticles.canvas;
    if (!canvas || !summitTitleParticles.active) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = summitTitleParticles.dpr || 1;

    summitTitleParticles.mouseX = (event.clientX - rect.left) * dpr;
    summitTitleParticles.mouseY = (event.clientY - rect.top) * dpr;
  }

  function resetSummitTitleParticlesPointer() {
    summitTitleParticles.mouseX = -9999;
    summitTitleParticles.mouseY = -9999;
  }

  function showSummitTitle(chapter) {
    const overlay = document.getElementById("summitTitleOverlay");
    const title = document.getElementById("summitTitleText");

    if (!overlay || !title) return;

    const displayTitle = getSummitDisplayTitle(chapter);

    setupSummitParticleTitle(displayTitle);
    startSummitParticleTitle();

    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");

    document.body.classList.add("chapter-active");
    document.body.classList.add("summit-title-active");
    document.body.classList.remove("chapter-nodes-active");
    document.body.classList.remove("chapter-nodes-preenter");
  }

  function hideSummitTitle() {
    const overlay = document.getElementById("summitTitleOverlay");

    stopSummitParticleTitle();
    resetSummitTitleParticlesPointer();

    overlay?.classList.add("hidden");
    overlay?.setAttribute("aria-hidden", "true");

    document.body.classList.remove("summit-title-active");
  }

  function clearSummitEntranceState() {
    hideSummitTitle();

    document.body.classList.remove("summit-title-active");
    document.body.classList.remove("chapter-nodes-active");
    document.body.classList.remove("chapter-nodes-preenter");

    const interviewNodes = document.getElementById("interviewNodes");
    if (interviewNodes) {
      interviewNodes.innerHTML = "";
    }

    document.querySelector(".chapter-media-map")?.classList.remove("has-open");
  }

  const exploredByCategory = {
    festa: new Set(),
    opportunita: new Set(),
    trasformazione: new Set(),
    criticita: new Set(),
    relazioni: new Set()
  };

  function startChapterTransition(data) {
    const chapter = CHAPTERS[data.key];
    if (!chapter) return;

    appState.view = 'transition';
    appState.transitionStart = clock.getElapsedTime();
    appState.transitionDuration = 3.4;
    appState.hoverHookObject = null;
    window.hideCategoryHoverText?.();
    document.body.classList.remove("category-hover-active");
    document.body.classList.remove("category-menu-open");

    document.querySelectorAll(".category-item").forEach((item) => {
      item.classList.remove("is-hovered");
    });
    syncCategoryHoverUI();
    document.body.style.cursor = "";
    appState.targetChapter = chapter;

    window.dispatchEvent(
      new CustomEvent("tracce:music-track", {
        detail: { key: chapter.key }
      })
    );

    document.getElementById('panel')?.classList.add('hidden');

    document.body.classList.add('is-transitioning');

    mapSceneGroup.visible = true;
    setMapSceneOpacity(1);

    if (animatedObjects.summitScene) {
      animatedObjects.summitScene.visible = true;
    }

    animatedObjects.summitModelMaterials?.forEach((material) => {
      material.opacity = 0;
    });

    if (animatedObjects.chapterCloud) {
      animatedObjects.chapterCloud.visible = false;
      animatedObjects.chapterCloud.material.opacity = 0;
      animatedObjects.chapterCloud.material.size = 0.08;
    }

    appState.cameraStart.copy(camera.position);
    appState.targetStart.copy(orbit.target);

    // 被点击的山顶位置
    const focusPoint = data.pos.clone();

    // 从当前相机直接朝被点击山靠近，不再用世界中心方向
    const directToMountain = focusPoint.clone().sub(camera.position);
    directToMountain.y = 0;

    if (directToMountain.lengthSq() < 0.0001) {
      directToMountain.set(0, 0, -1);
    }

    directToMountain.normalize();

    appState.cameraMid.copy(focusPoint)
      .add(directToMountain.clone().multiplyScalar(-18));

    appState.cameraMid.y = focusPoint.y + 8.0;

    appState.targetMid.copy(focusPoint);
    appState.targetMid.y = focusPoint.y + 1.5;

    // 从 overview / 当前相机位置指向被点击山
    const approachDir = focusPoint.clone().sub(camera.position);
    approachDir.y = 0;

    if (approachDir.lengthSq() < 0.0001) {
      approachDir.set(0, 0, -1);
    }

    approachDir.normalize();

    // 最终相机也落到这座山附近，而不是地图中心
    appState.cameraEnd.copy(focusPoint)
      .add(approachDir.clone().multiplyScalar(-18));

    appState.cameraEnd.y = focusPoint.y + 5.4;

    appState.targetEnd.copy(focusPoint)
      .add(approachDir.clone().multiplyScalar(14));

    appState.targetEnd.y = focusPoint.y + 0.6;

    placeSummitParticlesAtMountain({
      THREE,
      animatedObjects,
      mountainPos: focusPoint,
      cameraDirection: approachDir,
      cameraPosition: appState.cameraEnd,
      targetPosition: appState.targetEnd,
      categoryKey: chapter.key
    });

    console.log("SUMMIT MODEL DEBUG", {
      sceneVisible: animatedObjects.summitScene?.visible,
      modelReady: animatedObjects.summitModelReady,
      modelVisible: animatedObjects.summitModelRoot?.visible,
      materialCount: animatedObjects.summitModelMaterials?.length || 0,
      groupPosition: animatedObjects.summitScene?.position?.toArray(),
      cameraPosition: camera.position.toArray(),
      cameraEnd: appState.cameraEnd.toArray(),
      targetEnd: appState.targetEnd.toArray()
    });
  }

  function updateSummitTransitionVisuals() {
    if (appState.view !== "transition") return;

    const elapsed = clock.getElapsedTime() - appState.transitionStart;
    const progress = THREE.MathUtils.clamp(
      elapsed / appState.transitionDuration,
      0,
      1
    );

    const mapFade = 1 - smoothstep(0.58, 0.9, progress);
    setMapSceneOpacity(mapFade);

    updateSummitParticlesTransition({
      THREE,
      animatedObjects,
      progress,
      smoothstep
    });
  }

  function focusChapterScene(activeKey) {
    mapSceneGroup.traverse((obj) => {
      const material = obj.material;
      if (!material) return;

      const materials = Array.isArray(material) ? material : [material];
      const name = (obj.name || "").toLowerCase();

      const isMountain = !!obj.userData?.key;
      const isActiveMountain = obj.userData?.key === activeKey;

      const isMapParticle =
        name.includes("dense-map-points") ||
        name.includes("terrain-base-particles") ||
        name.includes("duomo-particles");

      materials.forEach((mat) => {
        mat.transparent = true;

        if (isActiveMountain) {
          mat.opacity = 0.72;

          if ("size" in mat) {
            mat.size = (obj.userData.baseSize || 0.44) * 0.62;
          }

          obj.renderOrder = 60;
          return;
        }

        if (isMountain) {
          mat.opacity = 0.035;

          if ("size" in mat) {
            mat.size = (obj.userData.baseSize || 0.44) * 0.32;
          }

          obj.renderOrder = 5;
          return;
        }

        if (isMapParticle) {
          const isDuomo = name.includes("duomo-particles");
          const isMapLine = name.includes("dense-map-points");
          const isTerrain = name.includes("terrain-base-particles");

          if (isDuomo) {
            mat.opacity = 0.45;
            obj.renderOrder = 18;
          } else if (isMapLine) {
            mat.opacity = 0.28;
            obj.renderOrder = 14;
          } else if (isTerrain) {
            mat.opacity = 0.18;
            obj.renderOrder = 10;
          }

          if ("size" in mat && obj.userData?.baseSize !== undefined) {
            mat.size = obj.userData.baseSize * 0.75;
          }

          return;
        }
      });
    });

    animatedObjects.hooks.forEach((hook) => {
      const isActive = hook.userData.key === activeKey;

      hook.material.opacity = isActive ? 0.72 : 0.08;
      hook.scale.set(
        isActive ? 2.8 : 1.2,
        isActive ? 2.8 : 1.2,
        1
      );
    });
  }

  function resetChapterSceneFocus() {
    mapSceneGroup.traverse((obj) => {
      const material = obj.material;
      if (!material) return;

      const materials = Array.isArray(material) ? material : [material];

      materials.forEach((mat) => {
        mat.transparent = true;

        if (obj.userData?.baseOpacity !== undefined) {
          mat.opacity = obj.userData.baseOpacity;
        } else if (mat.userData?.baseOpacity !== undefined) {
          mat.opacity = mat.userData.baseOpacity;
        }

        if ("size" in mat && obj.userData?.baseSize !== undefined) {
          mat.size = obj.userData.baseSize;
        }
      });

      if (obj.userData?.key) {
        obj.renderOrder = 24;
      }
    });

    animatedObjects.hooks.forEach((hook) => {
      hook.material.opacity = 0.86;
      hook.scale.set(2.4, 2.4, 1);
      hook.renderOrder = 35;
    });
  }

  function enterSummitImmerse(chapter) {
    appState.view = 'summit-immerse';
    appState.summitImmerseStart = clock.getElapsedTime();

    mapSceneGroup.visible = false;

    if (animatedObjects.summitScene) {
      animatedObjects.summitScene.visible = true;
    }
  }

  function enterChapter(chapter) {
    appState.view = "summit-title";

    document.body.classList.add("chapter-active");
    document.body.classList.remove("chapter-nodes-active");
    document.body.classList.remove("chapter-nodes-preenter");

    // Hide the original map. Keep the GLB summit scene as the background.
    mapSceneGroup.visible = false;

    if (animatedObjects.summitScene) {
      animatedObjects.summitScene.visible = true;
    }

    console.log("SUMMIT TITLE DEBUG", {
      sceneVisible: animatedObjects.summitScene?.visible,
      modelReady: animatedObjects.summitModelReady,
      modelVisible: animatedObjects.summitModelRoot?.visible,
      materialCount: animatedObjects.summitModelMaterials?.length || 0,
      groupPosition: animatedObjects.summitScene?.position?.toArray(),
      cameraPosition: camera.position.toArray(),
      cameraEnd: appState.cameraEnd?.toArray?.() || null,
      targetEnd: appState.targetEnd?.toArray?.() || null
    });

    if (animatedObjects.chapterCloud) {
      animatedObjects.chapterCloud.visible = false;
      animatedObjects.chapterCloud.material.opacity = 0;
    }

    updateChapterCopy(chapter);
    showChapterContainer();

    const interviewNodes = document.getElementById("interviewNodes");
    if (interviewNodes) {
      interviewNodes.innerHTML = "";
    }

    showSummitTitle(chapter);
    updateCategoryProgress();

    document.body.classList.remove("is-transitioning");
  }

  function enterChapterNodes() {
    const chapter = appState.targetChapter;
    if (!chapter) return;

    appState.view = "chapter";
    document.body.classList.remove("category-menu-open");
    appState.summitPanCurrent = 0;
    appState.summitPanTarget = 0;

    hideSummitTitle();

    document.body.classList.add("chapter-active");
    document.body.classList.add("chapter-nodes-preenter");
    document.body.classList.remove("chapter-nodes-active");

    document.querySelector(".chapter-media-map")?.classList.remove("has-open");

    const hoverIntro = document.getElementById("chapterHoverIntro");
    hoverIntro?.classList.remove("is-visible");
    hoverIntro?.setAttribute("aria-hidden", "true");

    renderInterviewNodes(chapter.key);
    updateCategoryProgress();

    const mediaMap = document.querySelector(".chapter-media-map");

    // 强制浏览器先读取一次 preenter 状态，避免动画被合并掉
    mediaMap?.getBoundingClientRect();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("chapter-nodes-active");
        document.body.classList.remove("chapter-nodes-preenter");
      });
    });
  }

  function returnToIntro() {
    appState.view = "intro";
    appState.targetChapter = null;
    appState.hoverHookObject = null;

    appState.transitionStart = 0;
    appState.ritualStartTime = 0;
    appState.ritualScrollProgress = 0;

    appState.ritualPointerX = 0;
    appState.ritualPointerY = 0;
    appState.ritualPointerTargetX = 0;
    appState.ritualPointerTargetY = 0;

    appState.overviewPointerX = 0;
    appState.overviewPointerY = 0;
    appState.overviewPointerTargetX = 0;
    appState.overviewPointerTargetY = 0;

    const intro = document.getElementById("intro");
    const ritualHint = document.getElementById("ritualHint");

    intro?.classList.remove("hidden");

    document.body.classList.add("intro-active");
    document.body.classList.remove("ritual-active");
    document.body.classList.remove("chapter-active");
    document.body.classList.remove("is-transitioning");
    document.body.classList.remove("category-hover-active");
    document.body.classList.remove("category-menu-open");

    window.dispatchEvent(new CustomEvent("tracce:music-stop"));

    document.getElementById("panel")?.classList.add("hidden");
    document.getElementById("infoPanel")?.classList.add("hidden");
    document.getElementById("mediaPanel")?.classList.add("hidden");

    document.querySelector(".chapter-media-map")?.classList.remove("has-open");

    hideChapterContainer();
    clearChapterState();
    clearSummitEntranceState();

    window.hideCategoryHoverText?.();
    syncCategoryHoverUI();

    mapSceneGroup.visible = false;
    setMapSceneOpacity(0);

    resetSummitParticles({ animatedObjects });

    if (animatedObjects.summitScene) {
      animatedObjects.summitScene.visible = false;
    }

    if (animatedObjects.chapterCloud) {
      animatedObjects.chapterCloud.visible = false;
      animatedObjects.chapterCloud.material.opacity = 0;
    }

    if (animatedObjects.introRings) {
      animatedObjects.introRings.visible = false;
      animatedObjects.introRings.material.opacity = 0;
      animatedObjects.introRings.material.size = 0;
    }

    if (animatedObjects.ritualSnowFine) {
      animatedObjects.ritualSnowFine.visible = false;
      animatedObjects.ritualSnowFine.material.opacity = 0;
    }

    if (animatedObjects.ritualSnowLarge) {
      animatedObjects.ritualSnowLarge.visible = false;
      animatedObjects.ritualSnowLarge.material.opacity = 0;
    }

    if (ritualHint) {
      ritualHint.classList.add("hidden");
      ritualHint.style.opacity = "0";
    }

    orbit.yaw = RITUAL_CAMERA.yaw;
    orbit.pitch = RITUAL_CAMERA.pitch;
    orbit.radius = RITUAL_CAMERA.radius;
    orbit.target.copy(RITUAL_CAMERA.target);
    updateCamera();
  }

  function returnToOverview() {
    document.documentElement.classList.remove("tracce-returning-map");
    
    appState.view = 'overview';
    appState.targetChapter = null;

    mapSceneGroup.visible = true;
    setMapSceneOpacity(1);
    resetChapterSceneFocus();

    resetSummitParticles({ animatedObjects });

    if (animatedObjects.chapterCloud) {
      animatedObjects.chapterCloud.visible = false;
    }

    if (animatedObjects.introRings) {
      animatedObjects.introRings.visible = false;
    }
    if (animatedObjects.ritualSnowFine)  animatedObjects.ritualSnowFine.visible  = false;
    if (animatedObjects.ritualSnowLarge) animatedObjects.ritualSnowLarge.visible = false;

    hideChapterContainer();
    clearChapterState();

    document.body.classList.remove('chapter-active');
    document.body.classList.remove('is-transitioning');
    document.body.classList.remove('intro-active');
    document.body.classList.remove('ritual-active');
    document.body.classList.add('overview-active');
    document.body.classList.remove("category-menu-open");

    window.dispatchEvent(
      new CustomEvent("tracce:music-track", {
        detail: { key: "overall" }
      })
    );

    // 地图初始视角
    appState.overviewPointerX = 0;
    appState.overviewPointerY = 0;
    appState.overviewPointerTargetX = 0;
    appState.overviewPointerTargetY = 0;

    orbit.yaw = OVERVIEW_CAMERA.yaw;
    orbit.pitch = OVERVIEW_CAMERA.pitch;
    orbit.radius = OVERVIEW_CAMERA.radius;
    orbit.target.copy(OVERVIEW_CAMERA.target);
    updateCamera();
  }

  function updateCategoryProgress() {
    let overallExplored = 0;
    let overallTotal = 0;

    Object.keys(CHAPTERS).forEach(key => {
      const chapter = CHAPTERS[key];

      if (!chapter) return;

      const explored = exploredByCategory[key]?.size || 0;
      const total = chapter.total ?? 10;

      overallExplored += explored;
      overallTotal += total;

      updateCategoryProgressItem(key, explored, total);
    });

    updateOverallProgressText(overallExplored, overallTotal);
  }

  function updateChapterExplorationCounter(categoryKey) {
    const counter = document.getElementById("chapterExplorationCounter");
    const chapter = CHAPTERS[categoryKey];

    if (!counter || !chapter) return;

    const explored = exploredByCategory[categoryKey]?.size || 0;
    const total = chapter.total ?? 0;

    counter.innerHTML = `Esplorazione <strong>${explored}</strong> / ${total}`;
  }

  function renderInterviewNodes(categoryKey) {
    const interviews = INTERVIEWS_BY_CATEGORY[categoryKey] || [];

    updateChapterExplorationCounter(categoryKey);

    renderInterviewNodeList({
      categoryKey,
      interviews,
      exploredSet: exploredByCategory[categoryKey],
      onSelect: (item) => {
        exploredByCategory[categoryKey].add(item.id);

        openMediaPanel(item);

        updateChapterExplorationCounter(categoryKey);
        updateCategoryProgress();
      }
    });

    updateChapterExplorationCounter(categoryKey);
    updateCategoryProgress();
  }

  if (backToMap) {
    backToMap.addEventListener('click', returnToOverview);
  }

  window.addEventListener("tracce:return-intro", returnToIntro);

  let interviewPanTarget = 0;
  let interviewPanCurrent = 0;

  window.addEventListener('mousemove', event => {
    if (appState.view !== 'chapter') return;

    const container = document.getElementById('interviewNodes');
    if (!container) return;

    const normalized = event.clientX / window.innerWidth - 0.5;

    // nodes 横向移动强度
    interviewPanTarget = -normalized * window.innerWidth * 0.14;

    // summit 山顶背景横向移动强度
    appState.summitPanTarget = -normalized * 2.4;
  });

  const hotspotLayer = document.getElementById('hotspotLayer');
  let hotspotButtons = [];

  function findHookByKey(key) {
    return animatedObjects.hooks.find(hook => hook.userData.key === key) || null;
  }

  let lastHoveredCategoryKey = null;

  function syncCategoryHoverUI() {
    const hoveredKey =
      appState.view === "overview"
        ? appState.hoverHookObject?.userData?.key || null
        : null;

    if (hoveredKey === lastHoveredCategoryKey) return;

    lastHoveredCategoryKey = hoveredKey;

    document.querySelectorAll(".category-item").forEach((item) => {
      item.classList.toggle("is-hovered", item.dataset.key === hoveredKey);
    });
  }

  function pickMountainByPointer(event) {
    if (appState.view !== 'overview') return null;

    pointerNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointerNdc, camera);

    const hits = raycaster.intersectObjects(animatedObjects.mountainParticles, false);

    if (!hits.length) return null;

    const hit = hits[0];
    const key = hit.object?.userData?.key;

    if (!key) return null;

    return findHookByKey(key);
  }

  function createHotspotButtons() {
    hotspotButtons = createHotspotButtonList({
      legacyAreas,
      hookHeightByKey,
      hotspotLayer,
      findHookByKey,
      onHover: (key) => {
        appState.hoverHookObject = findHookByKey(key);
        window.showCategoryHoverByKey?.(key);
        syncCategoryHoverUI();
      },
      onLeave: () => {
        appState.hoverHookObject = null;
        window.hideCategoryHoverText?.();
        syncCategoryHoverUI();
      },
      onSelect: (area) => {
        const hook = findHookByKey(area.key);

        const pos = hook?.userData?.pos
          ? hook.userData.pos.clone()
          : new THREE.Vector3(area.x, hookHeightByKey[area.key] || area.y || 9.5, area.z);

        startChapterTransition({
          id: area.id,
          key: area.key,
          title: area.title,
          text: area.text,
          pos
        });
      }
    });
  }

  function updateHotspotButtons() {
    updateHotspotButtonPositions({
      hotspotLayer,
      hotspotButtons,
      appState,
      camera,
      hookHeightByKey,
      findHookByKey,
      THREE
    });

    const shouldShow =
      appState.view === "overview" &&
      !document.body.classList.contains("intro-active");

    if (!shouldShow) {
      appState.hoverHookObject = null;
    }
  }

  // Initialize bottom category progress labels on overview.
  updateCategoryProgress();

  window.addEventListener('pointermove', e => {
    if (appState.view === "summit-title") {
      updateSummitTitleParticlesPointer(e);
    }

    emitCursorSnowTrail({
      THREE,
      camera,
      animatedObjects,
      event: e
    });

	window.addEventListener("pointerleave", () => {
    resetSummitTitleParticlesPointer();
  });

    emitCursorSnowTrail({
      THREE,
      camera,
      animatedObjects,
      event: e
    });

    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;

    // Keep the light parallax only during the ring ritual.
    if (appState.view === 'particle-ritual') {
      appState.ritualPointerTargetX = nx * 0.8;
      appState.ritualPointerTargetY = ny * -0.5;
      return;
    }

    if (appState.view !== 'overview') return;

    const isOverHotspot = e.target.closest && e.target.closest('.hotspot-btn');
    const isOverCategory = e.target.closest && e.target.closest('.category-item');

    if (isOverCategory) {
      appState.overviewPointerTargetX = 0;
      appState.overviewPointerTargetY = 0;
      return;
    }

    if (!isOverHotspot) {
      const pickedHook = pickMountainByPointer(e);

      if (pickedHook) {
        appState.hoverHookObject = pickedHook;

        // 山体 hover：只保留山体变色 + 底部 category 亮起
        // 不显示中间文字，也不让背景变暗
        window.hideCategoryHoverText?.();
        document.body.classList.remove("category-hover-active");

        syncCategoryHoverUI();

        appState.overviewPointerTargetX = 0;
        appState.overviewPointerTargetY = 0;
        return;
      } else {
        appState.hoverHookObject = null;

        // 离开山体后，也清掉可能残留的 hover overlay
        window.hideCategoryHoverText?.();
        document.body.classList.remove("category-hover-active");

        syncCategoryHoverUI();
      }
    }

    // 如果正在 hover hotspot，不要移动相机
    if (isOverHotspot || appState.hoverHookObject) {
      appState.overviewPointerTargetX = 0;
      appState.overviewPointerTargetY = 0;
      return;
    }

    const xRatio = e.clientX / window.innerWidth;
    const yRatio = e.clientY / window.innerHeight;

    // 只有鼠标在画面外圈才触发视角漂移
    const edgeX = 0.16;
    const edgeTop = 0.14;
    const edgeBottom = 0.20;

    let targetX = 0;
    let targetY = 0;

    if (xRatio < edgeX) {
      targetX = -THREE.MathUtils.smoothstep(edgeX - xRatio, 0, edgeX);
    } else if (xRatio > 1 - edgeX) {
      targetX = THREE.MathUtils.smoothstep(xRatio - (1 - edgeX), 0, edgeX);
    }

    if (yRatio < edgeTop) {
      targetY = -THREE.MathUtils.smoothstep(edgeTop - yRatio, 0, edgeTop);
    } else if (yRatio > 1 - edgeBottom) {
      targetY = THREE.MathUtils.smoothstep(yRatio - (1 - edgeBottom), 0, edgeBottom);
    }

    appState.overviewPointerTargetX = THREE.MathUtils.clamp(targetX, -1, 1);
    appState.overviewPointerTargetY = THREE.MathUtils.clamp(targetY, -1, 1);
  });

  window.addEventListener('click', event => {
    if (appState.view !== 'overview') return;

    // 点 DOM hotspot 时已经有自己的 click，不要重复触发
    const isOverHotspot = event.target.closest && event.target.closest('.hotspot-btn');
    if (isOverHotspot) return;

    const pickedHook = pickMountainByPointer(event);
    if (!pickedHook) return;

    const key = pickedHook.userData.key;
    const area = getLegacyArea(key);
    if (!area) return;

    startChapterTransition({
      id: area.id,
      key: area.key,
      title: area.title,
      text: area.text,
      pos: pickedHook.userData.pos.clone()
    });
  });

  window.addEventListener('wheel', e => {
    if (appState.view === 'particle-ritual') {
      if (e.deltaY > 0) {
        appState.ritualScrollProgress = THREE.MathUtils.clamp(
          //五环下滑速度
          appState.ritualScrollProgress + e.deltaY * 0.00022,
          0,
          1
        );

        if (appState.ritualScrollProgress >= 0.995) {
        if (animatedObjects.ritualSnowFine) animatedObjects.ritualSnowFine.visible = false;
        if (animatedObjects.ritualSnowLarge) animatedObjects.ritualSnowLarge.visible = false;

        if (animatedObjects.introRings) {
          animatedObjects.introRings.visible = false;
          animatedObjects.introRings.material.opacity = 0;
          animatedObjects.introRings.material.size = 0;
        }

        mapSceneGroup.visible = true;
        setMapSceneOpacity(1);

        orbit.yaw = OVERVIEW_CAMERA.yaw;
        orbit.pitch = OVERVIEW_CAMERA.pitch;
        orbit.radius = OVERVIEW_CAMERA.radius;
        orbit.target.copy(OVERVIEW_CAMERA.target);
        updateCamera();

        document.body.classList.remove('intro-active');
        document.body.classList.remove('ritual-active');
        document.body.classList.add('overview-active');

        appState.view = 'overview';

        if (ritualHint) {
          ritualHint.classList.add('hidden');
          ritualHint.style.opacity = '0';
        }
      }

          // Do NOT reset the camera here; it is already the same overview camera.
          // This avoids the final visual jump.
        }

      return;
    }

    	if (appState.view === "summit-title") {
        if (e.deltaY > 0) {
          enterChapterNodes();
        }

        return;
      }

    if (appState.view === 'overview') {
      return;
    }
  }, { passive: true });

  const intro = document.getElementById('intro');
  const enterBtn = document.getElementById('enterBtn');
  const ritualHint = document.getElementById('ritualHint');

  function startParticleRitual() {
    appState.view = 'particle-ritual';

    document.body.classList.remove('overview-active');
    document.body.classList.remove('chapter-active');
    document.body.classList.add('ritual-active');
    document.body.classList.remove("category-menu-open");

    window.dispatchEvent(
      new CustomEvent("tracce:music-start", {
        detail: { key: "overall" }
      })
    );

    updateIntroRingTargetsFromCurrentHotspots();

    mapSceneGroup.visible = true;
    setMapSceneOpacity(1);

    // 固定第二幕的观看角度，不用 map 的俯视相机
    appState.overviewPointerX = 0;
    appState.overviewPointerY = 0;
    appState.overviewPointerTargetX = 0;
    appState.overviewPointerTargetY = 0;

    orbit.yaw = OVERVIEW_CAMERA.yaw;
    orbit.pitch = OVERVIEW_CAMERA.pitch;
    orbit.radius = OVERVIEW_CAMERA.radius;
    orbit.target.copy(OVERVIEW_CAMERA.target);
    updateCamera();

    appState.ritualStartTime = clock.getElapsedTime();
    appState.ritualScrollProgress = 0;
    appState.ritualPointerX = 0;
    appState.ritualPointerY = 0;
    appState.ritualPointerTargetX = 0;
    appState.ritualPointerTargetY = 0;

    if (animatedObjects.introRings) {
      animatedObjects.introRings.visible = true;
      animatedObjects.introRings.material.opacity = 0;

      // 五环粒子大小
      animatedObjects.introRings.material.size = 0.42;

      // 五环整体位置：x 左右，y 上下，z 前后
      animatedObjects.introRings.position.set(-0.2, 2.6, 0);

      // 五环整体比例：x 横向，y 高度，z 深度
      animatedObjects.introRings.scale.set(1.08, 0.92, 0.86);

      // 五环整体倾斜角度
      animatedObjects.introRings.rotation.set(
        THREE.MathUtils.degToRad(-8),
        0,
        THREE.MathUtils.degToRad(-3)
      );
    }

    if (animatedObjects.ritualSnowFine) {
      animatedObjects.ritualSnowFine.visible = true;
      animatedObjects.ritualSnowFine.material.opacity = 0;
    }
    if (animatedObjects.ritualSnowLarge) {
      animatedObjects.ritualSnowLarge.visible = true;
      animatedObjects.ritualSnowLarge.material.opacity = 0;
    }

    document.getElementById('panel')?.classList.add('hidden');
    if (ritualHint) {
      ritualHint.classList.remove('hidden');
      ritualHint.style.opacity = '1';
    }
  }

  if (enterBtn && intro) {
    enterBtn.addEventListener('click', () => {
      intro.classList.add('hidden');

      // 注意：这里先不要 remove intro-active
      // 这样地图 UI 还不会出现
      startParticleRitual();
    });
  }

  window.addEventListener('resize', () => {
    resizeScene({ renderer, camera });
  });

  updateCamera();

  function animateTerrain(t) {
    const points = animatedObjects.terrain;
    if (!points) return;

    const pos = points.geometry.attributes.position.array;
    const base = animatedObjects.terrainBase;
    const phase = animatedObjects.terrainPhase;
    const amp = animatedObjects.terrainAmp;

    for (let i = 0, p = 0; i < pos.length; i += 3, p++) {
      const tt = t * 0.75 + phase[p];
      pos[i] = base[i] + Math.sin(tt) * amp[p] * 0.7;
      pos[i + 1] = base[i + 1] + Math.cos(tt * 1.17) * amp[p];
      pos[i + 2] = base[i + 2] + Math.sin(tt * 0.82) * amp[p] * 0.7;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.material.size = 0.135 + Math.sin(t * 0.7) * 0.006;
    points.material.opacity = 0.78 + Math.sin(t * 0.5) * 0.04;
  }

  function animateSnow(t) {
    animateSnowParticles({
      animatedObjects,
      t
    });
  }

  function animateForegroundSnow(t) {
    animateForegroundSnowParticles({
      animatedObjects,
      t
    });
  }

  function animateCursorSnow(t) {
    animateCursorSnowTrail({
      THREE,
      camera,
      animatedObjects,
      t
    });
  }

  function animateIntroRings(t) {
    animateIntroRingsModule({
      THREE,
      t,
      appState,
      animatedObjects,
      ritualHint,
      mapSceneGroup,
      setMapSceneOpacity,
      easeInOutCubic,
      smoothstep,

      orbit,
      ritualCamera: RITUAL_CAMERA,
      overviewCamera: OVERVIEW_CAMERA,
      updateCamera
    });
  }

  function animateIntroCloud(t) {
    const cloud = animatedObjects.introCloud;
    if (!cloud || !cloud.visible) return;

    const arr = cloud.geometry.attributes.position.array;
    const base = animatedObjects.introCloudBase;
    const phase = animatedObjects.introCloudPhase;
    const amp = animatedObjects.introCloudAmp;

    for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
      const bx = base[i];
      const by = base[i + 1];
      const bz = base[i + 2];

      const angle = Math.atan2(bz, bx);
      const dist = Math.sqrt(bx * bx + bz * bz);

      // 像参考图那样：整体有旋涡，但不是规则圆
      const twist = Math.sin(t * 0.45 + dist * 0.08) * 2.2;

      const waveX = Math.sin(t * 0.8 + phase[p]) * amp[p] * 1.8;
      const waveY = Math.cos(t * 0.65 + phase[p] * 1.3) * amp[p] * 0.9;
      const waveZ = Math.sin(t * 0.72 + phase[p] * 0.8) * amp[p] * 1.4;

      arr[i] =
        bx * Math.cos(twist * 0.035) -
        bz * Math.sin(twist * 0.035) +
        waveX;

      arr[i + 1] =
        by +
        waveY +
        Math.sin(angle * 3.0 + t * 0.7) * 0.7;

      arr[i + 2] =
        bx * Math.sin(twist * 0.035) +
        bz * Math.cos(twist * 0.035) +
        waveZ;
    }

    cloud.geometry.attributes.position.needsUpdate = true;

    // 出现时慢慢显现
    if (appState.view === 'particle-ritual') {
      cloud.material.opacity = THREE.MathUtils.lerp(
        cloud.material.opacity,
        0.9,
        0.035
      );

      cloud.material.size = THREE.MathUtils.lerp(
        cloud.material.size,
        0.16,
        0.035
      );
    }
  }

  function updateSummitScenePan() {
    const group = animatedObjects.summitScene;

    if (!group || !group.visible) return;

    if (!group.userData.summitBasePosition) {
      group.userData.summitBasePosition = group.position.clone();
      group.userData.summitBaseRotationY = group.rotation.y;
    }

    const target = appState.view === "chapter"
      ? appState.summitPanTarget
      : 0;

    // 这里的 0.04 和 interviewNodes.js 里的 pan 缓动速度保持一致
    appState.summitPanCurrent = THREE.MathUtils.lerp(
      appState.summitPanCurrent,
      target,
      0.04
    );

    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    cameraRight.y = 0;

    if (cameraRight.lengthSq() < 0.0001) {
      cameraRight.set(1, 0, 0);
    }

    cameraRight.normalize();

    group.position
      .copy(group.userData.summitBasePosition)
      .add(cameraRight.multiplyScalar(appState.summitPanCurrent));

    group.rotation.y =
      group.userData.summitBaseRotationY +
      appState.summitPanCurrent * 0.035;
  }

  function animateChapterCloud(t) {
    animateChapterCloudParticles({
      THREE,
      t,
      appState,
      animatedObjects
    });

    animateSummitParticles({
      THREE,
      animatedObjects,
      t,
      appState
    });

    updateSummitScenePan();

    updateSummitTransitionVisuals();
  }

  function animateHooks(t) {
    animateHooksModule({
      animatedObjects,
      appState,
      t
    });
  }

  function animateLines(t) {
    animatedObjects.pulseLines.forEach((line, index) => {
      if (line.material) {
        line.material.opacity = 0.38 + Math.sin(t * 0.72 + index * 0.65) * 0.07;
      }
    });
  }

  function animateRitualSnow(t) {
    animateRitualSnowModule({
      THREE,
      t,
      appState,
      animatedObjects
    });
  }

  startAnimationLoop({
    THREE,
    renderer,
    scene,
    camera,
    clock,
    appState,
    animatedObjects,
    orbit,

    animateTerrain,
    animateSnow,
    animateForegroundSnow,
    animateCursorSnow,
    animateHooks,
    animateLines,
    applyMarkerHoverVisual,
    updateOverviewCameraByPointer,
    animateIntroCloud,
    animateIntroRings,
    animateRitualSnow,
    animateChapterCloud,
    updateHotspotButtons,
    updateInterviewPan,

    enterSummitImmerse,
    enterChapter,
    easeInOutCubic,

    getInterviewPanCurrent: () => interviewPanCurrent,
    setInterviewPanCurrent: (value) => {
      interviewPanCurrent = value;
    },
    getInterviewPanTarget: () => interviewPanTarget
  });

	return () => {
    cleanupInfoPanel?.();
    cleanupMediaPanel?.();
    cleanupCategoryBar?.();

    window.removeEventListener("tracce:return-intro", returnToIntro);

		renderer.dispose();
	};
}