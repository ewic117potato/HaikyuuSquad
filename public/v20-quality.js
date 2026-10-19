/* V20 refinements: shared, testable match presentation and save helpers.
   Game rules and odds remain defined by tactical-engine.js. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.SpikeQuality=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const SPEEDS=[1,2,4];
 const speed=(x)=>SPEEDS.includes(Number(x))?Number(x):1;
 const interval=(x)=>Math.round(1050/speed(x));
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const CHOICE_ADVICE={
  serve:{safe:'Reliable when protecting a lead.',float:'Movement may disrupt a shaky reception.',jump:'High ace potential, but a service error can cost a point.',target:'Aim at the weakest receiver; spread coverage can counter it.'},
  receive:{balanced:'Stable passing with no extreme weakness.',libero:'Best when your libero is strong at receiving.',aggressive:'Speeds up the counterattack, but risks a shaky pass.',spread:'Helps against floats and targeted serves.'},
  set:{quick:'Rewards a strong middle blocker and good setter coordination.',high:'Reliable choice that gives the outside hitter time.',back:'Uses the opposite to surprise a middle-heavy block.',dump:'A surprise second-touch attack; a prepared defender can read it.'},
  attack:{power:'High force, but blockers can commit to shut it down.',cross:'A dependable cross-court finish.',line:'Tests sideline coverage and accuracy.',tip:'Avoids committed blockers; loses to defenders covering tips.'},
  defense:{read:'Balanced coverage when the next attack is uncertain.',commit:'Best against powerful spikes; vulnerable to tips and dumps.',dig:'Protects against deep cross-court and line attacks.',cover:'Anticipates soft touches and setter dumps.'}
 };
 function recommend(phase,team=[],opponent=[]){
  const avg=(arr,key)=>arr.length?arr.reduce((s,c)=>s+(Number(c?.[key])||Number(c?.power)||75),0)/arr.length:75;
  const setter=team.find(p=>p?.position==='S');
  if(phase==='serve')return avg(team,'attack')>=92?'jump':'float';
  if(phase==='receive')return team.some(p=>p?.position==='L')?'libero':'spread';
  if(phase==='set')return setter&&Number(setter.set||setter.power)>=92&&avg(opponent,'defense')<86?'dump':team.some(p=>p?.position==='MB')?'quick':'high';
  if(phase==='attack')return avg(team,'attack')>=94?'power':'cross';
  if(phase==='defense')return avg(opponent,'attack')>=94?'commit':'read';
  return '';
 }
 const questStatus=(list,period,progress,claims)=>{
  const source=period==='weekly'?'weekly':period==='daily'?'quests':'';
  return list.reduce((a,q)=>{
   const [key,,,,target]=q;
   const done=period==='milestone'?Boolean(q[3]()):Number(progress?.[source]?.[q[3]]||0)>=target;
   if(done&&!claims?.[key])a.claimable++;
   if(claims?.[key])a.claimed++;
   a.total++;
   return a;
  },{claimable:0,claimed:0,total:0});
 };
 // Validate imports without treating browser-supplied JSON as trusted code or state.
 function safeBackup(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Not a saved game object');
  if(!Array.isArray(raw.items)||!Array.isArray(raw.squad)||!raw.v3||typeof raw.v3!=='object'||Array.isArray(raw.v3))throw Error('This file is not a compatible Haikyuu Legends save');
  if(raw.items.length>2500||raw.coaches?.length>800)throw Error('Save file exceeds collection limits');
  if(raw.squad.length!==6)throw Error('Save file has an invalid court layout');
  // Only expected top-level fields are restored; remove dangerous prototype keys.
  const allowed=['name','coins','gems','tickets','items','squad','bench','coach','manager','coaches','savedTeams','wins','losses','level','xp','trophies','rolls','career','meta','v3'];
  const data=Object.create(null);
  for(const k of allowed){if(Object.prototype.hasOwnProperty.call(raw,k))data[k]=raw[k];}
  data.name=String(data.name||'ROOKIE').replace(/[^\w -]/g,'').trim().slice(0,18)||'ROOKIE';
  for(const k of ['coins','gems','tickets','wins','losses','level','xp','trophies','rolls','career']){
   data[k]=clamp(Math.floor(Number(data[k])||0),0,1_000_000_000);
  }
  data.level=Math.max(1,data.level);
  if(!Array.isArray(data.bench))data.bench=[null,null,null,null];
  if(!Array.isArray(data.coaches))data.coaches=[];
  if(!Array.isArray(data.savedTeams))data.savedTeams=[null,null,null,null,null];
  if(!data.meta||typeof data.meta!=='object'||Array.isArray(data.meta))data.meta={};
  data.items=data.items.filter(x=>x&&typeof x==='object'&&typeof x.key==='string'&&typeof x.uid==='string').slice(0,2500);
  data.coaches=data.coaches.filter(x=>x&&typeof x==='object'&&typeof x.key==='string'&&typeof x.uid==='string').slice(0,800);
  const keep=new Set(data.items.map(x=>x.uid));
  data.squad=data.squad.map(x=>keep.has(x)?x:null);
  data.bench=data.bench.slice(0,4).map(x=>keep.has(x)?x:null);
  while(data.bench.length<4)data.bench.push(null);
  data.savedTeams=data.savedTeams.slice(0,5).map(t=>t&&typeof t==='object'?{
   squad:Array.isArray(t.squad)?t.squad.slice(0,6).map(x=>keep.has(x)?x:null):[null,null,null,null,null,null],
   bench:Array.isArray(t.bench)?t.bench.slice(0,4).map(x=>keep.has(x)?x:null):[null,null,null,null],
   coach:t.coach||null,manager:t.manager||null,savedAt:Number(t.savedAt)||0
  }:null);
  while(data.savedTeams.length<5)data.savedTeams.push(null);
  data.v3=Object.fromEntries(Object.entries(data.v3).filter(([k])=>k!=='__proto__'&&k!=='constructor'&&k!=='prototype'));
  // Preserve current economy and completed quests; no import can execute content.
  data.savedAt=Date.now();
  return data;
 }
 return {CHOICE_ADVICE,recommend,speed,interval,questStatus,safeBackup};
});
