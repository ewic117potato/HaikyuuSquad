'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const T=require('../public/tactical-engine.js');const store={},elements=new Map();
function nodeFor(key){if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(){},focus(){},setSelectionRange(){},append(){}});return elements.get(key);}
const ctx=vm.createContext({document:{querySelector:nodeFor,querySelectorAll:()=>[],getElementById:nodeFor,addEventListener(){},body:{dataset:{},appendChild(){}}},window:{scrollTo(){},queueCloudSave(){}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},WebSocket:function(){},crypto:crypto.webcrypto,console,Date,Math,Intl,URL,URLSearchParams,setTimeout:()=>1,clearTimeout(){},setInterval:()=>7,clearInterval(){},DuelV16:{intro:(_a,_b,done)=>done(),cleanup(){}},SpikeTactics:T});
for(const file of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','gauntlet-engine.js','v20-quality.js','game-v3.js'])vm.runInContext(fs.readFileSync(__dirname+'/../public/'+file,'utf8'),ctx,{filename:file});
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('Quality.speed(4)'),4);
assert.equal(run('Quality.interval(4)'),263);
run('state.v3.quests.picks=15;state.v3.quests.runs=4;tab="daily";');
const before=run('state.tickets');run('claimAllQuests()');const after=run('state.tickets');assert(after>before,'complete daily quests should grant rolls');
const once=run('Object.keys(state.v3.claimed).length');run('claimAllQuests()');assert.equal(run('Object.keys(state.v3.claimed).length'),once,'quest rewards claim once');
const pro=run('CATALOG.find(c=>c.stage===3&&c.power>100)');assert(pro,'there should be 100+ OVR professional cards');
assert.equal(run(`asRoster([CATALOG.find(c=>c.key===${JSON.stringify(pro.key)})])[0].power`),Math.min(115,pro.power));
run('state.v3.autoSpeed=4;state.v3.fastReveals=true;save()');
const saved=JSON.parse(store['spike-legends-save-v1']);assert.equal(saved.v3.autoSpeed,4);assert(saved.v3.fastReveals);
const files=fs.readFileSync(__dirname+'/../public/index.html','utf8');assert(files.includes('v20-refined.css'));assert(files.indexOf('v20-quality.js')<files.indexOf('game-v3.js'));
console.log('PASS V20 game: claim-all idempotence, 100+ Pro OVR kept, speed/reveal preferences save, new client assets load in order.');
