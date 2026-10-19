'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const R=require('../public/roster-data.js'),B=require('../public/balance.js'),D=require('../public/draft-rules.js'),P=require('../public/pack-engine.js');
const Link=require('../public/team-chemistry.js'),Engine=require('../server/match-engine.js');
const school=R.SPIKE_ROSTER.filter(c=>!c.proOnly);
assert.equal(R.SPIKE_SCHOOL_TEAMS.length,10);
assert.deepEqual([...R.SPIKE_SECONDARY_TEAMS],['NOHEBI','JOHZENJI','TSUBAKIHARA','TOKONAMI']);
assert.equal(new Set(school.map(c=>c.school)).size,14);
assert(!school.some(c=>/GIRLS|KITAGAWA|YUKIGAOKA/.test(c.school)));
const get=(name,stage=0)=>{const i=R.SPIKE_ROSTER.findIndex(x=>x.name===name&&!x.proOnly);assert(i>=0,name);return B.buildCard(R.SPIKE_ROSTER[i],i,stage)};
for(const [name,expected] of [['Shoyo Hinata',92],['Tobio Kageyama',96],['Kotaro Bokuto',96],['Wakatoshi Ushijima',99],['Kenma Kozume',89],['Kiyoomi Sakusa',97],['Korai Hoshiumi',97]])assert.equal(get(name).power,expected,name);
assert.equal(get('Shoyo Hinata',1).power,95);
assert.equal(get('Shoyo Hinata',2).power,100);
assert.equal(get('Tobio Kageyama',1).power,99);
assert.equal(B.PRO_OVERRIDES['Wakatoshi Ushijima'],105);
assert.equal(B.PRO_OVERRIDES['Tobio Kageyama'],104);
const h=get('Shoyo Hinata'),k=get('Tobio Kageyama'),kn=get('Kenma Kozume');
const one=Link.evaluate([h,k]);assert.equal(one.schoolBonus,1);assert(one.links.some(x=>x.label==='Freak Quick'));assert.equal(one.linkBonus,3);
const two=Link.evaluate([h,k,kn]);assert(two.links.some(x=>x.label==='Garbage Dump Rivalry'));assert(two.rivalryBonus>=3);
const full=['Shoyo Hinata','Tobio Kageyama','Kei Tsukishima','Yu Nishinoya','Daichi Sawamura','Asahi Azumane'].map(get);
assert.equal(Link.evaluate(full).schoolBonus,5);
assert.equal(Engine.teamwork(full.map((c,i)=>({...c,slot:['MB','S','MB','L','OP','OH'][i]}))).schoolBonus,5);
const synergy=Link.evaluate([...full,kn]);assert(synergy.linkBonus<=12);
// Normal draft is school-only. Before region clearing, unlocked schools do not appear.
for(let progress=0;progress<6;progress++){
 const party=[];
 for(let round=0;round<6;round++){
  const off=D.makeOffer({roster:R.SPIKE_ROSTER,existing:party,allowedSchools:R.SPIKE_SCHOOL_TEAMS,
   cardFromIndex:(i,v)=>B.buildCard(R.SPIKE_ROSTER[i],i,0),rand:Math.random});
  assert(R.SPIKE_SCHOOL_TEAMS.includes(off.school));
  assert(off.cards.every(x=>x.stage===0&&x.school===off.school));
  assert.equal(new Set(off.cards.map(x=>x.name)).size,off.cards.length);
  const eligible=off.cards.find(x=>D.eligible(party,x));assert(eligible);party.push(eligible);
 }
 assert(D.validTeam(party));
}
const secondary=D.makeOffer({roster:R.SPIKE_ROSTER,targetSchool:'NOHEBI',allowedSchools:['NOHEBI'],
 cardFromIndex:(i,v)=>B.buildCard(R.SPIKE_ROSTER[i],i,0),rand:Math.random});
assert.equal(secondary.school,'NOHEBI');
const all=JSON.parse(fs.readFileSync('public/cards/catalog.json'));
assert.equal(all.cards.length,336);assert.equal(all.staff.length,156);
assert.equal(new Set([...all.cards,...all.staff].map(c=>c.key)).size,492);
assert.equal(all.cards.find(x=>x.key==='0-0').power,92);
for(const c of [...all.cards,...all.staff]){
 const path='public/'+c.file;assert(fs.existsSync(path),path);
 const buf=fs.readFileSync(path);assert.equal(buf.subarray(0,4).toString(),'RIFF');assert(buf.length>2000);
}
const html=fs.readFileSync('public/index.html','utf8');assert(html.includes('team-chemistry.js')&&html.includes('v14-rivalry.css'));
assert(fs.readFileSync('public/game-v3.js','utf8').includes('homeSpotlights()'));
assert(fs.readFileSync('server/match-engine.js','utf8').includes("require('../public/team-chemistry.js')"));
// Confirm region progression gates (don't require the multiplayer database).
const storage={};const nodes={};const el=k=>nodes[k]||(nodes[k]={innerHTML:'',value:'',textContent:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},focus(){},setSelectionRange(){}});
const context=vm.createContext({document:{querySelector:el,querySelectorAll:()=>[],body:{dataset:{}},addEventListener(){}},console,crypto:crypto.webcrypto,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},Date,Math,URL,URLSearchParams,Intl,window:{scrollTo(){},queueCloudSave(){}},navigator:{},location:{search:'',origin:'http://localhost'},setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},fetch:async()=>({ok:false,json:async()=>({})}),WebSocket:function(){}});
for(const filename of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+filename,'utf8'),context,{filename});
const run=e=>vm.runInContext(e,context);
assert.equal(run('unlockedSchools().length'),10);
for(const [value,count] of [[2,11],[4,12],[6,13],[8,14]]){run('state.career='+value);assert.equal(run('unlockedSchools().length'),count);}
run('state.career=0');assert(run('home().includes("UNLOCK MORE SCHOOLS")'));assert(run('homeSpotlights().includes("PROFESSIONAL LEAGUE")'));assert(run('squadPage().includes("CHEMISTRY & RIVALRY")'));
assert(run('CATALOG.filter(c=>c.stage===0).every(c=>!c.proOnly)'));
assert(run('QUEST_LEGENDS.every(c=>c.questOnly&&c.stage===4)'));
console.log('PASS V14: school Hinata 92, 14 real school rosters, stage-specific ratings, shared rivalry chemistry, region unlocks, school-only drafts, 492 card files, dashboard and saved-team UI.');
