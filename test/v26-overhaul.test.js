'use strict';
// Regression checks for the V26 release — pure game logic plus browser integration.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const crypto=require('node:crypto');
const Chem=require('../public/team-chemistry');
const Packs=require('../public/pack-engine');
const Road=require('../public/v26-progression');
const Raids=require('../server/raid-engine');
const R=require('../public/roster-data');
const B=require('../public/balance');
const T=require('../public/tactical-engine');
const get=(name,stage=0)=>{
 const idx=R.SPIKE_ROSTER.findIndex(c=>c.name===name&&!c.proOnly);
 assert(idx>=0,name);return B.buildCard(R.SPIKE_ROSTER[idx],idx,stage);
};
const hinata=get('Shoyo Hinata'),kageyama=get('Tobio Kageyama');
assert.equal(hinata.power,92);assert.equal(kageyama.power,96);
const duo=Chem.evaluate([hinata,kageyama]);
assert.equal(duo.byName[hinata.name].effective,104); // 92 + 10 duo + 2 same-school
assert.equal(duo.byName[kageyama.name].effective,108);
assert.equal(duo.links.find(x=>x.label==='Freak Quick').bonus,10);
const boosted=Chem.boostedSquad([hinata,kageyama]);
assert.equal(boosted[0].power,104);assert.equal(boosted[1].power,108);
assert.equal(boosted[0].attack,hinata.attack+12);
const next=Chem.preview([kageyama],hinata);
assert.equal(next.card.effective,104);assert.deepEqual(next.changes.map(x=>x.name),['Tobio Kageyama']);
assert.equal(next.changes[0].after,108);
const rivals=Chem.evaluate([get('Toru Oikawa'),get('Wakatoshi Ushijima')]);
assert.equal(rivals.links.find(x=>x.label==='Miyagi’s Greatest').type,'rivalry');
assert.equal(rivals.byName['Toru Oikawa'].bonus,9);
assert.equal(rivals.byName['Wakatoshi Ushijima'].bonus,9);
const three=Chem.evaluate([get('Shoyo Hinata'),get('Tobio Kageyama'),get('Atsumu Miya'),get('Korai Hoshiumi')]);
assert(three.byName['Shoyo Hinata'].bonus<=20);
assert.equal(Chem.MAX_INDIVIDUAL,20);
assert(Chem.PAIRS.length>=25);
assert.equal(Packs.ODDS.elite,10);assert.equal(Packs.ODDS.apex,1);
let pity=Packs.pityState({elite:0,apex:0});
for(let i=0;i<19;i++){
 const roll=Packs.rollWithPity(pity,()=>.99);assert.equal(roll.tier,'standard');pity=roll.pity;
}
let forced=Packs.rollWithPity(pity,()=>.99);
assert.equal(forced.tier,'elite');assert.equal(forced.guaranteed,'elite');
assert.equal(forced.pity.elite,0);assert.equal(forced.pity.apex,20);
pity=Packs.pityState({elite:19,apex:99});forced=Packs.rollWithPity(pity,()=>.99);
assert.equal(forced.tier,'apex');assert.equal(forced.guaranteed,'apex');
assert.equal(forced.pity.elite,0);assert.equal(forced.pity.apex,0);
assert.equal(Road.STAGES.length,100);assert.equal(Road.CHAPTER_NAMES.length,20);
for(let i=0;i<20;i++){
 const chapter=Road.chapter(i);assert.equal(chapter.stages.length,5);
 assert.equal(chapter.stages[0].number,i*5+1);assert(chapter.stages[4].boss);
}
assert(Road.canPlay(4,5));assert(!Road.canPlay(4,6));assert(!Road.canPlay(20,20));
for(const n of [5,10,20,30,50,75,100])assert(Road.reward(n).minPower>=90);
assert.equal(Road.reward(6).minPower,0);
const positions=['OH','MB','OP','MB','OH','S'];
const roster=(id)=>positions.map((position,i)=>({name:`${id} Player${i}`,school:id,position,power:95,attack:95,set:95,defense:95}));
const raidSquads=[{name:'One',squad:roster('A')},{name:'Two',squad:roster('B')}];
const combined=Raids.sharedTeam(raidSquads);
assert.equal(combined.length,6);
assert(combined.some(c=>c.owner===0));assert(combined.some(c=>c.owner===1));
assert.equal(new Set(combined.map(x=>x.name)).size,6);
for(const level of Object.keys(Raids.BOSSES))assert.equal(Raids.bossRoster(level,4).length,6);
const room={team:combined,enemy:Raids.bossRoster('normal',2),score:[0,0],rally:0,serving:0,pendingActions:{One:'quick',Two:'power'}};
const event=Raids.step(room,()=>.45);
assert.equal(event.type,'raid_rally');assert.equal(event.score[0]+event.score[1],1);
assert.equal(room.rally,1);assert.equal(Object.keys(room.pendingActions).length,0);
assert.equal(Raids.reward('mythic',true).tickets,100);
assert.equal(Raids.reward('normal',false).tickets,0);
const Story=require('../public/v26-story');
assert.equal(Story.ARC.length,20);
assert(Story.stage(Road.STAGES[4]).boss);
assert.equal(typeof Story.stage(Road.STAGES[5]).dialogue,'string');
assert(Story.stage(Road.STAGES[4]).tactics);
const attackTeam=['Shoyo Hinata','Kei Tsukishima','Wakatoshi Ushijima','Yu Nishinoya','Asahi Azumane','Tobio Kageyama'].map(get);
const rivalTeam=['Toru Oikawa','Hajime Iwaizumi','Kotaro Bokuto','Kenma Kozume','Tetsuro Kuroo','Atsumu Miya'].map(get);
const specialEvent=T.simulate([attackTeam,rivalTeam],[0,0],0,[0,0],{serveSide:1,home:{set:'quick',attack:'power'}},()=>.2);
assert.equal(specialEvent.special.label,'Freak Quick');
assert(specialEvent.phases.some(x=>x.includes('CHEMISTRY ACTIVATED')));
assert(Story.objectiveDone([{winner:0,action:'SERVICE ACE'}],1));
assert(!Story.objectiveDone([{winner:1,action:'SERVICE ACE'}],1));

// Read the current release client with a browser-like VM to exercise pages without CDN or WebGL.
const storage={},elements=new Map();
function nodeFor(k){if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},append(){},focus(){},setSelectionRange(){}});return elements.get(k);}
const ctx=vm.createContext({document:{querySelector:nodeFor,querySelectorAll:()=>[],getElementById:nodeFor,addEventListener(){},body:{dataset:{},append(){}}},window:{scrollTo(){},queueCloudSave(){}},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},WebSocket:function(){},crypto:crypto.webcrypto,console,Date,Math,Intl,URL,URLSearchParams,setTimeout:()=>1,clearTimeout(){},setInterval:()=>7,clearInterval(){}});
for(const file of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','v26-progression.js','v26-story.js','gauntlet-engine.js','v20-quality.js','game-v3.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../public',file),'utf8'),ctx,{filename:file});
const run=expr=>vm.runInContext(expr,ctx);
assert(run('v26RoadPage().includes("100 STAGES")'));
assert(run('v26RoadPage().includes("STAGE 1")'));
assert(run('v26RoadPage().includes("STAGE 5")'));
assert(run('v26RoadPage().includes("CHAPTER STORY")'));
assert(run('v26RoadPage().includes("LOCKED")'));
assert(run('questsPage().includes("progressbar")'));
assert(run('shopPage().includes("ELITE 10%")'));
assert(run('shopPage().includes("APEX 1%")'));
assert(run('raidPage().includes("CREATE RAID LOBBY")'));
assert(run('duelPage().includes("ONE DRAFT. ONE DUEL.")'));
assert(run('squadPage().includes("SAME-TEAM RIVALRIES")'));
assert(run('bondOfferPreview([CATALOG.find(c=>c.name==="Tobio Kageyama"&&c.stage===0)],CATALOG.find(c=>c.name==="Shoyo Hinata"&&c.stage===0)).includes("104")'));
const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
assert(html.indexOf('v26-progression.js')<html.indexOf('game-v3.js'));
assert(html.includes('v26-overhaul.css'));
const renderer=fs.readFileSync(path.join(__dirname,'../public/v22-arena3d.js'),'utf8');
for(const key of ['const joint=','const ellipsoid=','cameraMode=\'cinematic\'','action===\'dig\'','action===\'set\'','action===\'spike\''])assert(renderer.includes(key),key);
console.log('PASS V26: per-character duo & same-team rivalry stats, scout preview, 10%/1% pity, 100 locked Nationals stages, raid shared squads/authority, quests, 3D articulated rigs, preserved standard duels.');
