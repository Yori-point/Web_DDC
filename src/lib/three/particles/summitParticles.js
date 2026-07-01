// @ts-nocheck

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const SUMMIT_VIEW_PRESETS = {
  criticita: {
    sceneYaw: -0.38,
    modelYaw: 0.18,
    localX: -5.5,
    localY: -7.4,
    localZ: 0,
    scale: 1.0,
    distance: 8.2,
    verticalOffset: -6.6
  },

  relazioni: {
    sceneYaw: 0.28,
    modelYaw: -0.22,
    localX: 4.5,
    localY: -7.4,
    localZ: -1.5,
    scale: 1.05,
    distance: 8.1,
    verticalOffset: -6.5
  },

  trasformazione: {
    sceneYaw: 0.62,
    modelYaw: 0.42,
    localX: -2.5,
    localY: -7.5,
    localZ: 2.2,
    scale: 1.12,
    distance: 7.8,
    verticalOffset: -6.8
  },

  opportunita: {
    sceneYaw: -0.72,
    modelYaw: -0.48,
    localX: 6.0,
    localY: -7.4,
    localZ: 1.2,
    scale: 0.98,
    distance: 8.4,
    verticalOffset: -6.6
  },

  festa: {
    sceneYaw: 0.92,
    modelYaw: 0.66,
    localX: -7.0,
    localY: -7.4,
    localZ: -0.8,
    scale: 1.08,
    distance: 8.0,
    verticalOffset: -6.7
  }
};

const DEFAULT_SUMMIT_VIEW = {
  sceneYaw: 0,
  modelYaw: 0,
  localX: 0,
  localY: -7.4,
  localZ: 0,
  scale: 1,
  distance: 8.2,
  verticalOffset: -6.6
};

const SUMMIT_MODEL_URL = "/scene.glb";

const MODEL_TARGET_WIDTH = 58;
const MODEL_LOCAL_Y = -7.6;

const SUMMIT_PARTICLE_COUNT = 135000;
const SUMMIT_PARTICLE_SIZE = 0.155;
const SUMMIT_PARTICLE_OPACITY = 0.96;
const SUMMIT_PARTICLE_JITTER = 0.014;

function createSummitParticleTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

  gradient.addColorStop(0.0, "rgba(255,255,255,0.96)");
  gradient.addColorStop(0.20, "rgba(255,255,255,0.52)");
  gradient.addColorStop(0.50, "rgba(255,255,255,0.10)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function getSummitMaterials(animatedObjects) {
  return animatedObjects.summitModelMaterials || [];
}

function setSummitModelOpacity(animatedObjects, opacity) {
  const materials = getSummitMaterials(animatedObjects);

  materials.forEach((material) => {
    material.transparent = true;
    material.opacity = opacity;
    material.needsUpdate = true;
  });
}

function createHiddenMeshMaterial(THREE) {
  return new THREE.MeshBasicMaterial({
    color: 0x070e17,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide
  });
}

function normalizeSummitModel({ THREE, model }) {
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxXZ = Math.max(size.x, size.z, 0.0001);
  const scale = MODEL_TARGET_WIDTH / maxXZ;

  const root = new THREE.Group();
  root.name = "summit-glb-particle-root";

  // The preset scale must multiply this value, never replace it.
  root.userData.baseScale = scale;
  root.userData.baseLocalY = MODEL_LOCAL_Y;
  root.scale.setScalar(scale);

  // Center the GLB in local space before sampling it into particles.
  model.position.set(-center.x, -box.min.y, -center.z);

  root.add(model);
  root.position.set(0, MODEL_LOCAL_Y, 0);

  return root;
}

function collectMeshTrianglesInRootSpace({ THREE, root, model }) {
  root.updateMatrixWorld(true);
  model.updateMatrixWorld(true);

  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const triangles = [];
  let totalArea = 0;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();

  model.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;

    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;
    const triCount = index ? index.count / 3 : Math.floor(position.count / 3);

    mesh.updateMatrixWorld(true);

    for (let i = 0; i < triCount; i++) {
      const ia = index ? index.getX(i * 3) : i * 3;
      const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld).applyMatrix4(rootInverse);
      b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld).applyMatrix4(rootInverse);
      c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld).applyMatrix4(rootInverse);

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
  });

  return { triangles, totalArea };
}

function samplePointFromTriangles({ THREE, triangles, totalArea }) {
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

  return tri.a.clone()
    .add(tri.b.clone().sub(tri.a).multiplyScalar(u))
    .add(tri.c.clone().sub(tri.a).multiplyScalar(v));
}

function createSummitParticlesFromModel({ THREE, root, model }) {
  const collected = collectMeshTrianglesInRootSpace({ THREE, root, model });

  if (!collected.triangles.length || collected.totalArea <= 0) {
    console.warn("No triangles found for summit particle sampling.");
    return null;
  }

  const { triangles, totalArea } = collected;
  const positions = [];
  const colors = [];

  let minY = Infinity;
  let maxY = -Infinity;

  triangles.forEach((tri) => {
    minY = Math.min(minY, tri.a.y, tri.b.y, tri.c.y);
    maxY = Math.max(maxY, tri.a.y, tri.b.y, tri.c.y);
  });

  const yRange = Math.max(maxY - minY, 0.0001);

  for (let i = 0; i < SUMMIT_PARTICLE_COUNT; i++) {
    const p = samplePointFromTriangles({ THREE, triangles, totalArea });

    p.x += THREE.MathUtils.randFloatSpread(SUMMIT_PARTICLE_JITTER);
    p.y += THREE.MathUtils.randFloatSpread(SUMMIT_PARTICLE_JITTER * 0.65);
    p.z += THREE.MathUtils.randFloatSpread(SUMMIT_PARTICLE_JITTER);

    positions.push(p.x, p.y, p.z);

    const height = THREE.MathUtils.clamp((p.y - minY) / yRange, 0, 1);
    const ridgeWave =
      0.5 +
      0.5 * Math.sin(p.x * 0.22 + p.y * 0.34 + p.z * 0.1) *
      Math.cos(p.z * 0.12 - p.x * 0.08);

    const sparkle = Math.random() < 0.035 ? 0.22 : 0;
    const brightness = 0.55 + height * 0.22 + ridgeWave * 0.18 + Math.random() * 0.12 + sparkle;

    colors.push(
      0.86 * brightness,
      0.93 * brightness,
      1.0 * brightness
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
  map: createSummitParticleTexture(THREE),
  alphaTest: 0.035,
  size: SUMMIT_PARTICLE_SIZE,
  sizeAttenuation: true,
  vertexColors: true,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  depthTest: true,
  blending: THREE.NormalBlending
});

  const points = new THREE.Points(geometry, material);
  points.name = "summit-glb-surface-particles";
  points.frustumCulled = false;
  points.renderOrder = 72;

  points.userData = {
    baseOpacity: SUMMIT_PARTICLE_OPACITY,
    baseSize: SUMMIT_PARTICLE_SIZE
  };

  return points;
}

function applySummitModelPreset(animatedObjects, preset = DEFAULT_SUMMIT_VIEW) {
  const root = animatedObjects.summitModelRoot;
  if (!root) return;

  const baseScale = root.userData.baseScale || 1;

  root.position.set(
    preset.localX,
    preset.localY,
    preset.localZ
  );

  root.userData.baseLocalY = preset.localY;

  root.rotation.set(
    0,
    preset.modelYaw,
    0
  );

  root.scale.setScalar(baseScale * preset.scale);
}

function rememberSummitBaseTransform(group) {
  if (!group) return;

  group.userData.summitBasePosition = group.position.clone();
  group.userData.summitBaseRotationY = group.rotation.y;
}

/**
 * Compatibility name kept intentionally:
 * initScene.js already imports createSummitParticles().
 * Internally this now creates a particle cloud sampled from /scene.glb.
 */
export function createSummitParticles({
  THREE,
  scene,
  animatedObjects
}) {
  const summitScene = new THREE.Group();
  summitScene.name = "summit-glb-particle-scene";
  summitScene.visible = false;
  scene.add(summitScene);

  animatedObjects.summitScene = summitScene;
  animatedObjects.summitModel = null;
  animatedObjects.summitModelRoot = null;
  animatedObjects.summitModelParticles = null;
  animatedObjects.summitModelMaterials = [];
  animatedObjects.summitModelReady = false;

  const loader = new GLTFLoader();

  loader.load(
    SUMMIT_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.name = "summit-glb-source-model";

      model.traverse((child) => {
        if (!child.isMesh) return;

        child.frustumCulled = false;
        child.castShadow = false;
        child.receiveShadow = false;
        child.renderOrder = 70;

        child.material = createHiddenMeshMaterial(THREE);
      });

      const normalizedRoot = normalizeSummitModel({ THREE, model });
      summitScene.add(normalizedRoot);
      summitScene.updateMatrixWorld(true);
      normalizedRoot.updateMatrixWorld(true);

      const particleCloud = createSummitParticlesFromModel({
        THREE,
        root: normalizedRoot,
        model
      });

      if (particleCloud) {
        normalizedRoot.add(particleCloud);
        animatedObjects.summitModelParticles = particleCloud;
        animatedObjects.summitModelMaterials = [particleCloud.material];
      } else {
        animatedObjects.summitModelMaterials = [];
      }

      // Hide the source mesh after sampling. The visible terrain is now Points.
      model.traverse((child) => {
        if (child.isMesh) child.visible = false;
      });

      normalizedRoot.visible = true;

      animatedObjects.summitModel = model;
      animatedObjects.summitModelRoot = normalizedRoot;
      animatedObjects.summitModelReady = true;

      applySummitModelPreset(
        animatedObjects,
        animatedObjects.summitCurrentPreset || DEFAULT_SUMMIT_VIEW
      );

      setSummitModelOpacity(animatedObjects, 0);

      console.log("scene.glb converted to summit particles", {
        particleCount: particleCloud?.geometry?.attributes?.position?.count || 0,
        position: summitScene.position.toArray()
      });
    },
    undefined,
    (error) => {
      console.error("scene.glb summit particle load error:", error);
    }
  );
}

export function placeSummitParticlesAtMountain({
  THREE,
  animatedObjects,
  mountainPos,
  cameraDirection,
  cameraPosition = null,
  targetPosition = null,
  categoryKey = null
}) {
  const group = animatedObjects.summitScene;
  if (!group) return;

  const preset = SUMMIT_VIEW_PRESETS[categoryKey] || DEFAULT_SUMMIT_VIEW;
  animatedObjects.summitCurrentPreset = preset;

  group.visible = true;
  setSummitModelOpacity(animatedObjects, 0);

  if (cameraPosition && targetPosition) {
    const forward = targetPosition.clone().sub(cameraPosition);

    if (forward.lengthSq() < 0.0001) {
      forward.set(0, 0, -1);
    }

    forward.normalize();

    group.position.copy(cameraPosition);
    group.position.add(forward.clone().multiplyScalar(preset.distance));
    group.position.y = cameraPosition.y + preset.verticalOffset;

    group.rotation.set(
      0,
      Math.atan2(forward.x, forward.z) + preset.sceneYaw,
      0
    );

    group.scale.set(1, 1, 1);

    applySummitModelPreset(animatedObjects, preset);

    rememberSummitBaseTransform(group);

    return;
  }

  group.position.copy(mountainPos);
  group.position.add(cameraDirection.clone().multiplyScalar(-0.8));
  group.position.y -= 0.4;

  const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
  group.rotation.set(0, angle + preset.sceneYaw, 0);
  group.scale.set(1, 1, 1);

  applySummitModelPreset(animatedObjects, preset);

  rememberSummitBaseTransform(group);
}

export function updateSummitParticlesTransition({
  THREE,
  animatedObjects,
  progress,
  smoothstep
}) {
  if (!animatedObjects.summitScene) return;

  const appear = smoothstep(0.22, 0.78, progress);
  const opacity = THREE.MathUtils.clamp(
    THREE.MathUtils.lerp(0, SUMMIT_PARTICLE_OPACITY, appear),
    0,
    SUMMIT_PARTICLE_OPACITY
  );

  setSummitModelOpacity(animatedObjects, opacity);
}

export function animateSummitParticles({
  THREE,
  animatedObjects,
  t,
  appState
}) {
  const group = animatedObjects.summitScene;
  const root = animatedObjects.summitModelRoot;
  const particles = animatedObjects.summitModelParticles;

  if (!group || !group.visible || !root) return;

  const baseLocalY = root.userData.baseLocalY ?? MODEL_LOCAL_Y;
  root.position.y = baseLocalY + Math.sin(t * 0.12) * 0.035;

  if (particles?.material) {
    particles.material.size =
      (particles.userData.baseSize || SUMMIT_PARTICLE_SIZE) +
      Math.sin(t * 0.55) * 0.006;
  }

  if (
    appState.view === "chapter" ||
    appState.view === "summit-immerse" ||
    appState.view === "summit-title"
  ) {
    setSummitModelOpacity(animatedObjects, SUMMIT_PARTICLE_OPACITY);
  }
}

export function resetSummitParticles({ animatedObjects }) {
  if (animatedObjects.summitScene) {
    animatedObjects.summitScene.visible = false;
  }

  setSummitModelOpacity(animatedObjects, 0);
}
