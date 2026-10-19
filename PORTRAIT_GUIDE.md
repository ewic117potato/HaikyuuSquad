# Portrait coverage and diagnostics

1. Deploy V9 to Render.
2. Visit `<game URL>/portrait-check.html`.
3. Wait for the checker to inspect the real online results. AniList/MyAnimeList provide licensed-platform catalogue metadata; their image links are external art hosted by those sites, not game-owned assets.
4. **If a player only shows vector backup art**, their actual anime image was not resolved or could not be loaded. Some manga-only and minor characters have no anime portrait, so a promised 100% anime-image match would be misleading.
5. You can fill `portrait-overrides.json` with verified publicly authorized image URLs keyed to EXACT character names if you have permission to use them, then push changes. Restart Render to reload this mapping. Allowed image hosts are restricted in `server/anime-portraits.js` for safety.

Main school players from Karasuno, Nekoma, Inarizaki, Shiratorizawa, Fukurodani and Aoba Johsai generally have more published character portraits than minor tournament athletes. Professional-only variants commonly rely on their anime-era face because the adult uniform appears in the manga rather than animated material.
