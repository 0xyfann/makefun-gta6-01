# SUNDOWN / Port Aurelia

An original, offline, top-down city crime game. Play Mara Venn, a courier helping Inez expose the syndicate controlling the harbor. Explore a 3,200-unit coastal city, take vehicles, evade patrols, recover cash, and finish five linked story assignments. All art is drawn in canvas; sound and the small radio motif are synthesized locally.

Run from this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory game
```

Open http://127.0.0.1:8080/ in desktop Chrome. No installation, build step, CDN, downloaded asset, or external request is needed. Serve the files over a local static server because Chrome applies CORS restrictions to ES modules opened through `file:`.

Presets begin immediately with the HUD and moving city:

- http://127.0.0.1:8080/index.html?scene=foot — Mara on foot near her contact.
- http://127.0.0.1:8080/index.html?scene=drive — behind the wheel at Palm Court.
- http://127.0.0.1:8080/index.html?scene=chase — three-star police pursuit.
- http://127.0.0.1:8080/index.html?scene=mission — harbor ledger delivery by the marina.

WASD / arrows move or drive; E enters/exits the nearest vehicle; Shift sprints or applies the handbrake; mouse aims and left click fires; F interacts with the gold mission ring; Esc pauses; M toggles sound; P saves. Save/load is also available in the menus. Local storage retains location, money, health, and the current chapter; a resumed chapter restarts its objectives. The clinic (+ on the ground near Palm Court) restores health. Taking an occupied car or causing a serious collision attracts patrols. Break contact to reduce wanted stars. Cash drops are green cases; follow the yellow minimap marker for story jobs. Audio unlocks after the first user gesture.

`game/js/` separates city rendering/collision, traffic/pedestrians, player/vehicle physics, police, missions, combat/effects, audio, persistence, HUD, minimap, utilities, and the main loop. `game/css/style.css` styles the overlays. All city, character, story, visual, and sound content is original.

Packaging uses Node 22.18+ and standard libraries only:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/sundown-output node main.ts
```

`main.ts` copies `game/` and `screenshots/`, then writes `dossier.json` using the unchanged kit library in `vendor/makefun-game.ts` and the starter's exact size caps. Do not edit the generated dossier.

Per the brief, `screenshots/` intentionally contains no images. The vendor rejects an empty screenshot folder, so a submission build becomes runnable after 3–4 genuine browser renders have been added there. Name the cover first alphabetically; each image must be PNG/JPEG, at most 256 KiB, with a long side at most 1280 and a short side at least 480. No screenshot has been created for this entry yet.

Local checks:

```sh
node tools/verify.mjs /absolute/path/to/kit/starter/screenshots
node tools/browser-check.mjs
```

The first checks JS syntax, paths, file/size caps, and the license, then tests `main.ts` twice in a temporary mirror with the supplied fixture images; it compares every copied game file and rebuilds the dossier byte-for-byte. Fixtures never enter this repository. It also confirms the expected empty-image rejection. The browser check connects to a Chromium DevTools instance on port 9222 and the game server on port 8080, exercises presets and controls, checks mission progression, and watches exceptions and external requests. It creates no screenshots. Mission progression checks position the player at objectives to exercise all five chapters reproducibly; walking and driving are tested with real keyboard events.

The sealed competition gate, recording requirements, account ownership, and submission are not evaluated by these local checks. This repository is a local build only; nothing is pushed or submitted.
