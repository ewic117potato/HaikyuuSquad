'use strict';
// The match server owns rally outcomes; browsers receive the same generated event.
const Links=require('../public/team-chemistry.js');
const STYLES={balanced:[1,1,1],power:[1.16,.90,.96],iron:[.91,1.17,.98],tempo:[1.05,.95,1.12]};
const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
const PICK=['THUNDER SPIKE','LIGHTNING QUICK','CROSS-COURT ROCKET','PERFECT IRON WALL','JUMP SERVE ACE','MIRACLE DIG','PHANTOM DECOY','BACK-ROW ATTACK'];
const LEGACY_PAIRS=[['Shoyo Hinata','Tobio Kageyama',7],['Shoyo Hinata','Kenma Kozume',5],['Kotaro Bokuto','Keiji Akaashi',7],['Tetsuro Kuroo','Kenma Kozume',6],['Atsumu Miya','Osamu Miya',7],['Toru Oikawa','Hajime Iwaizumi',7],['Kotaro Bokuto','Tetsuro Kuroo',5],['Kei Tsukishima','Tetsuro Kuroo',6],['Shoyo Hinata','Kotaro Bokuto',5],['Shoyo Hinata','Atsumu Miya',8],['Tobio Kageyama','Toru Oikawa',5],['Shoyo Hinata','Korai Hoshiumi',7],['Kiyoomi Sakusa','Atsumu Miya',6],['Wakatoshi Ushijima','Tobio Kageyama',6]];
const safeName=x=>String(x||'ATHLETE').replace(/[^\w \-]/g,'').trim().slice(0,34)||'ATHLETE';
function sanitizeSquad(squad){
 if(!Array.isArray(squad)||squad.length!==6)return [];
 const allowed=['S','OH','MB','OP','L'];const slots=['OH','MB','OP','MB/L','OH','S'];
 const sanitized=squad.map((x,i)=>({
   name:safeName(x?.name),id:String(x?.id||'').slice(0,80),
   power:clamp(Number(x?.power)||65,60,115),attack:clamp(Number(x?.attack)||65,60,115),
   defense:clamp(Number(x?.defense)||65,60,115),set:clamp(Number(x?.set)||65,60,115),
   position:allowed.includes(x?.position)?x.position:slots[i],slot:slots[i],awakening:clamp(Number(x?.awakening)||0,0,6),
   school:String(x?.school||'Unknown').replace(/[^\w \-]/g,'').slice(0,32)
 }));
 const unique=new Set(sanitized.map(x=>x.name.toLowerCase()));
 return unique.size===6?sanitized:[];
}
function teamwork(squad){const links=Links.evaluate(squad);let aligned=0;
 for(const c of squad)if(c.position===c.slot||(c.slot==='MB/L'&&['MB','L'].includes(c.position)))aligned++;
 return {schoolBonus:links.schoolBonus,duoBonus:links.linkBonus,
  duoOnlyBonus:links.duoBonus,rivalryBonus:links.rivalryBonus,links:links.links,
  aligned,topSchool:links.main[0]};
}
function mean(squad,key){return squad.reduce((a,c)=>a+c[key],0)/Math.max(1,squad.length);}
function teamScore(player,rally){const squad=player.squad;const s=STYLES[player.strategy]||STYLES.balanced;
 const sy=teamwork(squad),fatigue=Math.max(0,rally-17)*.055;
 const strength=clamp(Number(player.coachBuff)||0,0,18);
 const schoolMatch=player.coachSchool===sy.topSchool?3:0;
 const kind=player.coachType;
 const atk=mean(squad,'attack')*.48*s[0]*(kind==='attack'?1+strength/100:1);
 const def=mean(squad,'defense')*.34*s[1]*(kind==='defense'?1+strength/100:1);
 const set=mean(squad,'set')*.18*s[2]*(kind==='setting'?1+strength/100:1);
 const extra=(kind==='chemistry'?strength*.55:kind==='strategy'?strength*.42:kind==='focus'?strength*.25:kind==='speed'?strength*.25:kind==='energy'?strength*.25:strength*.12);
 const awaken=Math.min(12,squad.reduce((sum,c)=>sum+(c.awakening||0),0)*.45);
 return atk+def+set+sy.schoolBonus*.32+sy.duoBonus*.36+sy.aligned*.24+extra+schoolMatch*.18+awaken-fatigue;
}
function chooseRally(room,rng=Math.random){
 const players=room.players;
 const chance=clamp(.5+(teamScore(players[0],room.rally)-teamScore(players[1],room.rally))*.012,.11,.89);
 const winner=rng()<chance?0:1;
 const team=players[winner].squad;
 const eligible=team.filter(x=>['OH','OP','MB'].includes(x.position));
 const actor=(eligible.length?eligible:team)[Math.floor(rng()*(eligible.length||team.length))];
 const setter=team.find(x=>x.position==='S')||team[5];
 const action=PICK[Math.floor(rng()*PICK.length)];
 room.rally++;room.score[winner]++;
 const event={type:'rally',rally:room.rally,winner,score:room.score.slice(),
   action,actor:actor.name,setter:setter.name,highlight:rng()<.3,
   message:action==='PERFECT IRON WALL'?`${actor.name} shuts down the angle with a monster block!`:
     action==='MIRACLE DIG'?`${setter.name} sets after a desperate defensive recovery!`:
     `${setter.name} sets for ${actor.name}: ${action}!`,
   strategies:players.map(p=>p.strategy),timestamp:Date.now(),serve:room.rally%2,
   chance:+chance.toFixed(3)};
 if(room.boxScore){room.boxScore[winner][actor.name]=(room.boxScore[winner][actor.name]||0)+1;}
 if(action.includes('ACE'))room.stats[winner].aces++;
 else if(action.includes('WALL'))room.stats[winner].blocks++;
 else if(action.includes('DIG'))room.stats[winner].digs++;
 else room.stats[winner].spikes++;
 return event;
}
function isFinished(room){return (Math.max(...room.score)>=15&&Math.abs(room.score[0]-room.score[1])>=2)||room.rally>=45;}
module.exports={STYLES,sanitizeSquad,teamwork,teamScore,chooseRally,isFinished,clamp};
