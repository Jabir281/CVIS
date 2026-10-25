import { goal } from '../../lib/content';
import { SceneFigure } from '../../components/three/SceneFigure';

export function Goal() {
  return <section id="goal" className="section surface"><div className="container goal-grid">
    <div><p className="eyebrow">{goal.eyebrow}</p><h2>{goal.title}</h2>{goal.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p className="editorial-note">{goal.reviewNotice}</p></div>
    <div><SceneFigure kind="goal" stages={goal.stages} /><noscript><p>Observe samples a sensor plane. Understand arranges those samples into a volume. Apply gives them a structured spatial form. Stage selection requires JavaScript.</p></noscript></div>
  </div></section>;
}
