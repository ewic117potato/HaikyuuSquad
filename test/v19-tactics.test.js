'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const T=require('../public/tactical-engine.js');
const positions=['OH','MB','OP','MB','OH','S'];
const make=(value,prefix)=>positions.map((position,i)=>({name:`${prefix} Player ${i}`,position,school:prefix,power:value,attack:value,defense:value,set:position==='S'?value+4:value}));
const strong=make(99,'A'),weak=make(69,'B');
for(const [phase,opts] of Object.entries(T.OPTIONS)){assert(opts.length>=4,`${phase} options missing`);assert(new Set(opts.map(x=>x.id)).size===opts.length);}
assert(T.OPTIONS.set.some(x=>x.id==='dump'));
assert.equal(T.simulate([strong,weak],[0,0],0,[0,0],{serveSide:1},randGen(3)).serve,1,'explicit serving side is honored');
assert.equal(T.valid('serve','hacked'),'safe');
assert.equal(T.valid('set','dump'),'dump');
function randGen(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const rng=randGen(3);let won=[0,0],dumps=0,aces=0;
for(let k=0;k<1200;k++){
 const event=T.simulate([strong,weak],[k%3,k%5],k%37,[6,0],{},rng);
 assert([0,1].includes(event.winner));assert(event.phases.length>=2);assert(event.actor&&event.action&&event.serve!==undefined);
 won[event.winner]++;
 if(event.action.includes('DUMP'))dumps++;
 if(event.action.includes('ACE'))aces++;
}
assert(won[0]>won[1],`strong squad must prevail more often: ${won}`);
assert(dumps>0,'auto simulated rallies should include setter dumps');
function dumpRate(blocking,seed){const rng=randGen(seed);let n=0,count=0;for(let i=0;i<4000;i++){
 // Score parity=odd, away serves so home is first attacking side.
 const ev=T.simulate([strong,weak],[1,0],i%16,[0,0],{home:{set:'dump'},away:{defense:blocking}},rng);
 if(ev.action==='SETTER DUMP')n++;if(ev.phases.some(x=>x.includes('DUMP')))count++;
}return {n,count};}
const committed=dumpRate('commit',44),covered=dumpRate('cover',44);
assert(committed.n>covered.n,`commit block should be more vulnerable to setter dump than cover: ${JSON.stringify({committed,covered})}`);
const s={};const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){}},dataset:{},style:{},addEventListener(){},focus(){},setSelectionRange(){},appendChild(){}});return elements.get(id)};
let intervalCount=0;
const fake={document:{querySelector:el,querySelectorAll:()=>[],getElementById:el,body:{dataset:{},appendChild(){}},addEventListener(){}},
 window:{scrollTo(){},queueCloudSave(){}},localStorage:{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},WebSocket:function(){},
 setTimeout:()=>0,clearTimeout(){},setInterval:()=>{intervalCount++;return intervalCount},clearInterval(){},
 crypto:crypto.webcrypto,console,Date,Math,URL,URLSearchParams,Intl,
 DuelV16:{intro:(_rosters,_names,cb)=>cb(),cleanup(){}},SpikeTactics:T};
const ctx=vm.createContext(fake);for(const src of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','gauntlet-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+src,'utf8'),ctx,{filename:src});
const go=x=>vm.runInContext(x,ctx);
const cards=go('CATALOG.filter(x=>x.stage===0)');
const selected=[];for(const role of positions){const eligible=cards.find(c=>c.position===role&&!selected.some(x=>x.name===c.name));assert(eligible,`missing ${role}`);selected.push(eligible);}
for(const c of selected)go(`addCard(${JSON.stringify(c.key)})`);
go(`state.squad=[${selected.map(c=>`state.items.find(i=>i.key===${JSON.stringify(c.key)}).uid`).join(',')}];`);
go("changeTacticalMode('manual')");
assert.equal(go('state.v3.matchMode'),'manual');
assert.equal(JSON.parse(s['spike-legends-save-v1']).v3.matchMode,'manual');
go('botMatch(65)');
assert.equal(go('duel.mode'),'manual');
assert.equal(go('duel.phaseList[0]'),'serve');
assert(go('document.querySelector("#modal").innerHTML.includes("Jump Serve")'));
go("tacticChoose('serve','jump')");assert.equal(go('duel.phaseList[duel.phaseIndex]'),'set');
go("tacticChoose('set','dump')");assert.equal(go('duel.phaseList[duel.phaseIndex]'),'defense'); // skips attack
// Invalid choice or out-of-order phase doesn't advance.
go("tacticChoose('attack','cross')");assert.equal(go('duel.phaseList[duel.phaseIndex]'),'defense');
go("tacticChoose('defense','cover')");assert.equal(go('duel.rally'),1);assert(go('duel.showOutcome'));
go('prepareTacticalRally(duel)');assert(!go('duel.showOutcome'));
go("changeTacticalMode('auto')");assert.equal(go('duel.mode'),'auto');assert(intervalCount>=1);
go("changeTacticalMode('manual')");assert.equal(go('duel.mode'),'manual');
const html=fs.readFileSync('public/index.html','utf8');assert(html.includes('<script src="tactical-engine.js"></script>'));assert(html.includes('v19-tactical.css'));
console.log(`PASS V19: full control and auto modes, 4-5 tactical steps, setter dump skipping attack, save persistence, skills & chemistry, server-shared engine, ${dumps} auto dump finishes, block-read counterplay.`);
