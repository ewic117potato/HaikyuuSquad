# HAIKYUU LEGENDS V26 — ULTIMATE OVERHAUL

**Full replacement project.** Contains all V25 assets, roster, server, quests, saves, online duels, and additions for V26.

## WHAT IS NEW

- **Articulated WebGL volleyball court:** replaces earlier block-and-sphere athletes with procedural humanoid limbs, jerseys, hair/face distinctions, jumps, attacks, passes, settings, crouches, digs, blocks and continuously moving cinematic cameras. Players and volleyball animate according to server/offline rally event logs. Cinematic / broadcast / sideline / overhead options.
- **Interactive timing during local/bot/career/Nationals Road matches:** Choose tactics and then hit SPACE or HIT in the green zone. The window scales with the character's actual skill. A perfect, good or poor result changes rally outcomes. Auto Play remains, with pause and playback speeds.
- **Individual-card chemistry and same-squad rivalry:** Named partnerships and rivalries boost each athlete, not just a hidden team average. Hinata 92 and Kageyama 96 activate +10 each for Freak Quick, and the two-card Karasuno school connection adds +2 each (104 and 108). Oikawa and Ushijima each gain +9 for their same-squad rivalry. All eligible school players can receive school bond boosts. Stacking caps at +20 per character. Bonuses affect attack, defence and setting stats used by the simulator. Named setter-to-hitter special connections trigger enhanced plays.
- **Visual previews during school drafts** and the standard friendly 1v1 school draft: effective OVR and the changes to currently picked allies appear on the choice itself. Friend drafts proceed independently; squads reveal once at the end, one character at a time. Friend duels keep the server-owned match result.
- **Timeskip / Pro packs:** Elite 10% and Apex 1% base probabilities per purchased/opened pack. Guaranteed Elite-or-higher within 20 packs without it and Apex within 100 without it. Separate counters per Timeskip and Pro pack, visible on the shop cards; stored across sessions.
- **National Road story expansion:** Existing 57-stage School Gauntlet and 6-match Spring High mode remain. New 100-stage, 20-chapter Nations Road with 5 ordered matches in each chapter. Chapter stories, boss intros, AI tactics that reflect stage challenge, visible stage and chapter progress, one-time rewards and character card milestones (stages 5/10/20/30/50/75/100). Optional stage objectives give five extra school rolls if fulfilled on first win.
- **Quests:** Progress bars for daily, weekly and milestone quests. Extra National Road and cooperative raid quests with tiered rewards. Existing character-earning Legend Road quests kept.
- **Multiplayer cooperative raid lobby:** 2–4 friends contribute selected athletes to one six-player squad, NOT 2v2 teams. Friends enter a room code, Ready up and combine tactical actions against the server-controlled Date Tech, Inarizaki, Shiratorizawa or All-Star boss. Shared 3D rallies, progression and victory prizes; leaving cancels an active cooperative raid.
- **3D preview:** Open `/v26-showcase.html` after deployment for the standalone, interactive serve and cinematic rally showcase without creating a full squad first.

## INSTALL / UPDATE WITH GITHUB DESKTOP & RENDER

1. **Back up V25 progress** first. Open the game's Save Backup area and export your JSON save. Keep the file somewhere safe.
2. Extract this entire V26 ZIP; it is a complete replacement, not an incremental patch. Copy the **contents** of the extracted folder into your `HaikyuuSquad` repository directory so `package.json`, `server.js`, `public/` and `server/` are at its root, replacing existing files.
3. In GitHub Desktop, commit the changes and **Push origin**. With auto-deploy configured, Render builds the new Node.js project. Keep `npm install` as build and `npm start` as start, with Node.js >= 20.
4. Once deployed open your game URL and `/v26-showcase.html` to preview the new character movement. Your existing browser local save remains in place when the site origin is unchanged. If anything is missing, use Save Backup to import your JSON file.
5. For cooperative multiplayer, all friends must open the deployed URL, and all browsers must connect to the same Render server. Create a raid code under **Co-op Raids**, then have friends **Join** using the code. Each member needs a complete valid saved starting six for their contribution.

For local development: `npm install` then `npm start`; open `http://localhost:3000`. Automated regression checks: `npm run test:v26`.

## IMPORTANT LIMITATIONS & TEST STATUS

- The new models are **procedural WebGL humanoids** with animated limbs and stylised hair/faces/uniforms. They are **not professional external rigged/texture-mapped GLB character assets**, and they do not yet individually reproduce every Haikyuu character's anime likeness. This is a major renderer upgrade, but still a stylised prototype. To reach AAA/anime quality, dedicated rigged models and authored animation clips are required.
- Manual timing is implemented for **local AI/school/Nationals Road matches and online 1v1 duels**. In 1v1, timing input is evaluated on each player’s device and the quality score is validated and used by the authoritative server for the rally result; device and network latency may affect perceived timing. Co-op raids currently support tactical decisions and Auto Play but not individual quick-time timing input for every participating friend. Online friends still share one server-calculated rally result.
- Raid server has tested **simulated** multiple WebSocket connections; actual live two-device Render deployment and reconnect behaviour need testing. Active raid cancels on disconnect, and cancelled games grant no rewards. Browser save/packs are local save-based and not cheat-resistant.
- Story includes chapter-specific narrative intros and tactical encounters, not voiced or full 3D story cutscenes. Arena replays remain simulations, not a motion-captured volleyball engine.
- All current JavaScript regression tests, including dedicated V26 tests, passed in the test harness. Automated real-browser graphical rendering could not be verified in this environment; visual performance may differ across devices.

## CONTENT NOTES

This is a fan-game roster with references to Haikyuu!! characters and is not an official game. Existing illustration fallbacks and portrait hosting rules are retained; some player portraits may be unavailable from external hosts.
