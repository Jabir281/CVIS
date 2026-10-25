import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingExcludes: { '/*': ['./design/**/*', './reference/**/*'] },
  async redirects() {
    return [{ source: '/join-us', destination: '/join', permanent: true }];
  },
};
export default config;
