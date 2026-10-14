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
  });
  assert.ok(title && ids.has('main-content'), `${file}: missing page structure`);
  documents.set(file, { ids, references });
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
assert.ok(!files.some(file => /(^|\/)(docs|tests|tmp|node_modules)\//.test(path.relative(root, file))));
assert.ok(!files.some(file => /\.(md|pptx|ts|mjs)$/.test(file)), 'Non-public source file leaked into build');
assert.ok(!files.some(file => /pdfs\/.*(?:mmpupil|cv|resume|split)/i.test(file)), 'Private draft leaked into build');
console.log(`Verified ${htmlFiles.length} pages and ${checked} local links, images, fonts, and anchors. No private drafts or local documentation in the build.`);
