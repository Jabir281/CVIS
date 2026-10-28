import * as THREE from 'three';
import { createModel, type Palette } from './scenes';
import { createFrameLoop } from './frame-loop';
import type { SceneKind, Stage } from './geometry';

export type SceneController = {
  toggle: () => void;
  reset: () => void;
  rotate: (direction: number) => void;
  stage: (stage: Stage) => void;
  dispose: () => void;
};
type State = { paused: boolean; reduced: boolean };

/** Called only by the mounted client island, after it intersects the viewport. */
export function mountScene(host: HTMLElement, kind: SceneKind, onState: (state: State) => void, onFailure: () => void): SceneController {
  const css = getComputedStyle(host);
  const color = (name: string) => {
    const value = css.getPropertyValue(`--color-${name}`).trim();
    if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) throw new Error('Missing scene color token');
    return value;
  };
  const palette: Palette = { blue: color('blue'), secondary: color('blue-secondary'), pale: color('pale-blue'), yellow: color('yellow'), white: color('white'), brain: color('brain'), cerebellum: color('brain-secondary'), stem: color('brain-stem') };
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(kind === 'brain' ? 40 : 45, 1, 0.1, 1000);
  const model = createModel(kind, palette);
  scene.add(model.root);
  scene.add(new THREE.AmbientLight(palette.white, 0.7));
  const key = new THREE.DirectionalLight(palette.cerebellum, 0.85);
  key.position.set(20, 30, 40);
  scene.add(key);
  const fill = new THREE.DirectionalLight(palette.yellow, 0.45);
  fill.position.set(-20, -10, -20);
  scene.add(fill);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  renderer.setClearColor(palette.white, 0);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motion.matches;
  let paused = reduced;
  let visible = true;
  let disposed = false;
  let lost = false;
  let time = 0;
  let selected: Stage = 0;
  let dragging: { id: number; x: number; y: number } | null = null;
  const render = () => { if (!disposed && !lost && visible && !document.hidden) renderer.render(scene, camera); };
  const loop = createFrameLoop(requestAnimationFrame, cancelAnimationFrame, (delta) => {
    try {
      time += delta;
      if (!dragging) model.root.rotation.y += delta * (kind === 'brain' ? 0.25 : 0.15);
      model.update(time, delta);
      render();
    } catch {
      lost = true;
      loop.setActive(false);
      onFailure();
    }
  });
  const sync = () => loop.setActive(!disposed && !lost && visible && !document.hidden && !paused && !reduced);
  const report = () => onState({ paused: paused || reduced, reduced });
  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    const distance = kind === 'brain' ? 58 : kind === 'goal' ? 85 : 88;
    camera.position.set(0, 0, distance / Math.min(1, camera.aspect));
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
    render();
  });
  intersection.observe(host);
  const visibility = () => { sync(); render(); };
  const changeMotion = () => {
    reduced = motion.matches;
    if (reduced) paused = true;
    model.stage(selected, true);
    report(); sync(); render();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    sync();
    onFailure();
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent) => {
    if (!dragging || dragging.id !== event.pointerId) return;
    model.root.rotation.y += (event.clientX - dragging.x) * 0.012;
    if (event.pointerType !== 'touch') model.root.rotation.x = THREE.MathUtils.clamp(model.root.rotation.x + (event.clientY - dragging.y) * 0.012, -1, 1);
    dragging.x = event.clientX;
    dragging.y = event.clientY;
    render();
  };
  const up = () => { dragging = null; };
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', changeMotion);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('lostpointercapture', up);
  const controller: SceneController = {
    toggle() {
      if (reduced) return;
      paused = !paused;
      if (paused) model.stage(selected, true);
      report(); sync(); render();
    },
    reset() { time = 0; model.reset(); model.update(0, 0); model.stage(selected, true); render(); },
    rotate(direction) { model.root.rotation.y += direction * Math.PI / 8; render(); },
    stage(stage) { selected = stage; model.stage(stage, paused || reduced); render(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      loop.dispose();
      intersection.disconnect(); resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', changeMotion);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('lostpointercapture', up);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
  try { resize(); report(); sync(); } catch (error) { controller.dispose(); throw error; }
  return controller;
}
