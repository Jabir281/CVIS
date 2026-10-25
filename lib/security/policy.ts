/** Nonces are per request. Production never permits eval or inline script attributes. */
export function contentSecurityPolicy(nonce: string, development = false): string {
  if (!/^[A-Za-z0-9+/=_-]{20,128}$/.test(nonce)) throw new Error('Invalid CSP nonce');
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'none'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${development ? ' ws://127.0.0.1:* ws://localhost:*' : ''}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self'",
  ].join('; ');
}
