# Verification record

## Build checks

- `node main.ts` is run twice by `tools/verify.mjs` in separate scratch output directories.
- The verifier compares the complete output trees byte-for-byte.
- The dossier is rebuilt with `vendor/makefun-game.ts` and compared byte-for-byte.
- The first line of `LICENSE` is checked for the SPDX MIT identifier.
- HTML, CSS and JavaScript references are checked to stay inside `game/`; the game contains no external URL.

## Manual/browser checklist

The game is a static ES-module page. The four query presets initialize distinct play states: foot, drive, chase (three wanted stars), and mission. Keyboard handling covers walking, driving, vehicle entry/exit, braking, action/combat pulse, pause/resume, and save/load. The runtime uses no fetch, WebSocket, external font, image, audio, or network dependency.

## Browser verification

- Chromium 145.0.7632.6 via Playwright 1.58.2, headless, viewport 1280×720.
- All four presets were opened: `foot` (Quiet Entry, on foot), `drive` (Borrowed Wheels, vehicle), `chase` (Heat Check, three wanted stars), and `mission` (Waterline Drop, contract active).
- Each preset rendered a live 1280×720 canvas with HUD and minimap. The browser exercise covered pause/resume (`P`), enter/exit vehicle (`E`), action/combat pulse (`Q`), and save/load (`F5`/`F9`). No page exceptions occurred.
- Network audit recorded zero non-local requests. The only requests were the local HTML, CSS, and ES modules.
- Fresh Chromium captures are stored as `screenshots/foot.png` (1280×720, 236028 bytes), `screenshots/drive.png` (1280×720, 233463 bytes), `screenshots/chase.png` (1280×720, 239678 bytes), and `screenshots/mission.png` (1280×720, 247423 bytes); each is a direct browser screenshot, not an edited illustration.

## Size guardrails

The repository keeps the game source deliberately small: one HTML page, one stylesheet, five focused ES modules, and no vendored engine or binary assets. `main.ts` passes the platform limits of 993 game entries and 48 MiB, while the verifier asserts the screenshot cap and dossier build.
