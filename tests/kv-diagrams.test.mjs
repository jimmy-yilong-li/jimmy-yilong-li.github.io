import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const subjects = ['reuse', 'branches', 'paths'];
const diagrams = subjects.flatMap(subject => ['', '-mobile'].map(variant => ({
  subject,
  mobile: Boolean(variant),
  name: `kv-${subject === 'reuse' ? 'cache' : 'context'}-${subject}${variant}.svg`,
})));
const resource = name => new URL(`../public/images/${name}`, import.meta.url);
const source = name => readFile(resource(name), 'utf8');
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const description = svg => svg.match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/)?.[1] ?? '';
const visibleText = svg => [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
  .map(match => match[1].replace(/<[^>]+>/g, '')).join(' ').replace(/\s+/g, ' ');

for (const { name, mobile } of diagrams) {
  test(`${name} exists and satisfies the accessible, self-contained SVG contract`, async () => {
    await assert.doesNotReject(access(resource(name)), `Missing diagram: ${name}`);
    const svg = await source(name);
    const root = svg.match(/<svg\b[^>]*>/)?.[0];
    assert.ok(root, 'An SVG root is required');
    assert.equal(attribute(root, 'xmlns'), 'http://www.w3.org/2000/svg');
    assert.equal(attribute(root, 'role'), 'img');
    assert.equal(attribute(root, 'width'), mobile ? '480' : '900');
    assert.equal(attribute(root, 'height'), mobile ? '720' : '560');
    assert.equal(attribute(root, 'viewBox'), mobile ? '0 0 480 720' : '0 0 900 560');

    const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'IDs must be unique within each resource');
    const labelledBy = attribute(root, 'aria-labelledby')?.trim().split(/\s+/);
    assert.equal(labelledBy?.length, 2, 'Reference one title and one description');
    for (const [index, element] of ['title', 'desc'].entries()) {
      const match = svg.match(new RegExp(`<${element}\\b([^>]*)>([\\s\\S]*?)<\\/${element}>`));
      assert.ok(match, `Missing ${element}`);
      assert.equal(attribute(match[1], 'id'), labelledBy[index]);
      assert.ok(match[2].trim().length >= (index ? 120 : 12), `${element} must be descriptive`);
    }

    assert.doesNotMatch(svg, /<(?:script|foreignObject|image|iframe|style|animate|set)\b/i);
    assert.doesNotMatch(svg, /<!DOCTYPE|<!ENTITY|<\?xml-stylesheet|\son\w+\s*=/i);
    assert.doesNotMatch(svg, /@import|@font-face|data:|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i);
    for (const match of svg.matchAll(/(?:href="([^"]+)"|url\(([^)]+)\))/g)) {
      const reference = match[1] ?? match[2];
      assert.ok(reference.startsWith('#'), `Non-local reference: ${reference}`);
      assert.ok(ids.includes(reference.slice(1)), `Unresolved reference: ${reference}`);
    }
    for (const match of svg.matchAll(/font-family="([^"]+)"/g)) {
      assert.equal(match[1], 'sans-serif', 'Use native sans-serif, not external fonts');
    }
    const labels = [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)];
    assert.ok(labels.length >= 8, 'The diagram needs visible explanatory labels');
    for (const [, attributes] of labels) {
      assert.ok(Number(attribute(attributes, 'font-size')) >= 22, 'Labels must be at least 22 SVG units');
    }
    for (const color of ['#f7f8f4', '#142d2a', '#39766a', '#dce5d8', '#e4a26a']) {
      assert.ok(svg.includes(color), `Missing reference palette color: ${color}`);
    }
  });
}

test('all six resources use distinct IDs, including their accessible title and description', async () => {
  const ids = (await Promise.all(diagrams.map(({ name }) => source(name))))
    .flatMap(svg => [...svg.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  assert.equal(new Set(ids).size, ids.length, 'Desktop and mobile diagrams must not share IDs');
});

const semantics = {
  reuse: [
    /image.*vision and projection.*visual embeddings.*historical LM prefill.*prefix KV.*query suffix prefill.*decode/i,
    /embeddings hit skips visual work/i,
    /KV hit also skips historical LM prefill/i,
    /neither hit skips query suffix prefill or decode/i,
    /embeddings are not contextual KV/i,
  ],
  branches: [
    /completed causal video history/i,
    /immutable/i,
    /Question A.*private suffix.*Answer A/i,
    /new frames.*later completed prefix.*Question B.*private suffix.*Answer B/i,
    /pending.*not ready.*excluded from both/i,
    /answer tails never merge/i,
    /earlier answers never observe new frames/i,
  ],
  paths: [
    /resident GPU/i,
    /CPU destination/i,
    /wait.*query suffix prefill.*decode on GPU/i,
    /export.*convert.*sync.*import.*compatible KV.*query suffix prefill.*decode on CPU/i,
    /retained visual embeddings.*historical LM prefill on CPU.*query suffix prefill.*decode on CPU/i,
    /Import requires backend support/i,
    /schematic only/i,
    /no scale.*duration.*guaranteed winner/i,
  ],
};

for (const subject of subjects) {
  test(`${subject} desktop and mobile descriptions preserve the technical distinctions`, async () => {
    for (const { name } of diagrams.filter(diagram => diagram.subject === subject)) {
      const desc = description(await source(name));
      for (const requirement of semantics[subject]) assert.match(desc, requirement, name);
    }
  });
}

test('visible labels preserve engine placement and cache distinctions, not just descriptions', async () => {
  for (const { name, subject, mobile } of diagrams) {
    const text = visibleText(await source(name));
    if (subject === 'reuse') {
      assert.match(text, /Embeddings hit.*History.*prefill.*Prefix KV hit.*Decode/i);
      assert.match(text, mobile ? /Query = suffix prefill/ : /query suffix prefill and decode/i);
    } else if (subject === 'branches') {
      assert.match(text, /Question A.*Private suffix.*Answer A/);
      assert.match(text, /Question B.*Private suffix.*Answer B/);
      assert.match(text, /Next frame pending.*Not ready/i);
    } else if (mobile) {
      assert.match(text, /Wait \/ stay on GPU.*Resident KV.*Wait on GPU.*Query suffix prefill.*Decode GPU/);
      assert.match(text, /Import \/ GPU to CPU.*GPU KV.*Export \/ convert.*Sync \/ import.*CPU KV.*Query suffix prefill.*Decode CPU/);
      assert.match(text, /Replay \/ rebuild on CPU.*Embeddings.*History prefill.*Query suffix prefill.*Decode CPU/);
    } else {
      assert.match(text, /Wait.*Resident GPU KV.*Query suffix prefill \/ GPU.*Decode GPU/);
      assert.match(text, /Import.*GPU KV.*Compatible KV.*Query suffix prefill \/ CPU.*Decode CPU/);
      assert.match(text, /Replay.*Retained visual embeddings.*History LM prefill CPU.*Query suffix prefill \/ CPU.*Decode CPU/);
    }
  }
});

test('the mobile import return connector stays in the gutter between state rows', async () => {
  const svg = await source('kv-context-paths-mobile.svg');
  const connector = svg.match(/M 424 338 H 438 V (\d+) H 124 V (\d+)/);
  assert.ok(connector, 'Missing import continuation connector');
  const first = svg.match(/<rect x="184" y="(\d+)" width="238" height="(\d+)"/);
  const second = svg.match(/<rect x="268" y="(\d+)" width="154" height="(\d+)"/);
  assert.ok(first && second, 'Missing import state rows');
  assert.ok(Number(connector[1]) > Number(first[1]) + Number(first[2]), 'Connector overlaps the first row');
  assert.ok(Number(connector[1]) < Number(second[1]), 'Connector crosses the CPU KV box');
  assert.ok(Number(connector[2]) <= Number(second[1]), 'Connector arrow enters another state box');
});

const hasXmllint = spawnSync('xmllint', ['--version'], { encoding: 'utf8' }).status === 0;
test('all diagram resources are well-formed XML', { skip: !hasXmllint && 'xmllint is not installed' }, () => {
  const result = spawnSync('xmllint', ['--nonet', '--noout', ...diagrams.map(({ name }) => fileURLToPath(resource(name)))], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
