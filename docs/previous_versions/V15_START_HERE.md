# HAIKYUU LEGENDS V15 — NEON ARENA

A full, working-project UI redesign based on the supplied stadium/menu reference. This ZIP contains the website, multiplayer server, quests, packs, Spring Nationals, roster, staff, tests and Supabase setup. The root of the ZIP contains `package.json` and `server.js` **directly**, with no wrapper folder.

## What's changed

- Entire main menu rebuilt to resemble the reference: glowing left navigation, compact counters, playable six-slot court presentation, chemistry dashboard, featured Pro/Quest/Nationals panels, school directory, card previews and rarity reels.
- Global theme improvements across Draft, Shop, Collection, Teams, Duels, Quests, Staff and Nationals, without removing the existing game logic.
- Improved presentation for **223 existing player-card images** using recognisable anime-style portraits cropped from the user-provided generated reference image. Remaining card images retain stylised existing art. **The images are not 223 newly hand-painted illustrations**; some stages use the same underlying player art.
- Updated Aone Takanobu's **base school OVR to 93** both in playable balance and the image catalog. Hinata stays at 92.
- Responsive desktop/mobile stadium layout. Preview-only starter team is explicitly labelled **EXAMPLE SQUAD** until a user equips real characters; it is not added to the user's inventory.
- Existing saved inventory IDs, chemistry, rivalries, school drafting, friend duels, quest rewards and optional cloud saves retained.

## Update using GitHub Desktop

1. Extract this ZIP somewhere outside your GitHub repository.
2. In GitHub Desktop select the repository **actually connected to Render** → **Repository → Show in Explorer**.
3. Copy the **contents** of this ZIP's extracted folder into the repository folder. Overwrite matching files. **Do not** delete `.git`.
4. `public/`, `server/`, `supabase/`, `test/`, `package.json`, `server.js` and `render.yaml` must be at the repository root.
5. GitHub Desktop → **Commit to main** → **Push origin**.
6. Render → check deployments. With the files at the GitHub repository root, use **Root Directory: blank**, **Build Command: `npm install`**, **Start Command: `npm start`**.
7. Open the Render website. Check the home page, school draft, quests, collection, and a friend duel from **two separate browsers**.

## Saving progress

Browser storage uses the original `spike-legends-save-v1` key and has not been reset. Supabase cloud saving still requires the same project keys and database setup; it is not automatically activated by a GitHub update. Back up valuable existing saves before deploying.

## Production & imagery notes

This is an unofficial fan game. The image references are sourced from a user-provided AI concept poster; copyrights and recognisability of specific characters must be checked before public redistribution. Other entries use stylised fallback art. The actual live two-user WebSocket / Render and Supabase deployment must still be tested after publishing.

## Developer checks (optional; Node not required on your personal computer)

`npm run test:v15` exercises the complete offline game-logic regression suite and checks UI assets. Render installs Node dependencies remotely. No local Node installation is necessary for GitHub Desktop upload.
