# HAIKYUU LEGENDS V22 — 3D TACTICAL ARENA

## What changed

- Playable **procedural 3D volleyball arena** in School Battles and friend-duel match displays. The renderer is bundled as `public/v22-arena3d.js` and does **not** need an external 3D CDN, a graphics plugin, or locally installed Node.js.
- A perspective court, net, stadium, two six-athlete teams, WebGL-rendered character models, moving volleyball, and event-driven serve/receive/set/attack/block animations.
- **Full Control**: pick your serving style, receiving tactic, set type, optional hitter, six-zone serve placement, six-zone spike placement, and defensive scheme. Click court zones where supported.
- **Auto Play** remains selectable, with 1×/2×/4× and pause/resume from V20.
- Three camera angles: Broadcast, Side and Top.
- A separate `arena-preview.html` lets you experiment with serve/sets/aim/auto play without changing your save.
- Preserves existing 57 school stages, squad progression, draws, OVR, chemistry, rivalries, quest rewards, shop, and server-operated friend duels.

## What this is (and is not)

This is **actual in-browser 3D rendering using WebGL**, but the player models are simplified stylized 3D figures, not Roblox-quality rigged character models. Players jump and the 3D ball traverses rally action trajectories. The existing tactical simulation decides who scores; the animation visualises those outcomes rather than introducing a new real-time physics game. In School Battles, targeted serve/spike zones and hitter choice affect the simulation. For online friend duels, the 3D replay shows server-decided rallies; both clients still use server-authoritative scoring, and synchronized manual aim selection in online duels is a future feature. On devices without WebGL, a simpler 2D fallback is shown.

## Publish with GitHub Desktop

1. Unzip this complete game project.
2. In GitHub Desktop select your connected `HaikyuuSquad` repository and click **Repository > Show in Explorer**.
3. Copy the **contents** of this V22 folder into the repository root (the folder with `package.json`, `server.js`, and `public`). Replace older versions.
4. Enter `V22 3D Tactical Arena`, click **Commit to main**, then **Push origin**.
5. Render normally auto-deploys. If needed, click **Manual Deploy > Deploy latest commit**. Keep Root Directory blank, Build Command `npm install`, Start Command `npm start`.
6. Visit `/arena-preview.html` to try the 3D gameplay without affecting saved progress.

## Testing

- `npm run test:v22` passes the new 3D coordinate, rally animation, tactical-aim, match server, and browser event-mock tests plus V21 regression tests.
- On-device WebGL visuals and Render live two-device matches still need testing. Tests do not prove high-end 3D visual fidelity or multiplayer network reliability.

**Save advice:** Make a backup of your current game progress before updating, especially when using browser-only saving.
