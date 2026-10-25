import assert from 'node:assert/strict';
import test from 'node:test';
import { pointPositions, morphPoints } from '../components/three/geometry.ts';
import { createFrameLoop } from '../components/three/frame-loop.ts';

test('reference scenes have finite, deterministic points and distinct stage geometry', () => {
  const hero = pointPositions('hero');
  assert.equal(hero.length, 3200 * 3);
  assert.deepEqual(hero, pointPositions('hero'));
  const stages = [0, 1, 2].map((stage) => pointPositions('goal', stage));
  for (const points of [hero, ...stages]) assert.ok(points.every(Number.isFinite));
  for (const points of stages) assert.equal(points.length, 1200 * 3);
  const maxZ = (points) => Math.max(...points.filter((_, index) => index % 3 === 2).map(Math.abs));
  assert.ok(maxZ(stages[0]) <= 1.8);
  assert.ok(maxZ(stages[1]) > 15);
  assert.notDeepEqual(stages[1], stages[2]);
});

test('morphing keeps the same buffer and reduced-motion changes are immediate', () => {
  const current = pointPositions('goal', 0);
  const target = pointPositions('goal', 1);
  const original = current.slice();
  morphPoints(current, target, 1 / 60, false);
  assert.notDeepEqual(current, original);
  assert.notDeepEqual(current, target);
  morphPoints(current, target, 0, true);
  assert.deepEqual(current, target);
  assert.throws(() => morphPoints(current, new Float32Array(3), 1, false));
});

test('offscreen/hidden/paused lifecycle has one loop and teardown cancels it', () => {
  let sequence = 0;
  const callbacks = new Map();
  const draws = [];
  const loop = createFrameLoop((callback) => { callbacks.set(++sequence, callback); return sequence; }, (id) => callbacks.delete(id), (delta) => draws.push(delta));
  loop.setActive(true);
  loop.setActive(true);
  assert.equal(callbacks.size, 1);
  const run = (time) => { const [id, callback] = callbacks.entries().next().value; callbacks.delete(id); callback(time); };
  run(1000);
  assert.equal(callbacks.size, 1);
  run(9000);
  assert.equal(draws[1], 0.05);
  loop.setActive(false);
  assert.equal(callbacks.size, 0);
  loop.setActive(true);
  run(99000);
  assert.equal(draws[2], 0);
  loop.dispose();
  assert.equal(callbacks.size, 0);
  loop.setActive(true);
  assert.equal(callbacks.size, 0);
});
