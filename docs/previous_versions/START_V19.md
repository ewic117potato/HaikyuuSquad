# HAIKYUU LEGENDS V19 — TACTICAL COURT

This is a complete replacement of V18. It retains your character collection, school scouting, 57-stage School Gauntlet, quests, 20-roll milestone rewards, chemistry/rivalries, anime portrait fallback system, duels, spring Nationals, coach/manager slots, and existing local/Supabase-compatible save format.

## New: Full Control ↔ Auto Play

Open **Duels** or **School Battles**. Above the battle list, pick **FULL CONTROL** or **AUTO PLAY**. The game remembers your choice in your normal browser save. You can also toggle during a live match on the match scoreboard.

In Full Control, each AI/school rally pauses for strategic decisions:

1. **Serve** (when your team serves): Safe / Float / Jump / Targeted. Each has a different risk and ace profile. Targeted serves go after vulnerable receivers unless covered.
2. **Receive** (when the opponent serves): Balanced / Libero Focus / Aggressive Pass / Spread Formation.
3. **Set**: Quick / High / Back / **Setter Dump**.
4. **Attack**: Power / Cross Court / Line / Tip. A successful Setter Dump skips this attack selection since the setter attacks the ball on the second touch.
5. **Defence**: Read & React / Commit Block / Deep Dig / Cover Tips. Commit Block can punish hard spikes, but leaves openings for a setter dump; Cover Tips counters it.

The system uses individual player attack, defence, and setter skill, chemistry, active coaching effects (where applicable), fatigue, tactical counters, and limited random variation. The team that won the previous rally serves next.

In **Auto Play**, the computer makes those choices and moves through rallies automatically. Setter dumps still happen under Auto Play, particularly with high-setting-skill athletes. The same rally engine is used in both modes: Auto is not a separate unfair match formula.

## Online friends

Both players can independently use Full Control or Auto Play. The match server validates their decisions and broadcasts the same scores to both devices. A manual turn has a **12-second** timeout: an unattended player automatically gets a reasonable AI decision so a match cannot freeze. Rallies between two manual players wait for the required player inputs. Choose each option from the buttons presented; you can't send unlimited or impossible moves to the server.

## How to update GitHub Desktop

1. Extract this ZIP.
2. Open the repository connected to Render in GitHub Desktop and click **Repository → Show in Explorer**.
3. Copy the *contents* of the extracted V19 directory into your repository's root, replacing earlier versions. Keep the hidden `.git` folder. Do not add an extra wrapper folder.
4. Confirm that `package.json`, `server.js`, `public/` and `server/` are visible immediately inside the repository.
5. Click **Commit to main**, summary `Haikyuu Legends V19 Tactical Court`, then **Push origin**.
6. On Render, check the new deployment is Live. If automatic deployment is off, choose **Manual Deploy → Deploy latest commit**.

Build: `npm install`. Start: `npm start`. You do not need Node.js installed on your own computer. Use the same Supabase project if already configured. Browser saves retain their existing key; back up valuable progress before updating, and verify the deployed version before clearing any browser data.

## Testing and limitations

- Passed: new manual and automated rally logic; scripted decision flow in a headless browser; live-room server integration using simulated WebSocket clients; small-phone responsive decision screen; all V18 and earlier gameplay regression suites.
- Not completed: a real two-device live deployment on Render and live cloud-save testing. The 2D players and character portrait fallbacks from V18 are retained, not replaced by 3D volleyball animations.
- Match outcomes remain probabilistic. A 105 OVR attacker is not guaranteed to win every rally.

This is a fan project. Character artwork availability may depend on third-party hosting and licensing.
