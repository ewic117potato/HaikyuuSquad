'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const D=require('../public/draft-rules');
const B=require('../public/balance');
const {SPIKE_ROSTER}=require('../public/roster-data');
const {sanitizeSquad}=require('../server/match-engine');
assert.deepEqual(B.STAGE_CHANCES,[100,0,0,0]);
assert.equal(B.versionForRoll(()=>.999999),0);
const schoolPools=new Map();
for(const p of SPIKE_ROSTER.filter(x=>!x.proOnly)){
 const names=schoolPools.get(p.school)||new Set();names.add(p.name);schoolPools.set(p.school,names);
}
// Every offered card is a UNIQUE named High School character. Players already
// drafted may not be offered/picked again, and all six slots can still fill.
for(let t=0;t<1800;t++){
 const drafted=[];
 for(let round=0;round<6;round++){
  const offer=D.makeOffer({roster:SPIKE_ROSTER,existing:drafted,
    cardFromIndex:i=>B.buildCard(SPIKE_ROSTER[i],i,0),
    versionSampler:()=>0,weightForIndex:i=>B.weightFor(SPIKE_ROSTER[i],i)});
  assert(offer.cards.length>0&&offer.cards.length<=4);
  assert(offer.cards.every(c=>c.school===offer.school&&c.stage===0&&!c.proOnly));
  assert.equal(new Set(offer.cards.map(c=>c.name)).size,offer.cards.length,'Repeated character in a four-card offer');
  assert(offer.cards.every(c=>!drafted.some(p=>p.name===c.name)));
  const valid=offer.cards.filter(x=>D.eligible(drafted,x));
  assert(valid.length,'Must offer at least one usable, undrafted character');
  drafted.push(valid[Math.floor(Math.random()*valid.length)]);
 }
 assert.equal(new Set(drafted.map(c=>c.name)).size,6);
 assert(D.validTeam(drafted));
}
// Small schools never invent 2+ copies of the same school character.
const fewest=[...schoolPools.entries()].sort((a,b)=>a[1].size-b[1].size)[0];
const small=D.makeOffer({roster:SPIKE_ROSTER,targetSchool:fewest[0],existing:[],cardFromIndex:i=>B.buildCard(SPIKE_ROSTER[i],i,0)});
assert.equal(small.school,fewest[0]);
assert.equal(small.cards.length,Math.min(4,fewest[1].size));
assert.equal(new Set(small.cards.map(c=>c.name)).size,small.cards.length);
// Duplicate athletes cannot be selected by fresh-draft clients.
assert(!D.eligible([{name:'Shoyo Hinata',position:'OH'}],{name:'Shoyo Hinata',position:'MB'}));
assert(!D.validTeam([{name:'A',position:'OH'},{name:'A',position:'OH'},
 {name:'B',position:'MB'},{name:'C',position:'OP'},
 {name:'D',position:'L'},{name:'E',position:'S'}]));
const dummy=[
 {name:'A',position:'OH'},{name:'B',position:'MB'},{name:'C',position:'OP'},
 {name:'D',position:'L'},{name:'E',position:'OH'},{name:'F',position:'S'}
].map((x,i)=>({...x,id:String(i),school:'KARASUNO',power:83,attack:83,defense:80,set:81}));
assert.equal(sanitizeSquad(dummy).length,6);
const wrong=dummy.map(x=>({...x}));wrong[1].name=wrong[0].name;
assert.equal(sanitizeSquad(wrong).length,0,'Server must reject duplicate athletes in saved squads');

const storage={};
const oldSave={name:'V9 USER',coins:200,items:[
 {key:'0-0',uid:'hinata-original',level:1},
 {key:'0-0',uid:'hinata-duplicate',level:3},
 {key:'4-0',uid:'kageyama',level:0}],
 squad:['hinata-duplicate',null,null,null,'hinata-original','kageyama'],
 bench:['hinata-duplicate',null,null,null],
 savedTeams:[{squad:['hinata-duplicate',null,null,null,'hinata-original','kageyama'],bench:[],savedAt:1}],
 v3:{runs:0,rerolls:2,quests:{picks:1},weekly:{picks:1},claimed:{},weeklyClaimed:{},milestoneClaimed:{},day:new Date().toISOString().slice(0,10),week:(()=>{const d=new Date();d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)})()}
};
storage['spike-legends-save-v1']=JSON.stringify(oldSave);
const elements=new Map();function element(k){if(!elements.has(k))elements.set(k,{textContent:'',innerHTML:'',value:'',classList:{add(){},remove(){},toggle(){}},style:{},dataset:{},addEventListener(){},focus(){},setSelectionRange(){}});return elements.get(k);}
const context=vm.createContext({document:{body:{dataset:{}},querySelector:element,querySelectorAll:()=>[],addEventListener(){}},console,crypto:crypto.webcrypto,
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},Date,Math,URL,URLSearchParams,Intl,
 window:{scrollTo(){},queueCloudSave(){}},WebSocket:function(){}});
for(const name of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+name,'utf8'),context);
const run=code=>vm.runInContext(code,context);
assert.equal(run('state.items.length'),2,'Migration must collapse duplicate card keys');
assert.equal(run('state.items[0].level'),3,'Highest duplicate card upgrade must survive');
assert.equal(run('state.squad[0]'),'hinata-original','Original UID must survive');
assert.equal(run('state.squad[4]'),null,'Duplicate cannot fill another position');
assert.equal(run('state.savedTeams[0].squad[0]'),'hinata-original','Old saved squad must migrate');
assert.equal(run('state.savedTeams[0].squad[4]'),null);
run("addCard('0-0');");
assert.equal(run('state.items.length'),2,'Recruiting an owned school card must not create copies');
assert(run("questsPage().includes('SCHOOL ROLLS')"));
assert(run("questsPage().includes('First Scouting Pick')"));
const beforeRolls=run('state.tickets'),beforeRerolls=run('state.v3.rerolls');
run("claimQuest('daily|pick1')");
assert.equal(run('state.tickets'),beforeRolls+2);
assert.equal(run('state.v3.rerolls'),beforeRerolls+1);
run("claimQuest('daily|pick1')");
assert.equal(run('state.tickets'),beforeRolls+2,'Claim-once protection');
run("claimQuest('milestone|m0')");
assert.equal(run('state.tickets'),beforeRolls+5);
run("claimQuest('milestone|m0')");
assert.equal(run('state.tickets'),beforeRolls+5);
run('state.v3.weekly.picks=10');
run("claimQuest('weekly|tenpicks')");
assert.equal(run('state.tickets'),beforeRolls+11);
assert.equal(run('state.v3.rerolls'),beforeRerolls+1+2+4);
// Start free, use additional school rolls / rerolls, then keep claiming
// previously-owned cards without polluting the collection.
const oldT=run('state.tickets');run('newRun()');
assert.equal(run('state.tickets'),oldT,'First school roll must be free');
assert(run('state.v3.offer.cards.every(c=>c.stage===0)'));
assert(run('new Set(state.v3.offer.cards.map(c=>c.name)).size===state.v3.offer.cards.length'));
run('changeSchool()');assert.equal(run('state.tickets'),oldT-1);
run('rerollOffer()');assert.equal(run('state.v3.rerolls'),beforeRerolls+1+2+4-1);
for(let i=0;i<6;i++){
 run('runPick(state.v3.offer.cards.find(x=>Draft.eligible(state.v3.run.picks.map(player).filter(Boolean),x)).key)');
}
assert.equal(run('state.v3.runs'),1);
assert.equal(run('new Set(starting().map(c=>c.name)).size'),6);
console.log('PASS V10: 1,800 unique six-player school drafts; no repeat offers or athlete cards; small school handling; saved team duplicate migration; server rejects duplicates; extra school rolls and rerolls from quests; claim-once protection.');
