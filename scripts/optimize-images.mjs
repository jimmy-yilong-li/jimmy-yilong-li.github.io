import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'public/images');
const output = path.join(source, 'optimized');
await mkdir(output, { recursive: true });
for (const file of await readdir(source)) {
  if (!/\.(png|jpe?g)$/i.test(file)) continue;
  const target = path.join(output, file.replace(/\.[^.]+$/, '.webp'));
  await sharp(path.join(source, file))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(target);
  console.log(`Optimized ${file}`);
}
