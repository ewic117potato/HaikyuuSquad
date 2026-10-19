# HAIKYUU LEGENDS V7 — Anime Portrait Coverage

# V7 — Anime portrait coverage upgrade

This is the complete Haikyuu Legends game (all V6 features included), plus improved portrait sourcing.

## What's changed

- All **210 player roster entries**, including High School/Nationals/Timeskip/Pro/Elite/Apex variants, request an online portrait using their character name (183 distinct player names).
- All **30 coaches and managers** also request named online portraits. **211 unique names** appear across the roster and staff (two staff names duplicate and some are also athletes).
- Sources: **Haikyuu anime cast listings from AniList** and **MyAnimeList via Jikan**; strict name matching prevents displaying a random anime character. Haikyuu Wiki thumbnails are used only when no profile image is found.
- Each player has an individual SVG illustration fallback, and each coach/manager now has a dedicated named fallback image. **No card should display as a blank missing-image icon**.
- Failed online images try another verified profile source when available, then fall back gracefully. Repeated card instances share the same request, reducing unnecessary API calls.
- New **Portrait checker** at `/portrait-check.html` lets you inspect the actual online availability for individual characters, coaches and managers after deployment.
- V6 quests, rare packs, ratings, chemistry, six-position court, saved squads, Supabase support and friend duels are unchanged.

## Important limitations

**I cannot guarantee that all 211 names resolve to an actual anime image.** Some bench members, professional/timeskip designs and manga-only characters have no anime portrait, and image providers can block external loading. Some fallback Wiki thumbnails may contain manga art. Variants generally share a character's image; distinct Timeskip and Pro anime images have not been bundled. This update provides an accurate lookup and a way to measure actual coverage, not a claim of 100% online portrait coverage.

These are third-party copyrighted profile images, not bundled assets. For a public release, confirm you have the rights/permission to display them and follow provider terms.

## Deploy via GitHub Desktop (no local Node.js needed)

1. Extract the ZIP, open the folder containing `package.json`, `server.js`, and `public/`.
2. GitHub Desktop → open the **repository connected to Render** → Repository → Show in Explorer.
3. Copy the **contents**, not the containing folder, to the repository root, replacing same-named files. Leave `.git` alone.
4. GitHub Desktop → Commit to main → Push origin.
5. Render should redeploy. Keep Root Directory blank if `package.json` is at repository root. Build: `npm install`; Start: `npm start`.
6. Open your public Render site and add `/portrait-check.html` to the address, then click **Check next 12 portraits** to see the portraits actually available. A slow or blocked external service may result in backup images.

You don't need to recreate Supabase or delete your browser save. Keep using your current deployed site and project.

## Verification

`npm run test:v7` runs the V7 portrait tests and all the V6/V5/V4 gameplay tests. Tests check strict name matching, safe HTTPS image domains, Anime vs. fallback handling and 210 player/30 staff backup assets. They use simulated API responses; external API uptime and image licensing cannot be validated offline.

---

# HAIKYUU LEGENDS — V6 PRO PACK ASCENSION

Full replacement for V5. Includes original school drafts, four-card picks, saved squads, coaches/managers, six-position court, school chemistry, friend duels, quests, and updated PREMIUM PACK + CHARACTER QUEST systems.

## V6: Pro / Timeskip packs, genuinely rare pulls

Players earn **coins** by completing six-player drafts, winning school battles, playing bot matches, and claiming daily/weekly/Legend Road quests. The shop offers:

| Pack | Cost in earned coins | Reward |
| --- | ---: | --- |
| Nationals | 2,400 | One permanent Nationals card |
| Timeskip | 7,500 | One permanent Timeskip card |
| Professional | 18,000 | One permanent Professional card |

Each purchased pack contains **one** card (not four) with these exact **per-pack odds**:
- **98.9% Standard** — ordinary version for that pack's stage. Stronger OVR players have less weight than weaker ones even within Standard.
- **1% Elite** — bonus stats, awakened chemistry boost and unique visual rarity.
- **0.1% Apex** — the rarest form, extra boosted stats and awakening. Apex forms are limited to notable characters.

**The main free school draft is intentionally unchanged:** normal school cards 95%, Nationals 3%, Timeskip 1%, Pro 1% **per option**; it still shows four choices and guarantees an open position. The 1% Elite / 0.1% Apex figures are **for shop packs only**, not for the four-card school draft.

## More quests and character rewards

- **Daily and weekly objectives** now reward significantly more coins and additional rolls or gems; milestones can award exact named characters instead of only random tickets.
- Guaranteed milestone paths include **Nationals Hinata**, **Nationals Kageyama**, **Timeskip Kenma**, **Pro Hinata**, and lengthy quests for **Elite Atsumu** and **Apex Ushijima**.
- Elite/Apex quest rewards are *deterministic achievements*, not an alteration of the store's displayed pack odds.
- Claiming rewards more than once is prevented by the existing claimed-quest save markers.

### Persistent progress

The game continues to use its existing `spike-legends-save-v1` browser save key. V6 adds pack stats and persists an **unclaimed paid pack** so closing the tab during an opening doesn't lose the card. Supabase cloud saving is optional and remains compatible with the earlier table setup. Anonymous Supabase users cannot reliably restore the same account on another device without implementing recoverable authentication.

### How to update GitHub Desktop / Render

1. **Back up your current browser save if it contains rare cards.** Do not clear browser data.
2. Extract the V6 ZIP. Open the cloned GitHub repository folder from **GitHub Desktop → Repository → Show in Explorer**.
3. Copy **the contents of the extracted folder** to the repository **root**, merging or replacing existing files. `public/`, `server/`, `supabase/`, `package.json`, `server.js` and `render.yaml` should be visible directly at the root. Do not put the new files inside an extra parent folder. **Do not remove the hidden `.git` folder.**
4. GitHub Desktop: `Commit to main` → `Push origin`. If Render is connected to a *different repository*, pushing here will not update the hosted website; confirm the connected repository first.
5. Render: ensure the Root Directory is blank **if package.json is at root**, Build Command `npm install`, Start Command `npm start`. Redeploy latest commit or wait for auto-deploy. The health endpoint `/health` should return version `pro-pack-ascension-v6`.
6. Open the game on its Render URL and reload. Go to **Pro Shop** to check odds and **Quests** to view new coin/character tasks. Continue using your existing Supabase project and its `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` environment variables.

### Development / tests

Requires Node >=20 on Render; users do **not** need to install Node locally. `npm install && npm run test:v6 && npm start` runs full automated suite and dev server for developers. Existing test suites and V6 tests passed in this workspace. A deployed two-user live match has **not** yet been end-to-end tested for V6. Browser render preview was unavailable in this environment; check UI after deployment.

### Prototype limitations

This is a free fan-game prototype, **not a production-grade anti-cheat economy**. Coins, quest claims and inventories are currently still mostly client-side; for a competitive public game, a server-verified authenticated economy is required to prevent fraud. Anime portraits depend on publicly available online APIs and may fail or use older artwork; redistributing copyrighted anime art requires permission.
