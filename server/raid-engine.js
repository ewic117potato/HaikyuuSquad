'use strict';
const Chemistry=require('../public/team-chemistry');
const Tactics=require('../public/tactical-engine');
const {SPIKE_ROSTER}=require('../public/roster-data.js');
const {sanitizeSquad}=require('./match-engine');
const SLOT=['OH','MB','OP','MB/L','OH','S'];
const BOSSES={normal:{name:'DATE TECH IRON WALL',school:'DATE TECH',power:87},hard:{name:'INARIZAKI TWIN KINGS',school:'INARIZAKI',power:96},legendary:{name:'SHIRATORIZAWA ACE',school:'SHIRATORIZAWA',power:106},mythic:{name:'NATIONALS ALL-STARS',school:'FUKURODANI',power:116}};
const fits=(slot,card)=>slot==='MB/L'?['MB','L'].includes(card.position):card.position===slot;
function sharedTeam(players){
 const owners=[];const used=new Set();const sorted=players.flatMap((p,owner)=>p.squad.map(card=>({...card,owner}))).filter(c=>c&&c.name);
 for(let i=0;i<6;i++){
  const preferred=i%players.length;
  const candidate=sorted.find(c=>c.owner===preferred&&fits(SLOT[i],c)&&!used.has(c.name))||sorted.find(c=>fits(SLOT[i],c)&&!used.has(c.name));
  if(!candidate)return null;
  used.add(candidate.name);owners.push({...candidate,slot:SLOT[i]});
 }
 return owners;
}
function bossRoster(level='normal',players=2){
 const boss=BOSSES[level]||BOSSES.normal;
 const boost=Math.min(5,Math.max(0,players-2)*2);
 const pool=SPIKE_ROSTER.filter(c=>c.school===boss.school);
 const seen=new Set();return SLOT.map((position,i)=>{
  const source=pool.find(x=>!seen.has(x.name)&&fits(position,x))||pool.find(x=>!seen.has(x.name));
  if(source)seen.add(source.name);
  const name=source?.name||`All-Star #${i+1}`;
  return {name,school:boss.school,position:position==='MB/L'?'MB':position,power:boss.power+boost,attack:boss.power+boost+(position==='OH'?2:0),defense:boss.power+boost+(position==='MB'?2:0),set:boss.power+boost+(position==='S'?2:0)};
 });
}
function step(room,rng=Math.random){
 const home=Chemistry.boostedSquad(room.team),away=Chemistry.boostedSquad(room.enemy);
 const plan=Tactics.autoPlan(home,away,rng);
 const chosen=room.pendingActions||{};
 // Any ally can make a genuine tactical contribution; no need to wait for everyone.
 const values=Object.values(chosen);
 for(const action of values){if(action==='quick')plan.set='quick';if(action==='dump')plan.set='dump';if(action==='power')plan.attack='power';if(action==='tip')plan.attack='tip';if(action==='block')plan.defense='commit';if(action==='float')plan.serve='float';}
 const event=Tactics.simulate([home,away],room.score,room.rally,[0,0],{home:plan,serveSide:room.serving},rng);
 room.score[event.winner]++;room.rally++;room.serving=event.winner;
 room.pendingActions={};
 return {...event,type:'raid_rally',score:room.score.slice(),rally:room.rally,bossPhase:room.score[1]>=10?'FINAL STAND':room.score[1]>=5?'AWAKENING':'OPENING'};
}
function finished(room){return (Math.max(...room.score)>=15&&Math.abs(room.score[0]-room.score[1])>=2)||room.rally>=45;}
function reward(level,won){if(!won)return {coins:150,tickets:0,rerolls:0,gems:0};const rank=['normal','hard','legendary','mythic'].indexOf(level);return {coins:1500+rank*2600,tickets:[20,30,60,100][rank]||20,rerolls:5+rank*5,gems:10+rank*12};}
module.exports={SLOT,BOSSES,sharedTeam,bossRoster,step,finished,reward};
