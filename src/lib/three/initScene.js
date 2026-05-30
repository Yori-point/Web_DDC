  // @ts-nocheck

  import * as THREE from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
  
  export function initScene() {
	console.log("Olympic Tracce scene started");

	const BG_COLOR = 0x070e17;
	document.body.classList.add("intro-active");

  const canvas = document.getElementById('scene');

  if (!canvas) {
	console.error("Missing #scene canvas.");
	return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(BG_COLOR, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG_COLOR);
  scene.fog = new THREE.FogExp2(BG_COLOR, 0.011);
  const mapSceneGroup = new THREE.Group();
  mapSceneGroup.name = 'map-scene-group';
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

  const CHAPTERS = {
    festa: {
      id: '01',
      key: 'festa',
      title: 'Festa / Celebrazione',
      subtitle: 'Il cuore che celebra. La cima più luminosa.',
      total: 72
    },
    opportunita: {
      id: '02',
      key: 'opportunita',
      title: 'Lavoro / Opportunità',
      subtitle: 'Direzioni che aprono il futuro.',
      total: 14
    },
    trasformazione: {
      id: '03',
      key: 'trasformazione',
      title: 'Cambiamento / Trasformazione',
      subtitle: 'Territori in divenire, forme che si ridisegnano.',
      total: 14
    },
    criticita: {
      id: '04',
      key: 'criticita',
      title: 'Problemi / Criticità',
      subtitle: 'Le valli da ascoltare. Ombre che chiedono cura.',
      total: 18
    },
    relazioni: {
      id: '05',
      key: 'relazioni',
      title: 'Relazioni / Incontri',
      subtitle: 'Incontri che generano nuove possibilità.',
      total: 52
    }
  };

  const ambientLight = new THREE.AmbientLight(0xA9C7E6, 0.92);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xE6F1FA, 1.55);
  keyLight.position.set(18, 38, 26);
  scene.add(keyLight);

  const violetBackLight = new THREE.DirectionalLight(0x5B7FA6, 0.95);
  violetBackLight.position.set(-28, 22, -24);
  scene.add(violetBackLight);

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

  const legacyAreas = [
    {
      id: '01',
      key: 'festa',
      title: 'Festa / Celebrazione',
      text: 'Il cuore che celebra. La cima più luminosa.',
      x: -15,
      z: 2,
      height: 5.2,
      radius: 9.8,
      spread: 1.0,
      color: 0xE8C860
    },
    {
      id: '02',
      key: 'opportunita',
      title: 'Lavoro / Opportunità',
      text: 'Direzioni che aprono il futuro.',
      x: -1,
      z: -18,
      height: 8.4,
      radius: 10.2,
      spread: 1.15,
      color: 0x88C4E8
    },
    {
      id: '03',
      key: 'trasformazione',
      title: 'Cambiamento / Trasformazione',
      text: 'Territori in divenire, forme che si ridisegnano.',
      x: 29,
      z: -8,
      height: 8.6,
      radius: 10.6,
      spread: 1.2,
      color: 0xE0EAF4
    },
    {
      id: '04',
      key: 'criticita',
      title: 'Problemi / Criticità',
      text: 'Le valli da ascoltare. Ombre che chiedono cura.',
      x: -6,
      z: 21,
      height: -4.6,
      radius: 10.8,
      spread: 1.25,
      color: 0x88C8A8
    },
    {
      id: '05',
      key: 'relazioni',
      title: 'Relazioni / Incontri',
      text: 'Il nucleo che connette. Incontri che generano nuove possibilità.',
      x: 30,
      z: 22,
      height: 5.8,
      radius: 8.5,
      spread: 1.0,
      color: 0xE89AB0
    }
  ];

  const hookHeightByKey = {
    festa: 16.0,
    opportunita: 14.0,
    trasformazione: 8.5,
    criticita: 27.0,
    relazioni: 13.0
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
    const hoveredHook = appState.hoverHookObject;
    const hoveredKey = hoveredHook?.userData?.key || null;
    const isHovering = appState.view === 'overview' && !!hoveredHook;

    scene.background.set(BG_COLOR);
    scene.fog.color.set(BG_COLOR); 

    ambientLight.intensity = 0.92;
    keyLight.intensity = 1.55;
    violetBackLight.intensity = 0.95;

    // Hover hook 时：只有对应山体轻微亮起，颜色跟山顶圆点一致
    animatedObjects.mountainParticles.forEach(points => {
      const mat = points.material;
      const isTargetMountain =
        isHovering &&
        points.userData.key &&
        points.userData.key === hoveredKey;

      if (points.userData.baseColors && points.geometry.attributes.color) {
        const colors = points.geometry.attributes.color.array;
        const baseColors = points.userData.baseColors;

        const targetColor = new THREE.Color(points.userData.color || 0xffffff);

        for (let i = 0; i < colors.length; i += 3) {
          const br = baseColors[i];
          const bg = baseColors[i + 1];
          const bb = baseColors[i + 2];

          if (isTargetMountain) {
            // 让山体真正染上对应类别色，而不是只变白
            const mix = 0.58;
            const glow = 1.18;

            colors[i] = THREE.MathUtils.lerp(br * 0.88, targetColor.r * glow, mix);
            colors[i + 1] = THREE.MathUtils.lerp(bg * 0.88, targetColor.g * glow, mix);
            colors[i + 2] = THREE.MathUtils.lerp(bb * 0.88, targetColor.b * glow, mix);
          } else {
            colors[i] = br;
            colors[i + 1] = bg;
            colors[i + 2] = bb;
          }
        }

        points.geometry.attributes.color.needsUpdate = true;
      }

      if (isTargetMountain) {
        mat.opacity = 1.0;
        mat.size = (points.userData.baseSize || 0.44) * 1.08;
        points.renderOrder = 42;
      } else {
        mat.opacity = points.userData.baseOpacity || 0.96;
        mat.size = points.userData.baseSize || 0.44;
        points.renderOrder = 24;
      }

      mat.color.set(0xffffff);
      mat.blending = THREE.NormalBlending;
      mat.needsUpdate = true;
    });

    // 地图线条保持原样
    animatedObjects.pulseLines.forEach(line => {
      if (!line.material.userData.baseOpacity) {
        line.material.userData.baseOpacity = line.material.opacity;
      }

      line.material.opacity = line.material.userData.baseOpacity;
    });

    if (animatedObjects.snow) {
      animatedObjects.snow.material.opacity = 0.5;
    }

    // 只保留以前五个点的轻微 hover feedback
    animatedObjects.hooks.forEach(hook => {
      const isTarget = isHovering && hook.userData.key === hoveredKey;

      if (isTarget) {
        hook.material.opacity = 1.0;
        hook.scale.set(5.2, 5.2, 1);
        hook.renderOrder = 70;
      } else {
        hook.material.opacity = 0.86;
        hook.scale.set(4.7, 4.7, 1);
        hook.renderOrder = 35;
      }
    });

    document.body.style.cursor = isHovering ? 'pointer' : '';
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
    orbit.pitch = Math.max(0.08, Math.min(1.05, orbit.pitch));
    orbit.radius = Math.max(34, Math.min(145, orbit.radius));

    // When the user rotates toward a top-down view, zoom out slightly
    // so the front/bottom mountains are not clipped by the screen.
    const topViewBoost = THREE.MathUtils.smoothstep(orbit.pitch, 0.52, 0.95) * 68;

    // Small screens also need a bit more distance.
    const aspect = window.innerWidth / window.innerHeight;
    const responsiveBoost = aspect < 1.05 ? 22 : 0;

    const effectiveRadius = orbit.radius + topViewBoost + responsiveBoost;

    const x = Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * effectiveRadius;
    const y = orbit.target.y + Math.sin(orbit.pitch) * effectiveRadius;
    const z = Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * effectiveRadius;

    camera.position.set(x, y, z);
    camera.lookAt(orbit.target);
  }

  function updateOverviewCameraByPointer() {
    if (appState.view !== 'overview') return;

    appState.overviewPointerX = THREE.MathUtils.lerp(
      appState.overviewPointerX,
      appState.overviewPointerTargetX,
      0.026
    );

    appState.overviewPointerY = THREE.MathUtils.lerp(
      appState.overviewPointerY,
      appState.overviewPointerTargetY,
      0.026
    );

    orbit.yaw =
      OVERVIEW_CAMERA.yaw +
      appState.overviewPointerX * OVERVIEW_CAMERA.maxYawOffset;

    orbit.pitch =
      OVERVIEW_CAMERA.pitch -
      appState.overviewPointerY * OVERVIEW_CAMERA.maxPitchOffset;

    orbit.radius = OVERVIEW_CAMERA.radius;
    orbit.target.copy(OVERVIEW_CAMERA.target);

    updateCamera();
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
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    if (colors) {
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }

    const mat = new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity,
      vertexColors: Boolean(colors),
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });

    const pts = new THREE.Points(geo, mat);
    pts.name = name;
    scene.add(pts);
    return pts;
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

  function createGlowSprite(color, opacity = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 58);

    gradient.addColorStop(0.00, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.16, 'rgba(255,255,255,0.62)');
    gradient.addColorStop(0.42, 'rgba(255,255,255,0.18)');
    gradient.addColorStop(0.72, 'rgba(255,255,255,0.035)');
    gradient.addColorStop(1.00, 'rgba(255,255,255,0)');

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
      alphaTest: 0.025, // 关键：切掉正方形透明边
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Sprite(material);
  }

  function createHookTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');

    const gradient = g.createRadialGradient(64, 64, 3, 64, 64, 47);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.34, 'rgba(230,241,250,0.66)');
    gradient.addColorStop(1, 'rgba(230,241,250,0)');

    g.fillStyle = gradient;
    g.beginPath();
    g.arc(64, 64, 48, 0, Math.PI * 2);
    g.fill();

    g.strokeStyle = 'rgba(255,255,255,0.88)';
    g.lineWidth = 2.0;
    g.beginPath();
    g.arc(64, 64, 23, 0, Math.PI * 2);
    g.stroke();

    g.fillStyle = 'rgba(255,255,255,0.78)';
    g.beginPath();
    g.arc(64, 64, 7, 0, Math.PI * 2);
    g.fill();

    return new THREE.CanvasTexture(c);
  }

  function createLegacyHooks() {
    const texture = createHookTexture();

    legacyAreas.forEach(area => {
      const y = hookHeightByKey[area.key] || 9.5;

      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        color: area.color,
        transparent: true,
        opacity: 0.86,
        alphaTest: 0.025,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending
      }));

      sprite.position.set(area.x, y, area.z);
      sprite.scale.set(2.4, 2.4, 1);
      sprite.userData = {
        id: area.id,
        key: area.key,
        title: area.title,
        text: area.text,
        pos: sprite.position.clone()
      };

      animatedObjects.hooks.push(sprite);
      mapSceneGroup.add(sprite);
    });
  }

  function createSnow() {
    const positions = [];
    const base = [];
    const phases = [];
    const amps = [];

    for (let i = 0; i < WORLD.snowCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(150);

      // 分两层：一层近地漂浮，一层高空星尘
      const lowLayer = Math.random() < 0.62;

      const y = lowLayer
        ? THREE.MathUtils.randFloat(1.8, 18)
        : THREE.MathUtils.randFloat(18, 68);

      const z = THREE.MathUtils.randFloatSpread(100);

      positions.push(x, y, z);
      base.push(x, y, z);
      phases.push(Math.random() * Math.PI * 2);
      amps.push(lowLayer ? 0.18 + Math.random() * 0.52 : 0.06 + Math.random() * 0.34);
    }

    animatedObjects.snowBase = new Float32Array(base);
    animatedObjects.snowPhase = new Float32Array(phases);
    animatedObjects.snowAmp = new Float32Array(amps);

    const snowGeometry = new THREE.BufferGeometry();
    snowGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    // 雪的材质修改
    const snowMaterial = new THREE.PointsMaterial({
      map: createSnowFlakeTexture(),
      alphaTest: 0.008,
      color: 0xffffff,
      size: 0.32,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.66,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });

    const snowPoints = new THREE.Points(snowGeometry, snowMaterial);
    snowPoints.name = 'dense-floating-snow';
    snowPoints.renderOrder = 5;

    mapSceneGroup.add(snowPoints);
    animatedObjects.snow = snowPoints;
  }

  function createForegroundSnow() {
    const positions = [];
    const base = [];
    const phases = [];
    const amps = [];

    const count = 260;

    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(120);
      const y = THREE.MathUtils.randFloat(4, 54);
      const z = THREE.MathUtils.randFloat(-35, 52);

      positions.push(x, y, z);
      base.push(x, y, z);
      phases.push(Math.random() * Math.PI * 2);
      amps.push(0.18 + Math.random() * 0.55);
    }

    animatedObjects.foregroundSnowBase = new Float32Array(base);
    animatedObjects.foregroundSnowPhase = new Float32Array(phases);
    animatedObjects.foregroundSnowAmp = new Float32Array(amps);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      map: createSnowFlakeTexture(),
      alphaTest: 0.004,
      color: 0xffffff,
      size: 0.76,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });

    const points = new THREE.Points(geo, mat);
    points.name = 'foreground-large-snow';
    points.renderOrder = 7;

    mapSceneGroup.add(points);
    animatedObjects.foregroundSnow = points;
  }

  function createChapterCloud() {
    const positions = [];
    const colors = [];
    const base = [];
    const phases = [];
    const amps = [];

    for (let i = 0; i < 14000; i++) {
     const radius = Math.pow(Math.random(), 0.62) * 92;
     const angle = Math.random() * Math.PI * 2;

     const x = Math.cos(angle) * radius;
     const y = 
       Math.random() < 0.72
       ? THREE.MathUtils.randFloat(-10, 8)
       : THREE.MathUtils.randFloat(8, 38);
     const z = Math.sin(angle) * radius + THREE.MathUtils.randFloat(-60, 36);

     positions.push(x, y, z);
     base.push(x, y, z);

     const c = COLORS.ice.clone().lerp(COLORS.white, 0.35 + Math.random() * 0.55);
     const intensity = 0.34 + Math.random() * 0.54;

     colors.push(c.r * intensity, c.g * intensity, c.b * intensity);

     phases.push(Math.random() * Math.PI * 2);
     amps.push(0.18 + Math.random() * 0.92);
    }

  animatedObjects.chapterBase = new Float32Array(base);
  animatedObjects.chapterPhase = new Float32Array(phases);
  animatedObjects.chapterAmp = new Float32Array(amps);

  animatedObjects.chapterCloud = makePoints(
    'chapter-cloud-particles',
    positions,
    colors,
    0.11,
    0.72
  );

  animatedObjects.chapterCloud.visible = false;
  animatedObjects.chapterCloud.renderOrder = 80;
}

function createBackgroundStars() {
  const positions = [];
  const colors = [];

  for (let i = 0; i < 3600; i++) {
    const x = THREE.MathUtils.randFloatSpread(180);

    const y =
      Math.random() < 0.72
        ? THREE.MathUtils.randFloat(4, 34)
        : THREE.MathUtils.randFloat(34, 74);

    const z = THREE.MathUtils.randFloat(-84, 68);

    positions.push(x, y, z);

    const m = 0.08 + Math.random() * 0.18;
    colors.push(
      0.78 * m,
      0.88 * m,
      1.0 * m
    );
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.095,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending
  });

  const points = new THREE.Points(geo, mat);
  points.name = 'distant-background-ice-dust';
  points.renderOrder = 2;
  scene.add(points);
}


  function createSoftMistTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,    'rgba(255,255,255,0.88)');
    grad.addColorStop(0.28, 'rgba(255,255,255,0.40)');
    grad.addColorStop(0.60, 'rgba(255,255,255,0.09)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function createSnowFlakeTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 58);
    gradient.addColorStop(0.0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.18, 'rgba(255,255,255,0.62)');
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.18)');
    gradient.addColorStop(1.0, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(c);
  }

    function createIntroParticleRings() {
      const positions = [];
      const colors = [];
      const base = [];
      const phases = [];
      const amps = [];

      const countPerRing = 9000;
      const ringRadius = 9.8;
      const ringThickness = 3.2;

      // Pale luminous winter palette — light, transparent, emerging from darkness.
      // Low saturation but HIGH brightness. "Pale ice" not "dark mud".
      const ringData = [
        { x: -14.4, y: 6.0, z: -6.2, color: new THREE.Color(0x88C4E8) },  // pale icy cyan-blue
        { x:    0,  y: 6.0, z: -6.2, color: new THREE.Color(0xE8C860) },  // soft pale gold
        { x:  14.4, y: 6.0, z: -6.2, color: new THREE.Color(0xE0EAF4) },  // soft snow white
        { x:  -7.2, y: 3.05, z:  5.7, color: new THREE.Color(0x88C8A8) },  // pale mint green
        { x:   7.2, y: 3.05, z:  5.7, color: new THREE.Color(0xE89AB0) }   // soft dusty rose
      ];

      for (let ringIndex = 0; ringIndex < ringData.length; ringIndex++) {
        const ring = ringData[ringIndex];

        for (let i = 0; i < countPerRing; i++) {
          const a = Math.random() * Math.PI * 2;

          // Multi-frequency brightness variation — creates uneven but always visible arc.
          const w1 = 0.5 + 0.5 * Math.sin(a * 1.8 + ringIndex * 2.3);
          const w2 = 0.5 + 0.5 * Math.sin(a * 4.1 + ringIndex * 0.8 + 1.0);
          const opFactor = w1 * 0.45 + w2 * 0.30 + Math.random() * 0.25;

          // Radial spread: wider soft halos in dim zones, tight core in bright clusters
          const radSpread = ringThickness * THREE.MathUtils.lerp(0.78, 0.34, opFactor);
          // 轻微有机起伏：让轮廓像雪尘，不像数学椭圆
          const organicWobble =
            Math.sin(a * 2.2 + ringIndex * 1.7) * 0.28 +
            Math.sin(a * 5.1 + ringIndex * 0.9) * 0.14;

          // 给每个环一点“管状厚度”：不是一条平面线，而是有体积的雪雾环
          const tubeAngle = Math.random() * Math.PI * 2;
          const tubeRadius = ringThickness * (0.18 + Math.pow(Math.random(), 0.7) * 0.56);

          const radialTube = Math.cos(tubeAngle) * tubeRadius;
          const verticalTube = Math.sin(tubeAngle) * tubeRadius * 0.34;
          const depthTube = Math.sin(tubeAngle) * tubeRadius * 0.12;

          const r =
            ringRadius +
            organicWobble +
            radialTube +
            THREE.MathUtils.randFloatSpread(radSpread * 0.36);

          const x =
            ring.x +
            Math.cos(a) * r +
            THREE.MathUtils.randFloatSpread(0.34);

          const y =
            ring.y +
            verticalTube +
            Math.sin(a * 3.0 + ringIndex) * 0.16 +
            THREE.MathUtils.randFloatSpread(0.26);

          const z =
            ring.z +
            Math.sin(a) * r +
            Math.cos(a) * depthTube +
            THREE.MathUtils.randFloatSpread(0.34);

          positions.push(x, y, z);
          base.push(x, y, z);
          phases.push(Math.random() * Math.PI * 2);
          amps.push(0.04 + Math.random() * 0.14);

          // Brightness floor at 0.42 — nothing goes dark or black.
          // opFactor modulates from "soft" (0.42) to "brighter cluster" (0.82).
          const brightness = 0.42 + opFactor * 0.40;
          const c = ring.color.clone();
          colors.push(c.r * brightness, c.g * brightness, c.b * brightness);
        }
      }

      // Pale atmospheric dust — same light palette, barely visible
      const dustCount = 420;
      for (let i = 0; i < dustCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 22;
        const dx = Math.cos(angle) * radius + THREE.MathUtils.randFloatSpread(4);
        const dy = 4.8 + THREE.MathUtils.randFloat(-2.5, 3.5);
        const dz = Math.sin(angle) * radius * 0.5 + THREE.MathUtils.randFloatSpread(6);
        positions.push(dx, dy, dz);
        base.push(dx, dy, dz);
        phases.push(Math.random() * Math.PI * 2);
        amps.push(0.05 + Math.random() * 0.18);
        const m = 0.06 + Math.random() * 0.08;
        colors.push(0.78 * m, 0.88 * m, 1.0 * m);
      }

    animatedObjects.introRingsCountPerRing = countPerRing;
    const p02 = getLegacyPoint('opportunita');
    const p01 = getLegacyPoint('festa');
    const p03 = getLegacyPoint('trasformazione');
    const p04 = getLegacyPoint('criticita');
    const p05 = getLegacyPoint('relazioni');

    animatedObjects.introRingsTargets = [
      // blue ring → 02 opportunità
      { cx: -14.4, cy: 6.0,  cz: -6.2, tx: p02.x, ty: p02.y, tz: p02.z },

      // yellow ring → 01 festa
      { cx:   0.0, cy: 6.0,  cz: -6.2, tx: p01.x, ty: p01.y, tz: p01.z },

      // white ring → 03 trasformazione
      { cx:  14.4, cy: 6.0,  cz: -6.2, tx: p03.x, ty: p03.y, tz: p03.z },

      // green ring → 04 criticità
      { cx:  -7.2, cy: 3.05, cz:  5.7, tx: p04.x, ty: p04.y, tz: p04.z },

      // pink ring → 05 relazioni
      { cx:   7.2, cy: 3.05, cz:  5.7, tx: p05.x, ty: p05.y, tz: p05.z }
    ];

    animatedObjects.introRingsBase  = new Float32Array(base);
    animatedObjects.introRingsPhase = new Float32Array(phases);
    animatedObjects.introRingsAmp   = new Float32Array(amps);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      map: createSoftMistTexture(),
      alphaTest: 0.005,
      size: 0.46,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });

    const rings = new THREE.Points(geo, mat);
    rings.name = 'intro-particle-rings';
    rings.visible = false;
    rings.renderOrder = 150;
    rings.position.set(0.8, 0.15, 0);
    rings.scale.set(1.18, 1.10, 1.12);
    rings.rotation.y = 0;
    rings.rotation.z = 0;

    scene.add(rings);
    animatedObjects.introRings = rings;
  }

  function updateIntroRingTargetsFromCurrentHotspots() {
    const p02 = getLegacyPoint('opportunita');
    const p01 = getLegacyPoint('festa');
    const p03 = getLegacyPoint('trasformazione');
    const p04 = getLegacyPoint('criticita');
    const p05 = getLegacyPoint('relazioni');

    animatedObjects.introRingsTargets = [
      { cx: -14.4, cy: 6.0,  cz: -6.2, tx: p02.x, ty: p02.y, tz: p02.z },
      { cx:   0.0, cy: 6.0,  cz: -6.2, tx: p01.x, ty: p01.y, tz: p01.z },
      { cx:  14.4, cy: 6.0,  cz: -6.2, tx: p03.x, ty: p03.y, tz: p03.z },
      { cx:  -7.2, cy: 3.05, cz:  5.7, tx: p04.x, ty: p04.y, tz: p04.z },
      { cx:   7.2, cy: 3.05, cz:  5.7, tx: p05.x, ty: p05.y, tz: p05.z }
    ];
  }

  function createRitualForegroundSnow() {
    // Fine particles between rings (z≈0) and camera (z=72).
    // Lower-half biased so they obscure the bottom of the ring composition.
    const fineCount = 1400;
    const finePos = [], fineBase = [], finePhase = [], fineAmp = [];

    for (let i = 0; i < fineCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(75);
      const y = Math.random() < 0.65
        ? THREE.MathUtils.randFloat(-18, 3)   // lower half emphasis
        : THREE.MathUtils.randFloat(3, 16);
      const z = 18 + Math.random() * 44;      // between rings and camera
      finePos.push(x, y, z);
      fineBase.push(x, y, z);
      finePhase.push(Math.random() * Math.PI * 2);
      fineAmp.push(0.12 + Math.random() * 0.38);
    }

    const fineGeo = new THREE.BufferGeometry();
    fineGeo.setAttribute('position', new THREE.Float32BufferAttribute(finePos, 3));
    const fineMat = new THREE.PointsMaterial({
      color: 0xCCDAE6,
      size: 0.11,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });
    const fineSnow = new THREE.Points(fineGeo, fineMat);
    fineSnow.name = 'ritual-snow-fine';
    fineSnow.visible = false;
    fineSnow.renderOrder = 160;
    scene.add(fineSnow);

    animatedObjects.ritualSnowFine      = fineSnow;
    animatedObjects.ritualSnowFineBase  = new Float32Array(fineBase);
    animatedObjects.ritualSnowFinePhase = new Float32Array(finePhase);
    animatedObjects.ritualSnowFineAmp   = new Float32Array(fineAmp);

    // Large slow flakes very close to camera — big apparent size, strong depth cue
    const largeCount = 38;
    const largePos = [], largeBase = [], largePhase = [], largeAmp = [];

    for (let i = 0; i < largeCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(50);
      const y = THREE.MathUtils.randFloat(-12, 8);
      const z = 52 + Math.random() * 16;   // very close to camera
      largePos.push(x, y, z);
      largeBase.push(x, y, z);
      largePhase.push(Math.random() * Math.PI * 2);
      largeAmp.push(0.25 + Math.random() * 0.45);
    }

    const largeGeo = new THREE.BufferGeometry();
    largeGeo.setAttribute('position', new THREE.Float32BufferAttribute(largePos, 3));
    const largeMat = new THREE.PointsMaterial({
      map: createSoftMistTexture(),
      alphaTest: 0.005,
      color: 0xDDE6EE,
      size: 0.55,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });
    const largeSnow = new THREE.Points(largeGeo, largeMat);
    largeSnow.name = 'ritual-snow-large';
    largeSnow.visible = false;
    largeSnow.renderOrder = 162;
    scene.add(largeSnow);

    animatedObjects.ritualSnowLarge      = largeSnow;
    animatedObjects.ritualSnowLargeBase  = new Float32Array(largeBase);
    animatedObjects.ritualSnowLargePhase = new Float32Array(largePhase);
    animatedObjects.ritualSnowLargeAmp   = new Float32Array(largeAmp);
  }

  function createLegendHelperDots() {
    legacyAreas.forEach(area => {
      const glow = createGlowSprite(
        area.color,
        0.28
      );

      const y = hookHeightByKey[area.key] || 9.5;

      glow.position.set(area.x, y, area.z);

      // Smaller, cleaner glow. No huge square panel over the mountains.
      glow.scale.set(4.8, 4.8, 1);

      glow.renderOrder = 35;
      mapSceneGroup.add(glow);
    });
  }

  function createDenseMapPointsFromMesh(mesh, count = 32000) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;

    if (!position) return null;

    mesh.updateMatrixWorld(true);

    const triangles = [];
    let totalArea = 0;

    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();

    const triCount = index ? index.count / 3 : Math.floor(position.count / 3);

    for (let i = 0; i < triCount; i++) {
      const ia = index ? index.getX(i * 3) : i * 3;
      const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);

      ab.subVectors(b, a);
      ac.subVectors(c, a);

      const area = ab.cross(ac).length() * 0.5;

      if (area > 0.000001) {
        totalArea += area;
        triangles.push({
          a: a.clone(),
          b: b.clone(),
          c: c.clone(),
          area,
          cumulative: totalArea
        });
      }
    }

    const positions = [];
    const colors = [];

    if (triangles.length) {
      for (let i = 0; i < count; i++) {
        const r = Math.random() * totalArea;

        let low = 0;
        let high = triangles.length - 1;

        while (low < high) {
          const mid = Math.floor((low + high) / 2);
          if (triangles[mid].cumulative < r) low = mid + 1;
          else high = mid;
        }

        const tri = triangles[low];

        let u = Math.random();
        let v = Math.random();

        if (u + v > 1) {
          u = 1 - u;
          v = 1 - v;
        }

        const p = tri.a.clone()
          .add(tri.b.clone().sub(tri.a).multiplyScalar(u))
          .add(tri.c.clone().sub(tri.a).multiplyScalar(v));

        p.x += THREE.MathUtils.randFloatSpread(0.012);
        p.y += -0.025 + THREE.MathUtils.randFloatSpread(0.004);
        p.z += THREE.MathUtils.randFloatSpread(0.012);

        positions.push(p.x, p.y, p.z);

        // Milan map line: brighter white particle traces
        const brightness = 0.62 + Math.random() * 0.28;

        colors.push(
          0.72 * brightness,
          0.84 * brightness,
          0.96 * brightness
);
      }
    } else {
      // fallback: if the mesh has no usable triangles, use raw vertices
      for (let i = 0; i < position.count; i++) {
        const p = new THREE.Vector3()
          .fromBufferAttribute(position, i)
          .applyMatrix4(mesh.matrixWorld);

        positions.push(p.x, p.y, p.z);

        const brightness = 0.58 + Math.random() * 0.32;
        colors.push(
          0.78 * brightness,
          0.90 * brightness,
          1.0 * brightness
        );
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      map: createSoftMistTexture(),
      alphaTest: 0.025,
      size: 0.18,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    }); 

    const points = new THREE.Points(particleGeometry, particleMaterial);
    points.name = `dense-map-points-${mesh.name || 'city'}`;
    points.renderOrder = 30;

    points.userData = {
      baseOpacity: 0.82,
      baseSize: 0.18
    };

    mapSceneGroup.add(points);

    return points;
  }

  function createTerrainBaseParticlesFromMesh(mesh, count = 90000) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;

    if (!position) return null;

    mesh.updateMatrixWorld(true);

    const triangles = [];
    let totalArea = 0;

    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();

    const triCount = index ? index.count / 3 : Math.floor(position.count / 3);

    for (let i = 0; i < triCount; i++) {
      const ia = index ? index.getX(i * 3) : i * 3;
      const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);

      ab.subVectors(b, a);
      ac.subVectors(c, a);

      const area = ab.cross(ac).length() * 0.5;

      if (area > 0.000001) {
        totalArea += area;
        triangles.push({
          a: a.clone(),
          b: b.clone(),
          c: c.clone(),
          area,
          cumulative: totalArea
        });
      }
    }

    if (!triangles.length) return null;

    const positions = [];
    const colors = [];

    for (let i = 0; i < count; i++) {
      const r = Math.random() * totalArea;

      let low = 0;
      let high = triangles.length - 1;

      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (triangles[mid].cumulative < r) low = mid + 1;
        else high = mid;
      }

      const tri = triangles[low];

      let u = Math.random();
      let v = Math.random();

      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }

      const p = tri.a.clone()
        .add(tri.b.clone().sub(tri.a).multiplyScalar(u))
        .add(tri.c.clone().sub(tri.a).multiplyScalar(v));

      // 很轻微的雪尘松散感，不要像实体板
      p.x += THREE.MathUtils.randFloatSpread(0.08);
      p.y += THREE.MathUtils.randFloatSpread(0.045);
      p.z += THREE.MathUtils.randFloatSpread(0.08);

      positions.push(p.x, p.y, p.z);

      // Terrain base: not pure white. Use icy blue-grey with organic variation.
      const wave =
        0.5 +
        0.5 * Math.sin(p.x * 0.18 + p.z * 0.11) *
        Math.cos(p.z * 0.13 - p.x * 0.07);

      const brightness = 0.36 + wave * 0.22 + Math.random() * 0.16;

      // Slight cold-green / blue-grey tint, closer to the reference site's unified terrain feeling.
      colors.push(
        0.58 * brightness,
        0.74 * brightness,
        0.82 * brightness
      );
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      map: createSoftMistTexture(),
      alphaTest: 0.025,
      size: 0.34,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending
    });

    const points = new THREE.Points(particleGeometry, particleMaterial);
    points.name = `terrain-base-particles-${mesh.name || 'terrain'}`;
    points.renderOrder = 12;

    points.userData = {
      baseOpacity: 0.74,
      baseSize: 0.30
    };

    mapSceneGroup.add(points);

    return points;
  }

  function createDuomoParticlesFromMesh(mesh, count = 18000) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;

    if (!position) return null;

    mesh.updateMatrixWorld(true);

    const triangles = [];
    let totalArea = 0;

    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();

    const triCount = index ? index.count / 3 : Math.floor(position.count / 3);

    for (let i = 0; i < triCount; i++) {
      const ia = index ? index.getX(i * 3) : i * 3;
      const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);

      ab.subVectors(b, a);
      ac.subVectors(c, a);

      const area = ab.cross(ac).length() * 0.5;

      if (area > 0.000001) {
        totalArea += area;
        triangles.push({
          a: a.clone(),
          b: b.clone(),
          c: c.clone(),
          area,
          cumulative: totalArea
        });
      }
    }

    if (!triangles.length) return null;

    const positions = [];
    const colors = [];

    for (let i = 0; i < count; i++) {
      const r = Math.random() * totalArea;

      let low = 0;
      let high = triangles.length - 1;

      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (triangles[mid].cumulative < r) low = mid + 1;
        else high = mid;
      }

      const tri = triangles[low];

      let u = Math.random();
      let v = Math.random();

      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }

      const p = tri.a.clone()
        .add(tri.b.clone().sub(tri.a).multiplyScalar(u))
        .add(tri.c.clone().sub(tri.a).multiplyScalar(v));

      p.x += THREE.MathUtils.randFloatSpread(0.04);
      p.y += THREE.MathUtils.randFloatSpread(0.04);
      p.z += THREE.MathUtils.randFloatSpread(0.04);

      positions.push(p.x, p.y, p.z);

      const brightness = 0.86 + Math.random() * 0.22;

      colors.push(
        1.0 * brightness,
        0.96 * brightness,
        0.88 * brightness
      );
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      map: createSoftMistTexture(),
      alphaTest: 0.04,
      size: 0.32,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending
    });

    const points = new THREE.Points(particleGeometry, particleMaterial);
    points.name = `duomo-particles-${mesh.name || 'duomo'}`;
    points.renderOrder = 32;

    points.userData = {
      baseOpacity: 0.95,
      baseSize: 0.32
    };

    mapSceneGroup.add(points);

    return points;
  }

  function createMountainParticlesFromMesh(mesh, count = 18000, categoryKey = null) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;

    if (!position) return null;

    mesh.updateMatrixWorld(true);

    const triangles = [];
    let totalArea = 0;

    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();

    const triCount = index ? index.count / 3 : position.count / 3;

    for (let i = 0; i < triCount; i++) {
      const ia = index ? index.getX(i * 3) : i * 3;
      const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);

      ab.subVectors(b, a);
      ac.subVectors(c, a);

      const area = ab.cross(ac).length() * 0.5;

      if (area > 0.0001) {
        totalArea += area;
        triangles.push({
          a: a.clone(),
          b: b.clone(),
          c: c.clone(),
          area,
          cumulative: totalArea
        });
      }
    }

    if (!triangles.length) return null;

    const positions = [];
    const colors = [];

    for (let i = 0; i < count; i++) {
      const r = Math.random() * totalArea;

      let low = 0;
      let high = triangles.length - 1;

      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (triangles[mid].cumulative < r) low = mid + 1;
        else high = mid;
      }

      const tri = triangles[low];

      let u = Math.random();
      let v = Math.random();

      // uniform triangle sampling
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }

      const p = tri.a.clone()
        .add(tri.b.clone().sub(tri.a).multiplyScalar(u))
        .add(tri.c.clone().sub(tri.a).multiplyScalar(v));

      // very small snowy looseness, so it is not a rigid mesh outline
      p.x += THREE.MathUtils.randFloatSpread(0.10);
      p.y += THREE.MathUtils.randFloatSpread(0.10);
      p.z += THREE.MathUtils.randFloatSpread(0.10);

      positions.push(p.x, p.y, p.z);

      // icy white-blue particle variation
      // Snow-white mountain particles: clear, bright, stronger than background snow
      const ridge =
        0.5 +
        0.5 * Math.sin(p.x * 0.20 + p.y * 0.35 + p.z * 0.08);

      const brightness = 0.72 + ridge * 0.22 + Math.random() * 0.16;

      // Mountains stay brighter than terrain, but not pure flat white.
      colors.push(
        0.92 * brightness,
        0.97 * brightness,
        1.0 * brightness
      );
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      map: createSoftMistTexture(),
      alphaTest: 0.055,
      size: 0.44,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending
    });

    const points = new THREE.Points(particleGeometry, particleMaterial);
    points.name = `particle-${mesh.name || 'mountain'}`;
    points.renderOrder = 24;

    const area = categoryKey ? getLegacyArea(categoryKey) : null;

    points.userData = {
      key: categoryKey,
      color: area ? area.color : 0xffffff,
      baseSize: 0.44,
      baseOpacity: 0.96,
      baseColors: particleGeometry.attributes.color.array.slice()
    };

    mapSceneGroup.add(points);
    animatedObjects.mountainParticles.push(points);

    return points;
  }

  function createUnifiedMapModel() {
    const loader = new GLTFLoader();

    loader.load(
      "/mountain_map.glb",
      gltf => {
        const model = gltf.scene;
        model.name = 'unified-map-model';

        model.position.set(0, 5.8, 0);
        model.rotation.set(0, 0, 0);

        // 地图大小
        model.scale.set(2, 2, 2);
        model.updateMatrixWorld(true);

        // 先读取 Blender 里的 hotspot 位置
        model.traverse(child => {
          const meshName = child.name.toLowerCase();

          if (meshName.startsWith('hotspot_')) {
            updateLegacyAreaFromObject(child);
            child.visible = false;
          }
        });

        // 再根据更新后的 hotspot 生成网页上的五个点
        createLegendHelperDots();
        createLegacyHooks();
        createHotspotButtons();

        // 再处理山、地图线、底座、duomo
        model.traverse(child => {
          if (!child.isMesh) return;

          const meshName = child.name.toLowerCase();

          const isMountain = meshName.startsWith('mountain_');
          const isMapLine = meshName.includes('map_line');
          const isTerrainBase = meshName.includes('terrain_base');
          const isDuomo = meshName.includes('duomo');

          if (isMountain) {
            const key = getKeyFromName(meshName);
            const vertexCount = child.geometry?.attributes?.position?.count || 0;

            const particleCount = Math.min(
              52000,
              Math.max(22000, Math.floor(vertexCount * 5.0))
            );

            createMountainParticlesFromMesh(child, particleCount, key);

            child.visible = false;
            child.material = new THREE.MeshBasicMaterial({
              color: BG_COLOR,
              transparent: true,
              opacity: 0,
              depthWrite: false
            });

            console.log('Converted named mountain:', child.name, key, particleCount);
            return;
          }

          if (isMapLine) {
            const vertexCount = child.geometry?.attributes?.position?.count || 0;

            const mapPointCount = Math.min(
              240000,
              Math.max(90000, Math.floor(vertexCount * 34))
            );

            createDenseMapPointsFromMesh(child, mapPointCount);

            child.visible = false;
            child.material = new THREE.MeshBasicMaterial({
              color: BG_COLOR,
              transparent: true,
              opacity: 0,
              depthWrite: false
            });

            child.castShadow = false;
            child.receiveShadow = false;

            console.log('Converted Map_Line to dense points:', child.name, mapPointCount);
            return;
          }

          if (isTerrainBase) {
            const vertexCount = child.geometry?.attributes?.position?.count || 0;

            const terrainPointCount = Math.min(
              260000,
              Math.max(130000, Math.floor(vertexCount * 30))
            );

            createTerrainBaseParticlesFromMesh(child, terrainPointCount);

            // 隐藏原来的实体平面，只保留淡粒子底座
            child.visible = false;
            child.material = new THREE.MeshBasicMaterial({
              color: BG_COLOR,
              transparent: true,
              opacity: 0,
              depthWrite: false
            });

            child.castShadow = false;
            child.receiveShadow = false;

            console.log('Converted Terrain_Base to soft particles:', child.name, terrainPointCount);
            return;
          }

          if (isDuomo) {
            const vertexCount = child.geometry?.attributes?.position?.count || 0;

            const duomoPointCount = Math.min(
              42000,
              Math.max(16000, Math.floor(vertexCount * 10))
            );

            createDuomoParticlesFromMesh(child, duomoPointCount);

            child.visible = false;
            child.material = new THREE.MeshBasicMaterial({
              color: BG_COLOR,
              transparent: true,
              opacity: 0,
              depthWrite: false
            });

            child.castShadow = false;
            child.receiveShadow = false;

            console.log('Converted Duomo to particles:', child.name, duomoPointCount);
            return;
          }

          // 其他辅助 mesh 暂时隐藏，避免乱入
          child.visible = false;
        });

        mapSceneGroup.add(model);
        document.body.classList.add('model-loaded');
        console.log('New mountain_map GLB loaded:', model);
      },
      undefined,
      error => {
        console.error('mountain_map GLB load error:', error);
      }
    );
  }

  function createWorld() {
    createBackgroundStars();

    createUnifiedMapModel();

    createSnow();
    createForegroundSnow();
    
    createIntroParticleRings();
    createRitualForegroundSnow();
    createChapterCloud();
  }

  createWorld();

  function setMapSceneOpacity(progress) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);

    mapSceneGroup.traverse(obj => {
      if (!obj.material) return;

      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      materials.forEach(mat => {
        if (mat.userData.baseOpacity === undefined) {
          mat.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1;
        }

        mat.transparent = true;
        mat.opacity = mat.userData.baseOpacity * p;

        // 完全透明时不写入深度，避免看不见但挡住五环
        mat.depthWrite = p > 0.15;
      });
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

  function makeInterviewList(categoryKey, labelPrefix) {
    const total = CHAPTERS[categoryKey]?.total ?? 10;
    const types = ['text', 'audio', 'video'];

    return Array.from({ length: total }, (_, i) => {
      const type = types[i % types.length];

      return {
        id: i + 1,
        type,
        label: `${labelPrefix} ${i + 1}`,
        title: `Intervista ${i + 1}`,
        text: `Placeholder intervista ${i + 1} per ${CHAPTERS[categoryKey]?.title || categoryKey}.`
      };
    });
  }

  const INTERVIEWS_BY_CATEGORY = {
    festa: makeInterviewList('festa', 'Celebrazione'),
    opportunita: makeInterviewList('opportunita', 'Opportunità'),
    trasformazione: makeInterviewList('trasformazione', 'Cambiamento'),
    criticita: makeInterviewList('criticita', 'Problemi'),
    relazioni: makeInterviewList('relazioni', 'Relazioni')
  };

  const exploredByCategory = {
    festa: new Set(),
    opportunita: new Set(),
    trasformazione: new Set(),
    criticita: new Set(),
    relazioni: new Set()
  };

  function getChapterCameraView(pos, key) {
    // 让相机看向山顶上方一点，这样山会落在画面下半部，上面留白更多
    const target = pos.clone();
    target.y += 7.5; //上方留白

    const yaw = OVERVIEW_CAMERA.yaw;
    const pitch = 0.16;
    const radius = 34; // zoom-in 更近 / 更远

    const x = Math.sin(yaw) * Math.cos(pitch) * radius;
    const y = Math.sin(pitch) * radius;
    const z = Math.cos(yaw) * Math.cos(pitch) * radius;

    const cameraPos = target.clone().add(new THREE.Vector3(x, y, z));

    // 防止相机太低，穿到山里
    cameraPos.y = Math.max(cameraPos.y, pos.y + 7);

    return {
      cameraPos,
      target
    };
  }

  function startChapterTransition(data) {
    const chapter = CHAPTERS[data.key];
    if (!chapter) return;

    appState.view = 'transition';
    appState.transitionStart = clock.getElapsedTime();
    appState.transitionDuration = 1.45;
    appState.targetChapter = chapter;

    if (panel) panel.classList.add('hidden');
    if (mediaPanel) mediaPanel.classList.add('hidden');
    if (mediaMap) mediaMap.classList.remove('has-open');

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

    if (chapterNumber) chapterNumber.textContent = chapter.id;
    if (chapterTitle) chapterTitle.textContent = chapter.title;
    if (chapterSubtitle) chapterSubtitle.textContent = chapter.subtitle;

    if (chapterContainer) chapterContainer.classList.remove('hidden');

    renderInterviewNodes(chapter.key);
    updateCategoryProgress();

    document.body.classList.remove('is-transitioning');
    document.body.classList.add('chapter-active');
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

    if (chapterContainer) chapterContainer.classList.add('hidden');
    if (mediaPanel) mediaPanel.classList.add('hidden');
    if (mediaMap) mediaMap.classList.remove('has-open');
    document.querySelectorAll('.interview-node').forEach(node => {
      node.classList.remove('is-active');
    });

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

    document.querySelectorAll('.category-item').forEach(item => {
      const key = item.dataset.key;
      const chapter = CHAPTERS[key];
      const meta = item.querySelector('.category-meta');

      if (!chapter || !meta) return;

      const explored = exploredByCategory[key]?.size || 0;
      const total = chapter.total ?? 10;
      const percent = total > 0
        ? Math.min(100, Math.round((explored / total) * 100))
        : 0;

      overallExplored += explored;
      overallTotal += total;

      meta.textContent = `Esplorazione ${explored} / ${total}`;
      item.style.setProperty('--progress', `${percent}%`);
    });
  }

  function renderInterviewNodes(categoryKey) {
    const container = document.getElementById('interviewNodes');

    if (!container || !mediaPanel || !mediaMap) return;

    container.innerHTML = '';

    const interviews = INTERVIEWS_BY_CATEGORY[categoryKey] || [];

    interviews.forEach((item, index) => {
      const button = document.createElement('button');

      button.className = `media-node interview-node interview-${item.type}`;
      if (exploredByCategory[categoryKey]?.has(item.id)) {
        button.classList.add('is-viewed');
      }
      button.dataset.category = categoryKey;
      button.dataset.id = item.id;
      button.setAttribute('aria-label', item.title);

      // 10 buttons: two rows of five
      const total = interviews.length;

      // 采访数量越多，画布越宽；鼠标左右移动时可以看到更多按钮
      const virtualWidth = total > 40 ? 190 : total > 20 ? 155 : 115;
      container.style.setProperty('--interview-width', `${virtualWidth}vw`);

      const cols = total > 40 ? 12 : total > 20 ? 8 : 5;
      const rows = Math.ceil(total / cols);

      const col = index % cols;
      const row = Math.floor(index / cols);

      // 基础网格，但加入轻微错位，避免太机械
      const xBase = 7 + (col / Math.max(cols - 1, 1)) * 86;
      const yBase = 34 + (row / Math.max(rows - 1, 1)) * 46;

      const offsetX = Math.sin(index * 1.7) * 2.8;
      const offsetY = Math.cos(index * 2.1) * 3.2;

      button.style.left = `${xBase + offsetX}%`;
      button.style.top = `${yBase + offsetY}%`;
      button.style.animationDelay = `${index * -0.12}s`;

      const iconByType = {
        text: '”',
        audio: '▶',
        video: '▦'
      };

      const iconClassByType = {
        text: 'particle-quote',
        audio: 'particle-play',
        video: 'particle-grid'
      };

      button.innerHTML = `
        <span class="particle-icon ${iconClassByType[item.type] || 'particle-quote'}">
          ${iconByType[item.type] || '”'}
        </span>
      `;

      button.addEventListener('click', event => {
        event.stopPropagation();

        exploredByCategory[categoryKey].add(item.id);
        button.classList.add('is-viewed');

        document.querySelectorAll('.interview-node').forEach(node => {
          node.classList.remove('is-active');
        });

        button.classList.add('is-active');

        mediaMap.classList.add('has-open');

        if (mediaPanelLabel) mediaPanelLabel.textContent = item.label;
        if (mediaPanelTitle) mediaPanelTitle.textContent = item.title;
        if (mediaPanelText) mediaPanelText.textContent = item.text;

        mediaPanel.classList.remove('hidden');

        updateCategoryProgress();
      });

      container.appendChild(button);
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

  const categoryItems = document.querySelectorAll('.category-item');

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
    if (!hotspotLayer) return;

    hotspotLayer.innerHTML = '';

    hotspotButtons = legacyAreas.map(area => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `hotspot-btn hotspot-${area.key}`;
      button.dataset.key = area.key;

      button.innerHTML = `
        <span class="hotspot-dot"></span>
        <span class="hotspot-label">
          <strong>${area.title}</strong>
          <small>${area.text}</small>
        </span>
      `;

      button.addEventListener('mouseenter', () => {
        appState.hoverHookObject = findHookByKey(area.key);
      });

      button.addEventListener('mouseleave', () => {
        appState.hoverHookObject = null;
      });

      button.addEventListener('pointerdown', event => {
        event.stopPropagation();
      });

      button.addEventListener('pointerup', event => {
        event.stopPropagation();
      });

      button.addEventListener('click', event => {
        event.stopPropagation();

        const hook = findHookByKey(area.key);
        const y = hookHeightByKey[area.key] || 9.5;

        startChapterTransition({
          id: area.id,
          key: area.key,
          title: area.title,
          text: area.text,
          pos: hook ? hook.userData.pos.clone() : new THREE.Vector3(area.x, y, area.z)
        });
      });

      hotspotLayer.appendChild(button);

      return {
        button,
        area
      };
    });
  }

  function updateHotspotButtons() {
    if (!hotspotLayer) return;

    const shouldShow =
      appState.view === 'overview' &&
      !document.body.classList.contains('intro-active');

    hotspotLayer.classList.toggle('is-visible', shouldShow);

    if (!shouldShow) {
      appState.hoverHookObject = null;
      return;
    }

    const worldPosition = new THREE.Vector3();

    hotspotButtons.forEach(({ button, area }) => {
      const hook = findHookByKey(area.key);

      if (hook) {
        hook.getWorldPosition(worldPosition);
      } else {
        worldPosition.set(area.x, hookHeightByKey[area.key] || 9.5, area.z);
      }

      worldPosition.project(camera);

      const screenX = (worldPosition.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-worldPosition.y * 0.5 + 0.5) * window.innerHeight;

      const isBehindCamera = worldPosition.z > 1;

      button.style.left = `${screenX}px`;
      button.style.top = `${screenY}px`;
      button.classList.toggle('is-hidden', isBehindCamera);
    });
  }

  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.key;
      const area = legacyAreas.find(a => a.key === key);

      if (!area) return;

      const y = hookHeightByKey[key] || 9.5;

      startChapterTransition({
        id: area.id,
        key: area.key,
        title: area.title,
        text: area.text,
        pos: new THREE.Vector3(area.x, y, area.z)
      });
    });
  });

  // Initialize bottom category progress labels on overview.
  updateCategoryProgress();

  if (closeMediaPanel && mediaPanel) {
    closeMediaPanel.addEventListener('click', event => {
      event.stopPropagation();

      mediaPanel.classList.add('hidden');

      if (mediaMap) mediaMap.classList.remove('has-open');
      document.querySelectorAll('.interview-node').forEach(node => {
        node.classList.remove('is-active');
      });
    });
  }

  if (closePanel && panel) {
    closePanel.addEventListener('click', () => panel.classList.add('hidden'));
  }

  if (aboutBtn && panel && panelLabel && panelTitle && panelText) {
    aboutBtn.addEventListener('click', () => {
      panelLabel.textContent = 'ABOUT';
      panelTitle.textContent = 'Rilievo emotivo';
      panelText.textContent =
        'Cinque cime di significato raccontano le tracce dell’eredità olimpica. Al centro, il nucleo urbano raccoglie traiettorie e anelli ispirati al Duomo.';
      panel.classList.remove('hidden');
    });
  }

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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    const snow = animatedObjects.snow;
    if (!snow) return;

    const arr = snow.geometry.attributes.position.array;
    const base = animatedObjects.snowBase;
    const phase = animatedObjects.snowPhase;
    const amp = animatedObjects.snowAmp;

    function wrap(value, min, max) {
      const range = max - min;
      return ((((value - min) % range) + range) % range) + min;
    }

    for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
      const baseX = base[i];
      const baseY = base[i + 1];
      const baseZ = base[i + 2];

      const isLowLayer = baseY < 18;

      //雪花速度
      const fallSpeed = isLowLayer ? 0.28 : 0.16;

      // 只允许非常轻微的左右漂移，不再整体往某个固定方向飞
      const swayX = Math.sin(t * 0.45 + phase[p]) * amp[p] * 0.65;
      const swayZ = Math.cos(t * 0.38 + phase[p]) * amp[p] * 0.45;

      arr[i] = baseX + swayX;

      // 核心：只沿世界 y 轴向下
      arr[i + 1] = wrap(baseY - t * fallSpeed, 1.2, 72);

      arr[i + 2] = baseZ + swayZ;
    }

    snow.geometry.attributes.position.needsUpdate = true;

    // 关键：雪不再跟随相机
    snow.position.set(0, 0, 0);
  }

  function animateForegroundSnow(t) {
    const snow = animatedObjects.foregroundSnow;
    if (!snow) return;

    const arr = snow.geometry.attributes.position.array;
    const base = animatedObjects.foregroundSnowBase;
    const phase = animatedObjects.foregroundSnowPhase;
    const amp = animatedObjects.foregroundSnowAmp;

    function wrap(value, min, max) {
      const range = max - min;
      return ((((value - min) % range) + range) % range) + min;
    }

    for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
      const baseX = base[i];
      const baseY = base[i + 1];
      const baseZ = base[i + 2];

      const swayX = Math.sin(t * 0.28 + phase[p]) * amp[p] * 0.42;
      const swayZ = Math.cos(t * 0.24 + phase[p]) * amp[p] * 0.28;

      arr[i] = baseX + swayX;
      arr[i + 1] = wrap(baseY - t * 0.34, 1.2, 58);
      arr[i + 2] = baseZ + swayZ;
    }

    snow.geometry.attributes.position.needsUpdate = true;
    snow.position.set(0, 0, 0);
  }

  function animateIntroRings(t) {
    const rings = animatedObjects.introRings;
    if (!rings || !rings.visible) return;

    const arr = rings.geometry.attributes.position.array;
    const base = animatedObjects.introRingsBase;
    const phase = animatedObjects.introRingsPhase;
    const amp = animatedObjects.introRingsAmp;
    const targets = animatedObjects.introRingsTargets;
    const cpRing = animatedObjects.introRingsCountPerRing;

    const progress = appState.ritualScrollProgress;
    const land = easeInOutCubic(progress);

    if (ritualHint) {
      const hintFade = smoothstep(0.02, 0.24, progress);
      ritualHint.style.opacity = String(1 - hintFade);

      if (progress > 0.28) {
        ritualHint.classList.add('hidden');
      } else {
        ritualHint.classList.remove('hidden');
      }
    }

    // 滚动到后半段时提前显示地图/山，不要到最后才突然出现
    if (mapSceneGroup) {
      mapSceneGroup.visible = true;
    
      // 0.68 是滚动到一半时的视觉临界点，0.94 是快结束时完全显示地图的点
      const reveal = smoothstep(0.68, 0.94, progress);
      setMapSceneOpacity(reveal);
    }

    // Smooth the mouse parallax target
    appState.ritualPointerX = THREE.MathUtils.lerp(
      appState.ritualPointerX,
      appState.ritualPointerTargetX,
      0.06
    );

    appState.ritualPointerY = THREE.MathUtils.lerp(
      appState.ritualPointerY,
      appState.ritualPointerTargetY,
      0.06
    );

    for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
      const bx = base[i];
      const by = base[i + 1];
      const bz = base[i + 2];

      const shimX = Math.sin(t * 0.50 + phase[p]) * amp[p] * 0.22 * (1 - land);
      const shimY = Math.cos(t * 0.42 + phase[p] * 1.1) * amp[p] * 0.07 * (1 - land);
      const shimZ = Math.sin(t * 0.38 + phase[p] * 0.9) * amp[p] * 0.22 * (1 - land);

      const gIdx =
        targets && cpRing > 0 && p < cpRing * 5
          ? Math.floor(p / cpRing)
          : -1;

      if (gIdx >= 0) {
        const target = targets[gIdx];

        // 每个环在下滑过程中慢慢缩小
        const ringScale = THREE.MathUtils.lerp(1.0, 0.018, land);

        // 当前粒子相对于本环中心的位置
        const localX = bx - target.cx;
        const localY = by - target.cy;
        const localZ = bz - target.cz;

        // 目标位置：每个环缩小后落到对应山顶
        const targetX = target.tx + localX * ringScale;
        const targetY = target.ty + localY * ringScale;
        const targetZ = target.tz + localZ * ringScale;

        arr[i]     = THREE.MathUtils.lerp(bx, targetX, land) + shimX;
        arr[i + 1] = THREE.MathUtils.lerp(by, targetY, land) + shimY;
        arr[i + 2] = THREE.MathUtils.lerp(bz, targetZ, land) + shimZ;
      } else {
        // 少量环境尘埃：跟随下落但逐渐散开
        arr[i]     = bx + shimX;
        arr[i + 1] = by - progress * 10 + shimY;
        arr[i + 2] = bz + shimZ;
      }
    }

    rings.geometry.attributes.position.needsUpdate = true;

    // 前半段保持你现在的大五环；后半段逐渐回到世界坐标，方便落到山上
    const groupScaleX = THREE.MathUtils.lerp(1.18, 1.0, land);
    const groupScaleY = THREE.MathUtils.lerp(1.10, 1.0, land);
    const groupScaleZ = THREE.MathUtils.lerp(1.12, 1.0, land);

    rings.scale.set(groupScaleX, groupScaleY, groupScaleZ);

    // 下落过程中逐渐取消一开始的视觉旋转，避免落点偏掉
    rings.rotation.y = 0;
    rings.rotation.z = 0;

    // 鼠标漂浮只在前半段明显；落山时收回到真实世界坐标
    rings.position.set(
      appState.ritualPointerX * 0.35 * (1 - land),
      appState.ritualPointerY * 0.20 * (1 - land),
      0
    );

    if (appState.view === 'particle-ritual') {
      const disappear = smoothstep(0.86, 1.0, progress);

      const targetOpacity = THREE.MathUtils.lerp(0.72, 0.0, disappear);

      rings.material.opacity = THREE.MathUtils.lerp(
        rings.material.opacity,
        targetOpacity,
        0.08
      );

      // 五环粒子落到山上后缩到 0，避免彩色残留点漂浮在画面里
      const landingSize = THREE.MathUtils.lerp(0.46, 0.12, land);
      const targetSize = THREE.MathUtils.lerp(landingSize, 0.0, disappear);

      rings.material.size = targetSize;
    }
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
    const cloud = animatedObjects.chapterCloud;
    if (!cloud || !cloud.visible) return;

    const arr = cloud.geometry.attributes.position.array;
    const base = animatedObjects.chapterBase;
    const phase = animatedObjects.chapterPhase;
    const amp = animatedObjects.chapterAmp;

    const isTransition = appState.view === 'transition';
    const transitionSpeed = isTransition ? 4.2 : 0.42;

    for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
      arr[i] =
        base[i] +
        Math.sin(t * 0.36 + phase[p]) * amp[p] * 1.8;

      arr[i + 1] =
        base[i + 1] +
        Math.sin(t * 0.28 + phase[p]) * amp[p] * 0.7;

      arr[i + 2] += transitionSpeed;

      if (arr[i + 2] > 62) {
        arr[i + 2] = -120;
      }
    }

    cloud.geometry.attributes.position.needsUpdate = true;

    if (isTransition) {
      const elapsed = t - appState.transitionStart;
      const progress = THREE.MathUtils.clamp(elapsed / appState.transitionDuration, 0, 1);

      cloud.material.opacity = THREE.MathUtils.lerp(0.05, 0.92, progress);
      cloud.material.size = THREE.MathUtils.lerp(0.08, 0.32, progress);
    } else {
      cloud.material.opacity = 0.62 + Math.sin(t * 0.8) * 0.08;
      cloud.material.size = 0.13 + Math.sin(t * 0.7) * 0.015;
    }
  }

  function animateHooks(t) {
  animatedObjects.hooks.forEach((hook, index) => {
    hook.position.y = hook.userData.pos.y + Math.sin(t * 1.25 + index * 0.9) * 0.34;

    if (hook === appState.hoverHookObject) return;

    hook.material.opacity = 0.78 + Math.sin(t * 1.9 + index) * 0.11;
    const s = 4.7 + Math.sin(t * 1.2 + index) * 0.18;
    hook.scale.set(s, s, 1);
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
    const isRitual = appState.view === 'particle-ritual';

    function wrapVal(v, lo, hi) {
      const range = hi - lo;
      return ((((v - lo) % range) + range) % range) + lo;
    }

    const fine = animatedObjects.ritualSnowFine;
    if (fine && fine.visible) {
      const arr   = fine.geometry.attributes.position.array;
      const base  = animatedObjects.ritualSnowFineBase;
      const phase = animatedObjects.ritualSnowFinePhase;
      const amp   = animatedObjects.ritualSnowFineAmp;

      for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
        arr[i]     = base[i] + Math.sin(t * 0.28 + phase[p]) * amp[p] * 1.4;
        arr[i + 1] = wrapVal(base[i + 1] - t * 0.20, -20, 18);
        arr[i + 2] = base[i + 2];
      }
      fine.geometry.attributes.position.needsUpdate = true;

      fine.material.opacity = THREE.MathUtils.lerp(
        fine.material.opacity,
        isRitual ? 0.46 : 0,
        0.025
      );
      if (!isRitual && fine.material.opacity < 0.005) fine.visible = false;
    }

    const large = animatedObjects.ritualSnowLarge;
    if (large && large.visible) {
      const arr   = large.geometry.attributes.position.array;
      const base  = animatedObjects.ritualSnowLargeBase;
      const phase = animatedObjects.ritualSnowLargePhase;
      const amp   = animatedObjects.ritualSnowLargeAmp;

      for (let i = 0, p = 0; i < arr.length; i += 3, p++) {
        arr[i]     = base[i] + Math.sin(t * 0.16 + phase[p]) * amp[p] * 0.9;
        arr[i + 1] = wrapVal(base[i + 1] - t * 0.09, -14, 10);
        arr[i + 2] = base[i + 2];
      }
      large.geometry.attributes.position.needsUpdate = true;

      large.material.opacity = THREE.MathUtils.lerp(
        large.material.opacity,
        isRitual ? 0.28 : 0,
        0.025
      );
      if (!isRitual && large.material.opacity < 0.005) large.visible = false;
    }
  }

  function animate() {
    const t = clock.getElapsedTime();

    const interviewContainer = document.getElementById('interviewNodes');

    if (interviewContainer) {
      interviewPanCurrent += (interviewPanTarget - interviewPanCurrent) * 0.06;
      interviewContainer.style.setProperty('--pan-x', `${interviewPanCurrent}px`);
    }

    if (appState.view === 'overview' || appState.view === 'transition') {
      animateTerrain(t);
      animateSnow(t);
      animateForegroundSnow(t);
      animateHooks(t);
      animateLines(t);
      applyMarkerHoverVisual();

      if (appState.view === 'overview') {
        updateOverviewCameraByPointer();
      }
    }

    animateIntroCloud(t);
    animateIntroRings(t);
    animateRitualSnow(t);
    animateChapterCloud(t);

    if (appState.view === 'transition') {
      const elapsed = t - appState.transitionStart;
      const progress = THREE.MathUtils.clamp(elapsed / appState.transitionDuration, 0, 1);
      const eased = easeInOutCubic(progress);

      // 从用户当前视角平滑冲向点击点
      camera.position.lerpVectors(
        appState.cameraStart,
        appState.cameraEnd,
        eased
      );

      orbit.target.lerpVectors(
        appState.targetStart,
        appState.targetEnd,
        eased
      );

      camera.lookAt(orbit.target);

      if (animatedObjects.chapterCloud) {
        animatedObjects.chapterCloud.material.opacity = THREE.MathUtils.lerp(
          0.05,
          0.95,
          progress
        );

        animatedObjects.chapterCloud.material.size = THREE.MathUtils.lerp(
          0.08,
          0.26,
          progress
        );
      }

      if (progress >= 1 && appState.targetChapter) {
        enterChapter(appState.targetChapter);
      }
    }

    updateHotspotButtons();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  	animate();

	return () => {
		renderer.dispose();
	};
}