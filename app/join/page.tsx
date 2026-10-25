import type { Metadata } from 'next';
import { site } from '../../lib/content';
export const metadata: Metadata = { title: 'Join CVIS', description: 'Joining information for the development preview; online intake is not enabled.' };
export default function JoinPage() {
  return <section className="section"><div className="container reading"><p className="eyebrow">Joining information</p><h1>Join CVIS</h1><p>Online applications are not currently enabled in this preview. Eligibility, available opportunities and the application process require confirmation by CVIS.</p><a className="button" href={site.legacyJoin}>Visit the existing CVIS joining page</a><p>The existing application workflow remains on the legacy website. Its continuity must be approved before replacement.</p></div></section>;
}
