# HAIKYUU LEGENDS V24 — CINEMATIC PULLS & RALLY POLISH

This ZIP is a **full V23 replacement**: it retains independent friend drafts, final position-by-position duel reveals, school battles, Nationals, quests, 3D rallies and existing save keys.

## New changes

- In **Draft**, set **Warn Before Losing** to 91+ OVR (default), Off, or another threshold.
- If a 91+ eligible athlete is in the current four-card offer, **Reroll**, **Different School**, or selecting a *weaker* card first shows a confirmation dialog. Choosing the valuable card does not warn. Warning applies to **both solo and online friend drafts**, without charging any roll until confirmed.
- In **Draft**, set **Special Pull At** (default 95+ OVR). Four choices appear sequentially; after they appear, the highest matching player gets a gold/purple cinematic with the actual collectible card image. Skip button and reduced-motion support included.
- Cinematic Auto Play can be toggled on/off; when on, 1x playback now gives rallies time to animate before scoring the next point. Higher speeds are intentionally faster. Auto match pause still works.
- Added a **Dynamic** 3D camera following the ball. Larger jump animations for spikes, effect particles on strong attacks, and longer simulated serve/set/spike trajectories; the same server/game simulation remains responsible for match results.
- Added an updated arena and cinematic visual treatment, with responsive card and warning dialogs.

## Update from V23

1. Export a backup from the game if you value the current progress. The save uses the same localStorage key and preserves existing collection.
2. Extract this ZIP. Copy **the contents** (not an outer folder) into your GitHub Desktop repository.
3. `package.json`, `server.js`, and `public` must sit at the repository root.
4. Commit to main and Push origin; Render redeploys if connected.
5. In Draft, adjust thresholds on the left. Try pulling a 91+ player and clicking Reroll to check confirmation.
6. In School Battles, select Auto Play and toggle Cinematic On, Dynamic camera and 1x speed to watch longer rallies.

## Testing/limitations

`npm run test:v24` runs all previous V23 regression tests and V24 safeguard checks. The updated game JS passes `node --check`. A full live browser visual test was not possible in this environment (local navigation was blocked), and live two-device Render multiplayer remains unverified. The player models are still simplified 3D character models, not fully rigged realistic avatars. Art assets remain as in V23, not a completely finished AI portrait set.
