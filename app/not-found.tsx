import Link from 'next/link';
export default function NotFound() {
  return <section className="section"><div className="container reading"><p className="eyebrow">404 · Page not found</p><h1>We could not find that page</h1><p>The address may be incorrect or may not be included in this development preview.</p><Link className="button" href="/">Return to the homepage</Link></div></section>;
}
