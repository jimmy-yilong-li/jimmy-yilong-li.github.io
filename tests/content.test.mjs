import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { works } from '../src/data/works.ts';
import { publicationAreas, selectedPublicationIds, displayImage, paperHref } from '../src/lib/content.mjs';

const json = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url)));
const papers = await json('publications');
const publicRoot = new URL('../public/', import.meta.url);

test('all visible publications since 2016 are preserved, including distinct venues', async () => {
  const visible = JSON.parse(await readFile(new URL('./fixtures/publication-ids.json', import.meta.url)));
  assert.deepEqual(papers.map(paper => paper.id).sort(), visible.sort());
  assert.equal(new Set(papers.map(paper => paper.id)).size, papers.length);
  for (const paper of papers) {
    assert.ok(paper.year >= 2016, `Pre-2016 publication: ${paper.id}`);
    assert.ok(publicationAreas.includes(paper.area), `Unassigned area: ${paper.id}`);
    assert.ok(paper.title && paper.authors && paper.venue, `Incomplete metadata: ${paper.id}`);
    assert.doesNotMatch(paper.authors, /et\s+al\.?|\.\.\.|…/i, `Truncated authors: ${paper.id}`);
  }
});

test('NanoMind follows the published PDF rather than stale proceedings metadata', () => {
  const nano = papers.find(paper => paper.id === '2024-10-1-tinyllm');
  assert.equal(nano.authors.replace(/<[^>]*>/g, '').split(',').length, 9);
  assert.match(nano.authors, /Chengpo Yan/);
  assert.match(nano.abstract, /18\.8/);
  assert.doesNotMatch(nano.abstract, /20\.8/);
  assert.ok(nano.resources.some(resource => resource.href === '/pdfs/nanomind-iclr2026.pdf'));
  assert.match(nano.metadataSource, /proceedings\.iclr\.cc/);
});

test('LiveTag co-first authors and public preprint collaborators remain explicit', () => {
  assert.match(papers.find(paper => paper.venue === 'NSDI 2018').authors, /Chuhan Gao\*.*Yilong Li\*/);
  const ember = papers.find(paper => /EMBER:/.test(paper.title));
  assert.match(ember.authors, /Yilong Li.*Suman Banerjee.*Tong Che/);
  assert.match(ember.venue, /arXiv preprint/i);
  assert.match(papers.find(paper => paper.id === '2026-05-26-cppo').venue, /EMNLP/);
});

test('exported citations retain every author shown in the publication entry', () => {
  const normalize = name => name.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ');
  for (const paper of papers.filter(paper => paper.bib)) {
    const displayAuthors = paper.authors.replace(/<[^>]*>/g, '').replace(/\*/g, '').replace(/\s+and\s+/g, ', ')
      .split(',').map(normalize).sort();
    const field = paper.bib.match(/author\s*=\s*\{([^}]*)\}/i);
    assert.ok(field, `Missing citation author field: ${paper.id}`);
    const citationAuthors = field[1].trim().split(/\s+and\s+/).map(normalize).sort();
    assert.deepEqual(citationAuthors, displayAuthors, `Incomplete citation authors: ${paper.id}`);
  }
});

test('small informational text has readable contrast on its actual surfaces', async () => {
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  const color = name => {
    const value = css.match(new RegExp(`--${name}: (#[0-9a-f]{3,6})`))[1];
    return value.length === 4 ? '#' + value.slice(1).split('').map(channel => channel + channel).join('') : value;
  };
  const luminance = hex => {
    const channels = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  for (const token of ['text', 'muted', 'green']) {
    for (const background of ['paper', 'surface', 'sage']) {
      assert.ok(contrast(color(token), color(background)) >= 4.5, `${token} has insufficient contrast on ${background}`);
    }
  }
});

test('selected works prioritize local AI and have complete, correctly associated details', async () => {
  assert.deepEqual(works.slice(0, 2).map(work => work.slug), ['nanomind', 'palmbench']);
  assert.equal(works.length, 6);
  assert.equal(new Set(works.map(work => work.slug)).size, works.length);
  for (const id of selectedPublicationIds) assert.ok(works.some(work => work.publicationId === id));
  for (const work of works) {
    assert.ok(work.summary && work.coverAlt && work.imageCaption, `Missing card content: ${work.slug}`);
    assert.ok(work.sections.length >= 3, `Insufficient detail: ${work.slug}`);
    assert.equal(new Set(work.sections.map(section => section.id)).size, work.sections.length);
    if (work.publicationId) assert.ok(papers.some(paper => paper.id === work.publicationId));
    for (const slug of work.related ?? []) assert.ok(works.some(other => other.slug === slug));
    const images = [work.cover, ...work.sections.map(section => section.image?.src).filter(Boolean)];
    for (const image of images) {
      await access(new URL(image.slice(1), publicRoot));
      await access(new URL(displayImage(image).slice(1), publicRoot));
    }
  }
  assert.equal(works.find(work => work.slug === 'medusa').category, 'Wireless Sensing');
  assert.match(works.find(work => work.slug === 'medusa').cover, /medusa-hardware/);
  assert.match(works.find(work => work.slug === 'virgile').imageCaption, /Concept illustration/);
});

test('EMBER replaces LiveTag in the showcase without removing the NSDI publication', () => {
  const ember = works.find(work => work.slug === 'ember');
  assert.ok(ember, 'EMBER is missing from the showcase');
  assert.equal(ember.publicationId, '2026-05-07-ember');
  assert.equal(ember.category, 'Efficient Models');
  assert.equal(paperHref(papers.find(paper => paper.id === ember.publicationId)), '/work/ember/');
  assert.ok(ember.resources.some(resource => resource.href === '/pdfs/EMBER_Li.pdf'));
  assert.ok(!works.some(work => work.slug === 'livetag'));
  const livetag = papers.find(paper => paper.id === '2018-02-28-Livetag');
  assert.ok(livetag, 'LiveTag must remain in the full publication list');
  assert.equal(paperHref(livetag), '/papers/2018-02-28-Livetag/');
});

test('public downloads are explicitly approved, with no CV or review-draft leaks', async () => {
  const aliases = await json('download-aliases');
  const allowed = new Set(['/pdfs/Re-Mind_for_pitch.pdf', ...papers.flatMap(paper => paper.resources.map(resource => resource.href)).filter(href => href.startsWith('/pdfs/'))]);
  for (const [alias, target] of Object.entries(aliases)) {
    assert.ok(allowed.has(target), `Alias points to an unapproved PDF: ${target}`);
    allowed.add(alias);
  }
  const actual = (await readdir(new URL('pdfs/', publicRoot))).map(file => `/pdfs/${file}`);
  assert.deepEqual(actual.sort(), [...allowed].sort());
  for (const file of actual) assert.doesNotMatch(file, /mmpupil|cv|resume|split/i);
  for (const work of works) {
    for (const resource of work.resources) {
      if (resource.href.startsWith('/pdfs/')) assert.ok(allowed.has(resource.href), resource.href);
    }
  }
});

test('news and blog only contain approved, completed content', async () => {
  const news = await json('news');
  assert.ok(news.length > 0);
  assert.ok(news.every(item => !/CRANE|Meta.*intern/i.test(item.title)));
  for (const item of news) if (item.href.startsWith('/work/')) {
    assert.ok(works.some(work => item.href === `/work/${work.slug}/`));
  }
  const blog = await json('blog');
  assert.equal(blog.length, 1);
  const text = await readFile(new URL(`../src/pages/blog/${blog[0].slug}.md`, import.meta.url), 'utf8');
  assert.doesNotMatch(text, /EdgeFlow|unpublished internal experiments/i);
});
