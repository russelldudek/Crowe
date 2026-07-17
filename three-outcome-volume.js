import * as THREE from './assets/vendor/three/three.module.min.js';

const FIELD_SPECS = [
  {id: 'outcome', label: 'Outcome', order: '01', color: 0x002e62, x: -2.88, start: [-3.12, .78, .92], rotation: [.18, .44, .14]},
  {id: 'workflow', label: 'Workflow', order: '02', color: 0x013b78, x: -1.44, start: [-1.20, -.52, -.76], rotation: [-.12, -.34, -.11]},
  {id: 'authority', label: 'Authority', order: '03', color: 0x002e62, x: 0, start: [-.18, .42, .64], rotation: [.10, .28, .09]},
  {id: 'evidence', label: 'Evidence', order: '04', color: 0x013b78, x: 1.44, start: [1.72, -.64, -.88], rotation: [-.14, -.42, -.12]},
  {id: 'ownership', label: 'Ownership', order: '05', color: 0x002e62, x: 2.88, start: [2.62, .66, .72], rotation: [.16, .36, .12]},
];

const desktopCamera = {
  position: [0, 2.15, 10.2],
  target: [0, -.32, 0],
  fov: 36,
};

const mobileCamera = {
  position: [0, 3.35, 12.6],
  target: [0, -.48, 0],
  fov: 34,
};

const diagnostics = {
  fieldCount: FIELD_SPECS.length,
  labelCount: FIELD_SPECS.length,
  fieldLabels: FIELD_SPECS.map(spec => spec.label),
  meshCount: 0,
  settled: false,
  fallbackActive: false,
  reducedMotion: false,
  continuousAnimation: false,
  frameCount: 0,
  phase: 'booting',
};
window.__outcomeVolumeDiagnostics = diagnostics;

const clamp01 = value => Math.min(1, Math.max(0, value));
const easeInOutCubic = value => value < .5
  ? 4 * value * value * value
  : 1 - ((-2 * value + 2) ** 3) / 2;
const easeOutQuart = value => 1 - (1 - value) ** 4;

export function activateFallback(stage) {
  if (!stage) return;
  stage.dataset.fallback = 'true';
  stage.dataset.state = 'settled';
  const status = stage.querySelector('.outcome-volume__status');
  if (status) status.textContent = 'Outcome, Workflow, Authority, Evidence, and Ownership aligned into one owned operation.';
  diagnostics.fallbackActive = true;
  diagnostics.settled = true;
  diagnostics.continuousAnimation = false;
  diagnostics.phase = 'fallback';
}

function createFieldLabelTexture(spec) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 208;
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(1, 30, 65, .92)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f5a800';
  context.fillRect(0, 0, canvas.width, 13);

  context.textBaseline = 'alphabetic';
  context.font = '800 45px Helvetica Neue, Helvetica, Arial, sans-serif';
  context.fillStyle = '#f7d894';
  context.fillText(spec.order, 30, 66);

  let labelSize = 92;
  const maxWidth = canvas.width - 60;
  do {
    context.font = `900 ${labelSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;
    if (context.measureText(spec.label.toUpperCase()).width <= maxWidth) break;
    labelSize -= 4;
  } while (labelSize > 62);

  context.fillStyle = '#ffffff';
  context.fillText(spec.label.toUpperCase(), 30, 169);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.name = `${spec.id}-field-label-texture`;
  return texture;
}

function createField(spec) {
  const group = new THREE.Group();
  group.name = `field-${spec.id}`;

  const geometry = new THREE.BoxGeometry(1.12, 2.7, .28, 1, 1, 1);
  geometry.applyMatrix4(new THREE.Matrix4().makeShear(.10, 0, 0, 0, 0, 0));
  const color = new THREE.Color(spec.color);
  const material = new THREE.MeshPhysicalMaterial({
    color,
    emissive: color.clone().multiplyScalar(.13),
    transparent: true,
    opacity: .34,
    roughness: .34,
    metalness: .08,
    clearcoat: .32,
    clearcoatRoughness: .54,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${spec.id}-surface`;
  group.add(mesh);

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x8ee6cf,
    transparent: true,
    opacity: .26,
  });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial);
  edges.name = `${spec.id}-edges`;
  group.add(edges);

  const capMaterial = new THREE.MeshBasicMaterial({
    color: 0x8ee6cf,
    transparent: true,
    opacity: .18,
  });
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.16, .055, .34), capMaterial);
  cap.position.y = 1.37;
  cap.name = `${spec.id}-confirmation`;
  group.add(cap);

  const labelTexture = createFieldLabelTexture(spec);
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    opacity: .18,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.08, .54), labelMaterial);
  label.position.set(.015, -.06, .151);
  label.name = `${spec.id}-field-label`;
  label.renderOrder = 6;
  group.add(label);

  group.position.set(...spec.start);
  group.rotation.set(...spec.rotation);

  return {
    id: spec.id,
    label: spec.label,
    group,
    material,
    edgeMaterial,
    capMaterial,
    labelMaterial,
    labelTexture,
    startPosition: new THREE.Vector3(...spec.start),
    finalPosition: new THREE.Vector3(spec.x, 0, 0),
    startRotation: new THREE.Euler(...spec.rotation),
    finalRotation: new THREE.Euler(0, 0, -.055),
  };
}

function createFoundation(parent) {
  const group = new THREE.Group();
  group.name = 'integration-foundation';

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x002e62,
    emissive: new THREE.Color(0x002e62).multiplyScalar(.10),
    transparent: true,
    opacity: .30,
    roughness: .48,
    metalness: .06,
  });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(8.25, .22, 3.2), material);
  plate.position.set(0, -1.72, -.40);
  plate.rotation.z = -.035;
  plate.name = 'integration-foundation-surface';
  group.add(plate);

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x54c0e8,
    transparent: true,
    opacity: .22,
  });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(plate.geometry), edgeMaterial);
  edges.position.copy(plate.position);
  edges.rotation.copy(plate.rotation);
  edges.name = 'integration-foundation-edges';
  group.add(edges);

  for (let index = 0; index < FIELD_SPECS.length; index += 1) {
    const railMaterial = new THREE.MeshBasicMaterial({
      color: 0x54c0e8,
      transparent: true,
      opacity: .08,
    });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(.04, .035, 2.58), railMaterial);
    rail.position.set(FIELD_SPECS[index].x, -1.57, -.26);
    rail.name = `foundation-rail-${FIELD_SPECS[index].id}`;
    group.add(rail);
  }

  parent.add(group);
  return {group, material, edgeMaterial};
}

function createContinuitySeam(parent) {
  const length = 7.72;
  const material = new THREE.MeshBasicMaterial({
    color: 0xf5a800,
    transparent: true,
    opacity: .96,
  });
  const geometry = new THREE.BoxGeometry(length, .055, .075);
  geometry.translate(length / 2, 0, 0);
  const seam = new THREE.Mesh(geometry, material);
  seam.position.set(-length / 2, -1.28, .30);
  seam.scale.x = .001;
  seam.name = 'owned-operation-continuity-seam';
  parent.add(seam);

  const terminalMaterial = new THREE.MeshBasicMaterial({
    color: 0xf5a800,
    transparent: true,
    opacity: 0,
  });
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(.10, .42, .12), terminalMaterial);
  terminal.position.set(length / 2, -1.28, .30);
  terminal.name = 'owned-operation-terminal';
  parent.add(terminal);

  return {seam, material, terminal, terminalMaterial};
}

function createBackdrop(parent) {
  const material = new THREE.LineBasicMaterial({
    color: 0x54c0e8,
    transparent: true,
    opacity: .12,
  });

  for (let index = 0; index < 3; index += 1) {
    const width = 8.8 - index * .62;
    const height = 4.8 - index * .46;
    const depth = -1.2 - index * .34;
    const points = [
      new THREE.Vector3(-width / 2, -height / 2, depth),
      new THREE.Vector3(width / 2 - .52, -height / 2, depth),
      new THREE.Vector3(width / 2, -height / 2 + .52, depth),
      new THREE.Vector3(width / 2, height / 2, depth),
      new THREE.Vector3(-width / 2 + .52, height / 2, depth),
      new THREE.Vector3(-width / 2, height / 2 - .52, depth),
      new THREE.Vector3(-width / 2, -height / 2, depth),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material.clone());
    line.rotation.z = -.025 * index;
    line.name = `architectural-frame-${index + 1}`;
    parent.add(line);
  }
}

function applyCameraProfile(camera, stage) {
  const profile = stage.clientWidth <= 560 ? mobileCamera : desktopCamera;
  camera.fov = profile.fov;
  camera.position.set(...profile.position);
  camera.lookAt(...profile.target);
  camera.updateProjectionMatrix();
}

export function initOutcomeVolume(stage) {
  if (!stage) return;
  const canvas = stage.querySelector('.outcome-volume__canvas');
  const status = stage.querySelector('.outcome-volume__status');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  diagnostics.reducedMotion = reducedMotionQuery.matches;

  if (!canvas || window.__forceOutcomeVolumeFallback) {
    activateFallback(stage);
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    activateFallback(stage);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  const system = new THREE.Group();
  system.rotation.set(.06, -.08, 0);
  scene.add(system);

  scene.add(new THREE.HemisphereLight(0xe4eef5, 0x011e41, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-3.5, 5.5, 7.5);
  scene.add(key);
  const amber = new THREE.PointLight(0xf5a800, 7.0, 14, 2);
  amber.position.set(4.4, -.4, 3.2);
  scene.add(amber);
  const cyan = new THREE.PointLight(0x54c0e8, 4.0, 12, 2);
  cyan.position.set(-4.5, 2.4, 2.4);
  scene.add(cyan);

  createBackdrop(system);
  const fields = FIELD_SPECS.map(spec => {
    const field = createField(spec);
    system.add(field.group);
    return field;
  });
  const foundation = createFoundation(system);
  const continuity = createContinuitySeam(system);

  let objectCount = 0;
  scene.traverse(object => {
    if (object.isMesh || object.isLine || object.isLineSegments) objectCount += 1;
  });
  diagnostics.meshCount = objectCount;
  diagnostics.fallbackActive = false;
  diagnostics.phase = 'aligning';
  stage.dataset.fallback = 'false';
  stage.dataset.state = 'aligning';

  let rafId = 0;
  let startTime = 0;
  let settled = false;

  function resize() {
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    applyCameraProfile(camera, stage);
    if (settled) renderer.render(scene, camera);
  }

  function setFieldProgress(field, progress) {
    field.group.position.lerpVectors(field.startPosition, field.finalPosition, progress);
    field.group.rotation.set(
      THREE.MathUtils.lerp(field.startRotation.x, field.finalRotation.x, progress),
      THREE.MathUtils.lerp(field.startRotation.y, field.finalRotation.y, progress),
      THREE.MathUtils.lerp(field.startRotation.z, field.finalRotation.z, progress),
    );
    field.material.opacity = THREE.MathUtils.lerp(.34, .68, progress);
    field.edgeMaterial.opacity = THREE.MathUtils.lerp(.26, .78, progress);
    field.capMaterial.opacity = THREE.MathUtils.lerp(.18, .92, progress);
    field.labelMaterial.opacity = THREE.MathUtils.lerp(.18, 1, progress);
  }

  function renderSettled() {
    fields.forEach(field => setFieldProgress(field, 1));
    foundation.material.opacity = .62;
    foundation.edgeMaterial.opacity = .54;
    continuity.seam.scale.x = 1;
    continuity.terminalMaterial.opacity = 1;
    renderer.render(scene, camera);
    diagnostics.frameCount += 1;
    diagnostics.settled = true;
    diagnostics.continuousAnimation = false;
    diagnostics.phase = 'settled';
    settled = true;
    stage.dataset.state = 'settled';
    if (status) status.textContent = 'Outcome, Workflow, Authority, Evidence, and Ownership aligned into one owned operation.';
  }

  function settleImmediately() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    renderSettled();
  }

  function tick(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;

    fields.forEach((field, index) => {
      const local = clamp01((elapsed - index * 170) / 1480);
      setFieldProgress(field, easeInOutCubic(local));
    });

    const foundationProgress = easeOutQuart(clamp01((elapsed - 1050) / 720));
    foundation.material.opacity = THREE.MathUtils.lerp(.30, .62, foundationProgress);
    foundation.edgeMaterial.opacity = THREE.MathUtils.lerp(.22, .54, foundationProgress);

    const seamProgress = easeOutQuart(clamp01((elapsed - 1980) / 720));
    continuity.seam.scale.x = Math.max(.001, seamProgress);
    continuity.terminalMaterial.opacity = clamp01((seamProgress - .78) / .22);

    renderer.render(scene, camera);
    diagnostics.frameCount += 1;
    diagnostics.continuousAnimation = true;

    if (elapsed >= 2820) {
      rafId = 0;
      renderSettled();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  if (reducedMotionQuery.matches) {
    settleImmediately();
  } else {
    diagnostics.continuousAnimation = true;
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
    observer.disconnect();
    fields.forEach(field => field.labelTexture.dispose());
    renderer.dispose();
  }, {once: true});
}
