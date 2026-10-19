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
