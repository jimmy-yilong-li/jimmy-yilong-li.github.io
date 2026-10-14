import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';

test('deployment validates the standalone site and publishes only built files', async () => {
  const filename = new URL('../.github/workflows/deploy-pages.yml', import.meta.url);
  const exists = await access(filename).then(() => true, () => false);
  assert.ok(exists, 'Missing Astro Pages deployment workflow');
  const workflow = parse(await readFile(filename, 'utf8'));
  assert.deepEqual(workflow.on.push.branches, ['master']);
  const steps = workflow.jobs.build.steps;
  const commands = steps.map(step => step.run).filter(Boolean);
  for (const command of ['npm ci', 'npm test', 'npm run check', 'npm run build', 'npm run verify']) {
    assert.ok(commands.includes(command), `Missing deployment gate: ${command}`);
  }
  assert.equal(steps.find(step => step.uses?.startsWith('actions/upload-pages-artifact@')).with.path, 'dist');
  assert.equal(workflow.jobs.deploy.needs, 'build');
});

test('the old NanoMind PDF URL resolves to the approved published PDF', async () => {
  const aliases = JSON.parse(await readFile(new URL('../src/data/download-aliases.json', import.meta.url)));
  assert.equal(aliases['/pdfs/tiny_llm.pdf'], '/pdfs/nanomind-iclr2026.pdf');
  const hash = async pathname => createHash('sha256').update(await readFile(new URL(`../public${pathname}`, import.meta.url))).digest('hex');
  for (const [alias, source] of Object.entries(aliases)) assert.equal(await hash(alias), await hash(source));
});
