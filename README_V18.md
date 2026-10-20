# Haikyuu Legends — V18 School Gauntlet

A browser-based, unofficial fan-made Haikyuu squad-building game for GitHub + Render + optional Supabase cloud saves.

Start with [START_V18.md](START_V18.md). The complete front end is in `public/`; `server.js` handles multiplayer rooms via WebSocket. This version uses no local build step.

### Additions

- 57 school stages; 7 chapters; repeating recognizable school opponents at increasingly difficult OVR levels
- 20 free school rolls and 10 rerolls per chapter boss first-clear
- 10 new 20-roll daily quests, 12 weekly quests with 30–40 rolls, and 20 additional permanent milestones
- Replaying cleared stages gives regular coins and daily/weekly quest credit, never the first-clear card/boss bundle again
- First nine stage positions preserved for save migration
- Existing V17 character artwork, quests, squads, duels, chemistry, shop, Nationals and cloud-save code retained

Test: `npm run test:v18` (requires Node.js on a testing machine or GitHub Actions; Render itself handles Node.js when deployed).

Images of Haikyuu characters and their derivatives may require rightsholder permission for public distribution. Existing V17 artwork is only partial; the remaining roster still uses fallback illustrations.
