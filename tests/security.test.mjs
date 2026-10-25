import assert from 'node:assert/strict';
import test from 'node:test';
import { contentSecurityPolicy } from '../lib/security/policy.ts';

test('production CSP binds scripts to a valid nonce and denies framing and eval', () => {
  const policy = contentSecurityPolicy('abcdefghijklmnopqrstuvwx');
  assert.match(policy, /'nonce-abcdefghijklmnopqrstuvwx'/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /style-src-attr 'none'/);
  assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval|https:/);
  assert.throws(() => contentSecurityPolicy("bad';script-src *"));
});
