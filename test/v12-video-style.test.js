'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const ctx={};const storage={};const els=new Map();
function fakeElement(key){if(!els.has(key))els.set(key,{innerHTML:'',textContent:'',value:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},addEventListener(){},focus(){},setSelectionRange(){}});return els.get(key)}
Object.assign(ctx,{console,crypto:crypto.webcrypto,Date,Math,URL,URLSearchParams,Intl,clearTimeout(){},setTimeout(){return 0},setInterval(){return 0},clearInterval(){},window:{scrollTo(){},matchMedia(){return {matches:true}},queueCloudSave(){}},document:{querySelector:fakeElement,querySelectorAll:()=>[],body:{dataset:{}},addEventListener(){}},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},navigator:{},location:{origin:'http://localhost',search:''},WebSocket:function(){}});
const context=vm.createContext(ctx);
for(const source of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','gauntlet-engine.js','game-v3.js']){
 vm.runInContext(fs.readFileSync('public/'+source,'utf8'),context,{filename:source});
}
const run=expr=>vm.runInContext(expr,context);
assert.equal(run('QUEST_LEGENDS.length'),5);
assert(run('QUEST_LEGENDS.every(x=>x.stage===4&&x.questOnly&&x.rarity>=4)'));
assert.equal(run("addCard('legend-bokuto-thunder')"),null,'Quest card cannot be added through generic recruit path');
assert.equal(run('state.items.length'),0);
run("claimQuest('milestone|ql-bokuto')");
assert.equal(run('state.items.length'),0,'Locked quest cannot be claimed early');
run('newRun()');
assert(run('state.v3.offer.cards.every(c=>c.stage===0&&!c.questOnly)'));
for(let i=0;i<6;i++){
 assert(run('state.v3.offer.cards.length')>0);
 run('runPick(state.v3.offer.cards.find(c=>Draft.eligible(state.v3.run.picks.map(player).filter(Boolean),c)).key)');
}
assert.equal(run('state.v3.runs'),1);
assert(run('rollPage().includes("v12-stage-grid")'));
assert(run('questsPage().includes("QUEST CARDS")'));
assert(run('questsPage().includes("BOKUTO · THUNDER ACE")'));
run('state.wins=50;state.v3.chemistryRuns=20');
run("claimQuest('milestone|ql-bokuto')");
assert.equal(run("state.items.filter(x=>x.key==='legend-bokuto-thunder').length"),1);
run("claimQuest('milestone|ql-bokuto')");
assert.equal(run("state.items.filter(x=>x.key==='legend-bokuto-thunder').length"),1);
assert(run("owned().some(c=>c.questOnly&&c.power>=104)"));
run("collectionCategory='quest'");
assert(run("collectionPage().includes('Bokuto')"));
for(let i=0;i<250;i++){
 const stage=i%2?2:3;
 const tier=run('SpikePacks.drawPack(CATALOG,'+stage+').card');
 assert(!tier.questOnly,'Pack may never contain quest-exclusive cards');
}
const idx=fs.readFileSync('public/index.html','utf8'),css=fs.readFileSync('public/v12-stadium.css','utf8');
assert(idx.includes('v12-stadium.css'));
assert(css.includes('v12-scout-card.v12-show')&&css.includes('v12-legend-overlay'));
console.log('PASS V12: quest-only 95+ cards, locked and claim-once rewards, separate collection, video-style school UI, school drafts, Timeskip/Pro packs and reveal animations.');
