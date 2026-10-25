"""Generate isolated design specimens from one draft content source. Stdlib only."""
from html import escape
from pathlib import Path
import json
import math

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / 'content.json').read_text(encoding='utf-8'))
PAPER = DATA['publication']
DIRECTIONS = {
    'optical': ('A', 'Optical Editorial', 'A research journal, opened to the visual world.'),
    'observatory': ('B', 'Midnight Observatory', 'An instrument for exploring perception and depth.'),
    'museum': ('C', 'Museum of Experiments', 'A welcoming collection of ideas you can examine.'),
}


def write(name, content):
    (ROOT / name).write_text(content, encoding='utf-8')


def svg(body, bg, label, width=720, height=600):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img"><title>{escape(label)}</title><rect width="100%" height="100%" fill="{bg}"/>{body}</svg>'


def build_art():
    # Original analytic drawings: no external assets or representations of real experiments.
    optical = []
    for x in range(40, 721, 40):
        optical.append(f'<path d="M{x} 0V600" stroke="#d4ddd1"/>')
    for y in range(20, 601, 40):
        optical.append(f'<path d="M0 {y}H720" stroke="#d4ddd1"/>')
    for i in range(9):
        x = 130 + i * 51
        optical.append(f'<ellipse cx="{x}" cy="300" rx="{48+i*3}" ry="{110+i*8}" fill="none" stroke="{("#253494" if i==4 else "#81958a")}" stroke-width="{(3 if i==4 else 1.2)}" transform="rotate(-17 {x} 300)"/>')
    for y in [165, 240, 360, 435]:
        optical.append(f'<path d="M35 {y}L350 300L690 {600-y}" fill="none" stroke="#52615a" stroke-width="1"/>')
    optical.append('<path d="M35 300H690" stroke="#253494" stroke-dasharray="5 7"/><circle cx="350" cy="300" r="8" fill="#253494"/>')
    write('optical.svg', svg(''.join(optical), '#e8ede6', 'Abstract optical planes and rays; not experimental evidence'))

    depth, flat = [], []
    for j in range(26):
        for i in range(63):
            u, v = i / 62, j / 25
            wave = math.sin(u * math.pi * 3 + v * 3) * math.sin(v * math.pi)
            x = 60 + u * 1000 + v * 100
            y = 85 + v * 260 + wave * 75
            color = '#9edbe5' if j % 5 else '#f0ca83'
            depth.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{1.2+v*1.6:.1f}" fill="{color}" opacity="{.35+v*.6:.2f}"/>')
            if i % 2 == 0:
                flat.append(f'<circle cx="{60+u*1080:.1f}" cy="{45+v*390:.1f}" r="{1.4+abs(wave)*3:.1f}" fill="{color}"/>')
    for x in [160, 600, 1040]:
        depth.append(f'<path d="M{x} 35V450" stroke="#667e87" stroke-dasharray="3 9"/>')
    write('depth.svg', svg(''.join(depth), '#101b28', 'Procedural depth field; an abstract mathematical surface', 1200, 480))
    write('projection.svg', svg(''.join(flat), '#101b28', 'Flat sampling projection of the illustrative surface', 1200, 480))

    smooth = ['<ellipse cx="360" cy="485" rx="220" ry="22" fill="#c8b8a5"/>']
    for k in range(26):
        t = (k + .5) / 26 * math.pi
        radius = math.sin(t) * 206
        cy = 278 - math.cos(t) * 205
        smooth.append(f'<ellipse cx="360" cy="{cy:.1f}" rx="{radius:.1f}" ry="{radius*.23:.1f}" fill="none" stroke="#8d391e" stroke-width="2"/>')
    smooth.append('<path d="M100 500H620M100 495V505M620 495V505" stroke="#68584a"/>')
    coarse = ['<ellipse cx="360" cy="485" rx="220" ry="22" fill="#c8b8a5"/>']
    for y in range(70, 481, 24):
        for x in range(140, 581, 24):
            dx, dy = (x - 360) / 206, (y - 278) / 205
            if dx * dx + dy * dy < 1:
                color = '#8d391e' if (x//24+y//24) % 3 else '#b96b4d'
                coarse.append(f'<rect x="{x}" y="{y}" width="19" height="19" fill="{color}"/>')
    write('specimen.svg', svg(''.join(smooth), '#e9dfd0', 'Original contour sphere illustrating continuous structure', 720, 560))
    write('sampled.svg', svg(''.join(coarse), '#e9dfd0', 'Original coarse grid illustration of the same sphere', 720, 560))


def header(key, detail=False):
    letter, name, _ = DIRECTIONS[key]
    prefix = f'{key}.html' if detail else ''
    links = ''.join(f'<a href="{prefix}#{anchor}">{label}</a>' for anchor, label in [('research', 'Research'), ('publications', 'Publications'), ('people', 'People'), ('join', 'Join / Collaborate')])
    return f'''<a class="skip" href="#main">Skip to content</a>
<div class="concept-bar"><span>{letter} / {name} · Local, unapproved design concept</span><a href="index.html">Compare all directions ↗</a></div>
<header class="site-header"><a class="brand" href="{key}.html" aria-label="CVIS concept homepage"><strong>CVIS<span aria-hidden="true">.</span></strong><span>BRAC University<br>Research lab concept</span></a>
<nav class="desktop-nav" aria-label="Main">{links}</nav>
<details class="mobile-menu"><summary>Menu</summary><nav aria-label="Mobile">{links}</nav></details></header>'''


def shell(key, body, detail=False):
    _, name, _ = DIRECTIONS[key]
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>{name} — {'Publication specimen' if detail else 'Homepage concept'} / CVIS</title><link rel="stylesheet" href="shared.css"><link rel="stylesheet" href="{key}.css"><script src="interactions.js" defer></script></head>
<body>{header(key, detail)}<main id="main">{body}</main><footer class="footer"><span>CVIS / BRAC University · Unapproved concept</span><span>Draft copy · Original abstract illustrations · No data collection</span><a href="index.html">Return to design comparison</a></footer></body></html>'''


def hero(key):
    if key == 'optical':
        return '''<section class="hero" aria-labelledby="hero-title"><div><p class="eyebrow">Computer Vision &amp; Intelligent Systems Research Lab</p><h1 id="hero-title">A closer<br>look at<br><em>intelligence.</em></h1><p class="lead">Exploring how machines see, interpret and learn from the visual world.</p><div class="actions"><a class="button primary" href="#research">Explore the research <span aria-hidden="true">↗</span></a><a href="#publications">Read a publication</a></div></div>
<figure><div class="figure-heading"><span>01 / The optical bench</span><span>Illustrative study</span></div><fieldset class="lab-control"><legend>Move the illustrated focus plane</legend><input type="radio" name="focus" id="near"><label for="near">Near</label><input type="radio" name="focus" id="middle" checked><label for="middle">Middle</label><input type="radio" name="focus" id="far"><label for="far">Far</label><div class="art-window"><img src="optical.svg" width="720" height="600" alt="A sequence of optical planes connected by rays"><div class="art-overlay focus-plane" aria-hidden="true"></div></div></fieldset><figcaption>Light, planes, perception. An original abstract illustration, not a model result. Select a plane to examine the idea of focus.</figcaption></figure></section>'''
    if key == 'observatory':
        return '''<section class="hero" aria-labelledby="hero-title"><p class="eyebrow">CVIS / Computer Vision &amp; Intelligent Systems Research Lab</p><div class="hero-top"><h1 id="hero-title">Beyond<br>the <span>visible.</span></h1><div class="hero-intro"><p class="lead">An image is a beginning.<br>Explore the structures, patterns and possibilities within it.</p><div class="actions"><a class="button primary" href="#research">Enter the research <span aria-hidden="true">↗</span></a></div></div></div>
<div class="observatory-instrument"><div class="instrument-legend"><div><p class="eyebrow">Perception field</p><p class="readout">x · y · depth</p></div><p class="note">Two views.<br>One illustrative surface.<br>No experimental data.</p></div><figure><fieldset class="lab-control"><legend>Inspect the surface</legend><input type="radio" name="projection" id="depth" checked><label for="depth">Depth field</label><input type="radio" name="projection" id="projection"><label for="projection">Flat projection</label><div class="art-window"><img class="depth" src="depth.svg" width="1200" height="480" alt="A mathematical wave surface represented by points"><img class="flat" src="projection.svg" width="1200" height="480" alt="The points arranged as a flat two-dimensional sampling grid"></div></fieldset><figcaption>Changing a viewpoint changes what becomes legible. Original procedural artwork; a metaphor for depth, not research evidence.</figcaption></figure></div></section>'''
    return '''<section class="hero" aria-labelledby="hero-title"><div><p class="eyebrow">Computer Vision &amp; Intelligent Systems Research Lab</p><h1 id="hero-title">The art<br>of <span>seeing<br>more.</span></h1><p class="lead">A place to explore the questions between images and intelligence.</p><div class="actions"><a class="button primary" href="#research">Explore the collection <span aria-hidden="true">↗</span></a></div></div><figure><div class="exhibit-tag"><span>Exhibit 01 / From shape to signal</span><span>Concept study</span></div><div class="art-window" id="sample-figure"><img src="specimen.svg" width="720" height="560" alt="A sphere described through fine contour lines"><img class="sampling-overlay" src="sampled.svg" width="720" height="560" alt="A coarse grid representation of the same illustrative sphere"><span class="split-marker" aria-hidden="true"></span></div><div class="range-control"><label for="sampling">Contours ↔ samples</label><output id="sampling-value" for="sampling">50%</output><input id="sampling" type="range" min="0" max="100" value="50" disabled aria-describedby="sampling-status"><span id="sampling-status" class="range-status">Static comparison. Enable JavaScript to move the divider.</span></div><figcaption>A small experiment in looking. Move between continuous contours and a sampled grid. Original educational art; not a scientific result.</figcaption></figure></section>'''


def research(key):
    titles = {'optical': 'Questions worth looking into.', 'observatory': 'Fields of inquiry.', 'museum': 'An index of curiosities.'}
    entries = ''.join(f'''<article class="research-entry"><span class="number">{escape(item['number'])}</span><div><h3>{escape(item['name'])}</h3></div><p><strong>{escape(item['question'])}</strong><br>{escape(item['description'])}</p></article>''' for item in DATA['research'])
    return f'''<section class="section" id="research"><div class="section-head"><div><p class="eyebrow">Research / An introduction</p><h2>{titles[key]}</h2></div><p class="note">Themes drawn from the legacy site.<br>Questions are proposed editorial copy.</p></div><div class="research-list">{entries}</div><p class="note">{escape(DATA['editorialNote'])} <a href="{DATA['researchSource']}">Legacy topic source ↗</a></p></section>'''


def publications(key):
    title = {'optical': 'From the reading room.', 'observatory': 'Research, on record.', 'museum': 'The reading table.'}[key]
    return f'''<section class="section" id="publications"><div class="section-head"><div><p class="eyebrow">Publication presentation / One sourced specimen</p><h2>{title}</h2></div><a href="{key}-publication.html">Open the detail concept ↗</a></div><a class="paper-row" href="{key}-publication.html"><span class="eyebrow">{escape(PAPER['topics'])}</span><div><h3>{escape(PAPER['title'])}</h3><p class="note">{escape(PAPER['status'])}</p></div><span class="arrow" aria-hidden="true">↗</span></a></section>'''


def community(key):
    title = {'optical': 'A lab is its people.', 'observatory': 'Human questions.<br>Shared curiosity.', 'museum': 'Meet the minds<br>behind the questions.'}[key]
    return f'''<section class="section community" id="people"><div><p class="eyebrow">People / Component study</p><h2>{title}</h2><p class="lead">A clear place for the people, perspectives and collaboration behind the work.</p></div><div><article class="person-specimen"><div class="portrait" aria-hidden="true">Portrait<br>withheld</div><div><p class="eyebrow">Profile layout specimen</p><h3>Profile awaiting approval</h3><p class="note">Name, role and affiliation will appear only after verification. No person is represented by this specimen.</p></div></article><aside class="event-empty"><p class="eyebrow">Events / Empty-state specimen</p><h3>No event selected for this concept.</h3><p class="note">The final site will preserve verified upcoming and past events.</p></aside></div></section>'''


def joining():
    return '''<section class="section join-panel" id="join"><div><p class="eyebrow">Join / Collaborate</p><h2>Bring a question.<br>Start a conversation.</h2><p class="lead">Make the next step clear, whether you are beginning your research or looking to collaborate.</p></div><div><p>This design prototype does not accept applications. The existing site's application route remains unchanged.</p><a class="button" href="https://cvis.bracu.ac.bd/join-us/">View existing Join Us page <span aria-hidden="true">↗</span></a><details><summary>What will joining look like in the replacement?</summary><p>Required application workflows must be confirmed with the lab and preserved through an approved continuation or migration plan. Online collection in the replacement stays blocked until its owner, destination, privacy notice and retention policy are authorized.</p></details><p class="note">This is not an announcement that CVIS applications are closed. Do not enter personal information into design review artifacts.</p></div></section>'''


def notes(key):
    stories = {
        'optical': [
            'Rest: a precise optical drawing accompanies a large editorial headline. All explanatory copy is visible.',
            'Explore: keyboard, touch or pointer selects Near / Middle / Far. The focus-plane outline moves over 180 ms; reduced motion changes position instantly.',
            'Future enhancement: a small focus/depth reconstruction demonstration using approved source imagery. Static diagrams remain the low-power and no-JavaScript baseline.',
        ],
        'observatory': [
            'Rest: a bounded depth field sits beneath the headline, with controls outside the artwork.',
            'Explore: Depth field / Flat projection switches instantly between two mathematical drawings, including with no JavaScript.',
            'Future enhancement: one lazy 3D depth surface with manual rotation and optional pointer parallax. Reduced-motion, low-power and WebGL failure use the illustrated views; never require automatic motion.',
        ],
        'museum': [
            'Rest: a half-and-half contour/sampling specimen invites a closer look.',
            'Explore: a native range control moves the dividing line. Arrow keys and touch work through the same control; no easing or autoplay.',
            'Future enhancement: step through reconstruction slices of an authorized research artifact. Reduced-motion and low-power modes retain static stages; no JavaScript shows the comparison and disables its slider truthfully.',
        ],
    }
    return '<section class="section"><details class="design-notes"><summary>Design notes, interaction storyboard &amp; component states</summary><div class="component-strip"><a class="button primary" href="#research">Primary link ↗</a><a class="button" href="#publications">Secondary link</a><span class="chip">Research topic</span><span class="note">Tab to inspect the focus outline.</span></div><ol>' + ''.join(f'<li>{escape(note)}</li>' for note in stories[key]) + '</ol><p class="note">System fonts only. No third-party imagery, logos, trackers, web fonts or libraries. These specimens are not the production website.</p></details></section>'


def detail(key):
    art = {'optical': 'optical.svg', 'observatory': 'depth.svg', 'museum': 'specimen.svg'}[key]
    width, height = (1200, 480) if key == 'observatory' else ((720, 560) if key == 'museum' else (720, 600))
    return f'''<div class="publication-hero"><a class="back" href="{key}.html#publications">← Back to publication concept</a><p class="eyebrow">{escape(PAPER['topics'])}</p><h1>{escape(PAPER['title'])}</h1><p class="lead">A publication detail designed for reading, context and source integrity.</p><p class="note">Legacy title reproduced for layout exploration. Publication date, author order, venue and DOI are withheld pending verification.</p></div><section class="section publication-layout" aria-label="Publication reading layout"><div class="reading"><p class="eyebrow">Reading specimen</p><h2>A clearer view of structure.</h2><p>{escape(PAPER['summary'])}</p><figure><img src="{art}" width="{width}" height="{height}" alt="Abstract concept artwork, unrelated to the publication's experimental results"><figcaption>Concept artwork only. This is not a figure from the paper. Approved research imagery would replace this specimen.</figcaption></figure><h3>Reading without distraction</h3><p class="note">This panel demonstrates long-form measure, figure captions and heading rhythm. The production page would contain only an authorized abstract, accurate citation metadata and verified links. No citation-copy control is offered until its data is verified.</p><a class="button" href="{escape(PAPER['source'])}">Read the existing lab article <span aria-hidden="true">↗</span></a></div><aside><p class="eyebrow">Record / Review state</p><dl class="metadata"><div><dt>Authors and order</dt><dd>Awaiting verification</dd></div><div><dt>Year and venue</dt><dd>Awaiting verification</dd></div><div><dt>DOI / canonical record</dt><dd>Awaiting verification</dd></div><div><dt>Source status</dt><dd>Legacy public page; owner approval pending</dd></div><div><dt>Topic</dt><dd>{escape(PAPER['topics'])}</dd></div></dl><div class="actions"><a href="{key}.html#research">Explore research themes ↗</a></div></aside></section>'''


def gallery():
    rows = []
    for key, (letter, name, description) in DIRECTIONS.items():
        rows.append(f'''<article class="direction"><div class="direction-copy"><p class="kicker">Direction {letter}</p><h2>{name}</h2><p>{description}</p><a class="open-link" href="{key}.html">Open homepage prototype ↗</a><a class="open-link" href="{key}-publication.html">Open publication prototype ↗</a><p class="small">Responsive HTML, original SVG art and working concept controls. No production app.</p></div><div class="preview"><iframe src="{key}.html" title="{name} interactive homepage preview" loading="lazy"></iframe></div></article>''')
    return '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>CVIS — Three visual directions / Phase 1</title><link rel="stylesheet" href="gallery.css"><script src="gallery.js" defer></script></head><body><main><header><p class="kicker">BRACU CVIS / Design exploration / Phase 1</p><h1>Three ways<br>of seeing.</h1><p class="intro">Compare composition, reading experience and interaction—not just color. These are private, unapproved design concepts. Choose a direction after inspecting desktop and mobile.</p><p class="small">Legacy visual audit pending: no connected browser. Use the screenshot checklist in the design review before final selection. All institutional approvals remain blocked.</p></header><fieldset class="view-controls"><legend>Embedded preview width</legend><label><input type="radio" name="viewport" value="1440" checked> Desktop · 1440px</label><label><input type="radio" name="viewport" value="390"> Mobile · 390px</label><label><input type="radio" name="viewport" value="320"> Narrow · 320px</label><p class="small">Frames are scaled to fit this comparison. Open a prototype directly for a full-size inspection; scroll inside each frame to explore.</p></fieldset>''' + ''.join(rows) + '''<footer><h2>Your art-direction decision</h2><p>Inspect each homepage, open its publication detail, try the visual controls, and compare the mobile menu. Select one direction or request specific refinements. No choice has been made for you.</p><a href="../../docs/implementation/design-review.md">Read the design comparison and review checklist</a><p class="small">No forms, tracking, hosted deployment, application backend or real 3D runtime. Static-first content delivery remains compatible with rich, accessible interaction.</p></footer></main></body></html>'''


if __name__ == '__main__':
    build_art()
    for direction in DIRECTIONS:
        write(f'{direction}.html', shell(direction, hero(direction) + research(direction) + publications(direction) + community(direction) + joining() + notes(direction)))
        write(f'{direction}-publication.html', shell(direction, detail(direction), detail=True))
    gallery_html = gallery().replace('<fieldset class="view-controls">', '<noscript><p>Open each prototype directly to inspect its responsive layout. Width controls require JavaScript.</p></noscript><fieldset class="view-controls" disabled>')
    write('index.html', gallery_html)
    print('Generated 3 homepage concepts, 3 publication concepts, 5 SVG illustrations and 1 comparison gallery.')
