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
	closeMediaPanel,
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
	createSnowFlakeTexture
} from "$lib/three/textures.js";

import {
	updateCamera as updateCameraController,
	updateOverviewCameraByPointer as updateOverviewCameraByPointerController,
	getChapterCameraView as getChapterCameraViewController
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

import { startAnimationLoop } from "$lib/three/animationLoop.js";
  
export function initScene() {
	console.log("Olympic Tracce scene started");

	const BG_COLOR = 0x070e17;
	document.body.classList.add("intro-active");

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
        pos: new THREE.Vector3(area.x, area.y, area.z)
      });
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
    view: 'overview',
    transitionStart: 0,
    transitionDuration: 2.1,
    targetChapter: null,

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

    cameraStart: new THREE.Vector3(),
    cameraEnd: new THREE.Vector3(),
    targetStart: new THREE.Vector3(),
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

  let milanMapField = null;

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
  }

  const orbit = {
    yaw: -0.48,
    pitch: 0.30,
    radius: 80,
    target: new THREE.Vector3(0.4, 2.4, 1.2)
  };

  const OVERVIEW_CAMERA = {
    yaw: -0.48,
    pitch: 0.30,
    radius: 80,
    target: new THREE.Vector3(0.4, 2.4, 1.2),

    // 先别真用 90°，否则会太剧烈。稳定后再调大。
    maxYawOffset: THREE.MathUtils.degToRad(25),
    maxPitchOffset: THREE.MathUtils.degToRad(10)
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

  function insideMapShape(x, z) {
    const nx = x / (WORLD.width * 0.5);
    const nz = z / (WORLD.depth * 0.5);
    const angle = Math.atan2(nz, nx);
    const r = Math.sqrt(nx * nx + nz * nz);

    const boundary =
      0.98 +
      0.12 * Math.sin(angle * 3.0 + 0.45) +
      0.08 * Math.sin(angle * 7.0 - 1.2) +
      0.05 * Math.cos(angle * 11.0 + 0.4);

    return r < boundary;
  }

  function edgeFade(x, z) {
    const nx = x / (WORLD.width * 0.5);
    const nz = z / (WORLD.depth * 0.5);
    const r = Math.sqrt(nx * nx + nz * nz);
    return THREE.MathUtils.clamp(1.08 - r, 0, 1);
  }

  function gaussian(x, z, cx, cz, height, radius, sx = 1, sz = 1) {
      const dx = (x - cx) / sx;
      const dz = (z - cz) / sz;
      const d2 = dx * dx + dz * dz;
      return height * Math.exp(-d2 / (2 * radius * radius));
  }

  function smoothstep(edge0, edge1, x) {
      const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
  }

  function sampleMapMask(x, z) {
      if (!milanMapField) return 0;

      const { width, height, data, worldWidth, worldHeight } = milanMapField;

      const nx = THREE.MathUtils.clamp(x / worldWidth + 0.5, 0, 0.9999);
      const nz = THREE.MathUtils.clamp(z / worldHeight + 0.5, 0, 0.9999);

      const px = Math.floor(nx * width);
      const py = Math.floor(nz * height);

      let sum = 0;
      let count = 0;

      // Blur sampling: not only exact road pixels, but nearby city texture too.
      for (let oy = -4; oy <= 4; oy++) {
       for (let ox = -4; ox <= 4; ox++) {
         const sx = Math.max(0, Math.min(width - 1, px + ox));
         const sy = Math.max(0, Math.min(height - 1, py + oy));

         const index = (sy * width + sx) * 4;
         const r = data[index];
         const g = data[index + 1];
         const b = data[index + 2];

         const brightness = (r + g + b) / 3 / 255;
         sum += brightness;
         count++;
       }
     }

     return sum / count;
  }

  function ridgeNoise(x, z) {
    return (
      Math.sin(x * 0.19 + z * 0.08) * 0.42 +
      Math.sin(x * 0.08 - z * 0.21) * 0.34 +
      Math.cos(x * 0.33 + z * 0.13) * 0.18
    );
  }

  function terrainHeight(x, z) {
      const festa = legacyAreas.find(area => area.key === 'festa');
      const opportunita = legacyAreas.find(area => area.key === 'opportunita');
      const trasformazione = legacyAreas.find(area => area.key === 'trasformazione');
      const criticita = legacyAreas.find(area => area.key === 'criticita');

      // 1. Outer mountain system.
      // These hills still exist, but the city/map area will flatten and cut into them.
      let mountainY = -0.35;

      // 只保留很轻微的整体起伏，不再做明显雪山
      mountainY += gaussian(x, z, festa.x, festa.z, 2.2, 12, 1.0, 1.0);
      mountainY += gaussian(x, z, opportunita.x, opportunita.z, 1.4, 12, 1.2, 1.0);
      mountainY += gaussian(x, z, trasformazione.x, trasformazione.z, 1.4, 12, 1.2, 1.0);
      mountainY += gaussian(x, z, criticita.x, criticita.z, -1.2, 10, 1.0, 1.0);

      mountainY += ridgeNoise(x, z) * 0.04;

      // 2. Milan map influence.
      // Brighter road/city texture means flatter and more urban.
      const mapMask = sampleMapMask(x, z);

      // 3. Central Milan / Duomo area should be a flat city plane.
      const d = Math.sqrt(x * x + z * z);
      const centerMask = Math.exp(-(d * d) / (2 * 20 * 20));

      // 4. Combined city mask:
      // cityMask = where terrain should become city/map, not mountain.
      const cityMask = THREE.MathUtils.clamp(mapMask * 1.45 + centerMask * 0.75, 0, 1);

      // 5. City plane with only tiny vibration.
      const cityPlane = -0.18 + ridgeNoise(x, z) * 0.035;

      // 6. Blend mountain into city plane.
      // This is the main fix: roads/map and terrain now belong to the same height system.
      let y = THREE.MathUtils.lerp(mountainY, cityPlane, cityMask * 0.94);

      // 7. Duomo exact center: force almost flat.
      const duomoFlat = 1.0 - smoothstep(0, 8, d);
      y = THREE.MathUtils.lerp(y, -0.12, duomoFlat);

      // 8. Edge fade.
      const fade = edgeFade(x, z);
      y *= 0.72 + fade * 0.28;

      return y;
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

  function makeLineSegments(name, positions, color = 0xF3D7C4, opacity = 0.42) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color,
        transparent: true,
      opacity,
      blending: THREE.NormalBlending,
      depthTest: false,
     depthWrite: false
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = name;
    lines.renderOrder = 20;
    mapSceneGroup.add(lines);
    return lines;
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
    chapterAmp: null
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
      mapSceneGroup,
      animatedObjects,
      createSnowFlakeTexture
    });
  }

  function createForegroundSnow() {
    createForegroundSnowParticles({
      THREE,
      mapSceneGroup,
      animatedObjects,
      createSnowFlakeTexture
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
    
    createIntroParticleRings();
    createRitualForegroundSnow();
    createChapterCloud();
  }

  createWorld();

  function setMapSceneOpacity(progress) {
    setMapSceneOpacityController({
      THREE,
      mapSceneGroup,
      progress
    });
  }

  const panel = document.getElementById('panel');
  const panelLabel = document.getElementById('panelLabel');
  const panelTitle = document.getElementById('panelTitle');
  const panelText = document.getElementById('panelText');
  const closePanel = document.getElementById('closePanel');
  const aboutBtn = document.getElementById('aboutBtn');

  const chapterContainer = document.getElementById('chapterContainer');
  const chapterNumber = document.getElementById('chapterNumber');
  const chapterTitle = document.getElementById('chapterTitle');
  const chapterSubtitle = document.getElementById('chapterSubtitle');
  const backToMap = document.getElementById('backToMap');

  const mediaPanel = document.getElementById('mediaPanel');
  const closeMediaPanel = document.getElementById('closeMediaPanel');
  const mediaPanelLabel = document.getElementById('mediaPanelLabel');
  const mediaPanelTitle = document.getElementById('mediaPanelTitle');
  const mediaPanelText = document.getElementById('mediaPanelText');

  const INTERVIEWS_BY_CATEGORY = createInterviewsByCategory(CHAPTERS);

  const exploredByCategory = {
    festa: new Set(),
    opportunita: new Set(),
    trasformazione: new Set(),
    criticita: new Set(),
    relazioni: new Set()
  };

  function getChapterCameraView(pos, key) {
    return getChapterCameraViewController({
      THREE,
      pos,
      overviewCamera: OVERVIEW_CAMERA
    });
  }

  function startChapterTransition(data) {
    const chapter = CHAPTERS[data.key];
    if (!chapter) return;

    appState.view = 'transition';
    appState.transitionStart = clock.getElapsedTime();
    appState.transitionDuration = 1.45;
    appState.targetChapter = chapter;

    if (panel) panel.classList.add('hidden');

    document.body.classList.add('is-transitioning');

    // 保留地图和山作为背景，不要隐藏。
    mapSceneGroup.visible = true;
    setMapSceneOpacity(1);

    if (animatedObjects.chapterCloud) {
      animatedObjects.chapterCloud.visible = true;
      animatedObjects.chapterCloud.material.opacity = 0;
      animatedObjects.chapterCloud.material.size = 0.08;
    }

    appState.cameraStart.copy(camera.position);
    appState.targetStart.copy(orbit.target);

    const focusPoint = data.pos.clone();

    const chapterView = getChapterCameraView(focusPoint, data.key);

    appState.cameraEnd.copy(chapterView.cameraPos);
    appState.targetEnd.copy(chapterView.target);
  }

  function enterChapter(chapter) {
    appState.view = 'chapter';

    // 保留当前 zoom-in 后的 3D 背景，不切到新页面。
    mapSceneGroup.visible = true;
    setMapSceneOpacity(1);

    updateChapterCopy(chapter);
    showChapterContainer();

    renderInterviewNodes(chapter.key);
    updateCategoryProgress();

    document.body.classList.remove('is-transitioning');
  }

  function returnToOverview() {
    appState.view = 'overview';
    appState.targetChapter = null;

    mapSceneGroup.visible = true;
    setMapSceneOpacity(1);

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

  function renderInterviewNodes(categoryKey) {
    const interviews = INTERVIEWS_BY_CATEGORY[categoryKey] || [];

    renderInterviewNodeList({
      categoryKey,
      interviews,
      exploredSet: exploredByCategory[categoryKey],
      onSelect: (item) => {
        exploredByCategory[categoryKey].add(item.id);
        openMediaPanel(item);
        updateCategoryProgress();
      }
    });

    updateCategoryProgress();
  }

  if (backToMap) {
    backToMap.addEventListener('click', returnToOverview);
  }

  const mediaMap = document.querySelector('.chapter-media-map');

  let interviewPanTarget = 0;
  let interviewPanCurrent = 0;

  window.addEventListener('mousemove', event => {
    if (appState.view !== 'chapter') return;

    const container = document.getElementById('interviewNodes');
    if (!container) return;

    const normalized = event.clientX / window.innerWidth - 0.5;

    // 左右最多移动约 28vw，不要太夸张
    interviewPanTarget = -normalized * window.innerWidth * 0.28;
  });

  const hotspotLayer = document.getElementById('hotspotLayer');
  let hotspotButtons = [];

  function findHookByKey(key) {
    return animatedObjects.hooks.find(hook => hook.userData.key === key) || null;
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
      },
      onLeave: () => {
        appState.hoverHookObject = null;
      },
      onSelect: (area) => {
        const fallbackPos = new THREE.Vector3(
          area.fallback.x,
          area.fallback.y,
          area.fallback.z
        );

        startChapterTransition({
          id: area.id,
          key: area.key,
          title: area.title,
          text: area.text,
          pos: area.pos || fallbackPos
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

    // 如果鼠标不在 DOM hotspot 上，就用 raycaster 检测山体
    if (!isOverHotspot) {
      const pickedHook = pickMountainByPointer(e);

      if (pickedHook) {
        appState.hoverHookObject = pickedHook;
        appState.overviewPointerTargetX = 0;
        appState.overviewPointerTargetY = 0;
        return;
      } else {
        appState.hoverHookObject = null;
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

        document.body.classList.remove('intro-active');
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

    if (appState.view === 'overview') {
      return;
    }
  }, { passive: true });

  const intro = document.getElementById('intro');
  const enterBtn = document.getElementById('enterBtn');
  const ritualHint = document.getElementById('ritualHint');

  function startParticleRitual() {
    appState.view = 'particle-ritual';

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
      animatedObjects.introRings.material.size = 0.46;
      animatedObjects.introRings.position.set(0.8, 0.15, 0);
      animatedObjects.introRings.scale.set(1.18, 1.10, 1.12);
      animatedObjects.introRings.rotation.y = 0;
      animatedObjects.introRings.rotation.z = 0;
    }

    if (animatedObjects.ritualSnowFine) {
      animatedObjects.ritualSnowFine.visible = true;
      animatedObjects.ritualSnowFine.material.opacity = 0;
    }
    if (animatedObjects.ritualSnowLarge) {
      animatedObjects.ritualSnowLarge.visible = true;
      animatedObjects.ritualSnowLarge.material.opacity = 0;
    }

    if (panel) panel.classList.add('hidden');
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
      smoothstep
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

  function animateChapterCloud(t) {
    animateChapterCloudParticles({
      THREE,
      t,
      appState,
      animatedObjects
    });
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

		renderer.dispose();
	};
}