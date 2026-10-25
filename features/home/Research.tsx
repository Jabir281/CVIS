import Link from 'next/link';
import { site } from '../../lib/content';
import { SectionHeading } from '../../components/ui/SectionHeading';

export function Research() {
  return <section id="research" className="section"><div className="container">
    <SectionHeading eyebrow="Academic portfolio" title="Core Research Areas" description="Editorial introductions to topics in the legacy content inventory. Current laboratory programs and outputs remain subject to review." />
    <div className="research-grid">{site.research.map((area, index) => <article className="research-card" key={area.id}><p className="eyebrow">Area {String(index + 1).padStart(2, '0')}</p><h3>{area.title}</h3><p>{area.summary}</p><ul className="tags" aria-label="Topics">{area.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul><Link href={`/research/${area.id}`}>Explore this area <span aria-hidden="true">→</span></Link></article>)}</div>
  </div></section>;
}
