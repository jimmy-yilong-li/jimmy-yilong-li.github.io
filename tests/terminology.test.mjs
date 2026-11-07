import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { works } from '../src/data/works.ts';

const root = new URL('../src/', import.meta.url);
const legacyTerms = /\bVLMs?\b|vision[\s\u2010-\u2015-]+language\s+(?:inference|models?)/i;
const read = path => readFile(new URL(path, root), 'utf8');

async function copyFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) files.push(...await copyFiles(path));
    else if (/\.(astro|md)$/.test(entry.name)) files.push(path);
  }
  return files;
}

test('the homepage introduces multimodal LLMs and prioritizes local MLLM inference', async () => {
  const homepage = await read('pages/index.astro');
  assert.match(homepage, /multimodal LLMs \(MLLMs\) locally/);
  assert.match(homepage, /From local MLLM inference/);
});

test('page descriptions and blog prose use MLLM terminology outside cited paper titles', async () => {
  const files = [
    ...await copyFiles(new URL('pages/', root)),
    ...await copyFiles(new URL('layouts/', root)),
  ];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const prose = source.replace(/\[[^\]]*\]\([^)]*\)/g, '');
    assert.doesNotMatch(prose, legacyTerms, `Outdated narrative terminology: ${file.pathname}`);
  }
  const blog = await read('pages/blog/kv-caching-across-accelerators-on-edge-socs.md');
  assert.match(blog, /multimodal LLM \(MLLM\)/);
  assert.match(blog, /0\.5B MLLM/);
  assert.match(blog, /\[Shared Context, Separate Engines: Stateful Streaming Inference for Multimodal LLMs on Edge SoCs\]\(https:\/\/arxiv\.org\/pdf\/2610\.35309\)/);
});

test('project narratives use MLLM without relabeling text-only LLM research', () => {
  for (const work of works) {
    assert.doesNotMatch(JSON.stringify({ summary: work.summary, sections: work.sections }), legacyTerms, work.slug);
  }
  for (const slug of ['nanomind', 'virgile']) {
    assert.match(works.find(work => work.slug === slug).summary, /MLLM/);
  }
  const palmbench = works.find(work => work.slug === 'palmbench');
  assert.match(palmbench.summary, /compressed mobile LLMs/);
  assert.equal(palmbench.title, 'PalmBench: A Comprehensive Benchmark of Compressed Large Language Models on Mobile Platforms');
});
