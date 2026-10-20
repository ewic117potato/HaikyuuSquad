# HAIKYUU LEGENDS V23 — INSTANT DRAFT + FINAL REVEAL

**This is a complete replacement of V22.** No local Node.js installation is needed: copy the extracted contents of this ZIP directly into your existing GitHub Desktop repository, commit and push. Render should redeploy automatically if enabled.

## Exactly what changed

### Friend duels — Fast independent drafting

- Each player can make all six picks **at their own pace**, without waiting for their opponent between picks.
- Your first offer and **every new school offer following a pick are free**. The host's extra-school-roll and reroll counts are spent only when voluntarily changing schools or rerolling four cards.
- Both players get their own 4-card offers. The multiplayer server checks that you actually received and can use a card before accepting a pick.
- The other player sees **0/6 to 6/6 draft progress**, but not the chosen characters or final ratings until both squads are finished.
- After your sixth pick, you wait only for the other player to finish their complete squad. They can take their time and use their own remaining rolls.

### Final 1v1 card reveal

- **Only once both squads are complete**, a showdown plays six position face-offs.
- Each position shows the first team's card, then reveals the opponent's card: **12 separate reveal beats**, one player card at a time.
- Includes face-off effects, OVR readouts, coloured borders, position names, a progress meter and a **Skip to Ready** button.
- Once revealed, each player presses **Ready**; the 3D match starts without replaying the same intro. Saved-squad matches still use the 1v1 intro before first serve.
- If motion reduction is enabled on the device, the card transitions are shortened and effects reduced.

### Previous systems retained

57 School Battles, Full Control / Auto Play, 3D volleyball court and aiming, setter dumps, chemistry/rivalries, quest rolls and rerolls, collection, Timeskip and Pro packs, Supabase-compatible progress format, and coach/manager system.

## Test the animation without a second person

After deployment, visit:

`https://YOUR-RENDER-URL/duel-reveal-preview.html`

The demo uses Karasuno versus Nekoma examples and **does not affect your saved progress or online rooms**.

## How to update with GitHub Desktop

1. Download and extract the V23 ZIP.
2. Open GitHub Desktop → the repository used by Render → **Repository → Show in Explorer**.
3. Copy the **contents inside** the extracted V23 folder into the GitHub repository folder, replacing the old files.
4. Confirm that `package.json`, `server.js`, and `public/` are directly in the repository root, not nested within another folder.
5. Commit as `V23 instant drafts and sequential duel reveals`, then **Push origin**.
6. Wait for Render to say **Live**. Open your game with a hard refresh (`Ctrl + Shift + R`).

## Verification / limitations

- Node syntax checks and the full V22 offline test suite pass, plus dedicated V23 tests covering independent drafts and 12 sequential card reveals.
- Live deployment and a real two-device duel were **not** tested here; verify on Render.
- Existing premium artwork is retained; V23 does not generate new artwork for missing characters.
- V23 does not change stored player progression; still back up saved progress before major changes.
