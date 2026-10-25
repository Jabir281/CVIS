import { site } from '../../lib/content';

export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-grid"><div><strong>{site.name} · {site.institution}</strong><p>{site.fullName}</p><p className="note">Development preview. Text identity is not an approved university mark.</p></div>
      <nav aria-label="Footer navigation"><a href="/#research">Research areas</a><a href="/#publications">Publications</a><a href="/#join">Joining information</a><a href="/#contact">Contact information</a></nav>
      <div><h2 className="footer-heading">About this preview</h2><p>Content, media and institutional approval are pending. No application or contact submissions are collected.</p><a href="/#preview-information">Privacy & accessibility information</a></div>
    </div><div className="footer-bottom">CVIS website development preview · {new Date().getFullYear()}</div>
  </div></footer>;
}
