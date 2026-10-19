'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const crypto=require('node:crypto');
const P=require('../public/pack-engine');
const B=require('../public/balance');
const {SPIKE_ROSTER}=require('../public/roster-data');
assert.deepEqual(P.ODDS,{standard:98.9,elite:1,apex:0.1});
assert.equal(P.rollTier(()=>0),'apex');
assert.equal(P.rollTier(()=>0.000999),'apex');
assert.equal(P.rollTier(()=>0.001),'elite');
assert.equal(P.rollTier(()=>0.010999),'elite');
assert.equal(P.rollTier(()=>0.011),'standard');
let counted={standard:0,elite:0,apex:0};
for(let i=0;i<250000;i++)counted[P.rollTier(Math.random)]++;
assert(Math.abs(counted.elite/2500-1)<.20,JSON.stringify(counted));
assert(Math.abs(counted.apex/250-1)<.30,JSON.stringify(counted));
const basic=SPIKE_ROSTER.flatMap((r,i)=>[0,1,2,3].filter(v=>!r.proOnly||v===3).map(v=>B.buildCard(r,i,v)));
const catalog=basic.concat(basic.filter(P.eliteCandidate).map(c=>P.upgradeCard(c,'elite')),basic.filter(P.apexCandidate).map(c=>P.upgradeCard(c,'apex')));
for(const stage of [1,2,3])for(const [tier,number] of [['apex',0],['elite',.001],['standard',.5]]){
 const randomValues=[number,.5];const result=P.drawPack(catalog,stage,()=>randomValues.shift()??.5);
 assert.equal(result.card.stage,stage);assert.equal(result.tier,tier);assert.equal(result.card.packTier||'standard',tier);
 assert(result.card.power>=60&&result.card.power<=100);
}
const storage={},elements=new Map();
function el(key){if(!elements.has(key))elements.set(key,{value:'',textContent:'',innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},style:{},addEventListener(){},focus(){},setSelectionRange(){}});return elements.get(key);}
function load(){const context=vm.createContext({document:{body:{dataset:{}},querySelector:el,querySelectorAll:()=>[],addEventListener(){}},console,crypto:crypto.webcrypto,
 localStorage:{getItem:key=>storage[key]||null,setItem:(key,val)=>storage[key]=val},navigator:{},location:{search:'',origin:'http://localhost'},setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},Date,Math,URL,URLSearchParams,Intl,window:{scrollTo(){},queueCloudSave(){}},WebSocket:function(){}});
 for(const file of ['roster-data.js','balance.js','draft-rules.js','pack-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+file,'utf8'),context);
 return {context,run:js=>vm.runInContext(js,context)};
}
let client=load(),run=client.run;
run('state.coins=100000;save()');
const before=run('state.coins');
assert.equal(run('buyPack("professional")'),true);
assert.equal(run('state.coins'),before-18000);
assert.equal(run('state.v3.packsOpened'),1);
assert.equal(run('state.v3.pendingPack.pack'),'professional');
assert.equal(run('buyPack("timeskip")'),false);
assert.equal(run('state.v3.packsOpened'),1);
const pending=run('state.v3.pendingPack.key');
assert.equal(run('state.items.length'),0);
// A refresh cannot lose the purchased card or double-spend it.
client=load();run=client.run;
assert.equal(run('state.v3.pendingPack.key'),pending);
assert.equal(run('buyPack("timeskip")'),false);
assert(run('shopPage()').includes('UNCLAIMED'));
run('shopPick("not-our-card")');assert.equal(run('state.items.length'),0);
run('shopPick(state.v3.pendingPack.key)');
assert.equal(run('state.items.length'),1);
assert.equal(run('state.v3.proOwned'),1);
assert.equal(run('state.v3.pendingPack'),null);
run('shopPick("not-our-card")');assert.equal(run('state.items.length'),1);
assert.equal(run('buyPack("timeskip")'),true);
assert.equal(run('state.coins'),before-18000-7500);
run('shopPick(state.v3.pendingPack.key)');
assert.equal(run('state.v3.packsOpened'),2);
assert.equal(run('state.items.length'),2);
// Daily and milestone quests can grant coins and exact guaranteed character cards.
run('state.v3.runs=3;state.v3.quests.runs=1;save()');
const preQuestCoins=run('state.coins');
run('claimQuest("daily|run1")');
assert.equal(run('state.coins'),preQuestCoins+500);
run('claimQuest("daily|run1")');
assert.equal(run('state.coins'),preQuestCoins+500);
const beforeQuestCards=run('state.items.length');
run('claimQuest("milestone|m8")');
assert.equal(run('state.items.length'),beforeQuestCards+1);
assert(run('owned().some(x=>x.name==="Shoyo Hinata"&&x.stage===1)'));
run('claimQuest("milestone|m8")');assert.equal(run('state.items.length'),beforeQuestCards+1);
run('state.wins=250');
run('claimQuest("milestone|m13")');
assert(run('owned().some(x=>x.name==="Wakatoshi Ushijima"&&x.stage===3&&x.packTier==="apex")'));
assert(run('shopPage()').includes('0.1%'));
assert(run('questsPage()').includes('CHARACTER JOURNEYS'));
console.log('PASS: V6 pack rates, stage pools, elite/apex variants, purchases and refresh recovery, claim-once protection, coin quests, guaranteed character rewards.');
