# HAIKYUU LEGENDS V13 — COMPLETE CARD COLLECTION

This is a complete replacement for V12, using the existing GitHub → Render → optional Supabase setup.

## What's inside

- **419 individual WebP card images** in `public/cards/`: 293 playable character-version cards (88 school, 78 Nationals, 55 Timeskip, 67 Pro, 5 Quest Legend) plus 126 coach/manager tier cards (21 staff members × 6 rarities).
- Each card has its own readable **OVR**, name, school, court role or staff category, ability, and stage/rarity frame.
- School cards use school colours; Nationals use violet; Timeskip uses mint; Pro uses gold; Quest Legends use magenta. Elite and Apex cards have distinct rare frames.
- School character ratings remain balanced (e.g. Kenma 89, Ushijima 99); **select Professional characters now reach 103–105 OVR**, Quest Legends range 101–105, and special Apex variants can exceed 105.
- Newly rendered art is integrated into the **Collection**, **staff recruiting / inventory**, and **school-draft card thumbnails**.
- A browsable gallery at `/cards-gallery.html` allows searching, filtering by type/school, inspecting and saving any card.
- Online portrait lookup remains available elsewhere in the game, while each exported card contains its own offline artwork and won't depend on a hotlinked website.

## IMPORTANT artwork limitation

This release uses the game's existing **individual, custom simplified vector character portraits** and renders them into substantially redesigned Roblox-style collectible frames. It does **not** include 419 freshly hand-painted anime action illustrations, copies of Roblox art, or bundled screenshots from the Haikyuu anime. Some Timeskip/Pro versions share a character's school portrait because the character is the same person. Pro counterparts now reuse the matching named school portrait where available, not a generic adult avatar. This is a consistent visual card set, **not** an exact match for the high-detail Hinata concept illustration previously shown.

## Update via GitHub Desktop

1. Back up your progress (optional: copy/export your browser game save before deploying).
2. Extract the **complete V13 ZIP**. Open GitHub Desktop → choose the **same repository connected to Render** → Repository → Show in Explorer.
3. Copy the **contents** of the extracted folder into the cloned repository's **root**. Replace existing files. Do not copy a nested V13 folder; never delete `.git`.
4. In GitHub Desktop: **Commit to main** → **Push origin**.
5. On Render, redeploy if Auto Deploy is not enabled. If `package.json` is at repository root, Root Directory is blank, Build Command is `npm install`, Start Command `npm start`.
6. Open your website and navigate to **Full Card Gallery** in the left navigation, or go directly to `https://YOUR-WEBSITE.onrender.com/cards-gallery.html`.

## Data saving

Browser save remains `spike-legends-save-v1`. No new Supabase schema or key is needed for the art changes. Existing saved card IDs have not changed. Their effective OVR may differ after balance adjustments. Game saves are currently browser-controlled and the economy is not fully anti-cheat hardened.

## Testing and limitations

`npm run test:v13` passes the complete card file audit and gameplay tests from V3 to V12, including drafting, currency, pack pulls, duels, quests, character rewards and Nationals simulation. Local browser GUI testing wasn't available in the build environment. After Render deploys, manually inspect the gallery at desktop/mobile sizes, test a 4-card school draft, test staff recruiting and confirm Pro/Quest OVR values. Live two-browser friend duels and Supabase cloud saving have not been retested in this release.

## Editing/expanding cards

The manifest of all card identities and paths is at `public/cards/catalog.json`. The image files are individually usable as assets in other tools. Pro and quest descriptions are fan-game fantasy values, not official Haikyuu ratings.
