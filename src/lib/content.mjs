export const publicationAreas = [
  'Efficient AI / Agentic AI / Interpretability',
  'On-Device AI',
  'Wireless Sensing',
];

export const selectedPublicationIds = [
  '2024-10-1-tinyllm',
  '2024-09-21-PalmBench',
  '2026-05-26-cppo',
  '2025-12-09-Medusa',
  '2026-05-07-ember',
];

export const publicationWorkSlugs = {
  '2024-10-1-tinyllm': 'nanomind',
  '2024-09-21-PalmBench': 'palmbench',
  '2026-05-26-cppo': 'cppo',
  '2025-12-09-Medusa': 'medusa',
  '2026-05-07-ember': 'ember',
};

export const paperHref = (paper) => publicationWorkSlugs[paper.id]
  ? `/work/${publicationWorkSlugs[paper.id]}/`
  : `/papers/${paper.id}/`;

export const formatDate = (date, long = false) => new Intl.DateTimeFormat('en-US', {
  month: long ? 'long' : 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date}T12:00:00Z`));

export const plainText = (html) => html.replace(/<[^>]*>/g, '').trim();

export const displayImage = (src) => /\.(png|jpe?g)$/i.test(src)
  ? src.replace('/images/', '/images/optimized/').replace(/\.[^.]+$/, '.webp')
  : src;

export const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
