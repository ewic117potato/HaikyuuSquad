# Haikyuu Legends V26.1 — Courtside Director

This is the **complete replacement project**, based directly on V26. Previous collections, school stages, quests, chemistry, rivalry, pack pity, raids and standard 1v1 drafting code are retained. Back up browser progress before replacing deployed code.

## Improvements in this release

- **A much larger playable 3D presentation**: wider match dialogs and a 360–625 px responsive court viewport on desktop, with responsive mobile sizing.
- **Full-size indoor volleyball environment**: recognisable 9×18 m court, safety space, boundary and attack lines, fine timber planks, proper net mesh, net posts and antennae, benches, audience seating, LED perimeter advertising, roof trusses, arena lighting and scoreboard geometry.
- **Coherent rally animation**: ball travels *from one actual player contact to the next* through serve, receive/dig, set, spike and block instead of unrelated teleporting positions. Off-ball players anticipate the next contact and move toward it.
- **Better player movement**: service from behind the baseline, spiking approach toward the net, receiving movement, athletic footwork, crouching and jumping.
- **Broadcast camera direction**: establishing wide shots, tighter player action, ball tracking and smooth transitions. Includes static Broadcast, Sideline and Overhead views.
- **In-render play calls**: labelled action, active athlete, live camera badges and a replay progress indicator.
- **Smoother cinematic Auto Play**: the next simulated point no longer replaces the currently displayed point early. Playback timing scales with the number of touches and the chosen auto speed. Fast replay remains optional.
- **Updated showcase**: longer varied example rallies, manual serve timing, pause/resume, 0.5×–2× slow-motion/speed, camera switch, and replay without adding a second score.
- **Accurate target raycasts** in the 3D view use the actual active camera, rather than an unrelated approximation.

## Run and deploy

1. Extract the ZIP. Copy the **contents** of HAIKYUU_LEGENDS_V26 into your existing HaikyuuSquad repository root (package.json and server.js should remain in the root).
2. Use GitHub Desktop > Commit to main > Push origin. Render can redeploy automatically if configured.
3. In the deployed game, visit `/v26-showcase.html`, or open the separately provided self-contained HTML showcase directly.
4. In terminal: `npm run test:v26 && npm run test:arena`.

## Visual scope and limitations

The environment and movement have been rebuilt in the existing **self-contained procedural WebGL renderer**, not replaced with imported commercial-grade 3D character models or mocap animations. Professional, anime-accurate rigged character assets are still a separate asset-production job.

Live multiplayer deployment and visual smoothness on different graphics hardware still require hands-on browser testing. Animated match results remain controlled by the original server or offline simulation engine.
