# Haikyuu Legends V12 — Stadium Draft / Legend Road

This is a full project, intended to replace the files in your existing GitHub repository while retaining Render + the optional Supabase cloud save.

## What changed

### Stadium draft layout
- Video-inspired purple-blue stadium backdrop, orange wooden six-player court and visible draft score.
- School controls on the left; four unique selectable athlete cards in a vertical stack beside the court.
- Four cards reveal sequentially with staggered animations on each new school roll or reroll.
- An offer with an athlete rated 95+ OVR triggers a short reveal overlay. A **Continue to Cards** button skips it; reduced-motion accessibility settings skip the animations.
- Every chosen athlete goes to the six-player draft board, and subsequent school rolls remain free.

### Separate recruit categories
- **School Scouts**: one High School card per athlete, from the randomly selected school. Four choices, no repeated athletes.
- **Quest Legends**: five specially named variants, available ONLY as one-time Legend Road quest rewards:
  * Bokuto — Thunder Ace: 35 wins and 12 completed squad runs
  * Hinata — Sky Breaker: Nationals semifinals and 10 squad runs
  * Kenma — Court Oracle: 18 squad runs
  * Kageyama — Court King: 60 wins and Nationals Top 8
  * Ushijima — Left Arm: Nationals champion and 100 wins
- **Timeskip / Pro**: remain exclusive to their existing packs and other eligible quests.
- The Collection screen now supports All / School / Timeskip-Pro / Quest Exclusive filters.
- Quest rewards cannot be added with the ordinary card-collection function, and quest-only stage-4 cards are excluded from premium pack pools.

### Unchanged
- Rivalry/duo chemistry, school chemistry, staff and rarity systems, six-player lineup, five saved squads, friendly draft duel settings, AI and bot matches, Spring High Nationals, coins/gems, quest economy and existing progress save keys.

## Update using GitHub Desktop
1. Back up any valuable game saves in your browser. The current game uses localStorage with optional Supabase syncing; browser profiles are not portable by default.
2. Download and extract the complete V12 ZIP.
3. Open GitHub Desktop, select the repository currently connected to Render and click **Repository → Show in Explorer**.
4. Copy the CONTENTS of the extracted V12 project into the cloned repository folder. Replace existing files, but **do not delete the hidden `.git` directory**.
5. Confirm that `server.js`, `package.json`, and the `public` folder are directly at the repository root.
6. In GitHub Desktop: **Commit to main → Push origin**.
7. Render should auto-deploy; otherwise use **Manual Deploy → Deploy latest commit**.
8. Render build command: `npm install`; start command: `npm start`; Root Directory: blank if project files are at repo root.

No Node.js installation is required on your own computer when Render builds and runs the server.

## Testing
- `npm run test:v12` passes. This includes the existing V11 through V3/V4 unit tests and the additional quest-exclusivity, pack-exclusivity, draft and UI-string checks.
- A complete online two-browser match and full visual layout QA in an actual deployed browser have **not** been verified here.
- The game attempts to load anime character portraits online through its existing `/api/portrait` endpoint, falling back to local art if the sources are unavailable. The game does **not** include licensed official Haikyuu images; not every anime/manga portrait is guaranteed to load.
- This is an unofficial fan project. Online art may have copyright and hotlinking restrictions.
