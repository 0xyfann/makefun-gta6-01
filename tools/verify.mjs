import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { lstatSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { buildDossier } from '../vendor/makefun-game.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const gameRoot = join(root, 'game');
const run = () => mkdtempSync(join(tmpdir(), 'nightline-verify-'));
const one = run();
const two = run();
const caps = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, game_max_files: 993, game_max_bytes: 50331648 };
const env = (out) => ({ ...process.env, MAKEFUN_OUTPUT_DIR: out });
execFileSync(process.execPath, ['main.ts'], { cwd: root, env: env(one), stdio: 'inherit' });
execFileSync(process.execPath, ['main.ts'], { cwd: root, env: env(two), stdio: 'inherit' });

function listFiles(base) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const mode = lstatSync(path);
      assert(!mode.isSymbolicLink(), `symlink forbidden: ${path}`);
      if (mode.isDirectory()) walk(path);
      else { assert(mode.isFile(), `special file forbidden: ${path}`); out.push(relative(base, path)); }
    }
  };
  walk(base);
  return out.sort();
}
const firstFiles = listFiles(one), secondFiles = listFiles(two);
assert.deepEqual(firstFiles, secondFiles, 'output file lists differ');
for (const path of firstFiles) {
  assert.deepEqual(readFileSync(join(one, path)), readFileSync(join(two, path)), `output differs: ${path}`);
}
const dossier = buildDossier(one, caps);
assert.deepEqual(readFileSync(join(one, 'dossier.json')), Buffer.from(dossier), 'dossier rebuild differs');
assert.equal(readFileSync(join(root, 'LICENSE'), 'utf8').split(/\r?\n/, 1)[0], 'SPDX-License-Identifier: MIT');

const gameFiles = listFiles(gameRoot);
const gameEntries = gameFiles.length;
const gameBytes = gameFiles.reduce((n, path) => n + statSync(join(gameRoot, path)).size, 0);
assert(gameEntries <= 993, 'game entry cap exceeded');
assert(gameBytes <= 50331648, 'game byte cap exceeded');
const html = readFileSync(join(gameRoot, 'index.html'), 'utf8');
const external = /https?:\/\//i;
const refs = [];
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) refs.push([match[1], 'index.html']);
for (const path of gameFiles.filter((p) => /\.(?:js|mjs)$/i.test(p))) {
  const text = readFileSync(join(gameRoot, path), 'utf8');
  assert(!external.test(text), `external URL in game/${path}`);
  for (const match of text.matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?["']([^"']+)["']/g)) refs.push([match[1], path]);
  for (const match of text.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) refs.push([match[1], path]);
}
for (const path of gameFiles) {
  const text = readFileSync(join(gameRoot, path), 'utf8');
  assert(!external.test(text), `external URL in game/${path}`);
}
for (const [ref, from] of refs) {
  if (ref.startsWith('data:') || ref.startsWith('#')) continue;
  assert(!/^[a-z][a-z0-9+.-]*:/i.test(ref) && !ref.startsWith('//'), `external reference: ${ref}`);
  const clean = ref.split(/[?#]/, 1)[0];
  const target = clean.startsWith('/') ? resolve(gameRoot, `.${clean}`) : resolve(gameRoot, dirname(from), clean);
  assert(target.startsWith(gameRoot + sep), `reference escapes game/: ${ref}`);
  assert(lstatSync(target).isFile(), `missing game reference ${ref} from ${from}`);
}
const shots = readdirSync(join(root, 'screenshots')).filter((name) => !name.startsWith('.')).sort();
assert.equal(shots.length, 4, 'exactly four screenshots required');
for (const name of shots) {
  const bytes = readFileSync(join(root, 'screenshots', name));
  assert(bytes.length <= 262144, `screenshot too large: ${name}`);
  assert.deepEqual([...bytes.subarray(0, 8)], [137,80,78,71,13,10,26,10], `${name} is not PNG`);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert(Math.max(width,height) <= 1280 && Math.min(width,height) >= 480, `screenshot dimensions invalid: ${name}`);
}
console.log(`verified: ${firstFiles.length} output files, ${gameBytes} game bytes, 4 PNG renders, deterministic output and dossier`);
