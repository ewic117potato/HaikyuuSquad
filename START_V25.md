# HAIKYUU LEGENDS V25 — Cinematic Scouts & Animated Arena

This is a **complete replacement game project** with all files required for the existing GitHub → Render → Supabase deployment. No Node.js installation is required on your own computer if Render handles hosting.

## New in V25

1. **Rare-card confirmation:** Before spending a reroll, changing the school, or picking a weaker card that discards a high-OVR offered player, the game asks **ARE YOU SURE?**. Default cutoff: **91 OVR**. Eligible cards only; cards that cannot fit the squad are not treated as lost opportunities. Set cutoff to 0 to disable warnings.
2. **Adjustable special pull cinematic:** Default 95 OVR, adjustable 60–110 (0 to disable). Each four-card offer reveals sequentially first, then a cinematic displays its best qualifying card with animated lighting, artwork and rarity effects. Press **REVEAL ALL FOUR CARDS** to skip the animation. Respect reduced-motion settings and the instant reveal preference.
3. **Premium pack reveal polish:** 1% Elite and 0.1% Apex pack reveals have animated backdrops. Drop rates do **not** change.
4. **3D match replay quality:** Stadium UI now has a cinematic/fast replay toggle, clearer live HUD, longer ball-path animations when cinematic mode is on, and stronger jump poses during spikes. At 1x, the action gets more time to play; 2x and 4x remain available.
5. **Previous V23 systems retained:** Independent friend drafting without waiting between picks, 12-card position-vs-position duel reveal, skill-based tactical decisions and setter dumps, 3D match court, 57 career stages, quests, school chemistry and rivalries, Nationals, saved squads, staff, Timeskip and Pro packs, local saving and optional Supabase backup.

## What V25 is *not*

- This is a code-driven 3D replay of the simulated rally, not a physics-driven Roblox-quality volleyball game with motion-captured athlete models.
- The opponent chooses actions server-side in multiplayer. Actual two-device production verification on Render is still required.
- The full roster still does **not** have individually commissioned AI portraits for every character. Previous portrait fallbacks remain.
- The image/rally cinematics are different from the *pre-duel* one-by-one team reveal. The latter is preserved from V23.

## Deploy (GitHub Desktop)

1. Back up any important local progress first.
2. Extract the V25 ZIP.
3. GitHub Desktop → select your deployed game's repo → Repository → Show in Explorer.
4. Copy **the contents** of the extracted ZIP into the repo root, replacing files (do not move the ZIP folder inside the repo). `package.json`, `server.js`, and `public/` must be at the repo root.
5. GitHub Desktop → **Commit to main** → **Push origin**.
6. On Render, leave Root Directory blank if package.json is in repo root; Build command `npm install`, Start command `npm start`. Wait for successful deploy.
7. After deployment open Draft → **SCOUT CINEMATICS & SAFETY** to choose thresholds and start drafting. In matches use **CINEMATIC REPLAY ON/OFF** to choose pacing.

Supabase uses the existing schema and environment configuration; no schema changes are introduced by the new client-side cosmetic preferences.

## Tests

`npm run test:v25` (includes previous regression suites) passed in the preparation environment. The real deployed browser visuals, network image loading and two-device production multiplayer have not been verified here.

## For continuing work in a new ChatGPT conversation

Upload this ZIP and say: "Continue developing my Haikyuu Legends V25 game. Read START_V25.md and source files before changing anything. Keep GitHub → Render → Supabase deployment, school-only drafts, premium-only Timeskip/Pro, Quest Legends, chemistry, V23 independent friend drafts, 3D tactical matches and V25 threshold warnings. Build V26 on top of these files." 
