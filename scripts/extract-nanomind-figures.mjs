import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// These figures come from the published ICLR 2026 PDF, not a recreated diagram.
const pdf = 'public/pdfs/nanomind-iclr2026.pdf';
await mkdir('tmp/nanomind', { recursive: true });
execFileSync('pdfimages', ['-f', '14', '-l', '14', '-png', pdf, 'tmp/nanomind/figure']);
const photos = await Promise.all([0, 1].map(index =>
  sharp(`tmp/nanomind/figure-00${index}.png`)
    .resize({ width: 800, height: 583, fit: 'contain', background: '#ffffff' })
    .png().toBuffer(),
));
await sharp({ create: { width: 1640, height: 623, channels: 3, background: '#ffffff' } })
  .composite(photos.map((input, index) => ({ input, left: 20 + index * 800, top: 20 })))
  .png().toFile('public/images/nanomind-hardware.png');

execFileSync('pdftoppm', ['-f', '5', '-l', '5', '-scale-to', '2400', '-png', '-singlefile', pdf, 'tmp/nanomind/system-page']);
await sharp('tmp/nanomind/system-page.png')
  .extract({ left: 320, top: 1035, width: 1200, height: 433 })
  .png().toFile('public/images/nanomind-system.png');
console.log('Extracted NanoMind Figure 11 photos and Figure 3 architecture.');
