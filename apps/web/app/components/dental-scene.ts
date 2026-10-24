import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Escultura conceptual propia, no modelo anatómico ni simulación clínica. */
export function createDentalScene(host: HTMLDivElement): () => void {
  const mount = host.querySelector<HTMLDivElement>('.canvas-mount');
  if (!mount) return () => {};
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.dataset.scene = 'fallback';
    return () => {};
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 0.15, 8.5);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  let environment: THREE.WebGLRenderTarget | undefined;
  let frame = 0;
  let active = true;
  let visible = false;
  let stopped = false;
  let resize: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';

  const dispose = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    resize?.disconnect();
    intersection?.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    canvas.removeEventListener('webglcontextlost', lost);
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    scene.environment = null;
    environment?.dispose();
    renderer.dispose();
    canvas.remove();
    host.dataset.scene = 'fallback';
  };
  const lost = (event: Event) => { event.preventDefault(); dispose(); };
  const visibility = () => {
    active = !document.hidden;
    schedule();
  };

  const sculpture = new THREE.Group();
  const orbit = new THREE.Group();
  let elapsed = 0;
  let previous = 0;
  const render = (time: number) => {
    frame = 0;
    if (stopped || !active || !visible) { previous = 0; return; }
    if (previous) elapsed += Math.min((time - previous) / 1000, 0.05);
    previous = time;
    sculpture.rotation.set(0.06 + Math.sin(elapsed * 0.32) * 0.07, -0.28 + Math.sin(elapsed * 0.24) * 0.2, -0.13);
    sculpture.position.y = Math.sin(elapsed * 0.65) * 0.07;
    orbit.rotation.z = Math.sin(elapsed * 0.18) * 0.1;
    try {
      renderer.render(scene, camera);
      host.dataset.scene = 'ready';
      schedule();
    } catch { dispose(); }
  };
  function schedule() {
    if (stopped) return;
    if (active && visible && !frame) frame = requestAnimationFrame(render);
    if (!active || !visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    try { environment = pmrem.fromScene(room, 0.04); }
    finally { room.dispose(); pmrem.dispose(); }
    scene.environment = environment.texture;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x4473d5, 2));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8dbdff, 5);
    rim.position.set(3, -1, -2);
    scene.add(rim);

    const outline = new THREE.Shape();
    outline.moveTo(0, 1.08);
    outline.bezierCurveTo(-0.3, 1.08, -0.49, 1.36, -0.85, 1.2);
    outline.bezierCurveTo(-1.32, 1.02, -1.03, 0.32, -0.91, -0.02);
    outline.bezierCurveTo(-0.72, -0.53, -0.74, -1.32, -0.47, -1.38);
    outline.bezierCurveTo(-0.2, -1.42, -0.28, -0.34, 0, -0.3);
    outline.bezierCurveTo(0.28, -0.34, 0.2, -1.42, 0.47, -1.38);
    outline.bezierCurveTo(0.74, -1.32, 0.72, -0.53, 0.91, -0.02);
    outline.bezierCurveTo(1.03, 0.32, 1.32, 1.02, 0.85, 1.2);
    outline.bezierCurveTo(0.49, 1.36, 0.3, 1.08, 0, 1.08);
    const toothGeometry = new THREE.ExtrudeGeometry(outline, { depth: 0.48, bevelEnabled: true, bevelSegments: 8, steps: 1, bevelSize: 0.17, bevelThickness: 0.25, curveSegments: 28 });
    toothGeometry.center();
    geometries.push(toothGeometry);
    const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf8fbff, roughness: 0.23, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 0.9 });
    materials.push(ceramic);
    sculpture.add(new THREE.Mesh(toothGeometry, ceramic));
    scene.add(sculpture);

    const ringGeometry = new THREE.TorusGeometry(1.95, 0.009, 8, 140);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xa6caff, transparent: true, opacity: 0.72 });
    geometries.push(ringGeometry);
    materials.push(ringMaterial);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.set(1.12, -0.32, -0.4);
    orbit.add(ring);
    const satelliteGeometry = new THREE.SphereGeometry(0.052, 16, 12);
    const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    geometries.push(satelliteGeometry);
    materials.push(satelliteMaterial);
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    satellite.position.set(1.72, 0.65, 0.65);
    orbit.add(satellite);
    scene.add(orbit);

    resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height || stopped) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      schedule();
    });
    resize.observe(host);
    intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      schedule();
    });
    intersection.observe(host);
    active = !document.hidden;
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('webglcontextlost', lost);
    mount.append(canvas);
  } catch { dispose(); }

  return dispose;
}
