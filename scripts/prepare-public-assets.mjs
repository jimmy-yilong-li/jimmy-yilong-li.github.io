import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const aliases = JSON.parse(await readFile(path.join(root, 'src/data/download-aliases.json'), 'utf8'));
for (const [alias, target] of Object.entries(aliases)) {
  await mkdir(path.dirname(path.join(publicDir, alias)), { recursive: true });
  await copyFile(path.join(publicDir, target), path.join(publicDir, alias));
}
await mkdir(path.join(publicDir, 'licenses'), { recursive: true });
for (const font of ['ibm-plex-sans', 'space-grotesk']) {
  await copyFile(path.join(root, `node_modules/@fontsource-variable/${font}/LICENSE`), path.join(publicDir, `licenses/${font}.txt`));
}
console.log('Prepared legacy download aliases and bundled font licenses.');
