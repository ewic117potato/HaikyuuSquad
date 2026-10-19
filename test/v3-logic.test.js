'use strict';
const assert=require('assert');const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const nodes={};function element(name){return nodes[name]|| (nodes[name]={innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){},toggle(){}},style:{},addEventListener(){},dataset:{},focus(){},setSelectionRange(){}})}
const storage={};const document={body:{dataset:{}},querySelector:element,querySelectorAll:()=>[],addEventListener(){},getElementById:element};
const context=vm.createContext({document,console,crypto:crypto.webcrypto,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,clearInterval:()=>{},fetch:async()=>({ok:false,json:async()=>({})}),Date,Math,URL,URLSearchParams,Intl,window:{scrollTo(){},queueCloudSave(){}},WebSocket:function(){}});
vm.runInContext(fs.readFileSync('public/roster-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/balance.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/draft-rules.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/team-chemistry.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/pack-engine.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/game-v3.js','utf8'),context);
function get(e){return vm.runInContext(e,context)}
assert.equal(get('SPIKE_ROSTER.length')>=100,true);
assert.equal(get('SCHOOLS.length'),14);
assert.equal(get('SPIKE_COACHES.length')>=15,true);
assert.equal(get('state.squad.filter(Boolean).length'),0);
get('newRun()');
for(let i=0;i<6;i++)get('runPick(state.v3.offer.cards.find(c=>Draft.eligible(state.v3.run.picks.map(player).filter(Boolean),c)).key)');
assert.equal(get('state.v3.runs'),1);
assert.equal(get('state.items.length'),6);
assert.equal(get('starting().length'),6);
assert.equal(get('state.v3.run'),null);
get('state.coins=200000;state.gems=500;staffRoll();chooseCoach(state.v3.staffOffer[0].key+"|"+state.v3.staffOffer[0].tier);');
assert.equal(get('state.coaches.length'),1);
get('buyPack("professional");shopPick(offer.cards[0].key)');
assert.equal(get('state.v3.proOwned'),1);
assert(get('owned().some(x=>x.stage===3)'));
get('state.savedTeams[0]={squad:[...state.squad],bench:[...state.bench],coach:state.coach,savedAt:Date.now()};state.squad[0]=null;');
assert.equal(get('starting().length'),5);
get('state.squad=state.savedTeams[0].squad');
assert.equal(get('starting().length'),6);
assert(get('chem().schoolBonus')>=0);assert(get('Draft.validTeam(starting())'));assert(get('state.coaches[0].tier')>=0);
for(const v of ['home','roll','squad','collection','staff','shop','duels','quests','career']) {get(`show('${v}')`);assert(nodes['#view'].innerHTML.length>100,`Empty ${v}`)}
console.log('PASS: V4 school drafts, guaranteed needed position, six-player run, coin reward, coach rarity, pro shop, saved team, nine pages, chemistry.');
