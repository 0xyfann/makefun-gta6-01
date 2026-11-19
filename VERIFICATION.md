# Local verification

Verified again on November 19, 2026 using Node v24.22.1, Python 3.12.3, and headless Chromium 157.0.8103.81. Browser interaction checks use the actual canvas and DOM at 1280 × 720. The four new JPEG captures use live gameplay at 1280 × 800.

## Rewrite and unchanged behavior

All 19 text files named in the fix3 brief were read and rewritten in full through the agent's write tool. The brief's summary says 18, but its enumerated paths total 19: 14 game files, `main.ts`, `VERIFICATION.md`, two verification tools, and `README.md`.

- The 14 game files have only explanatory comment additions. `main.ts` and both verification tools have only comment changes. An automated comparison against the previous commit strips comment-only lines and confirms identical remaining content in all 17 executable/source files.
- The entrypoint still copies `game/` and `screenshots/`, then writes `dossier.json` with `buildDossier` and the original size caps. Its default destination remains `/output`, with `MAKEFUN_OUTPUT_DIR` overriding it.
- `vendor/makefun-game.ts`, `LICENSE`, and `screenshots/.gitkeep` are byte-for-byte unchanged.
- Vendor SHA-256: `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129`.
- README was rewritten in full, retaining the three live make.fun badges at the top, the bounty URL, technical instructions, and referral footer.

## Static and packaging checks

- Game tree: 14 files and 2 directories, 56,904 file bytes; `index.html`: 627 bytes. No symlinks; all kit limits pass.
- Every game JavaScript file passes `node --check`; both verification scripts parse successfully.
- All 23 declared HTML/module references resolve to local regular files. Game sources contain no external URL references.
- `node tools/verify.mjs /tmp/gta6-fix3-images-c2sEEH` exits 0 using an image-only temporary directory containing the four newly captured JPEGs. Its isolated builds match source bytes and a fresh `buildDossier` result. The expected empty-image rejection also passes.
- The unchanged test helper counts all copied directory entries, so passing the repository's `screenshots/` directly triggers its count assertion because of `.gitkeep`. The successful helper run uses only the four images. Production `main.ts` is tested separately against the actual repository, including the unchanged `.gitkeep`.
- The helper's legacy output text says production screenshots are deferred; that description is historical. Four genuine entry screenshots are now present and both production runs below succeed.

Two direct runs of the actual repository's `main.ts` use different `MAKEFUN_OUTPUT_DIR` destinations:

| Run | Output directory | Exit | Images | Cover |
| --- | --- | --- | --- | --- |
| 1 | `/tmp/gta6-fix3-production-CDWMze/run-one` | 0 | 4 | 0 |
| 2 | `/tmp/gta6-fix3-production-CDWMze/run-two` | 0 | 4 | 0 |

All 20 output files, including the copied game, JPEGs, `.gitkeep`, and dossier, are byte-identical between runs. Each copied game file and JPEG also matches its repository source. Each dossier matches a fresh `buildDossier` invocation byte-for-byte.

Both dossiers are 589,645 bytes with SHA-256 `2644634ce530db06d963077decf5dc4f3b3c23d57a9455c8877456acd51a2d09`.

## Browser checks

`node tools/browser-check.mjs` exits 0. Title, foot, drive, chase, and mission all render varied canvas pixels with 63 city vehicles and 63 pedestrians. Chase has three wanted stars and four police vehicles; the mission preset begins at chapter two, PRECIOUS CARGO.

Walking, driving, entering/exiting a vehicle, pause/resume, starting from the title, vehicle theft raising wanted level, and mouse combat raising wanted level all pass. The story checks pass pickup, delivery, police-escape completion, three cash pickups, final handoff, and five completed chapters. Tests position the player at objectives to exercise progression reproducibly; movement uses real keyboard events.

Save/load passes in the main browser suite. An additional synchronous browser check confirms restoration of money (1,234), health (63), location (1510, 1084), chapter (1), and completed progression (2); loading also restores the player on foot and clears wanted level and police.

The successful main browser run observes 114 local requests, zero external requests, and zero uncaught exceptions. Screenshot capture separately records zero external requests and zero exceptions. Early attempts reached Chromium's localhost navigation error page before game execution; the successful browser instance classifies only the test endpoint with `--ip-address-space-overrides=127.0.0.1:8080=public`. The supplied Chromium also requires a validated WebGL policy file; an empty domain allowlist is used because this game renders with Canvas 2D.

## Fresh screenshots

All four previous JPEGs were replaced by new headless Chromium captures in this session. Their bytes differ from the previous commit. Every capture has `paused: false`, no open menu, a 1280 × 800 viewport, and a validated 1280 × 800 JPEG frame. Each is below 262,144 bytes.

| File | Scene | Bytes | State |
| --- | --- | ---: | --- |
| `screenshots/1-foot.jpg` | foot | 104,118 | On foot; cover image |
| `screenshots/2-drive.jpg` | drive | 105,983 | Inside the player vehicle |
| `screenshots/3-chase.jpg` | chase | 105,957 | Inside the vehicle; 3 stars, 4 police |
| `screenshots/4-mission.jpg` | mission | 81,430 | Inside the vehicle; PRECIOUS CARGO |

These are local verification results, not a sealed scorer or transcript-gate result. No submission or push was made, and the repository has no remote.
