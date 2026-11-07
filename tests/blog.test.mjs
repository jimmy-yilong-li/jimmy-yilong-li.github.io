import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { parse } from 'yaml';

const posts = JSON.parse(await readFile(new URL('../src/data/blog.json', import.meta.url), 'utf8'));
const kvSlug = 'kv-caching-across-accelerators-on-edge-socs';
const previousSlug = 'what-we-learned-the-hard-way-about-npus-gpus-and-unified-memory';

async function article(slug) {
  const source = await readFile(new URL(`../src/pages/blog/${slug}.md`, import.meta.url), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, `Missing article frontmatter: ${slug}`);
  return { metadata: parse(match[1]), body: match[2] };
}

test('Blog lists exactly the two approved articles, newest first', () => {
  assert.deepEqual(posts.map(post => post.slug), [kvSlug, previousSlug]);
  assert.equal(posts[0].title, 'KV Caching Across Accelerators on Edge SoCs');
  assert.equal(posts[0].date, '2026-10-21');
  assert.deepEqual(posts.map(post => post.date), posts.map(post => post.date).sort().reverse());
});

test('each article has matching metadata and its own accessible illustration', async () => {
  for (const post of posts) {
    const { metadata } = await article(post.slug);
    for (const key of ['title', 'summary', 'minutes', 'cover', 'coverAlt', 'coverCaption', 'coverMobile']) {
      assert.equal(metadata[key], post[key], `${post.slug}: mismatched ${key}`);
    }
    assert.equal(String(metadata.date).slice(0, 10), post.date);
    assert.ok(post.coverAlt?.length > 30, `${post.slug}: missing descriptive cover alt`);
    assert.ok(post.coverCaption?.length > 20, `${post.slug}: missing cover caption`);
    await access(new URL(`../public${post.cover}`, import.meta.url));
    if (post.coverMobile) await access(new URL(`../public${post.coverMobile}`, import.meta.url));
  }
  assert.equal(posts[0].cover, '/images/kv-context-branches.svg');
  assert.equal(posts[1].cover, '/images/compute-memory.svg');
});

test('the KV note preserves the explanation, experiment scope, and public references', async () => {
  const { body } = await article(kvSlug);
  assert.equal((body.match(/^## /gm) ?? []).length, 8);
  assert.doesNotMatch(body, /^# /m, 'The layout already renders the article title');
  for (const phrase of ['RK3588', '0.5B', '128 output', 'three runs', 'about 16%', 'about 26%', 'separate']) {
    assert.ok(body.includes(phrase), `Missing source context: ${phrase}`);
  }
  for (const url of [
    'https://docs.vllm.ai/en/latest/design/prefix_caching/',
    'https://arxiv.org/abs/2309.06180',
    'https://huggingface.co/docs/transformers/en/kv_cache',
  ]) assert.ok(body.includes(url), `Missing reference: ${url}`);
  assert.match(body, /<math\b[\s\S]*?<\/math>/);
  assert.doesNotMatch(body, /\\\[|\\\(|\\mathrm/);
  assert.equal((body.match(/class="blog-table-scroll"/g) ?? []).length, 2);
  for (const name of ['kv-cache-reuse', 'kv-context-paths']) {
    assert.ok(body.includes(`/images/${name}.svg`));
    assert.ok(body.includes(`/images/${name}-mobile.svg`));
  }
});

test('the two notes link to each other without changing the homepage', async () => {
  for (const [slug, related] of [[kvSlug, previousSlug], [previousSlug, kvSlug]]) {
    const { metadata } = await article(slug);
    assert.equal(metadata.relatedSlug, related);
    assert.ok(posts.some(post => post.slug === metadata.relatedSlug));
  }
  const homepage = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  assert.ok(!homepage.includes(kvSlug), 'Do not add a homepage blog teaser');
});

test('measurements keep the retained-context and RSS comparisons separate', async () => {
  const { body } = await article(kvSlug);
  const text = body.replace(/\s+/g, ' ');
  assert.match(text, /faster retained single-language-engine baseline, which was CPU in this setup/);
  assert.match(text, /Both paths used the NPU for vision/);
  assert.match(text, /peak aggregate process RSS\*\* than an earlier process-per-stream implementation/);
  assert.match(text, /That is a separate comparison, involving consolidated model ownership/);
  assert.match(text, /RSS does not isolate unique physical memory or KV allocation/);
  assert.match(text, /Mean first-token latency remained slightly higher than in that earlier implementation/);
  assert.match(text, /These are short-session observations/);
});

test('the KV note links its related arXiv paper before the first section', async () => {
  const { body } = await article(kvSlug);
  const introduction = body.split(/^## /m)[0];
  const publications = JSON.parse(await readFile(new URL('../src/data/publications.json', import.meta.url), 'utf8'));
  const paper = publications.find(paper => paper.id === '2026-10-26-shared-context');
  assert.ok(paper, 'The related paper must be included in Publications');
  assert.ok(introduction.includes(`[${paper.title}](https://arxiv.org/pdf/2610.35309)`), 'The blog citation must match the current publication title');
});
