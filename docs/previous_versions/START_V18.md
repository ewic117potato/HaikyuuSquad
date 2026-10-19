# HAIKYUU LEGENDS V18 — School Gauntlet & 20-Roll Quests

This ZIP contains the **full replacement web game** for your existing GitHub + Render + Supabase setup. There is no need to install Node.js locally.

## What changed

- **57 School Battle stages in seven chapters** rather than nine stages. The first nine are kept in the same order and save slots as before, so existing campaign progress can carry over.
- Boss victories in stages **9, 17, 25, 33, 41, 49 and 57** give **20 school rolls + 10 four-card rerolls** *on the first clear*, plus coins, gems and a permanent school card (or duplicate compensation). Later bosses also grant Nationals passes; the last boss gives a Pro token.
- **Ten additional higher-value daily quests** with 20 rolls each, including school fights, squad drafting, scouting, spending rerolls and Nationals matches.
- **Twelve additional weekly quests**, giving 30–40 rolls plus rerolls and other prizes.
- **Twenty additional permanent milestone quests** with 20–50 rolls, covering wins, squad drafts, chemistry, Spring High and the full campaign.
- **Opponent AI scales to the displayed stage power** so later chapters are materially harder, not just labelled with a larger OVR.
- **Progress and first-clear rewards save** with the existing browser/Supabase-compatible save structure. Replays earn standard match coins and count toward repeatable quests but do not duplicate the first-clear bonus.
- Previous V17 artwork, school draft mechanics, friendship/rivalry chemistry, saved squads, shops, duels and Spring High mode are retained.

## Where to play

- **School Battles** tab: pick a chapter, beat each stage, return for replays. Battles require a six-player starting squad.
- **Quests** tab: the new 20-roll quests appear first in Daily; higher-value quests appear first in Weekly. Long-term completion rewards appear under Legend Road.
- **Draft** tab: a *free new school roll after every pick* remains. Earned school rolls let you change schools; rerolls refresh the four offered cards.

## Install/update with GitHub Desktop

1. Download this ZIP and **Extract All**.
2. Open GitHub Desktop and select the GitHub repository currently connected to your Render website.
3. Choose **Repository → Show in Explorer**.
4. Copy everything **inside this ZIP's extracted folder** into the repository folder, replacing previous files. Do not nest the project inside another folder; the root should contain `server.js`, `package.json` and `public/`.
5. Keep the hidden `.git` directory intact. Commit as `Haikyuu Legends V18 School Gauntlet` and press **Push origin**.
6. Render should redeploy automatically if configured. Otherwise, deploy the latest commit. Root Directory should be blank **only if** `package.json` is at repository root. Build: `npm install`; Start: `npm start`.
7. Once Render says Live, open the website, choose **School Battles**, and confirm the 57-stage chapter selector. Open **Quests** to claim scouting rewards.

**Back up your existing progress before updating.** Browser saves remain tied to the device unless your Supabase cloud saving has been set up and verified. This update does not change Supabase schema or credentials.

## Testing

`npm run test:v18` — full game regression suite plus new V18 quest, stage and reward tests.

The offline tests pass. A live Render deployment, two-device duels and browser visual appearance still need checking. The client-side single-player coin/roll economy is not cheat-proof for competitive play.
