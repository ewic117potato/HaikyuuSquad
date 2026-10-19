# HAIKYUU LEGENDS V8 — Astral Court

A no-local-install Haikyuu-inspired multiplayer browser-game project for **GitHub + Render + Supabase**. It includes the existing court-based squad builder, four-card school rolls, cross-school friendship and rivalry chemistry, six-player positions, one coach + one manager, quests, school battles, AI matches, saved squads and friend duels. This V8 project replaces V7 and includes all files.

## V8 — Updated game design

**Normal school drafting** is where squads begin: one free school roll shows four cards, then pick one. Every new pick grants a free next school. Earned rerolls re-roll that school's four cards, and extra rolls switch schools. Each four-card draw guarantees at least one useful missing position. Schools dominate the pool: **97% High School / 3% Nationals / 0% Timeskip / 0% Professional**, per card. The shop—not the normal school draft—is the path to Timeskip and Pro characters.

**Pack shop (coins only):**

| Pack | Price | Contents |
| --- | ---: | --- |
| Timeskip Chronicles | 7,500 coins | One older-version school athlete |
| Pro League Contract | 22,000 coins | One verified pro-team player from the roster |

Only these **two packs** are sold. In each pack, **98.9% Standard / 1% Elite / 0.1% Apex**. The odds are per one-card pack, not multiplied by the number of cards in a normal school draft. Standard's selection is *also* weighted: top-performing pro stars are rarer than lesser-known pro teammates. Only selected notable characters can receive the rare Apex form.

**Earned Nationals Scout Passes** from quests directly recruit one random Nationals athlete without selling a third type of pack. Pro tokens open Pro packs without paying coins. Daily/weekly/long-term quests give coins, passes, coach currency, and specific character rewards. Legacy unclaimed V7 packs can still be claimed.

**Player ratings:** Between 60 and 100, with narrow ratings above 90: Ushijima **99**, Sakusa **97**, Kiryu **97**, Kageyama **96**, Bokuto **96**, Hoshiumi **96**, Atsumu **95**, Oikawa **94**, Kenma **89**, Hinata **88** (base school versions). A minor bench character now gets a plausible low-to-mid rating, not an arbitrary 98. Nationals/Timeskip/Pro stage changes remain carefully capped by each player's base ability. Rare Apex forms are special collectibles and can reach 100 only for eligible stars. **These are subjective game ratings, not official canon.**

**Interface overhaul:** Astral Court visual theme with luminous lilac/gold rarity cards, cinematic Timeskip/Pro covers, frosted panels, strengthened court layout, improved responsive grid, animated effects and accessible reduced-motion handling. The six-player court respects the requested formation: top **OH / M / OP**, bottom **M or L / OH / S**.

## Online portraits

All **210 roster entries** and **30 coach/manager cards** have local fallback SVG illustrations, so the game has an image for every card, even offline. While online, the server attempts to match *real Haikyuu character portraits* by name from AniList and MyAnimeList/Jikan, with a Haikyuu Wiki fallback. A given character's school, Nationals, Timeskip and Pro variants may reuse the same portrait. **100% real anime imagery is not guaranteed**: some obscure or manga-only characters don't have accessible anime photos, and third-party image hosts can refuse hotlinking. These online images are third-party copyrighted artworks and are **not bundled**. For public release, obtain appropriate permission or licensed artwork.

After deploying, visit `YOUR-SITE/portrait-check.html` to verify which online anime images are actually loading for your character roster and staff.

## Upgrade an existing GitHub/Render website

1. Back up any rare saved characters before changing things. **Do not clear browser data**. The persistent browser key is still `spike-legends-save-v1`.
2. Extract this ZIP. Open GitHub Desktop, select the repository actually connected to Render and click **Repository → Show in Explorer**.
3. Copy **the contents** (folders and files) of this directory into the cloned repository's **root**. Replace the existing files. Do not create an extra parent directory, do not delete the hidden `.git` folder.
4. In GitHub Desktop, **Commit to main → Push origin**. If the Render service points to a different GitHub repository, update the correct one.
5. In Render Settings use **Root Directory blank** (when `package.json` is at root), **Build Command `npm install`**, **Start Command `npm start`**. Redeploy the latest commit or rely on automatic deployment. The `/health` endpoint should report `astral-court-v8`.
6. Visit the live site and test school rolls, Timeskip and Pro shops, quest passes, staff and a two-device friend duel.

Supabase is optional for cloud saving and uses the same `supabase/OPTIONAL_CLOUD_SAVE.sql` configuration as V7. Anonymous accounts do not provide reliable recovery from another device, so a permanent sign-in method would be needed for a competitive public release.

## Technical notes

- Node 20+ on Render; **no Node.js installation on your computer required**.
- `npm install && npm run test:v8` runs V8 tests plus the V7/V6/V5/V4 suites.
- `npm start` launches the multiplayer HTTP + WebSocket service.
- Cloud currency, rewards and inventories are not fully verified server-side: **the online economy is still a prototype and is not cheat-resistant**.
- Offline logic tests include 200 brand-new six-character drafts on top of the 600 existing scenarios; live online multiplayer and actual online portrait availability still require post-deployment checks.
