import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseSite, parseGoal, safeSource } from '../lib/content/schema.ts';

const raw = JSON.parse(await readFile(new URL('../content/site.json', import.meta.url), 'utf8'));
const goal = JSON.parse(await readFile(new URL('../content/goal.json', import.meta.url), 'utf8'));

test('the authoritative content loads and excludes unexpected private fields', () => {
  const site = parseSite({ ...raw, privateReviewer: 'synthetic-test-only' });
  assert.equal(site.research.length, 6);
  assert.equal(Object.hasOwn(site, 'privateReviewer'), false);
  assert.equal(parseGoal(goal).status, 'draft');
});

test('unsafe, deceptive, credential-bearing and non-allowlisted source URLs are rejected', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'http://cvis.bracu.ac.bd/', 'https://cvis.bracu.ac.bd.evil.example/', 'https://test@cvis.bracu.ac.bd/', 'https://cvis.bracu.ac.bd:8080/']) {
    assert.throws(() => safeSource(url));
  }
  assert.equal(safeSource(raw.legacyContact), raw.legacyContact);
});

test('duplicate IDs, malformed collections, raw markup and oversized values fail validation', () => {
  assert.throws(() => parseSite({ ...raw, research: [raw.research[0], raw.research[0]] }), /Duplicate/);
  assert.throws(() => parseSite({ ...raw, research: {} }));
  assert.throws(() => parseSite({ ...raw, name: '<script>alert(1)</script>' }));
  assert.throws(() => parseSite({ ...raw, name: 'x'.repeat(2001) }));
  assert.throws(() => parseSite({ ...raw, navigation: [{ label: 'Unsafe', href: '//evil.example' }] }));
});

test('preview claims cannot silently become published or lose the review notice', () => {
  assert.throws(() => parseSite({ ...raw, hero: { ...raw.hero, status: 'published' } }));
  assert.throws(() => parseGoal({ ...goal, approvalStatus: 'APPROVED' }));
  assert.throws(() => parseGoal({ ...goal, reviewNotice: 'Official laboratory mission' }));
  assert.throws(() => parseGoal({ ...goal, stages: ['Apply', 'Observe', 'Understand'] }));
});
