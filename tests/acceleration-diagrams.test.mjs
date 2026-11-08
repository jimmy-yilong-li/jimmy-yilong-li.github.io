import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

for (const mobile of [false, true]) {
  const name = `speed-acceleration${mobile ? '-mobile' : ''}.svg`;
  const file = new URL(`../public/images/${name}`, import.meta.url);
  test(`${name} explains speed versus acceleration accessibly without benchmark claims`, async () => {
    const svg = await readFile(file, 'utf8');
    assert.ok(svg.includes(`viewBox="0 0 ${mobile ? '480 720' : '900 560'}"`));
    assert.match(svg, /role="img" aria-labelledby="[^"]+"/);
    assert.match(svg, /<title id="[^"]+">[^<]+<\/title>/);
    assert.match(svg, /<desc id="[^"]+">[^<]+<\/desc>/);
    for (const phrase of ['Speed wins.', 'Acceleration wins.', 'Development Speed', 'Time', 'Conceptual', 'Product + loop', 'Product only']) {
      assert.ok(svg.includes(phrase), `Missing label: ${phrase}`);
    }
    assert.match(svg, /stroke="#2463a0"/);
    assert.match(svg, /stroke="#ad4c42"/);
    assert.match(svg, /stroke-dasharray=/);
    assert.doesNotMatch(svg, /<(?:script|foreignObject|image)\b|\son\w+=/i);
    const validation = spawnSync('xmllint', ['--noout', fileURLToPath(file)], { encoding: 'utf8' });
    assert.equal(validation.status, 0, validation.stderr);
  });
  test(`${name} shows irregular setbacks without losing the overall trends`, async () => {
    const svg = await readFile(file, 'utf8');
    assert.doesNotMatch(svg, /iteration speed/i);
    for (const id of ['fixed-blue', 'fixed-red', 'growing-blue', 'growing-red']) {
      const path = svg.match(new RegExp(`<path id="${id}" d="([^"]+)"`));
      assert.ok(path, `Missing trace: ${id}`);
      const points = [...path[1].matchAll(/[ML](\d+) (\d+)/g)].map(match => [+match[1], +match[2]]);
      assert.ok(points.length >= 20, `${id}: needs visible local variation`);
      const changes = points.slice(1).map((point, i) => point[1] - points[i][1]);
      assert.ok(changes.some(change => change > 0) && changes.some(change => change < 0), `${id}: needs both rises and dips`);
      assert.ok(points.slice(1).every((point, i) => point[0] > points[i][0]), `${id}: time must advance`);
      if (id.startsWith('fixed')) assert.ok(Math.max(...points.map(p => p[1])) - Math.min(...points.map(p => p[1])) <= 20);
      else assert.ok(points.at(-1)[1] < points[0][1], `${id}: must rise overall`);
    }
  });
}
