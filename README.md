# HAIKYUU LEGENDS V24 — CINEMATIC SCOUT & 3D RALLY

See [START_V24.md](START_V24.md) for full update instructions and known limitations.

# V23 — INSTANT FRIEND DRAFTS & END-OF-DRAFT CARD REVEAL

**Start with [`START_V23.md`](START_V23.md)** for all changes and update steps. In friend duels, school rolls are instant and both players draft independently. When both squads are done, each card is revealed one by one before Ready.

# HAIKYUU LEGENDS — V20 REFINED ARENA

A browser-based, unofficial Haikyuu-inspired squad-building volleyball game. This ZIP is the **complete replacement project** for GitHub + Render, with optional Supabase cloud saves. It does not require local Node.js to deploy through GitHub Desktop.

## V20 changes

- **Tactical quality of life:** Full Control now presents more descriptive serve/receive/set/attack/defence options, suggests a tactic based on the current squads and provides 1–4 number-key shortcuts. Suggestions are strategic hints, not guaranteed wins.
- **Auto Play:** 1×, 2× or 4× speed and pause/resume for local bot or school battles. Manual and Auto Play can still be switched mid-match. Friend duels keep their synchronized server-paced turn timers (you cannot speed those up individually).
- **Match clarity:** First-to-15/win-by-two rules, serving indicator, and live counts for aces, blocks and setter dumps.
- **Quest improvements:** One-button claim-all for complete Daily, Weekly or Legend Road milestones, with a visible claimable count. The V18 20–50-roll quest rewards and seven campaign chapters / 57 stages remain.
- **Draft options:** Toggle instant reveals vs cinematic card reveals. School scouting still uses four distinct characters and one free new-school roll after every pick.
- **Recovery & safety:** Export a JSON backup, import it with confirmation, and see clearer local-save warnings. Unclaimed coach/manager scouting choices can now be reopened instead of forcing another purchase.
- **Rating bug fix:** 100–105+ OVR cards no longer lose stats when sent from the browser to the online-duel server.
- **Menus:** Progress summary on the homepage, How to Play guidance, a National-card collection filter, touch/keyboard focus improvements and mobile layout adjustments.

## Core features retained

- Main-school drafting, four-card picks, rarities, school roles and saved teams
- School, duo and rivalry chemistry; one coach and one manager
- 57 School Gauntlet stages, 20-roll chapter boss rewards, large Daily/Weekly quests
- Spring High Nationals simulation and prizes
- Timeskip/Professional card packs, Quest Legends and permanent collection
- Position-by-position face-offs; Full Control / Auto Play; setter dumps
- Saved-squad and from-scratch multiplayer room codes via Render WebSockets
- Optional Supabase browser progress backup

## IMPORTANT: portraits

V20 preserves the existing V17 portrait system (12 character-focused generated images from a remote image host) and hundreds of local artwork fallbacks. **The full roster has NOT received a unique high-detail AI portrait.** The external images may not always load. This update concentrates on gameplay, responsiveness and saves, not new character art.

## Update via GitHub Desktop

1. **Back up your progress** in the currently deployed game: sidebar > **SAVE BACKUP** > **EXPORT SAVE (.JSON)**. Save the file securely.
2. Download this V20 ZIP, right-click it and choose **Extract All**.
3. In GitHub Desktop, select the repository connected to your Render service, then **Repository > Show in Explorer**.
4. Copy **the files and folders inside the extracted folder** into the main repository folder; replace older versions. Do not copy the surrounding folder as a single nested directory. Do not delete the hidden `.git` folder.
5. At the repository root you should see `package.json`, `server.js`, `public/`, `server/`, `supabase/` and `render.yaml`.
6. Back in GitHub Desktop, **Commit to main** and **Push origin**. On Render, check the deploy status.

### Render configuration

- Branch: `main`
- Root Directory: **blank** if files are directly at the GitHub repository root
- Build Command: `npm install`
- Start Command: `npm start`
- Node 20+ (`package.json` specifies `>=20`)

Deploy log errors about `ENOENT package.json` mean the root directory is wrong. Render runs Node.js for you, so you do not need to install it locally.

### Supabase

Existing optional Supabase saves continue using the earlier anonymous-account setup and schema. Without Supabase, data saves in local browser storage, **not** automatically across devices. Anonymous accounts are not a substitute for recoverable login. Exporting a JSON backup is strongly recommended.

## Tests

- `npm run test:v20` runs the new pure quality helpers, claim-all / card rating checks, V19 tactical tests and the full earlier regression chain.
- Browser tests covered desktop (1440 px) and mobile (390 px) layouts, card drafting, quest claim-all, match tactics/dumps, speed/pause, and JSON save export/import.
- These tests do **not** substitute for a live deployment check with two real devices or an authenticated Supabase save test on Render.

## Prototype limitations

Online saved-squad results are calculated server-side, but the client-side currency and browser progress are **not cheat-resistant**. Server-side authentication, entitlement checks and payment protections would be required for public competitive play. Character names and franchise associations belong to their respective owners; the project is unofficial fan work. Be mindful of licensing for online artwork.
