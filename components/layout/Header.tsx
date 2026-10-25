'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { Site } from '../../lib/content/schema';

export function Header({ site }: { site: Pick<Site, 'name' | 'fullName' | 'institution' | 'previewNotice' | 'navigation'> }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => { if (menu.current) menu.current.open = false; };
  return <>
    <div className="institution-bar"><div className="container"><span>{site.institution}</span><span>{site.previewNotice}</span></div></div>
    <header className="site-header"><div className="container header-inner">
      <Link href="/" className="wordmark" aria-label="CVIS Laboratory homepage"><span className="wordmark-letter" aria-hidden="true">C</span><span><strong>{site.name}</strong><small>{site.fullName}</small></span></Link>
      <nav aria-label="Main navigation" className="desktop-nav">{site.navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <div className="header-actions"><a className="button button-outline" href="/#contact">Contact Lab</a><a className="button button-yellow" href="/#join">Join Laboratory</a></div>
      <details ref={menu} className="mobile-menu" onKeyDown={(event) => {
        if (event.key === 'Escape' && menu.current?.open) { close(); menu.current.querySelector('summary')?.focus(); }
      }}><summary>Menu</summary><nav aria-label="Mobile navigation" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) close(); }}>
        {site.navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        <a href="/#join">Join Laboratory</a><a href="/#contact">Contact Lab</a>
      </nav></details>
    </div></header>
  </>;
}
