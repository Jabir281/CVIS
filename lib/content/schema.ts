export type Research = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  status: 'draft';
};
export type Site = {
  name: string;
  fullName: string;
  institution: string;
  previewNotice: string;
  hero: { title: string; summary: string; status: 'draft' };
  navigation: { label: string; href: string }[];
  research: Research[];
  publication: { title: string; sourceUrl: string; status: 'draft'; notice: string };
  groups: string[];
  facilities: string[];
  legacyContact: string;
  legacyJoin: string;
};
export type Goal = {
  id: string;
  status: 'draft';
  approvalStatus: 'NEEDS_APPROVAL';
  source: string;
  reviewNotice: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  stages: string[];
};

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || !value || Array.isArray(value)) throw new Error('Expected content object');
  return value as Record<string, unknown>;
}
function text(value: unknown, maximum = 2000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum || /[<>]/.test(value)) {
    throw new Error('Invalid plain-text content');
  }
  return value;
}
function list(value: unknown, maximum = 50): unknown[] {
  if (!Array.isArray(value) || value.length > maximum) throw new Error('Invalid content collection');
  return value;
}
export function safeSource(value: unknown): string {
  const input = text(value, 2000);
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.hostname !== 'cvis.bracu.ac.bd' || url.username || url.password || url.port) {
    throw new Error('Unapproved source URL');
  }
  return url.href;
}
function draft(value: unknown): 'draft' {
  if (value !== 'draft') throw new Error('Editorial approval is required before publishing this preview');
  return value;
}
export function parseSite(input: unknown): Site {
  const value = record(input);
  const hero = record(value.hero);
  const publication = record(value.publication);
  const research = list(value.research).map((item): Research => {
    const row = record(item);
    const id = text(row.id, 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Invalid research ID');
    return { id, title: text(row.title, 200), summary: text(row.summary), tags: list(row.tags, 10).map((tag) => text(tag, 80)), status: draft(row.status) };
  });
  if (new Set(research.map((item) => item.id)).size !== research.length) throw new Error('Duplicate research ID');
  return {
    name: text(value.name), fullName: text(value.fullName), institution: text(value.institution), previewNotice: text(value.previewNotice),
    hero: { title: text(hero.title), summary: text(hero.summary), status: draft(hero.status) },
    research,
    navigation: list(value.navigation, 10).map((item) => {
      const row = record(item);
      const href = text(row.href, 100);
      if (!/^\/#(?:goal|research|publications|people|facilities|seminars)$/.test(href)) throw new Error('Invalid navigation target');
      return { label: text(row.label, 80), href };
    }),
    publication: { title: text(publication.title), sourceUrl: safeSource(publication.sourceUrl), status: draft(publication.status), notice: text(publication.notice) },
    groups: list(value.groups, 10).map((item) => text(item, 100)),
    facilities: list(value.facilities, 10).map((item) => text(item, 100)),
    legacyContact: safeSource(value.legacyContact), legacyJoin: safeSource(value.legacyJoin),
  };
}
export function parseGoal(input: unknown): Goal {
  const value = record(input);
  if (value.approvalStatus !== 'NEEDS_APPROVAL') throw new Error('Goal approval must remain pending');
  const stages = list(value.stages, 3).map((item) => text(item, 30));
  if (stages.join('|') !== 'Observe|Understand|Apply') throw new Error('Invalid goal stages');
  const reviewNotice = text(value.reviewNotice);
  if (!reviewNotice.includes('pending CVIS review')) throw new Error('Missing editorial review notice');
  return {
    id: text(value.id), status: draft(value.status), approvalStatus: 'NEEDS_APPROVAL', source: text(value.source), reviewNotice,
    eyebrow: text(value.eyebrow), title: text(value.title), paragraphs: list(value.paragraphs, 10).map((item) => text(item)), stages,
  };
}
