# HAIKYUU LEGENDS V14 — RIVALRY ROAD

This is a full replacement project for GitHub → Render → optional Supabase. It is **not** a live website until you deploy it. No Node.js installation is needed on your own PC: Render installs dependencies in the cloud.

## What changed in V14

- **Hinata's ordinary school card is now 92 OVR.** Kageyama 96, Bokuto 96, Ushijima 99, Kenma 89, Sakusa 97 and other top players have character-specific ratings. Normal bench players have lower ratings; these are subjective game-balance values, not official series stats.
- Ten featured school scouting pools. No mixed-school regular draft offers; one school card per named character. Four smaller schools unlock via School Battles/Career wins.
- Standard school scouting produces **High School cards only**. Nationals, Timeskip, Professional and five separate Quest Legend forms come from their corresponding rewards or premium systems.
- Same-school synergy (+1 to +5), named duo bonds, cross-school rivalries and Karasuno/Nekoma Garbage Dump Showdown are calculated through the same `public/team-chemistry.js` module on the client and match server. Link bonuses cap at +12 effective OVR.
- More consistent card catalog: **336 player card designs + 156 coach/manager card designs = 492 cards**, with a searchable gallery, variant-specific frames and corrected printed ratings. Some versions share a portrait. The local illustration quality varies; we do **not** claim all 492 contain unique cinematic anime artwork.
- Stadium-style draft with four sequentially revealed choices, 95+ cutscene, six-slot volleyball court, reward progression, saved teams, staff, duels and Spring Nationals preserved from earlier versions.

## Updating with GitHub Desktop

1. Back up your current repository and any valuable browser progress first.
2. Extract this ZIP into a temporary folder (not into your GitHub folder yet).
3. In GitHub Desktop open the repository linked to your Render site. Select **Repository → Show in Explorer**.
4. **Copy the contents of this extracted folder** into the repo. `package.json`, `server.js` and `public/` must be directly in the repository root. Keep `.git` unchanged.
5. Replace existing files when Windows asks. If an old, extra version folder still contains conflicting app files, remove that old version folder **after** verifying the new root structure.
6. In GitHub Desktop: **Commit to main → Push origin**.
7. On Render, check the service connected to the same GitHub repo and branch. With this root structure, **Root Directory = blank**, **Build Command = `npm install`**, **Start Command = `npm start`**. Deploy latest commit if needed.
8. Once Render shows Live, open the website and test draft → squad → school battle → friend lobby; then check your Supabase cloud-save indicator.

The ZIP root contains: `public/`, `server/`, `supabase/`, `test/`, `.github/`, `server.js`, `package.json`, `render.yaml` and documentation. **Do not upload the ZIP itself as a single GitHub file.**

## Testing and limitations

`npm run test:v14` passed the V14 suite and the V3–V13 regressions. V14 has not yet been verified in a real Render two-browser multiplayer match. The browser UI, external portrait URLs and Supabase persistence still need live deployment testing.

Local saves are browser-specific. Supabase is optional and requires your project URL, publishable key, schema and configured anonymous sign-in. Never commit Supabase secret or service-role keys.

**Artwork:** stylized fan/project portraits and template frames are included. Some leading characters use more recognisable AI-reference-derived art; other characters use illustrated backups or attempt external image lookups. Every image cannot be guaranteed to match official anime stills, and official art may require licensing.

**Security:** Match sync is server-driven, but parts of the economy/quests can still be modified from browser storage. This build is suitable for a friends prototype, not a public competitive economy with real-money purchases.
