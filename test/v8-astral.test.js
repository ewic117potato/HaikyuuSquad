'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const crypto=require('node:crypto');
const {SPIKE_ROSTER,SPIKE_COACHES}=require('../public/roster-data');
const B=require('../public/balance');const P=require('../public/pack-engine');const D=require('../public/draft-rules');
const base=SPIKE_ROSTER.flatMap((c,i)=>(c.proOnly?[3]:[0,...(['KARASUNO','NEKOMA','FUKURODANI','INARIZAKI','KAMOMEDAI','ITACHIYAMA','MUJINAZAKA'].includes(c.school)?[1]:[]),...(P.TIMESKIP_NAMES.has(c.name)?[2]:[])]).map(v=>B.buildCard(c,i,v)));
const catalog=base.concat(base.filter(P.eliteCandidate).map(c=>P.upgradeCard(c,'elite')),base.filter(P.apexCandidate).map(c=>P.upgradeCard(c,'apex')));
const find=(name,stage=0)=>{const i=SPIKE_ROSTER.findIndex(x=>x.name===name&&!x.proOnly);assert(i>=0,name);return B.buildCard(SPIKE_ROSTER[i],i,stage)};
assert.equal(find('Wakatoshi Ushijima').power,99);
assert.equal(find('Tobio Kageyama').power,96);
assert.equal(find('Kenma Kozume').power,89);
assert.equal(find('Kotaro Bokuto').power,96);
assert.equal(find('Shoyo Hinata').power,92);
assert.equal(B.STAGE_CHANCES[0],100);assert.equal(B.STAGE_CHANCES[1],0);
assert.equal(B.STAGE_CHANCES[2]+B.STAGE_CHANCES[3],0);
for(const [i,c] of SPIKE_ROSTER.entries())for(const stage of c.proOnly?[3]:[0,1,2,3]){
 const power=B.ratingFor(c,i,stage);
 assert(power>=60&&power<=109);
 if(!(c.name in B.OVERRIDES))assert(power<=89,`Unknown ${c.name} is wrongly rated ${power}`);
 if(power>=95&&stage<=1)assert(B.ALLOWED_OVER_90.has(c.name),`Non-star ${c.name} hit ${power}`);
 assert(fs.existsSync(`public/portraits/${String(c.id).padStart(2,'0')}.svg`),`Missing ${c.name} illustration`);
}
assert(SPIKE_COACHES.length>=15&&SPIKE_COACHES.length<30);
for(const n of [0,.5,.99])assert.equal(B.versionForRoll(()=>n)===2||B.versionForRoll(()=>n)===3,false);
assert.throws(()=>P.drawPack(catalog,1),/Only Timeskip and Professional/);
for(const s of [2,3])for(const n of [0,.005,.4,.94]){
 const seq=[n,.28],r=P.drawPack(catalog,s,()=>seq.shift()??.28);
 assert.equal(r.card.stage,s);assert.equal(r.card.proOnly,s===3);
}
// Draft: 100% of offered cards must be school or Nationals; every offer has at least one needed position.
for(let trial=0;trial<200;trial++){
 const squad=[];
 for(let j=0;j<6;j++){
  const off=D.makeOffer({roster:SPIKE_ROSTER,existing:squad,cardFromIndex:(i,s)=>B.buildCard(SPIKE_ROSTER[i],i,s),versionSampler:B.versionForRoll,weightForIndex:i=>B.weightFor(SPIKE_ROSTER[i],i)});
  assert(off.cards.length>=1&&off.cards.length<=4);
  assert(off.cards.every(x=>x.stage<=1));
  const match=off.cards.find(c=>D.eligible(squad,c));assert(match,`unfillable draft ${trial}/${j}`);squad.push(match);
 }
 assert(D.validTeam(squad));
}
const storage={};const elements={};function el(id){return elements[id]||(elements[id]={value:'',textContent:'',innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},style:{},addEventListener(){},focus(){},setSelectionRange(){}})}
const ctx=vm.createContext({document:{body:{dataset:{}},querySelector:el,querySelectorAll:()=>[],addEventListener(){}},console,crypto:crypto.webcrypto,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},Date,Math,URL,URLSearchParams,Intl,window:{scrollTo(){},queueCloudSave(){}},WebSocket:function(){}});
for(const name of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+name,'utf8'),ctx);
const run=js=>vm.runInContext(js,ctx);
assert.equal(run('SHOP.length'),2);assert.equal(run('SHOP.map(x=>x.id).join(",")'),'timeskip,professional');
assert(run('shopPage()').includes('TIMESKIP CHRONICLES'));
assert(run('shopPage()').includes('PRO LEAGUE CONTRACT'));
assert(!run('shopPage()').includes('NATIONALS PACK'));
assert(run('rollPage()').includes('100%'));
assert(run('shopPage()').includes('v8-pack-art'));
// Existing V7-owned character's legacy rating is reconciled without losing UID or upgrades.
run('state.items.push({key:"8-0",uid:"player-old",level:2,power:99});');
assert.equal(run('owned().find(x=>x.uid==="player-old").power'),89);
assert.equal(run('owned().find(x=>x.uid==="player-old").level'),2);
run('state.v3.quickTokens=1;');
const count=run('state.items.length');run('redeemNationalsPass()');
assert.equal(run('state.v3.quickTokens'),0);assert.equal(run('state.items.length'),count+1);
assert.equal(run('owned().at(-1).stage'),1);
run('state.coins=200000;');assert.equal(run('buyPack("nation")'),false);
assert.equal(run('buyPack("professional")'),true);assert.equal(run('state.coins'),178000);
assert.equal(run('state.v3.pendingPack.pack'),'professional');
// Guaranteed quest awards must use real pro-team cards, not a school uniform mislabeled Pro.
run('state.v3.pendingPack=null;state.wins=60;');
run('claimQuest("milestone|m11")');
assert(run('owned().some(x=>x.name==="Shoyo Hinata" && x.stage===3 && x.proOnly)')); 
assert(fs.readFileSync('public/index.html','utf8').includes('v8-astral.css'));
assert(fs.readFileSync('public/v8-astral.css','utf8').includes('.v8-pack-art'));
console.log('PASS: V8 premium-only packs, strict school ratings, 105+ professional ratings, Kenma 89 / Ushijima 99, 200 complete drafts, online-portrait fallbacks, old-save correction, earned Nationals pass and Astral UI.');
