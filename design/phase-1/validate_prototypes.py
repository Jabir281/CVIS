"""Structural/contrast verification, not a substitute for browser or screen-reader QA."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import gzip
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent


class Document(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.links, self.assets = path, set(), [], []
        self.h1, self.main, self.lang, self.noindex = 0, 0, False, False

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'{self.path.name}: duplicate ID'
            self.ids.add(attrs['id'])
        self.h1 += tag == 'h1'
        self.main += tag == 'main'
        self.lang |= tag == 'html' and attrs.get('lang') == 'en'
        self.noindex |= tag == 'meta' and attrs.get('name') == 'robots' and 'noindex' in attrs.get('content', '')
        if tag == 'a':
            assert attrs.get('href') and attrs['href'] != '#', f'{self.path.name}: dead anchor'
            self.links.append(attrs['href'])
        if tag in ('img', 'script', 'iframe'):
            self.assets.append(attrs['src'])
        if tag == 'link':
            self.assets.append(attrs['href'])
        if tag == 'img':
            assert all(key in attrs for key in ('alt', 'width', 'height')), 'Image needs alt and dimensions'
        if tag == 'iframe':
            assert attrs.get('title'), 'Iframe needs a title'
        assert tag != 'form', 'No submission form in Phase 1'
        assert not any(key.startswith('on') for key in attrs), 'No inline event handlers'


def luminance(color):
    channels = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in channels]
    return sum(a * b for a, b in zip(linear, (.2126, .7152, .0722)))


def ratio(a, b):
    x, y = sorted([luminance(a), luminance(b)])
    return (y + .05) / (x + .05)


def verify():
    pages = {}
    for path in ROOT.glob('*.html'):
        doc = Document(path)
        doc.feed(path.read_text(encoding='utf-8'))
        assert doc.h1 == 1 and doc.main == 1 and doc.lang and doc.noindex, path.name
        pages[path.resolve()] = doc
    assert len(pages) == 7, 'Expected gallery, three homepages and three detail specimens'
    for path, doc in pages.items():
        for href in doc.links + doc.assets:
            url = urlparse(href)
            assert url.scheme in ('', 'https'), 'Unsafe URL scheme'
            if url.scheme:
                assert href not in doc.assets, 'No remote assets permitted in prototypes'
                continue
            dest = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert dest.exists(), f'{path.name}: missing {href}'
            if url.fragment:
                assert dest in pages and url.fragment in pages[dest].ids, f'Broken fragment {href}'
    for path in ROOT.glob('*.svg'):
        ET.parse(path)
    shared = (ROOT / 'shared.css').read_text(encoding='utf-8')
    assert 'prefers-reduced-motion: reduce' in shared and ':focus-visible' in shared
    assert '@media (max-width: 400px)' in shared
    for name in ('optical', 'observatory', 'museum'):
        assert '@media (max-width: 850px)' in (ROOT / f'{name}.css').read_text(encoding='utf-8')
    for path in ROOT.glob('*.js'):
        source = path.read_text(encoding='utf-8')
        assert not re.search(r'\b(fetch|XMLHttpRequest|localStorage|sessionStorage|eval)\b|innerHTML|document\.cookie', source)

    pairs = []
    for name in ('optical', 'observatory', 'museum'):
        css = (ROOT / f'{name}.css').read_text(encoding='utf-8')
        colors = dict(re.findall(r'--([a-z-]+):\s*(#[0-9a-fA-F]{6})', css))
        for fg, bg, threshold in [('ink', 'paper', 4.5), ('muted', 'paper', 4.5), ('muted', 'surface', 4.5), ('on-accent', 'accent', 4.5), ('accent', 'paper', 4.5), ('focus', 'paper', 3), ('focus', 'surface', 3), ('line', 'paper', 3)]:
            value = ratio(colors[fg], colors[bg])
            assert value >= threshold, f'{name} {fg}/{bg} = {value:.2f}, requires {threshold}'
            pairs.append({'direction': name, 'foreground': fg, 'background': bg, 'ratio': round(value, 2), 'minimum': threshold})
    assets = list(ROOT.glob('*.html')) + list(ROOT.glob('*.css')) + list(ROOT.glob('*.js')) + list(ROOT.glob('*.svg'))
    report = {'status': 'PASS', 'scope': 'Static source/link/contrast checks only; browser rendering and interaction not tested', 'pages': len(pages), 'contrast': pairs, 'file_sizes': [{'file': p.name, 'bytes': p.stat().st_size, 'gzip_bytes': len(gzip.compress(p.read_bytes(), mtime=0))} for p in sorted(assets)]}
    (ROOT / 'validation-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(f'PASS: {len(pages)} HTML pages, all local links/fragments/assets, SVG XML, no remote assets/forms, static fallback rules.')
    print(f'PASS: {len(pairs)} contrast pairs. Browser rendering, keyboard interaction and real-device performance remain UNVERIFIED.')
    for name in ('optical', 'observatory', 'museum'):
        print(name + ': ' + ', '.join(f"{p['foreground']}/{p['background']} {p['ratio']}:1" for p in pairs if p['direction'] == name))


if __name__ == '__main__':
    verify()
