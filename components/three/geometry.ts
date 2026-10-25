export type SceneKind = 'hero' | 'goal' | 'brain';
export type Stage = 0 | 1 | 2;

/** Deterministic samples make posters, transitions, and regression checks reproducible. */
export function randomSequence(seed = 2026): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Ported from the approved Stitch equations, including the tapered Apply helix. */
export function pointPositions(kind: 'hero' | 'goal', stage: Stage = 0): Float32Array {
  const count = kind === 'hero' ? 3200 : 1200;
  const points = new Float32Array(count * 3);
  const random = randomSequence();
  const side = Math.floor(Math.sqrt(count));
  for (let index = 0; index < count; index++) {
    let x: number, y: number, z: number;
    if (kind === 'goal' && stage === 0) {
      const row = Math.floor(index / side) - side / 2;
      const col = index % side - side / 2;
      x = col * 1.5 + (random() - 0.5) * 0.4;
      y = row * 1.5 + (random() - 0.5) * 0.4;
      z = Math.sin(col * 0.2) * Math.cos(row * 0.2) * 1.8;
    } else if (kind === 'goal' && stage === 2) {
      const t = index / count * Math.PI * 12;
      const radius = 6 + index / count * 16;
      x = Math.cos(t) * radius;
      y = (index / count - 0.5) * 32;
      z = Math.sin(t) * radius;
    } else {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(random() * 2 - 1);
      const radius = kind === 'hero'
        ? 21 + Math.sin(theta * 4) * Math.cos(phi * 3) * 3.5 + (random() - 0.5) * 5
        : 18 + Math.sin(theta * 3) * Math.cos(phi * 2) * 4;
      x = radius * Math.sin(phi) * Math.cos(theta);
      y = radius * Math.sin(phi) * Math.sin(theta) * (kind === 'hero' ? 0.92 : 0.85);
      z = radius * Math.cos(phi);
    }
    points.set([x, y, z], index * 3);
  }
  return points;
}

export function morphPoints(current: Float32Array, target: Float32Array, delta: number, instant: boolean): void {
  if (current.length !== target.length) throw new Error('Point counts must match');
  const blend = instant ? 1 : 1 - Math.exp(-3.7 * Math.max(0, Math.min(delta, 0.05)));
  for (let i = 0; i < current.length; i++) current[i] += (target[i] - current[i]) * blend;
}
