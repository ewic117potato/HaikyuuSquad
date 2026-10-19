# HAIKYUU LEGENDS V16 — DUEL SHOWDOWN

Full replacement for V15; no local Node.js needed if deployed via GitHub Desktop and Render.

## New battle sequence
- Saved Squad and Fresh Draft friend matches now start with six position-by-position reveals: Outside 1, Middle 1, Opposite, Middle/Libero, Outside 2 and Setter.
- Both clients receive the same two rosters from the server; 7.5 seconds of intro before server-generated points begin. Skip Intro skips the local animation but does **not** start the server clock sooner.
- Bot matches have the same reveal and a revamped local serve/receive/set/spike/block rally model using each athlete's attack, defence, setting and team chemistry.
- Match arena adds a chronological rally phase feed, and the server includes those phases with its authoritative rally events.
- Existing quests, chemistry, Pro packs, saved squads, school drafts and Nationals preserved.

## Updating
1. Extract ZIP. Copy the **contents** (package.json, server.js, public, server, test) into your existing GitHub Desktop repository root.
2. Commit and Push origin. Render build: `npm install`, start: `npm start`, Root Directory blank **only if package.json is in root**.
3. Test with two browsers in different sessions using Saved Squad or Fresh Draft. The initial face-off should show matching athlete pairs and the score should remain synced.

## Validation
Ran `npm run test:v16` successfully, covering existing offline tests and new duel logic checks. Two live deployed browsers have NOT yet been tested, and artwork remains partly simplified.
