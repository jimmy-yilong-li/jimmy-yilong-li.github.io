import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2] ?? path.join(root, '../JimmyLi-Network.github.io'));
const dataDir = path.join(root, 'src/data');
const publicDir = path.join(root, 'public');
const overrides = JSON.parse(await readFile(path.join(dataDir, 'publication-overrides.json'), 'utf8'));
await mkdir(dataDir, { recursive: true });
await mkdir(path.join(publicDir, 'images'), { recursive: true });
await mkdir(path.join(publicDir, 'pdfs'), { recursive: true });

const files = async (directory) => (await readdir(path.join(source, directory)))
  .filter((file) => file.endsWith('.md')).sort();
const parse = async (directory, filename) => {
  const text = await readFile(path.join(source, directory, filename), 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter: ${filename}`);
  return { data: parseYaml(match[1]), content: match[2] };
};
const dateString = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString().slice(0, 10);
};

const publications = [];
const publicPdfs = new Set(['/pdfs/Re-Mind_for_pitch.pdf']);
for (const file of await files('_papers')) {
  const { data } = await parse('_papers', file);
  const date = dateString(data.date);
  if (data.hidden === true || Number(date.slice(0, 4)) < 2016) continue;
  const resources = [];
  const used = new Set();
  for (const [field, label] of [
    ['arxiv', 'arXiv'], ['pdf', 'PDF'], ['code', 'Code'], ['video', 'Video'],
    ['poster', 'Poster'], ['slides', 'Slides'], ['link', 'Publisher'],
  ]) {
    const href = String(data[field] ?? '').trim();
    if (!href || used.has(href)) continue;
    used.add(href);
    resources.push({ label, href });
    if (href.startsWith('/pdfs/')) publicPdfs.add(href);
  }
  const publication = {
    id: file.replace(/\.md$/, ''),
    title: data.title,
    date,
    year: Number(date.slice(0, 4)),
    venue: data.venue,
    area: data.publication_area,
    authors: data.authors,
    note: data.note ?? '',
    abstract: String(data.abstract ?? '').trim(),
    resources,
    bib: data.bib ?? '',
  };
  const resolved = { ...publication, ...(overrides[publication.id] ?? {}) };
  if (resolved.bib) {
    // Keep citation authors in sync with the complete, approved display list.
    const authors = resolved.authors.replace(/<[^>]*>/g, '').replace(/\*/g, '')
      .replace(/\s+and\s+/g, ', ').split(',').map(name => name.trim()).filter(Boolean).join(' and ');
    resolved.bib = resolved.bib.replace(/(author\s*=\s*)\{[^}]*\}/i, `$1{${authors}}`);
  }
  publications.push(resolved);
}
publications.sort((a, b) => b.date.localeCompare(a.date));
await writeFile(path.join(dataDir, 'publications.json'), JSON.stringify(publications, null, 2) + '\n');

const news = [];
for (const file of await files('_news')) {
  const { data } = await parse('_news', file);
  if (data.hidden || /CRANE/i.test(data.title)) continue;
  const title = String(data.title);
  const related = /PalmBench/i.test(title) ? 'palmbench'
    : /NanoMind|Tiny but Mighty/i.test(title) ? 'nanomind'
    : /CPPO/i.test(title) ? 'cppo' : 'medusa';
  news.push({
    title,
    date: dateString(data.date),
    href: data.external_url || `/work/${related}/`,
  });
}
news.sort((a, b) => b.date.localeCompare(a.date));
await writeFile(path.join(dataDir, 'news.json'), JSON.stringify(news, null, 2) + '\n');

const assetMap = [
  ['images/uwb.jpg', 'images/profile-hardware.jpg'],
  ['images/tinyllm.png', 'images/nanomind-prototype.png'],
  ['images/palmbench.png', 'images/palmbench-overview.png'],
  ['Nanomind.png', 'images/virgile-concept.png'],
  ['images/motherboard.PNG', 'images/medusa-hardware.png'],
  ['images/medusa.png', 'images/medusa-signal.png'],
  ['images/livetag-homepage.png', 'images/livetag-prototype.png'],
  ['images/mmpupil-system.png', 'images/mmpupil-system.png'],
  ['images/gemini.png', 'images/gemini-overview.png'],
];
for (const [from, to] of assetMap) {
  await copyFile(path.join(source, from), path.join(publicDir, to));
}
await copyFile(path.join(source, 'favicon.png'), path.join(publicDir, 'favicon.png'));
for (const pdf of publicPdfs) {
  if (/mmpupil|cv|resume|split/i.test(pdf)) throw new Error(`Unapproved public PDF: ${pdf}`);
  await copyFile(path.join(source, pdf.replace(/^\//, '')), path.join(publicDir, pdf));
}

const blogDir = path.join(root, 'src/pages/blog');
await mkdir(blogDir, { recursive: true });
const blog = [];
for (const file of await files('_posts')) {
  const { data, content } = await parse('_posts', file);
  if (data.listed !== true) continue;
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
  const title = JSON.stringify(data.title);
  const summary = JSON.stringify(data.summary ?? '');
  const date = dateString(data.date);
  const minutes = Math.max(1, Math.ceil(content.split(/\s+/).length / 220));
  const frontmatter = `---\nlayout: '../../layouts/ArticleLayout.astro'\ntitle: ${title}\nsummary: ${summary}\ndate: ${date}\nminutes: ${minutes}\ncover: /images/compute-memory.svg\n---\n`;
  await writeFile(path.join(blogDir, `${slug}.md`), frontmatter + content.trim() + '\n');
  blog.push({ slug, title: data.title, summary: data.summary, date, minutes, cover: '/images/compute-memory.svg' });
}
await writeFile(path.join(dataDir, 'blog.json'), JSON.stringify(blog, null, 2) + '\n');

await mkdir(path.join(root, 'docs'), { recursive: true });
await writeFile(path.join(root, 'docs/source-provenance.json'), JSON.stringify({
  source, importedAt: new Date().toISOString(),
  assets: assetMap.map(([from, to]) => ({ from, to })),
  publicPdfs: [...publicPdfs],
  excluded: ['CV and resume', 'mmPupil review draft', 'hidden Split to Fit paper', 'pre-2016 papers', 'unlisted blog drafts'],
}, null, 2) + '\n');
console.log(`Imported ${publications.length} papers, ${news.length} updates, ${blog.length} blog post, ${publicPdfs.size} public PDFs.`);
