import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { site } from '../lib/content';
import '../styles/tokens.css';
import '../styles/global.css';

export const metadata: Metadata = {
  title: { default: 'CVIS Laboratory | Development preview', template: '%s | CVIS preview' },
  description: 'Development preview of the Computer Vision and Intelligent Systems research laboratory website. Content and institutional approval pending.',
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Explicit dynamic rendering is required for a fresh nonce on each HTML response.
  await headers();
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header site={site} /><main id="main" tabIndex={-1}>{children}</main><Footer /></body></html>;
}
