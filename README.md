# SPIKE LEGENDS V4 — Anime Volleyball Squad Draft

**Complete replacement project** for GitHub + Render + optional Supabase. No Node.js installation is required on your own PC. This is a browser-based unofficial Haikyuu!! fan game.

## What is new in V4

- **FREE initial school roll**, showing 4 cards from the same random school.
- **FREE next school roll** immediately after picking a character.
- **Earned school-roll tickets** change your current school without choosing a character. When possible, a different school is guaranteed.
- **Earned card rerolls** refresh the four offers from the SAME school.
- **Guaranteed usable position:** every offer includes a player who can legally fill a remaining slot. Once a position is full its offers become unselectable.
- **Six-player roster:** 2 Outside Hitters, 1 Opposite, 1 Setter, and 2 Middle/defensive positions (at least 1 Middle Blocker; the other may be a Middle or Libero).
- **Friend-draft custom settings:** host chooses 0–30 EXTRA school rolls and 0–30 four-card rerolls per player, plus whether coach buffs count. These counters are validated on the multiplayer server. Free school rolls between picks DO NOT use the allowance.
- **Rarity-tiered staff:** every coach/manager has Common, Rare, Epic, Legendary, Mythic or Secret versions with stronger buffs at higher rarity. Spend **40 gems** on a separate 3-option coach recruitment.
- **Gems and cosmetics:** earn gems from quests and one-time high squad-OVR milestones. Spend gems on staff recruiting and cosmetic court themes.
- **Quests:** daily/weekly rewards now also give rolls, rerolls and gems. Existing National/Professional rewards remain.
- **Persistent collection:** school drafts retain all selected cards, award coins on completed squads, and can be saved to one of 5 preset teams.
- **Duels:** Saved Squad mode; Fresh Draft mode, private room codes, AI career, quests, economy and cross-team rival/friend chemistry.
- **Character images:** the server tries online anime profile illustrations via AniList with Fandom fallback; bundled local portraits appear whenever online images are unavailable. The game does not bundle licensed anime screenshots.

## Upload to GitHub — important for your previous Render ENOENT error

1. Download and extract this ZIP.
2. Open your GitHub repository (`Spike-Legends`).
3. Upload the **CONTENTS inside the ZIP**, not the ZIP and not an outer folder.
4. Make sure `server.js`, `package.json`, `public/`, and `server/` are **directly at the repository root**.
5. Commit all changes to `main`. Remove outdated duplicates if your old files were inside a different parent folder.

## Render settings

- Service: **Web Service** connected to your GitHub repository
- Root Directory: **blank when package.json is at the repository root**
- Build Command: `npm install`
- Start Command: `npm start`
- Node.js: platform installs automatically
- Health-check endpoint: `/health`
- Deploy the latest commit after uploading; use your Render service URL to play.

**If you keep the game in an extra top-level folder**, set Root Directory to that folder's exact name, with Build Command `npm install` and Start Command `npm start`. Do not combine Root Directory with `cd` commands.

## Optional Supabase online saves

1. Supabase dashboard → create project → SQL Editor, paste/run `supabase/OPTIONAL_CLOUD_SAVE.sql`.
2. Enable anonymous sign-ins under Authentication.
3. Render → Environment → add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from your Supabase project.
4. Save/deploy and check the in-game cloud save status.

Never put service-role or secret keys in public/browser files. **Supabase is optional for friend duels**, because WebSocket gameplay runs on Render; without Supabase, inventory and coins remain local to each browser.

## Friend duels

- **Saved Squad:** equip six players and an optional coach, then create a room and share its six-character code.
- **Fresh Draft:** select this mode, choose EXTRA school rolls (default 8), FOUR-CARD rerolls (default 5), and coach buffs on/off. Create room. Each player gets an automatic initial free offer and a free offer after every successful pick; extra school changes cost one of the configurable rolls. Four-card rerolls keep the same school.
- Both players build a complete six, press Ready, then watch server-synchronized rallies. Fresh draft rematches start new drafts.

## Test status

Tests that passed locally (no install needed):

```text
node test/v4-rules.test.js       # 600 legal 6-pick drafts + config bounds
node test/v3-logic.test.js       # client state, economy, rarity, squad/quest views
node test/v3-server-draft.test.js # offline simulated 2-player socket draft and rallies
node test/engine.test.js         # server match simulation
node test/roster.test.js         # character catalog
```

`npm run test:v4` runs all five. `npm test` is the live local WebSocket/HTTP smoke test after `npm install`. The dependency installation couldn't complete in this environment, so a real Render deployment and two separate browsers **have not been tested yet**.

## Current limits

This is a 2D prototype, not an official Roblox or Haikyuu product. Progress and game rewards still rely partly on browser state, so the economy isn't sufficiently cheat-resistant for serious public rankings or paid competitions. Anonymous Supabase accounts are tied to their browsers unless linked to permanent login. External anime art may be copyrighted; online availability doesn't give permission to redistribute it.
