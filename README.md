[![make.fun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/0xyfann/makefun-gta6-01/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/0xyfann/makefun-gta6-01/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

# Sundown: Port Aurelia

An original, offline, top-down city crime game. As courier Mara Venn, help Inez expose the syndicate controlling the harbor. Explore a 3,200-unit coastal city, take vehicles, evade patrols, collect cash, and complete five connected story assignments. Canvas draws all the art; audio and the small radio motif are synthesized locally.

## Run locally

Start a static server from this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory game
```

Open http://127.0.0.1:8080/ in desktop Chrome. There is no installation or build step, and the game uses no CDN, downloaded assets, or external requests. Use a local server: Chrome restricts ES modules opened directly through `file:` URLs.

These presets start live gameplay immediately, with the HUD and moving city:

- http://127.0.0.1:8080/index.html?scene=foot — Mara on foot near her contact.
- http://127.0.0.1:8080/index.html?scene=drive — driving at Palm Court.
- http://127.0.0.1:8080/index.html?scene=chase — a three-star police pursuit.
- http://127.0.0.1:8080/index.html?scene=mission — harbor ledger delivery near the marina.

## Controls and progression

WASD / arrows move or drive. E enters or exits the nearest vehicle. Shift sprints on foot or applies the handbrake while driving. Aim with the mouse and fire with left click; F interacts with the gold mission ring. Esc pauses, M toggles sound, and P saves. The menus also offer save/load. Audio unlocks after the first user gesture.

Local storage retains location, money, health, and the current chapter; loading a chapter restarts its objectives. The clinic, marked with a ground-level + near Palm Court, restores health. Taking an occupied car or causing a serious collision attracts patrols. Break contact to reduce wanted stars. Green cases hold cash; the yellow minimap marker points toward story jobs.

## Source and packaging

`game/js/` separates city rendering and collision, traffic and pedestrians, player and vehicle physics, police, missions, combat and effects, audio, persistence, HUD, minimap, utilities, and the main loop. Overlay styles live in `game/css/style.css`. All city, character, story, visual, and sound content is original.

Packaging requires Node 22.18+ and standard libraries only:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/sundown-output node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory, then writes `dossier.json` through `buildDossier` from the unchanged kit library, `vendor/makefun-game.ts`, using the starter's exact size caps. Without `MAKEFUN_OUTPUT_DIR`, the destination is `/output`. Do not edit the generated dossier.

The four original renders in `screenshots/` are captured from live gameplay with headless Chromium: `1-foot.jpg` (on foot, cover), `2-drive.jpg` (driving), `3-chase.jpg` (three wanted stars), and `4-mission.jpg` (harbor ledger mission). Every image is 1280 × 800 and no larger than 256 KiB.

## Local verification

With the game server running on port 8080 and Chromium DevTools on port 9222:

```sh
node tools/verify.mjs /absolute/path/to/image-only-screenshots
node tools/browser-check.mjs
```

The packaging check accepts an image-only directory containing three or four screenshots, either this entry's actual JPEGs or kit starter fixtures. Exclude placeholder files such as `.gitkeep`: this test helper counts all copied directory entries, while production packaging correctly ignores dotfiles for dossier images. It checks JS syntax, local references, file and byte caps, and the license. It then runs `main.ts` twice in a temporary mirror, compares every copied game file, and rebuilds each dossier byte-for-byte. It also confirms that an empty screenshot folder receives the expected vendor rejection. Test fixtures stay in the temporary mirror.

The browser check exercises presets, controls, vehicle theft, combat, save/load, and all five story chapters, while watching for exceptions and external requests. It produces no screenshots. Mission checks place the player at objectives to exercise progression reproducibly; walking and driving use real keyboard events. See `VERIFICATION.md` for the recorded local results.

These checks do not evaluate the sealed competition gate, transcript recording requirements, account ownership, or submission. This is a local build; nothing is pushed or submitted.

Bounty: https://make.fun/bounty/gta6-01

Referral: https://make.fun/r/p1x954ca
