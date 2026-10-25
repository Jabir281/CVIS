import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { inspectReferences, requiredReferences } from '../scripts/check-design-inputs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('missing and empty references block readiness; nonempty alternate paths are discovered', async () => {
  const cache = resolve(root, '.cache');
  await mkdir(cache, { recursive: true });
  const directory = await mkdtemp(resolve(cache, 'reference-test-'));
  try {
    assert.equal((await inspectReferences(directory)).every((item) => !item.available), true);
    await mkdir(resolve(directory, 'reference'));
    for (const name of requiredReferences) {
      await writeFile(resolve(directory, 'reference', name), ' \n');
    }
    const empty = await inspectReferences(directory);
    assert.equal(empty.every((item) => !item.available), true);
    assert.equal(empty.every((item) => item.candidates[1].status === 'EMPTY'), true);
    for (const name of requiredReferences) {
      await writeFile(resolve(directory, 'reference', name), '<!doctype html><html></html>');
    }
    assert.equal((await inspectReferences(directory)).every((item) => item.available), true);
  } finally {
    // Only the exact mkdtemp directory within this workspace is removed.
    assert.equal(resolve(directory, '..'), cache);
    await rm(directory, { recursive: true, force: true });
  }
});

function luminance(hex) {
  const channels = hex.match(/[a-f0-9]{2}/gi).map((part) => {
    const value = Number.parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test('approved foreground/background and control boundary token pairs meet contrast thresholds', async () => {
  const css = await readFile(resolve(root, 'styles/tokens.css'), 'utf8');
  const tokens = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6});/gi)]
    .map((match) => [match[1], match[2]]));
  for (const [foreground, background, minimum] of [
    ['text', 'white', 4.5], ['text', 'background', 4.5],
    ['white', 'blue', 4.5], ['white', 'navy', 4.5],
    ['white', 'blue-secondary', 4.5], ['navy', 'yellow', 4.5],
    ['blue-secondary', 'white', 3], ['blue-secondary', 'background', 3],
    ['blue', 'background', 3], ['yellow', 'navy', 3],
  ]) {
    const values = [luminance(tokens[foreground]), luminance(tokens[background])].sort((a, b) => b - a);
    const ratio = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(ratio >= minimum, `${foreground}/${background}: ${ratio.toFixed(2)} < ${minimum}`);
  }
});

test('goal copy remains explicitly pending review with the required stage order', async () => {
  const goal = JSON.parse(await readFile(resolve(root, 'content/goal.json'), 'utf8'));
  assert.equal(goal.status, 'draft');
  assert.equal(goal.approvalStatus, 'NEEDS_APPROVAL');
  assert.match(goal.reviewNotice, /pending CVIS review/);
  assert.match(goal.reviewNotice, /not an officially approved/);
  assert.deepEqual(goal.stages, ['Observe', 'Understand', 'Apply']);
  assert.equal(goal.paragraphs.length, 3);
  assert.doesNotMatch(JSON.stringify(goal), /\p{Extended_Pictographic}/u);
});
