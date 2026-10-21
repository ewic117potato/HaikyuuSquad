# Haikyuu Legends V26.2 — Refined Hub

This package builds on V26.1 Courtside Director and keeps all game modes, saves, chemistry, raids, story, pack pity and 3D court updates.

## What's changed

- Replaced the very long V15 homepage (school tile rows, multiple card carousels, spotlight promotions and stacked banners) with a focused overview that fits more of the game in view.
- Two contextual primary buttons: Draft / Resume Draft; Continue Play / Finish Squad.
- One-tap shortcuts: School Battles, Nationals, 1v1, and Co-op Raids.
- Compact live six-player roster with effective individual character OVR, named active synergies, latest recruit and a manage-squad shortcut.
- School Gauntlet and Nationals Road completion meters, plus daily claimable quest notice.
- Simplified side navigation; secondary links (guides, save backup, staff, galleries, showcase) live in an expandable More & Settings group.
- Compact responsive layout for mobile and desktop, and keyboard-focus affordances.
- No permanent-save format changes. Replaced dashboard presentation, not game rules.

## How to test locally (Windows, Node.js 20+)

1. In GitHub Desktop open the repository, then Repository > Show in Explorer.
2. Open PowerShell inside the repository, then run `npm install` and `npm start`.
3. Browse to `http://localhost:3000` for the full game and `http://localhost:3000/v26-showcase.html` for the 3D scene.
4. Press Ctrl+C in PowerShell to stop.
5. Run `npm run test:v26` and `npm run test:arena` to verify the existing engines.
6. Changes will not deploy on Render until you commit and push them. Back up your browser save before updating the live version.

## Scope

V26.2 targets homepage/navigation clarity and progress visibility. It does not claim professional-grade replacement 3D assets or motion-captured animations. The existing V26.1 renderer remains intact.
