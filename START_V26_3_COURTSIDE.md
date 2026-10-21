# V26.3 — Courtside

Extract the entire ZIP. On Windows, run **START_LOCAL_DEV_WINDOWS.bat** (Node.js 20+). Or run `npm install` then `npm start` and open http://localhost:3000.

## What changed

- Court-first match layout, larger viewport, quieter broadcast graphics, clearer scoreboard and selected camera state.
- Corrected player facing direction and the net's lower edge. Brighter timber, less obstructive overhead structure, numbered jerseys and contrasting libero uniforms.
- Serve toss and a contact phase before each flight. Hands reach the ball at contact; connected pass, set and spike trajectories use the actual rally log.
- Smooth player recovery and approach movement. Grounded receiving stance and frame-rate-aware camera smoothing.
- Camera and tactic changes preserve replay progress. Auto Play pauses the animation as well as the simulation and waits for a replay to finish.
- Preview reset clears the old replay, rapid repeated clicks cannot skip rallies, and a finished preview cannot continue scoring.
- Cached static stadium geometry; reduced frame rate while idle or paused.
- Reused player-label elements instead of rebuilding all labels each frame. Cinematic view shows the active player's label to reduce clutter.
- Rendering an event no longer mutates its beats array.

## Existing game retained

Manual timing challenges and optional Auto Play; drafting, squad management, chemistry and rivalry boosts; school progression, Nationals, co-op raids, friend duels, collections, quests and save tools.

Progress still uses the existing save keys. Export your save before changing hosting address: browser saves belong to the address where you played.

## Scope

Players remain procedural stylized 3D athletes, not imported anime character models. Match animations visualize the simulation; this update does not turn the game into direct movement-controlled volleyball. Optional online portraits and cloud saves still need their existing services. Multiplayer needs the Node server.

## Validation

Full `npm run test:v26` regression suite; `npm test` server smoke; arena and hub checks; new `node test/v26-3-playback.test.js` checks for contact, continuity and event immutability. Browser checks are recorded in QA_V26_3.md.
