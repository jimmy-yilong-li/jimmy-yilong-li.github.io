import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';

const root = path.resolve('dist');
const origin = 'https://jimmy-yilong-li.github.io';
const walk = async (directory) => {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    result.push(...(item.isDirectory() ? await walk(file) : [file]));
  }
  return result;
};
const files = await walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const documents = new Map();
const visit = (node, callback) => {
  callback(node);
  for (const child of node.childNodes ?? []) visit(child, callback);
};
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const tree = parse(html);
  const ids = new Set();
  const references = [];
  let title = false;
  visit(tree, node => {
    if (node.tagName === 'title') title = true;
    const attributes = Object.fromEntries((node.attrs ?? []).map(item => [item.name, item.value]));
    if (attributes.id) {
      assert.ok(!ids.has(attributes.id), `${file}: duplicate id ${attributes.id}`);
      ids.add(attributes.id);
    }
    if (node.tagName === 'img') assert.ok(attributes.alt, `${file}: missing image description`);
    for (const name of ['href', 'src', 'poster']) if (attributes[name]) references.push(attributes[name]);
    if (attributes.srcset) {
      for (const candidate of attributes.srcset.split(',')) references.push(candidate.trim().split(/\s+/)[0]);
    }
  });
  assert.ok(title && ids.has('main-content'), `${file}: missing page structure`);
  documents.set(file, { ids, references, tree });
}

const resolveFile = async (pathname) => {
  let target = path.join(root, decodeURIComponent(pathname));
  assert.ok(target === root || target.startsWith(`${root}${path.sep}`), `Invalid path: ${pathname}`);
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    await stat(target);
    return target;
  } catch { throw new Error(`Missing local resource: ${pathname}`); }
};
let checked = 0;
const check = async (reference, sourceFile, checkFragment = true) => {
  const page = path.relative(root, sourceFile).replaceAll(path.sep, '/').replace(/index\.html$/, '');
  const url = new URL(reference, `${origin}/${page}`);
  if (url.origin !== origin) return;
  const target = await resolveFile(url.pathname);
  if (checkFragment && url.hash && documents.has(target)) {
    const id = decodeURIComponent(url.hash.slice(1));
    assert.ok(documents.get(target).ids.has(id), `${page}: broken anchor ${reference}`);
  }
  checked++;
};
for (const [file, document] of documents) for (const reference of document.references) await check(reference, file);
for (const file of files.filter(file => file.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) await check(match[1], file, false);
}

const nodes = (tree, predicate) => {
  const result = [];
  visit(tree, node => { if (predicate(node)) result.push(node); });
  return result;
};
const attrs = node => Object.fromEntries((node.attrs ?? []).map(item => [item.name, item.value]));
const text = node => (node.value ?? '') + (node.childNodes ?? []).map(text).join('');
const posts = JSON.parse(await readFile('src/data/blog.json', 'utf8'));
const blogIndexDocument = documents.get(path.join(root, 'blog/index.html'));
assert.ok(blogIndexDocument, 'Missing built Blog index');
const blogIndex = blogIndexDocument.tree;
const cards = nodes(blogIndex, node => attrs(node).class?.split(' ').includes('blog-card'));
const expectedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
assert.deepEqual(cards.map(card => text(nodes(card, node => node.tagName === 'h2')[0])), expectedPosts.map(post => post.title), 'Blog cards are missing or not ordered newest first');
for (const [index, card] of cards.entries()) {
  const image = nodes(card, node => node.tagName === 'img')[0];
  assert.ok(image, 'Blog card is missing its cover');
  assert.equal(attrs(image).src, expectedPosts[index].cover, 'Blog card uses the wrong cover');
  assert.equal(attrs(image).alt, expectedPosts[index].coverAlt, 'Blog card uses the wrong image description');
}
for (const post of posts) {
  const file = path.join(root, 'blog', post.slug, 'index.html');
  const document = documents.get(file);
  assert.ok(document, `Missing built blog article: ${post.slug}`);
  const h1 = nodes(document.tree, node => node.tagName === 'h1');
  assert.deepEqual(h1.map(text), [post.title], `${post.slug}: incorrect or duplicate title`);
  const cover = nodes(document.tree, node => node.tagName === 'img' && attrs(node).src === post.cover)[0];
  assert.ok(cover, `${post.slug}: missing cover image`);
  assert.equal(attrs(cover).alt, post.coverAlt, `${post.slug}: incorrect cover description`);
  assert.ok(nodes(document.tree, node => node.tagName === 'figcaption').some(node => text(node) === post.coverCaption), `${post.slug}: missing article-specific cover caption`);
  if (post.coverMobile) {
    assert.ok(nodes(document.tree, node => node.tagName === 'source' && attrs(node).srcset === post.coverMobile).length, `${post.slug}: missing mobile cover`);
  }
  if (post.slug === 'kv-caching-across-accelerators-on-edge-socs') {
    assert.ok(nodes(document.tree, node => node.tagName === 'math' && attrs(node).display === 'block').length, `${post.slug}: memory equation is not rendered as math`);
    const tables = nodes(document.tree, node => node.tagName === 'table');
    assert.equal(tables.length, 2, `${post.slug}: missing comparison table`);
    const sources = nodes(document.tree, node => node.tagName === 'source');
    assert.equal(sources.length, 3, `${post.slug}: mobile diagram alternatives are missing`);
  }
  const related = nodes(document.tree, node => node.tagName === 'nav' && attrs(node)['aria-label'] === 'Related article')[0];
  assert.ok(related, `${post.slug}: related article navigation is missing`);
  const link = nodes(related, node => node.tagName === 'a')[0];
  assert.ok(posts.some(other => other.slug !== post.slug && attrs(link).href === `/blog/${other.slug}/`), `${post.slug}: invalid related article`);
}
assert.ok(!files.some(file => /(^|\/)(docs|tests|tmp|node_modules)\//.test(path.relative(root, file))));
assert.ok(!files.some(file => /\.(md|pptx|ts|mjs)$/.test(file)), 'Non-public source file leaked into build');
assert.ok(!files.some(file => /pdfs\/.*(?:mmpupil|cv|resume|split)/i.test(file)), 'Private draft leaked into build');
console.log(`Verified ${htmlFiles.length} pages, ${posts.length} complete blog articles, and ${checked} local links, images, fonts, and anchors. No private drafts or local documentation in the build.`);
