# HAIKYUU LEGENDS V21 — FAIR SCHOOL SCOUTING + PORTRAIT PASS

This is a full replacement for the V20 GitHub/Render project. `package.json`, `server.js`, `public/`, `server/` and `test/` are at ZIP root. Your existing save format is preserved.

## Scouting changes
- Base Kageyama stays **96 OVR** but now has a much better school-card weighting (16). In 12,000 deterministic trial Karasuno offers, he appeared about **41%** of the time; no specific player is guaranteed.
- Itachiyama offers now include **nine unique candidates**: three named players (**Sakusa, Komori, Iizuna**) plus six clearly labelled **anonymous reserves** with role-based, non-elite 78–84 OVR. The reserves are gameplay stand-ins, NOT newly established Haikyuu characters. This keeps the real three-player roster intact and prevents Sakusa from showing nearly every roll.
- Sakusa is still 97 OVR, with a smaller scouting weight (3). In the same trial, he appeared about **14%** of Itachiyama offers.
- No duplicate names in the same four-card school offer. Roles remain guaranteed for incomplete squads. Nobody on Itachiyama's anonymous reserve list can turn into a fake Pro or Nationals card.
- Premium packs keep their own probabilities (Elite 1%, Apex 0.1%). School scout balancing does not change premium pack odds.

## Portrait progress (read before downloading)
- This update references **56 distinct individually generated character portraits** (out of the **120 named school-player identities** in the roster). Cards for the remaining named school players and six anonymous Itachiyama reserves use previous artwork/fallbacks. **This is not the promised full-roster portrait overhaul.**
- Generated illustrations are NOT the same as official anime screenshots. Many portray an interpretation of the character; their details have not been independently checked against official character model sheets.
- The game defaults to using the local files in `public/ai-portraits/local/{id}.webp`, if present, then tries each externally hosted generated portrait, finally falling back to the existing card images.
- Because the generated images were created on an external generation host and could not be copied into this ZIP automatically, the offline portrait pack is separate. **Download and extract the following AI portrait ZIP directly inside `public/ai-portraits/local/`:**

  https://d2ol7oe51mr4n9.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/59b3140c-a023-418a-bda1-e14b1b1fb68d.zip

  The external archive includes `0.webp`, `1.webp`, etc. Put those numbered WebP files at `public/ai-portraits/local/` (not an extra folder). The optional archive has **56 pictures**. They render more reliably when local than when remotely hotlinked.
- Visit `YOUR-WEBSITE/ai-art-preview.html` to inspect every school-player identity and filter between individually generated portraits and fallback assets.

## Preserve game progress
This update does not delete browser saves or Supabase setup, but export a save backup before replacing the project. Both saved squads and full-control/auto tactical duels remain supported.

## Update using GitHub Desktop
1. Download and extract the V21 ZIP.
2. Open your game repository in GitHub Desktop, then click **Repository > Show in Explorer**.
3. Copy the **contents** of the extracted V21 project folder to the repository root and replace files. Do not overwrite `.git`.
4. OPTIONAL: copy numbered WebP files from the portrait archive to `public/ai-portraits/local/`.
5. In GitHub Desktop: **Commit to main > Push origin**. Render redeploys if auto-deploy is enabled.
6. Check your Render log and inspect `ai-art-preview.html` and the Draft screen in the live app.

## Verification
`npm run test:v21` runs V21's scouting/duplicate validation plus the inherited V20 gameplay regression suites. Browser display, remotely hosted art, live friend duels and cloud saves must be tested on deployment.
