# HAIKYUU LEGENDS V10 — ONE CARD PER PLAYER + SCOUT QUESTS

**Complete GitHub / Render / optional Supabase replacement project.** No Node.js installation is required on your PC when deploying through GitHub Desktop and Render.

## V10 changes (October 2026)

- **One school card per named character.** School scouting is now **100% High School versions**. The school roll no longer mixes the same character's Nationals, Timeskip or Professional variants. Nationals cards remain available from earned Nationals Scout Passes and character quests; Timeskip and Professional cards remain exclusive to premium coin packs and quests.
- **No repeated athlete in an offer or during a six-player draft.** School scouting shows up to four distinct names from one real school. If a school contains fewer than four eligible known athletes (e.g. Itachiyama has three), it shows fewer options rather than duplicating a character. At least one offer is always usable for a missing role. This applies to online friend drafts, too.
- **Unique permanent collection.** Repeated copies of the same card version don't make extra inventory entries. Existing V9 browser saves are migrated: duplicate cards are merged, the **highest existing upgrade level** is kept, and active/saved lineup slots are repaired. Characters from other card versions still exist as separate collectible cards (e.g. school Hinata and a professional Hinata).
- **One athlete per team lineup.** A saved six-player squad cannot field the same named player twice, even using multiple stages. The multiplayer server validates this.
- **More rolls from quests:** Daily First Scouting Pick (+2 school rolls, +1 reroll), Daily Build Momentum (+2 rolls, +2 rerolls), Daily Practice (+2 rolls); Weekly School Recruiter (+6 rolls, +4 rerolls), Weekly Winning Scout (+4 rolls), and first-recruit Legend Road milestone (+3 rolls, +2 rerolls). Existing quests remain available.
- **School battle first-clear rewards:** a permanent school card, **2 rolls** and **1 reroll**. Every third match victory awards an extra school roll.
- **Duplicate pack compensation:** repeated exact Timeskip/Pro cards return coins instead of filling inventory with copies (1,600 for Timeskip, 5,000 for Pro).
- **Draft costs unchanged:** first roll free; a fresh free school roll after each pick; extra school change uses a School Roll; changing the four offered characters uses a Reroll.

### Upgrade with GitHub Desktop

1. **Keep your existing repository**, Render web service, and Supabase project; don't delete them.
2. Extract the complete V10 ZIP.
3. In GitHub Desktop, choose the repository Render is connected to and select **Repository → Show in Explorer**.
4. Copy the **contents** of the V10 folder (`public`, `server`, `test`, `package.json`, `server.js`, `.github`, etc.) directly to the repository root. Choose **Replace files**. Do not nest the game in another folder or delete the `.git` folder.
5. In GitHub Desktop click **Commit to main → Push origin**.
6. Render should redeploy automatically. For root-level files use: **Root Directory empty**, **Build `npm install`**, **Start `npm start`**.
7. Refresh your game. Verify the top-bar **Rolls** count and visit **Quests & Rewards** to collect the new rewards.

**Save compatibility:** Uses the existing `spike-legends-save-v1` browser key and existing Supabase save schema. V10 merges exact duplicate cards and may clear redundant positions in previously invalid lineups; it does not intentionally wipe your currency, first card, progress or saved team presets. As a precaution, back up your browser data before updating.

**Testing:** `npm run test:v10` runs 1,800 randomly generated legal six-player drafts, duplicate-migration and quest-claim tests, the simulated multiplayer server tests, and the older regression suites. Actual Render-to-Render client duels, cloud saves, and online anime artwork still require checking after deployment. The browser-local economy is not yet cheat-resistant.

---

# Previous V9 notes (historical)

A complete replacement project for the existing GitHub → Render → Supabase browser game. **No local Node.js installation is required for deployment.**

## V9 changes

### School scouting is now school-only

Normal four-card scouting is limited to ten prominent **boys' high-school** teams:

Karasuno, Nekoma, Aoba Johsai, Date Tech, Shiratorizawa, Fukurodani, Inarizaki, Kamomedai, Itachiyama and Mujinazaka.

- **Removed from selectable scouting:** Niyama Girls, junior-high schools, lesser-known filler schools, all professional teams and the national side.
- Each card in an offer must belong to the school shown. Four choices are offered. At least one has a position you still need.
- Normal school picks have a **97% school / 3% Nationals** version chance. Nationals variants appear only for the schools that actually went to Nationals. **Zero Timeskip / zero Professional cards** can appear in a school roll or its reroll.
- Ordinary school cards stay at believable character-specific ratings, from 60 to 100. Bench/reserve players no longer get their OVR artificially overwritten by the career difficulty. For example, Kenma = **89**, Kageyama = **96**, Ushijima = **99**. Ratings are fan-game balancing values, not canonical statistics.
- Corrected notable positions, including school Hinata as MB, Daichi as opposite and school Gao Hakuba as opposite.

### Timeskip and Professional exclusive packs

The *only* coin-bought packs are:

- **Timeskip Chronicles** — 7,500 coins, with a curated list of named characters who have adult storylines.
- **Pro League Contract** — 22,000 coins, only actual listed pro-team players.

Each pack has **98.9% Standard, 1% Elite, 0.1% Apex** chance. Card selection within a rarity is weighted, so the main aces are rarer than ordinary professional teammates. Quests may directly reward a named Timeskip or Professional card without opening a random school roll.

### Anime character pictures

Every playable card has an individual **offline SVG backup portrait** for its specific named character, and the server attempts to replace it with a matching **online Haikyuu anime character portrait** from the AniList and MyAnimeList/Jikan listings. A Haikyuu Wiki portrait is a further fallback when listings have no image. Coach/manager images have the same treatment.

- The lookup uses verified character-name matching against Haikyuu series listings, rather than showing pictures of unrelated characters with similar names.
- Real anime portraits are **not guaranteed for every character**. Some athletes appear only in manga, some sites prohibit external hotlinking, and professional/timeskip manga looks have not all been animated. Those cards keep their named backup illustration instead of a broken image.
- You can audit **every active character** at `https://YOUR-GAME-URL/portrait-check.html` to see which online pictures actually load.
- `portrait-overrides.json` at the project root is an optional map `{ "Shoyo Hinata": "https://..." }` for publisher-authorized, manually verified images. It allows the backend to override a bad automatic match with a known-good picture. Only approved image CDN hosts are accepted by the validation code.
- Images from other publishers are not included in this ZIP. Obtain appropriate permission/licensing before distributing anime screenshots as your own game's assets.

### Previous game systems retained

Friend duels (saved team and custom new drafts), configurable extra-school rolls and rerolls, free automatic school offer after each pick, one coach + one manager, school and rivalry chemistry, saved squad presets, coins, gems, quests, character packs, school battles, AI matches and optional Supabase cloud saves.

## Update from V8 using GitHub Desktop

1. Back up existing progress if you have valuable cards; avoid clearing browser data. Keep the original GitHub repository and Render service.
2. Download and extract the **V9 complete ZIP**.
3. GitHub Desktop → choose the repository *connected to Render* → **Repository → Show in Explorer**.
4. Copy **the contents** of this extracted folder (`public`, `server`, `test`, `package.json`, `server.js`, etc.) into the repository root. Replace old files. Do not copy an extra containing folder and do not touch `.git`.
5. In GitHub Desktop, choose **Commit to main** then **Push origin**.
6. Render usually deploys automatically; otherwise **Manual Deploy → Deploy latest commit**. Render Settings: Root Directory blank **if** `package.json` is at root; Build `npm install`; Start `npm start`.
7. Confirm `/health` shows `school-showdown-v9`, test a school draft and a Timeskip pack, then open `/portrait-check.html`.

**Saving:** V9 keeps the existing `spike-legends-save-v1` local save key. Original numeric character IDs are preserved for retained characters, even though the available-school list is smaller. Previously owned cards from retired teams remain in the saved JSON (not deleted), but retired teams and their cards no longer appear as selectable cards in V9. Existing Supabase settings remain unchanged.

## Tests and limitations

Run `npm run test:v9` with Node 20+ if you want to validate logic. Automated checks cover the fixed ratings, 500 completed school drafts, pack exclusivity, prior save IDs and portrait file fallback availability.

Full live multiplayer, actual third-party online anime-image availability and Supabase connectivity still need testing **after deployment**. Coins and cloud inventories are not yet fully server-authoritative; don't release it as a cheat-resistant competitive economy without further hardening.
