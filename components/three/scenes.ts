import * as THREE from 'three';
import { morphPoints, pointPositions, randomSequence, type SceneKind, type Stage } from './geometry';

export type Palette = { blue: string; secondary: string; pale: string; yellow: string; white: string; brain: string; cerebellum: string; stem: string };
export type Model = {
  root: THREE.Group;
  update: (time: number, delta: number) => void;
  stage: (stage: Stage, instant: boolean) => void;
  reset: () => void;
};

export function createModel(kind: SceneKind, palette: Palette): Model {
  if (kind === 'brain') return brainModel(palette);
  const root = new THREE.Group();
  const positions: Float32Array = pointPositions(kind);
  const originals = positions.slice();
  let targets: Float32Array = new Float32Array(positions);
  const colors = new Float32Array(positions.length);
  const random = randomSequence(7);
  const blue = new THREE.Color(palette.blue);
  const secondary = new THREE.Color(palette.secondary);
  const pale = new THREE.Color(palette.pale);
  const white = new THREE.Color(palette.white);
  for (let i = 0; i < positions.length / 3; i++) {
    const depth = THREE.MathUtils.clamp((positions[i * 3 + 2] + 22) / 44, 0, 1);
    const color = kind === 'goal' ? blue.clone().lerp(pale, random()) : depth < 0.45
      ? blue.clone().lerp(secondary, depth / 0.45)
      : depth < 0.85 ? secondary.clone().lerp(pale, (depth - 0.45) / 0.4)
        : pale.clone().lerp(white, (depth - 0.85) / 0.15);
    if (random() < (kind === 'hero' ? 0.015 : 0.05)) color.set(palette.yellow);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const cloud = new THREE.Points(geometry, new THREE.PointsMaterial({ size: kind === 'hero' ? 1.35 : 1.6, vertexColors: true, transparent: true, opacity: 0.9 }));
  root.add(cloud);
  const cage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(kind === 'hero' ? 19.5 : 17, kind === 'hero' ? 2 : 1),
    new THREE.MeshBasicMaterial({ color: palette.secondary, wireframe: true, transparent: true, opacity: kind === 'hero' ? 0.28 : 0 }),
  );
  root.add(cage);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(kind === 'hero' ? 22 : 18, kind === 'hero' ? 22.6 : 18.5, 64),
    new THREE.MeshBasicMaterial({ color: palette.yellow, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  root.add(ring);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(38, 38), new THREE.MeshBasicMaterial({ color: palette.yellow, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
  if (kind === 'hero') {
    plane.rotation.x = ring.rotation.x = Math.PI / 2;
    root.add(plane);
    const box = new THREE.BoxGeometry(40, 40, 40);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    root.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: palette.blue, transparent: true, opacity: 0.25 })));
  } else { plane.geometry.dispose(); plane.material.dispose(); }
  return {
    root,
    update(time, delta) {
      if (kind === 'hero') {
        plane.position.y = ring.position.y = Math.sin(time * 1.2) * 14;
        for (let i = 0; i < positions.length; i += 3) {
          const wave = Math.sin(time * 1.8 + originals[i] * 0.18 + originals[i + 1] * 0.12) * 0.6;
          for (let axis = 0; axis < 3; axis++) positions[i + axis] = originals[i + axis] * (1 + wave / 24);
        }
      } else morphPoints(positions, targets, delta, false);
      geometry.attributes.position.needsUpdate = true;
      ring.rotation.z = time * 0.3;
      cage.rotation.y = -time * 0.06;
    },
    stage(stage, instant) {
      if (kind !== 'goal') return;
      targets = pointPositions('goal', stage);
      cage.material.opacity = stage === 2 ? 0.35 : stage === 1 ? 0.12 : 0;
      ring.material.opacity = stage === 0 ? 0.6 : stage === 1 ? 0.25 : 0.45;
      if (instant) { morphPoints(positions, targets, 0, true); geometry.attributes.position.needsUpdate = true; }
    },
    reset() { root.rotation.set(0, 0, 0); },
  };
}

function brainModel(palette: Palette): Model {
  const root = new THREE.Group();
  for (const sign of [-1, 1]) {
    const geometry = new THREE.SphereGeometry(11, 48, 48);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      let x = position.getX(i) * 0.78 + sign * 4.8;
      const y = position.getY(i) * 0.88;
      const z = position.getZ(i) * 1.25;
      if ((sign < 0 && x > -0.4) || (sign > 0 && x < 0.4)) x *= 0.55;
      const u = Math.atan2(z, x);
      const v = Math.acos(THREE.MathUtils.clamp(y / 12, -1, 1));
      const fold = Math.sin(u * 14) * Math.cos(v * 16) * 0.75 + Math.sin(z * 0.8) * Math.cos(x * 0.8) * 0.45;
      const lobe = y < -1 && z > 0 ? Math.sin(z * 0.4) * 1.2 : 0;
      position.setXYZ(i, x + fold * 0.5, y + lobe + fold * 0.4, z + fold * 0.6);
    }
    geometry.computeVertexNormals();
    root.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: palette.brain, roughness: 0.65, metalness: 0.02 })));
  }
  const cerebellum = new THREE.SphereGeometry(5.2, 32, 32);
  const position = cerebellum.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i) * 0.65 - 7.5;
    position.setXYZ(i, position.getX(i) * 1.35, y + Math.sin(y * 12) * 0.3, position.getZ(i) * 0.9 - 6.5);
  }
  cerebellum.computeVertexNormals();
  root.add(new THREE.Mesh(cerebellum, new THREE.MeshStandardMaterial({ color: palette.cerebellum, roughness: 0.65 })));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.6, 9, 24), new THREE.MeshStandardMaterial({ color: palette.stem, roughness: 0.6 }));
  stem.position.set(0, -9.8, -2.5);
  stem.rotation.x = -0.18;
  root.add(stem);
  const accent = new THREE.Mesh(new THREE.IcosahedronGeometry(3.6, 2), new THREE.MeshBasicMaterial({ color: palette.yellow, wireframe: true, transparent: true, opacity: 0.5 }));
  accent.position.set(4.8, 2.2, 2.5);
  root.add(accent);
  root.rotation.x = 0.1;
  return { root, update() {}, stage() {}, reset() { root.rotation.set(0.1, 0, 0); } };
}
