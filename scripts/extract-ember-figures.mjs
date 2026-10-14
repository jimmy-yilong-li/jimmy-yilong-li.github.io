import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// Extract the original overview and budget-frontier plot from the public draft.
const pdf = 'public/pdfs/EMBER_Li.pdf';
await mkdir('tmp/ember', { recursive: true });
execFileSync('pdfimages', ['-f', '2', '-l', '2', '-png', pdf, 'tmp/ember/figure']);
await sharp('tmp/ember/figure-000.png').png().toFile('public/images/ember-overview.png');
execFileSync('pdftoppm', ['-f', '2', '-l', '2', '-scale-to', '2400', '-png', '-singlefile', pdf, 'tmp/ember/page2']);
await sharp('tmp/ember/page2.png')
  .extract({ left: 315, top: 1160, width: 1240, height: 413 })
  .png().toFile('public/images/ember-budget-frontier.png');
console.log('Extracted EMBER Figure 1 overview and Figure 2 budget frontier.');
