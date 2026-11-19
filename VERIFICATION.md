# Local verification

Runtime: Node v24.22.1, Python 3.12.3, Chromium 157.0.8103.81. Checked at 1280 × 720 using the actual canvas and DOM; no screenshot files were generated.

- Game: 14 files, 2 directories, 55,859 bytes; index.html: 542 bytes; no symlinks. All below the kit limits.
- Every game JS file passes `node --check`. Both verification scripts also parse.
- All 23 declared HTML/module references resolve to local regular files.
- Repository URL-pattern scan: matches only README.md, zero elsewhere.
- Vendor SHA-256 matches the kit unchanged: `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129`.
- Static server: index.html, js/main.js, js/city.js, js/missions.js, and css/style.css each return HTTP 200.
- Chromium: title, foot, drive, chase, and mission render successfully. Each preset has 63 city vehicles and 63 pedestrians. Chase starts with three wanted stars and four police vehicles; mission starts at chapter two near the marina.
- Keyboard/mouse checks pass: walking, driving, entering/exiting a car, pause/resume, title start, vehicle theft raising wanted level, and firing raising wanted level.
- Story checks pass: pickup, delivery, police-escape completion trigger, three cash collections, final handoff, and reward/progression. Objective positions are set by the test to exercise each stage reproducibly.
- Save/load restores money, health, location, and chapter.
- Final browser test: 119 local requests across page navigations, zero external requests, zero uncaught exceptions.
- Packaging: two runs of main.ts with separate MAKEFUN_OUTPUT_DIR destinations produce identical bytes. Copied game files match the source; each dossier equals a fresh buildDossier invocation byte-for-byte.

Packaging was checked in an isolated temporary copy with three existing kit fixture images. These are only test data, not screenshots of this entry, and are not included in the repository. `screenshots/` contains only .gitkeep, as requested. Running the production entrypoint now copies the folders and then receives the vendor's expected “holds no image” error; adding the final 3–4 genuine browser images enables production dossier generation. The vendor has not been weakened to bypass that requirement.

These are local checks, not a sealed scorer or transcript-gate result. No submission, remote repository, or push was made.
