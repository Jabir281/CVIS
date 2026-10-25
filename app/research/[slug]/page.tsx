import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { site } from '../../../lib/content';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = site.research.find((item) => item.id === slug);
  return { title: area?.title ?? 'Research area not found', description: area?.summary };
}
export default async function ResearchDetail({ params }: Props) {
  const { slug } = await params;
  const area = site.research.find((item) => item.id === slug);
  if (!area) notFound();
  return <article className="section surface"><div className="container reading"><Link href="/#research">← All research areas</Link><p className="eyebrow">Research area · Editorial draft</p><h1>{area.title}</h1><p className="lead">{area.summary}</p><ul className="tags">{area.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul><h2>Research context</h2><p>This introduction is proposed educational copy based on the topic inventory. Current CVIS projects, investigators and related publication records are awaiting content-owner verification.</p><div className="empty-state"><h2>Related work</h2><p>No verified publication relationships have been added to this preview.</p><a href="/#publications">View the migration review record</a></div><a className="button" href="/#join">Joining & collaboration information</a></div></article>;
}
