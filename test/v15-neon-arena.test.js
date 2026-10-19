'use strict';
const fs=require('fs'),assert=require('assert');
const P='public/';
const balance=require('../public/balance.js');
assert.strictEqual(balance.ratingFor({name:'Takanobu Aone',school:'DATE TECH',pos:'MB'},32,0),93);
assert.strictEqual(balance.ratingFor({name:'Shoyo Hinata',school:'KARASUNO',pos:'MB'},0,0),92);
const catalog=JSON.parse(fs.readFileSync(P+'cards/catalog.json','utf8'));
const aone=catalog.cards.find(c=>c.name==='Takanobu Aone'&&c.stage===0);
assert(aone&&aone.power===93,'gallery / image catalog should show Aone 93');
assert.strictEqual(catalog.version,15);
for(const c of catalog.cards){assert(fs.existsSync(P+c.file),`missing image: ${c.key}`)}
for(const c of catalog.staff){assert(fs.existsSync(P+c.file),`missing staff card: ${c.key}`)}
const html=fs.readFileSync(P+'index.html','utf8');const script=fs.readFileSync(P+'game-v3.js','utf8');const css=fs.readFileSync(P+'v15-neon.css','utf8');
assert(html.includes('v15-neon.css')&&html.includes('data-view="roll"')&&html.includes('id="cloudStatus"'));
for(const part of ['v15-home-grid','v15-school-tile','v15-chem-showcase','v15-promo','v15-lineup'])assert(script.includes(part));
for(const action of ['schoolInfo','questTab','startRun','newRun','startRun'])assert(script.includes(action));
assert(css.includes('max-width:520px')&&css.includes('prefers-reduced-motion'));
console.log(`PASS: V15 neon UI, Aone 93, existing action routing and all ${catalog.cards.length+catalog.staff.length} collectible art file references.`);
