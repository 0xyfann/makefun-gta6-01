// Copy the playable game and screenshots before describing their packaged bytes.
// Packaging stays separate from gameplay and uses only the offline starter kit.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repository = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(destination, { recursive: true });
cpSync(join(repository, 'game'), join(destination, 'game'), { recursive: true });
const imageFolder = join(destination, 'screenshots');
mkdirSync(imageFolder, { recursive: true });
if (existsSync(join(repository, 'screenshots'))) {
  cpSync(join(repository, 'screenshots'), imageFolder, { recursive: true });
}
const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(destination, 'dossier.json'), dossier);
