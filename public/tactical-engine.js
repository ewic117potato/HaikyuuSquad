/* Haikyuu Legends V19 — optional full-control volleyball rallies.
   Pure deterministic simulation, shared by browser and server. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SpikeTactics=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
 // Shared card relationships activate real setter-to-hitter plays, not team-only text buffs.
 const Bonds=(typeof globalThis!=='undefined'&&globalThis.SpikeChemistry)||(typeof require==='function'?require('./team-chemistry.js'):null);
 const ZONES=[1,2,3,4,5,6];const aim=x=>{const n=Number(x);return Number.isInteger(n)&&n>=1&&n<=6?n:4;};
 const OPTIONS={
  serve:[
   {id:'safe',name:'Safe Serve',icon:'🛡️',hint:'Most reliable · low ace pressure'},
   {id:'float',name:'Float Serve',icon:'🌪️',hint:'Moving ball · disrupts receiving'},
   {id:'jump',name:'Jump Serve',icon:'⚡',hint:'Powerful ace attempt · higher error risk'},
   {id:'target',name:'Targeted Serve',icon:'🎯',hint:'Attack their weakest receiver'}],
  receive:[
   {id:'balanced',name:'Balanced Receive',icon:'👐',hint:'Steady passing and positioning'},
   {id:'libero',name:'Libero Focus',icon:'🛡️',hint:'Feed powerful serves to your libero'},
   {id:'aggressive',name:'Aggressive Pass',icon:'🚀',hint:'Quick transition · more mistakes'},
   {id:'spread',name:'Spread Formation',icon:'↔️',hint:'Cover targeted and float serves'}],
  set:[
   {id:'quick',name:'Quick Set',icon:'💨',hint:'Fast middle attack · rewards chemistry'},
   {id:'high',name:'High Set',icon:'🏐',hint:'Safe high ball for an outside hitter'},
   {id:'back',name:'Back Set',icon:'🔁',hint:'Surprise the block with the opposite'},
   {id:'dump',name:'Setter Dump',icon:'🃏',hint:'Setter attacks on second touch · risky surprise'}],
  attack:[
   {id:'power',name:'Power Spike',icon:'💥',hint:'Huge force · harder to control'},
   {id:'cross',name:'Cross Court',icon:'↗️',hint:'Reliable angled spike'},
   {id:'line',name:'Line Shot',icon:'📏',hint:'Aim along the sideline'},
   {id:'tip',name:'Tip / Feint',icon:'🤫',hint:'Soft attack to empty court'}],
  defense:[
   {id:'read',name:'Read & React',icon:'👁️',hint:'Balanced blocks and floor coverage'},
   {id:'commit',name:'Commit Block',icon:'🧱',hint:'Stops power · vulnerable to dumps'},
   {id:'dig',name:'Deep Dig',icon:'🛟',hint:'Better coverage of sharp attacks'},
   {id:'cover',name:'Cover Tips',icon:'✋',hint:'Anticipate setter dumps and soft shots'}]
 };
 const DEFAULTS={serve:'safe',receive:'balanced',set:'high',attack:'cross',defense:'read'};
 const valid=(phase,id)=>OPTIONS[phase]?.some(o=>o.id===id)?id:DEFAULTS[phase];
 const stat=(player,key)=>clamp(Number(player?.[key])||Number(player?.power)||75,50,135);
 const avg=(arr,key)=>arr.reduce((n,p)=>n+stat(p,key),0)/Math.max(1,arr.length);
 const one=(arr,random)=>arr[Math.floor(clamp(random(),0,0.999999)*arr.length)]||arr[0];
 const setter=team=>team.find(x=>x.position==='S')||team[5]||team[0];
 const receiver=team=>team.find(x=>x.position==='L')||team.reduce((a,b)=>stat(a,'defense')>=stat(b,'defense')?a:b,team[0]);
 const blocker=team=>team.filter(x=>x.position==='MB').sort((a,b)=>stat(b,'defense')-stat(a,'defense'))[0]||team[1]||team[0];
 const attacker=(team,style,rand)=>{
  const positions=style==='quick'?['MB']:style==='back'?['OP']:['OH','OP'];
  const list=team.filter(p=>positions.includes(p.position));
  return one(list.length?list:team.filter(p=>p.position!=='S'&&p.position!=='L'),rand)||setter(team);
 };
 function autoPlan(team=[],other=[],rng=Math.random){
  const s=setter(team);const mb=team.filter(x=>x.position==='MB');const bestAttack=avg(team,'attack'),bestSet=stat(s,'set');
  const serve=bestAttack>91&&rng()<.43?'jump':rng()<.30?'float':rng()<.32?'target':'safe';
  const receive=team.some(p=>p.position==='L')?'libero':'balanced';
  const set=bestSet>=88&&rng()<.09?'dump':mb.length&&bestSet>83&&rng()<.45?'quick':rng()<.25?'back':'high';
  const attack=bestAttack>93&&rng()<.47?'power':rng()<.18?'tip':'cross';
  const defense=other.some(p=>stat(p,'attack')>=95)&&rng()<.35?'commit':rng()<.21?'cover':'read';
  return {serve,receive,set,attack,defense};
 }
 function plan(input){const out={};for(const p of Object.keys(OPTIONS))out[p]=valid(p,input?.[p]);for(const p of ['serveZone','attackZone'])out[p]=aim(input?.[p]);out.setTo=Number.isInteger(input?.setTo)&&input.setTo>=0&&input.setTo<6?input.setTo:null;out.timingQuality=clamp(Number(input?.timingQuality)||0,-1,1);return out;}
 function simulate(rosters,score=[0,0],rally=0,chemistry=[0,0],choices={},rng=Math.random){
  if(!Array.isArray(rosters)||rosters.length!==2||rosters.some(t=>!Array.isArray(t)||!t.length))throw new Error('Two nonempty rosters required');
  const teams=rosters, server=choices.serveSide===0||choices.serveSide===1?choices.serveSide:(score[0]+score[1])%2, receiverIndex=1-server;
  const p=[plan({...autoPlan(teams[0],teams[1],rng),...(choices.home||{})}),plan({...autoPlan(teams[1],teams[0],rng),...(choices.away||{})})];
  let special=null;const phases=[],beats=[],squadServ=teams[server],squadRec=teams[receiverIndex];
  const serving=one(squadServ,rng),servingSet=setter(squadServ);
  const style=p[server].serve;
  // Targeted serves genuinely seek the weakest receiver unless a coverage scheme protects them.
  const recvStyle=p[receiverIndex].receive;
  const rec=style==='target'&&!['libero','spread'].includes(recvStyle)?squadRec.reduce((a,b)=>stat(a,'defense')<=stat(b,'defense')?a:b,squadRec[0]):receiver(squadRec);
  const receiverRating=stat(rec,'defense')+(p[receiverIndex].receive==='libero'?4:0)+(p[receiverIndex].receive==='spread'&&['target','float'].includes(style)?5:0);
  const power=stat(serving,'attack')*.45+stat(serving,'set')*.55;
  const opponentChem=(Number(chemistry[receiverIndex])||0)*.20;
  const serveError=clamp(({safe:.01,float:.035,jump:.105,target:.05})[style]-(power-85)*.001-p[server].timingQuality*.023,.005,.23);
  let winner,actor=serving,action='',setterName=servingSet.name||'Setter',defender=rec,method='serve';
  beats.push({kind:'serve',side:server,name:serving.name||'Player',zone:p[server].serveZone});
  phases.push(`${serving.name||'Player'} prepares a ${OPTIONS.serve.find(x=>x.id===style).name.toLowerCase()}`);
  if(rng()<serveError){winner=receiverIndex;action='SERVICE ERROR';phases.push(`${serving.name} misses the ${style} serve — point to the receivers`);}
  else {
   const aceBase=({safe:.025,float:.065,jump:.115,target:.085})[style];
   const serveZone=p[server].serveZone;const serveCorner=[0,2,6,8].includes(serveZone);
   const ace=clamp(aceBase+(power-receiverRating-opponentChem)*.003+(serveCorner?.012:0)-(serveZone===4?.01:0)+p[server].timingQuality*.055,.012,.23);
   if(rng()<ace){winner=server;action=style==='jump'?'JUMP SERVE ACE':style==='float'?'FLOAT SERVE ACE':'SERVICE ACE';phases.push(`${rec.name} is beaten by the serve — ACE!`);}
   else{
    beats.push({kind:'dig',side:receiverIndex,name:rec.name||'Receiver',zone:4});
    phases.push(`${rec.name} receives ${style==='jump'?'a powerful jump serve':'the serve'}`);
    let attacking=receiverIndex,defending=server;
    const servePressure=style==='jump'?3:style==='float'?2:style==='target'?3:0;
    let finished=false;
    for(let exchange=0;exchange<3&&!finished;exchange++){
     const side=p[attacking],defence=p[defending],setterP=setter(teams[attacking]),block=blocker(teams[defending]);
     setterName=setterP?.name||'Setter';defender=block;
     const chemistryBoost=clamp(Number(chemistry[attacking])||0,0,30)*.25;
     const defenderChem=clamp(Number(chemistry[defending])||0,0,30)*.25;
     const fatigue=Math.max(0,rally-13)*.13;
     if(side.set==='dump'){
      actor=setterP;method='dump';
      const dumpChance=clamp(.34+(stat(setterP,'set')-avg(teams[defending],'defense'))*.012+chemistryBoost*.006+ (defence.defense==='commit'?.21:0) + (defence.defense==='cover'?-.18:0) -fatigue*.003,.09,.73);
      beats.push({kind:'dump',side:attacking,name:setterP.name||'Setter',zone:side.attackZone});
      phases.push(`${setterP.name} disguises the set and attempts a SECOND-TOUCH DUMP`);
      if(rng()<dumpChance){winner=attacking;action='SETTER DUMP';phases.push(`🏐 ${setterP.name} catches the blockers off guard!`);finished=true;}
      else{phases.push(`${block.name} anticipates the setter dump!`);
       if(rng()<.52){winner=defending;action='DUMP READ BLOCK';actor=block;finished=true;}
       else{attacking=defending;defending=1-attacking;}
      }
     } else {
      const chosen=Number.isInteger(side.setTo)?teams[attacking][side.setTo]:null;
      const hitter=chosen&&!['S','L'].includes(chosen.position)?chosen:attacker(teams[attacking],side.set,rng);
      actor=hitter;method='spike';beats.push({kind:'set',side:attacking,name:setterP.name||'Setter',zone:4});beats.push({kind:'spike',side:attacking,name:hitter.name||'Hitter',zone:side.attackZone});
      const signature=Bonds?.evaluate(teams[attacking])?.links?.find(link=>(link.a===setterP.name&&link.b===hitter.name)||(link.b===setterP.name&&link.a===hitter.name));
      // +2-4 situational value on top of real card-stat OVR boosts.
      const linkAdvantage=signature?(signature.type==='duo'?4:3):0;
      if(signature){special={label:signature.label,ability:signature.ability,setting:setterP.name,hitter:hitter.name,type:signature.type};
       phases.push(`✦ ${signature.type==='rivalry'?'RIVALRY':'CHEMISTRY'} ACTIVATED: ${signature.label} · ${setterP.name} → ${hitter.name}`);
       beats.at(-1).special=signature.label;
      }
      const quick=side.set==='quick'&&hitter.position==='MB'?5:0;
      const back=side.set==='back'&&hitter.position==='OP'?4:0;
      const attackBonus=side.attack==='power'?5:side.attack==='cross'?2:side.attack==='line'?1:-2;
      const defBonus=defence.defense==='commit'&&side.attack==='power'?8:
        defence.defense==='cover'&&side.attack==='tip'?10:
        defence.defense==='dig'&&['line','cross'].includes(side.attack)?7:
        defence.defense==='commit'&&side.attack==='tip'?-8:0;
      const setPower=stat(setterP,'set'),attackPower=stat(hitter,'attack');
      const advantage=(attackPower*.60+setPower*.25+avg(teams[attacking],'power')*.15)
       -(stat(block,'defense')*.45+avg(teams[defending],'defense')*.35+avg(teams[defending],'power')*.20)
       +quick+back+linkAdvantage+attackBonus-defBonus+(side.attackZone===4?0:[1,2,4,5].includes(side.attackZone)?2.5:1.25)+chemistryBoost-defenderChem-(exchange===0&&attacking===receiverIndex?servePressure:0)-fatigue;
      const killChance=clamp(.54+advantage*.012+p[attacking].timingQuality*.080-p[defending].timingQuality*.035,.14,.88);
      phases.push(`${setterP.name} plays ${side.set} set to ${hitter.name}`);
      phases.push(`${hitter.name} uses ${side.attack} attack against ${block.name}`);
      if(rng()<killChance){winner=attacking;action=side.attack==='power'?'POWER SPIKE':side.attack==='tip'?'SMART TIP':side.attack==='line'?'LINE SHOT':side.set==='quick'?'QUICK ATTACK':'CROSS-COURT SPIKE';phases.push(`${hitter.name} scores past the defenders!`);finished=true;}
      else if(rng()<.36){beats.push({kind:'block',side:defending,name:block.name||'Blocker',zone:4});winner=defending;action=defence.defense==='commit'?'IRON WALL BLOCK':'READ BLOCK';actor=block;phases.push(`${block.name} seals the angle for a block point!`);finished=true;}
      else{const backRow=receiver(teams[defending]);beats.push({kind:'dig',side:defending,name:backRow.name||'Defender',zone:4});phases.push(`${backRow.name} digs the attack; counterattack!`);attacking=defending;defending=1-attacking;}
     }
    }
    if(!finished){winner=attacking;actor=setter(teams[attacking]);action='EXTENDED RALLY FINISH';phases.push(`${actor.name} finds the open court after a long rally`);}
   }
  }
  return {winner,actor:actor?.name||'Player',setter:setterName,defender:defender?.name||'Defence',action,phases,serve:server,rally:rally+1,style,method,choices:p,serveZone:p[server].serveZone,attackZone:(p[receiverIndex]?.attackZone||4),beats,special};
 }
 return {OPTIONS,DEFAULTS,valid,plan,autoPlan,simulate,clamp,ZONES,aim};
});
