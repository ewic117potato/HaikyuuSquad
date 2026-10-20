'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const T=require('../public/tactical-engine.js'),G=require('../public/v22-arena3d.js'),M=require('../server/match-engine.js');
const roles=['OH','MB','OP','MB','OH','S'];
const team=(prefix,power)=>roles.map((position,i)=>({name:`${prefix}-${i}`,position,school:prefix,power,attack:power,set:power+(position==='S'?7:0),defense:power}));
const A=team('KARASUNO',90),B=team('NEKOMA',88);
assert.deepEqual(T.ZONES,[1,2,3,4,5,6]);
assert.equal(T.aim('abc'),4);assert.equal(T.aim('6'),6);assert.equal(T.aim(99),4);
assert.deepEqual(G.xyzZone(0,4),[-2.8,.28,-2.55]);assert.deepEqual(G.xyzZone(1,1),[2.8,.28,6]);
assert.notDeepEqual(G.athleteXYZ(0,0),G.athleteXYZ(1,0));
for(const cam of ['broadcast','side','top']){let hits=0;for(let x=0;x<11;x++)for(let y=0;y<11;y++){const z=G.zoneAtScreen(x/10,y/10,0,cam,16/9);if(z!==null){hits++;assert(z>=1&&z<=6);}}assert(hits>0,`No targetable tiles with ${cam} camera`);}
function rng(seed){return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};}
const choice={home:{serve:'target',serveZone:6,set:'high',setTo:4,attack:'line',attackZone:5,defense:'read'},away:{serve:'safe',serveZone:1}};
let seenTarget=false,seenHitter=false;
for(let i=0;i<50;i++){
 const e=T.simulate([A,B],[3,5],i,[4,5],{...choice,serveSide:i%2},rng(i+10));
 assert([0,1].includes(e.winner));assert(Array.isArray(e.beats)&&e.beats.length);
 assert(e.beats[0].kind==='serve');assert([1,2,3,4,5,6].includes(e.beats[0].zone));
 assert(e.phases.some(x=>/serve/.test(x)));
 assert(e.beats.every(b=>Number.isInteger(b.side)&&b.zone>=1&&b.zone<=6&&typeof b.name==='string'));
 const anim=G.setupTracks(e,[A,B]);assert(anim.length===e.beats.length);
 assert(anim.every(seg=>seg.from.length===3&&seg.to.length===3&&seg.from.every(Number.isFinite)));
 if(e.serve===0){assert.equal(e.serveZone,6);seenTarget=true;}
 if(e.beats.some(b=>b.kind==='spike'&&b.name===A[4].name))seenHitter=true;
}
assert(seenTarget,'Manual serve target was ignored');assert(seenHitter,'Chosen attacker never performed a spike');
const room={players:[{squad:A,strategy:'balanced',coachBuff:0,coachSchool:'KARASUNO'},{squad:B,strategy:'balanced',coachBuff:0,coachSchool:'NEKOMA'}],score:[0,0],serving:0,rally:0,boxScore:[{},{}],stats:[{aces:0,blocks:0,digs:0,spikes:0},{aces:0,blocks:0,digs:0,spikes:0}]};
const live=M.chooseRally(room,rng(45),{home:{serve:'target',serveZone:2,setTo:4,attackZone:5}});
assert.equal(live.serveZone,2);assert(live.beats.length);assert.equal(live.type,'rally');
// Browser event wiring is preserved for full-control and auto mode, without Node installed on the user's PC.
const s={};const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){}},dataset:{},style:{},setAttribute(){},addEventListener(){},focus(){},setSelectionRange(){},appendChild(){}});return elements.get(id);};
const fake={document:{querySelector:el,querySelectorAll:()=>[],getElementById:el,body:{dataset:{},appendChild(){}},addEventListener(){}},window:{scrollTo(){},queueCloudSave(){},matchMedia(){return {matches:true}}},localStorage:{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=v},navigator:{},location:{search:'',origin:'http://localhost'},WebSocket:function(){},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},crypto:crypto.webcrypto,console,Date,Math,URL,URLSearchParams,Intl,DuelV16:{intro:(_r,_n,cb)=>cb(),cleanup(){}},SpikeTactics:T};
const context=vm.createContext(fake),base=__dirname+'/../public/';
for(const f of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','gauntlet-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync(base+f,'utf8'),context,{filename:f});
const run=x=>vm.runInContext(x,context);
const picks=[];for(let role of roles){const card=run(`BASE_CATALOG.find(c=>c.stage===0&&c.position==='${role}'&&!${JSON.stringify(picks.map(x=>x.name))}.includes(c.name))`);assert(card);picks.push(card);}
for(const c of picks)run(`addCard(${JSON.stringify(c.key)})`);
run(`state.squad=[${picks.map(c=>`state.items.find(x=>x.key===${JSON.stringify(c.key)}).uid`).join(',')}];`);
run("changeTacticalMode('manual')");run('botMatch(70)');
assert(el('#modal').innerHTML.includes('id="v22Match3D"'),'3D viewport missing from match UI');
assert(el('#modal').innerHTML.includes('data-v="aimZone"'),'target zone buttons missing');
run("duel.aim.serveZone=1;duel.plan.serveZone=1");run("tacticChoose('serve','target')");
run("duel.aim.setTo=4;duel.plan.setTo=4");run("tacticChoose('set','high')");
assert(el('#modal').innerHTML.includes('data-v="aimZone"'));
run("duel.aim.attackZone=5;duel.plan.attackZone=5");run("tacticChoose('attack','power')");run("tacticChoose('defense','commit')");
assert.equal(run('duel.rally'),1);assert.equal(run('duel.events[0].serveZone'),1);
assert.equal(run('duel.events[0].beats.length')>0,true);assert(run('duel.showOutcome'));
const html=fs.readFileSync(base+'index.html','utf8'),preview=fs.readFileSync(base+'arena-preview.html','utf8');
assert(html.includes('v22-arena3d.js'));assert(html.includes('v22-3d.css'));assert(html.includes('arena-preview.html'));assert(preview.includes('v22Match3D'));
console.log('PASS V22: 3 WebGL camera modes, court raycasting, six target zones, server-authoritative location odds, attacker selection, real 3D rally trajectories, manual match target controls and offline demo.');
