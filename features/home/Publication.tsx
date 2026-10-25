import { site } from '../../lib/content';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SceneFigure } from '../../components/three/SceneFigure';

export function Publication() {
  return <section id="publications" className="section surface"><div className="container">
    <SectionHeading eyebrow="Scholarly work" title="Selected Publications" />
    <article className="publication-feature"><div><p className="eyebrow">Legacy article · Metadata pending verification</p><h3>{site.publication.title}</h3><div className="publication-summary"><h4>About this record</h4><p>{site.publication.notice}</p></div><p>The illustration beside this record explains a visual concept. It is not a figure, dataset or output from the article.</p><a className="button" href={site.publication.sourceUrl}>Read the existing CVIS article <span aria-hidden="true">↗</span></a></div><SceneFigure kind="brain" /></article>
  </div></section>;
}
