import { site } from '../../lib/content';
import { SectionHeading } from '../../components/ui/SectionHeading';

export function Community() {
  return <>
    <section id="people" className="section"><div className="container"><SectionHeading eyebrow="Academic community" title="Faculty & Research Investigators" description="Current names, roles, affiliations and portrait permissions are awaiting CVIS review." />
      <div className="people-grid">{site.groups.map((group) => <article className="person-card" key={group}><div className="portrait-placeholder" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="27" r="12" /><path d="M17 68C17 40 63 40 63 68" /></svg></div><h3>{group}</h3><p>Reviewed profiles will appear here. No person or affiliation is represented by this placeholder.</p></article>)}</div>
    </div></section>
    <section id="facilities" className="section surface"><div className="container"><SectionHeading eyebrow="Spaces for discovery" title="Laboratory Facilities" description="Development gallery placeholders. Equipment specifications, photographs and availability require owner verification." />
      <div className="facilities-grid">{site.facilities.map((facility) => <figure className="facility-card" key={facility}><div className="facility-placeholder"><svg viewBox="0 0 300 150" aria-hidden="true" fill="none"><path d="M40 120H260M70 120V55H230V120M100 55V30H200V55M150 30V120M70 88H230" /><circle cx="150" cy="75" r="18" /></svg><span>Approved photograph pending</span></div><figcaption><h3>{facility}</h3><p>Illustrative gallery category; no equipment inventory or access commitment is implied.</p></figcaption></figure>)}</div>
    </div></section>
    <section id="seminars" className="section"><div className="container"><SectionHeading eyebrow="Intellectual exchange" title="Seminars, Colloquia & Workshops" /><div className="empty-state"><h3>Event information is awaiting verification</h3><p>No reviewed event dates are available in this preview. Registration is not enabled.</p></div></div></section>
  </>;
}
