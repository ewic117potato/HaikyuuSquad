'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {SPIKE_ROSTER,SPIKE_SCHOOL_TEAMS}=require('../public/roster-data.js');
const Balance=require('../public/balance.js');
const Draft=require('../public/draft-rules.js');
const it=SPIKE_ROSTER.filter(c=>c.school==='ITACHIYAMA'&&!c.proOnly);
assert.equal(it.length,9,'Itachiyama has three named players and six anonymous roster positions');
assert.equal(it.filter(c=>c.supportRoster).length,6);
assert.deepEqual(it.filter(c=>!c.supportRoster).map(c=>c.name).sort(),['Kiyoomi Sakusa','Motoya Komori','Tsukasa Iizuna']);
assert.equal(SPIKE_ROSTER.filter(c=>c.name==='Kiyoomi Sakusa'&&c.school==='ITACHIYAMA').length,1);
const entry=n=>{const i=SPIKE_ROSTER.findIndex(p=>p.name===n&&!p.proOnly);return {p:SPIKE_ROSTER[i],i}};
assert.equal(Balance.ratingFor(entry('Tobio Kageyama').p,entry('Tobio Kageyama').i,0),96);
assert.equal(Balance.ratingFor(entry('Takanobu Aone').p,entry('Takanobu Aone').i,0),93);
assert(Balance.weightFor(...Object.values(entry('Tobio Kageyama')))>Balance.weightFor(...Object.values(entry('Kiyoomi Sakusa'))));
const B=Balance;
function maker(targetSchool,seed){let x=seed>>>0;const rand=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};return ()=>Draft.makeOffer({roster:SPIKE_ROSTER,allowedSchools:SPIKE_SCHOOL_TEAMS,targetSchool,rand,weightForIndex:i=>B.weightFor(SPIKE_ROSTER[i],i),cardFromIndex:(i,s)=>B.buildCard(SPIKE_ROSTER[i],i,0)});}
const itOffer=maker('ITACHIYAMA',123456),karasuno=maker('KARASUNO',4567);
let sakusa=0,kageyama=0;
const N=12000;
for(let i=0;i<N;i++){
 const a=itOffer();assert.equal(a.cards.length,4);assert(a.cards.every(c=>c.school==='ITACHIYAMA'&&c.stage===0));assert.equal(new Set(a.cards.map(c=>c.name)).size,4);if(a.cards.some(c=>c.name==='Kiyoomi Sakusa'))sakusa++;
 const k=karasuno();assert.equal(k.cards.length,4);assert(k.cards.every(c=>c.school==='KARASUNO'));if(k.cards.some(c=>c.name==='Tobio Kageyama'))kageyama++;
}
assert(sakusa/N<.25,`Sakusa should not appear nearly every Itachiyama roll, actual ${sakusa/N}`);
assert(sakusa/N>.04,'Sakusa should remain obtainable');
assert(kageyama/N>.22,`Kageyama school appearance should be much easier than V20, actual ${kageyama/N}`);
assert(kageyama/N<.75,'Kageyama should not be guaranteed');
const cat=JSON.parse(fs.readFileSync('public/cards/catalog.json','utf8'));
for(let i=210;i<216;i++){
 const c=cat.cards.find(v=>v.key===`${i}-0`);
 assert(c&&c.school==='ITACHIYAMA'&&c.supportRoster);
 assert(fs.existsSync(`public/cards/players/${i}-0.webp`));
 assert(!cat.cards.some(v=>v.idx===i&&v.stage!==0),'Anonymous supporting players cannot get imaginary pro or Nationals versions');
}
// Six picks remain completable with role guarantees, and never duplicate a named player.
const rnd=maker(null,98765);
for(let trial=0;trial<120;trial++){
 let selected=[];let seed=12345+trial;let random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let j=0;j<6;j++){
  const offer=Draft.makeOffer({roster:SPIKE_ROSTER,existing:selected,allowedSchools:SPIKE_SCHOOL_TEAMS,rand:random,cardFromIndex:i=>B.buildCard(SPIKE_ROSTER[i],i,0),weightForIndex:i=>B.weightFor(SPIKE_ROSTER[i],i)});
  selected.push(offer.cards.find(c=>Draft.eligible(selected,c)));
 }
 assert(Draft.validTeam(selected));
}
console.log('PASS V21 scouting: 9 Itachiyama candidates, Sakusa '+(100*sakusa/N).toFixed(1)+'% offers, Kageyama '+(100*kageyama/N).toFixed(1)+'% Karasuno offers, unique cards, complete six-slot drafts, valid artwork and no invented Pro supports.');
