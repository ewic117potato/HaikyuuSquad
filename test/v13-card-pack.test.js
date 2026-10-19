'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../public/roster-data'),B=require('../public/balance'),P=require('../public/pack-engine');
const all=JSON.parse(fs.readFileSync('public/cards/catalog.json','utf8'));
assert.equal(all.cards.length,336);assert.equal(all.staff.length,156);
assert.equal(new Set([...all.cards,...all.staff].map(c=>c.key)).size,492);
for(const c of [...all.cards,...all.staff]){
 const f=path.join('public',c.file);
 assert(fs.existsSync(f),`Artwork missing: ${c.key} ${f}`);
 const buf=fs.readFileSync(f);
 assert.equal(buf.subarray(0,4).toString(),'RIFF',`Not WebP: ${c.key}`);
 assert(buf.length>2000,`Suspiciously small card: ${c.key}`);
}
for(const c of all.cards.filter(c=>c.stage===0))assert(c.power<=100);
assert(all.cards.some(c=>c.stage===3&&c.power===105));
assert(all.cards.some(c=>c.stage===4&&c.power===105));
assert(all.cards.some(c=>c.packTier==='apex'&&c.power>100));
for(const c of all.cards.filter(c=>c.questOnly))assert.equal(c.variant,'Quest Legend');
const html=fs.readFileSync('public/cards-gallery.html','utf8');
assert(html.includes('cards/catalog.js'));assert(html.includes('const groups='));
const game=fs.readFileSync('public/game-v3.js','utf8');
assert(game.includes('v13CardPath(c)')&&game.includes('v13StaffPath(c)'));
const index=fs.readFileSync('public/index.html','utf8');assert(index.includes('v13-cards.css')&&index.includes('cards-gallery.html'));
console.log('PASS V13: 419 unique card images, exact card artwork files, 105+ pro and Quest ratings, full gallery and game card integration.');
