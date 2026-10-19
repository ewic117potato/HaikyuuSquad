'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const N=require('../public/nationals-engine');
const D=require('../public/draft-rules');
const {SPIKE_ROSTER}=require('../public/roster-data');
const B=require('../public/balance');
assert.equal(N.ROUNDS.length,6);
assert.equal(N.ROUNDS[3].name,'QUARTERFINAL');
assert.equal(N.ROUNDS[5].name,'FINAL');
assert.equal(N.simulateMatch(90,90,0,()=>0).sets.length,2);
assert.equal(N.simulateMatch(90,90,4,()=>1).sets.length,3);
for(let x=0;x<500;x++){
 const bracket=N.makeBracket(x*19+6);
 assert(N.validateBracket(bracket),'valid six-round bracket');
 assert.equal(new Set(bracket.map(a=>a.name)).size,6,'Should not face the same school twice in one bracket');
 const easy=N.projection(96,bracket),hard=N.projection(70,bracket);
 const total=easy.results.reduce((sum,r)=>sum+r.probability,0);
 assert(Math.abs(total-1)<1e-7,'Placement probabilities must add to 100%');
 assert(easy.championChance>hard.championChance,'Stronger team should have a better championship chance');
 assert(easy.championChance>=0&&easy.championChance<=1);
 assert(N.matchChance(98,bracket[0].power,0)>N.matchChance(64,bracket[0].power,0));
}
const trials=12000,random=Math.random;
let wins=0;for(let i=0;i<trials;i++)if(N.simulateMatch(90,92,0,random).win)wins++;
assert(Math.abs(wins/trials-N.matchChance(90,92,0))<.03,'Simulated results should match forecast likelihood');
// Browser harness from existing regression tests, with a fully local draft and game state.
const storage={};
const elements=new Map();function element(k){if(!elements.has(k))elements.set(k,{textContent:'',innerHTML:'',value:'',classList:{add(){},remove(){},toggle(){}},style:{},dataset:{},addEventListener(){},focus(){},setSelectionRange(){}});return elements.get(k);}
const math=Object.create(Math);math.random=()=>.0001; // always win most likely, even the hardest finale
const context=vm.createContext({document:{body:{dataset:{}},querySelector:element,querySelectorAll:()=>[],addEventListener(){}},console,crypto:crypto.webcrypto,
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},
 setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},Date,Math:math,URL,URLSearchParams,Intl,
 window:{scrollTo(){},queueCloudSave(){}},WebSocket:function(){}});
for(const name of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','gauntlet-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+name,'utf8'),context);
const run=code=>vm.runInContext(code,context);
assert(run("nationalsPage().includes('COMPLETE YOUR SQUAD FIRST')"));
run('newRun()');
for(let i=0;i<6;i++){
 const offered=run('state.v3.offer.cards.length');assert(offered>=1);
 run('runPick(state.v3.offer.cards.find(x=>Draft.eligible(state.v3.run.picks.map(player).filter(Boolean),x)).key)');
}
assert.equal(run('starting().length'),6);
assert(run("nationalsPage().includes('NATIONALS BRACKET')"));
assert(run("nationalsForecast().championChance>=0"));
assert(run("document.querySelector('#modal').innerHTML.includes('SPRING HIGH FORECAST')"));
const scoreAtStart=run('state.coins');
run('nationalsStart()');
assert.equal(run('state.v3.nationals.runs'),1);
assert.equal(run('state.v3.nationals.active.finished'),false);
assert.equal(run('state.v3.nationals.active.players.length'),6);
const lockedPower=run('state.v3.nationals.active.power');
run('state.squad=[null,null,null,null,null,null]');
assert.equal(run('state.v3.nationals.active.power'),lockedPower,'Tournament must preserve team strength even if lineup changes');
// advance after leaving lineup - run uses squad snapshot rather than mutable active state
run('nationalsNext(true)');
assert.equal(run('state.v3.nationals.active.wins'),1);
run('state.squad=state.v3.nationals.active.players.map(x=>state.items.find(i=>i.key===x.key).uid)');
run('nationalsSimulateAll()');
assert.equal(run('state.v3.nationals.active.wins'),6);
assert.equal(run('state.v3.nationals.active.finished'),true);
assert.equal(run('state.v3.nationals.bestWins'),6);
assert.equal(run('state.v3.nationals.history.length'),1);
assert.equal(run('state.v3.nationals.history[0].results.length'),6);
assert.equal(run('state.v3.quickTokens'),1,'National champion first-clear reward');
assert.equal(run('state.v3.quests.nationalsRuns'),1);
assert.equal(run('state.v3.quests.nationalsWins'),6);
assert(run('state.coins>0'));
assert(run("questsPage().includes('National Debut')"));
const rewardAfter=run('state.coins');
run('nationalsStart()');
assert.equal(run('state.v3.nationals.runs'),2);
run('nationalsSimulateAll()');
assert.equal(run('state.v3.quickTokens'),1,'Champions cannot farm the 1st-title reward');
assert.equal(run('state.coins'),rewardAfter+6*70,'Each first-clear stage reward may only be paid once; repeats have a small daily bonus');
assert(run('state.v3.nationals.history.length===2'));
assert(run("nationalsPage().includes('PREVIOUS TOURNAMENTS')"));
// The first loss stops the run and cannot pay a stage reward.
math.random=()=>.9999;
run('nationalsStart()');
const coinsBeforeLoss=run('state.coins');
run('nationalsNext(true)');
assert.equal(run('state.v3.nationals.active.wins'),0);
assert.equal(run('state.v3.nationals.active.finished'),true);
assert.equal(run('state.coins'),coinsBeforeLoss);
assert.equal(run('state.v3.nationals.history[0].wins'),0);
// Persisted state survives a re-evaluation and references no new database schema.
assert(storage['spike-legends-save-v1'].includes('nationals'));
const indexed=fs.readFileSync('public/index.html','utf8');
assert(indexed.includes('nationals-engine.js')&&indexed.includes('v11-nationals.css')&&indexed.includes('data-view="nationals"'));
assert(fs.readFileSync('public/game-v3.js','utf8').includes("case'nationalsAuto'"));
console.log('PASS V11: 500 unique brackets; calibrated match odds; 6-round champion and loss runs; team snapshot; persistence; 1-time prizes; capped repeat rewards; Nationals quest tracking; new UI/nav.');
