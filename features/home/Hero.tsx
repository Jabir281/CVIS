import { site } from '../../lib/content';
import { SceneFigure } from '../../components/three/SceneFigure';

export function Hero() {
  return <section className="hero"><div className="container hero-grid">
    <div className="hero-copy"><p className="institution-badge">BRAC University · CVIS research laboratory</p><h1>{site.hero.title}</h1><p className="lead">{site.hero.summary}</p>
      <div className="actions"><a className="button" href="#research">Our Research & Discovery <span aria-hidden="true">→</span></a><a className="button button-outline" href="#publications">Selected Publications</a></div>
      <p className="editorial-note">Proposed introductory copy pending CVIS review.</p>
      <div className="hero-topics"><span>Visual perception</span><span>Spatial understanding</span><span>Intelligent systems</span></div>
    </div><div className="hero-visual"><SceneFigure kind="hero" /></div>
  </div></section>;
}
