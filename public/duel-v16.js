/* V16 duel presentation and local school-match simulation. */
'use strict';
window.DuelV16=(()=>{
 const slots=['OUTSIDE HITTER 1','MIDDLE BLOCKER 1','OPPOSITE','MIDDLE / LIBERO','OUTSIDE HITTER 2','SETTER'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 let token=0,clock=null;
 const cleanup=()=>{token++;if(clock)clearTimeout(clock);clock=null};
 const photo=c=>{const id=c?.portrait||'';return /^portraits\/[\w/.\-]+\.(svg|webp|png)$/.test(id)?id:'portraits/staff-placeholder.svg';};
 function intro(rosters,names,onDone,ms=7500){cleanup();const cur=token;const host=document.getElementById('modal');if(!host){onDone();return;}
   const a=Array.isArray(rosters?.[0])?rosters[0]:[],b=Array.isArray(rosters?.[1])?rosters[1]:[];
   host.innerHTML=`<div class="overlay" id="overlay"><div class="dialog v16-dialog"><div class="v16-kicker">⚔ PRE-MATCH SHOWDOWN</div><h2 class="v16-title">POSITION FACE-OFF</h2><div class="v16-intro-score"><b>${esc(names?.[0]||'HOME')}</b><span>VS</span><b>${esc(names?.[1]||'AWAY')}</b></div><div class="v16-reveal" id="v16-reveal" aria-live="polite"></div><div class="v16-progress"><div id="v16-progress"></div></div><div class="v16-foot"><span id="v16-count">ROUND 1 / 6</span><button class="btn ghost sm" id="v16-skip">SKIP INTRO →</button></div></div></div>`;
   const panel=document.getElementById('v16-reveal'),meter=document.getElementById('v16-progress'),counter=document.getElementById('v16-count');
   const show=i=>{
     const ca=a[i]||{},cb=b[i]||{};
     const one=(c,side)=>`<article class="v16-face v16-${side}" style="--side:${side==='home'?'#ff994e':'#39b7ff'}"><div class="v16-portrait"><img src="${photo(c)}" alt="${esc(c.name||'Unknown player')}"></div><b class="v16-ovr">${Math.round(Number(c.power)||0)} <small>OVR</small></b><strong>${esc(c.name||'UNKNOWN')}</strong><small>${esc(c.school||'')} · ${esc(c.position||'')}</small></article>`;
     panel.innerHTML=`${one(ca,'home')}<div class="v16-versus">VS</div>${one(cb,'away')}`;
     meter.style.width=((i+1)/6*100)+'%';counter.textContent=`${slots[i]} · ${i+1}/6`;
   };
   const duration=Math.max(3000,Number(ms)||7500),step=Math.floor((duration-400)/6);let idx=0;
   show(0);
   function next(){if(token!==cur)return;idx++;if(idx>=6){finish();return;}show(idx);clock=setTimeout(next,step);}
   function finish(){if(token!==cur)return;cleanup();onDone();}
   document.getElementById('v16-skip').addEventListener('click',finish);
   clock=setTimeout(next,step);
 }
 // Position-aware rally simulator: serve -> receive -> set -> attack -> block/dig.
 const avg=(r,key)=>r.reduce((n,c)=>n+(Number(c?.[key])||Number(c?.power)||70),0)/Math.max(1,r.length);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const randomOne=(r,rand)=>r[Math.floor(rand()*r.length)]||r[0];
 function simulate(rosters,score,rally,chemistry=[0,0],rng=Math.random){
   const playerPower=rosters.map((r,i)=>avg(r,'power')+.45*(chemistry[i]||0));
   const server=(score[0]+score[1])%2,defender=1-server;
   const servR=rosters[server],recvR=rosters[defender];
   const serving=randomOne(servR,rng),defending=randomOne(recvR,rng);
   const receiver=recvR.find(c=>c.position==='L')||randomOne(recvR,rng);
   const setters=rosters.map(r=>r.find(c=>c.position==='S')||r[5]||r[0]);
   const attackers=rosters.map(r=>r.filter(c=>['OH','OP','MB'].includes(c.position)));
   const sides=[server,defender];
   const actions=[];
   const serveProb=clamp(.1+(Number(serving?.attack)||75)-(Number(receiver?.defense)||75),-14,14);
   const aceChance=clamp(.06+serveProb*.007,.015,.16);
   let winner,actor,action,setter,defenderName;
   if(rng()<aceChance){winner=server;actor=serving;setter=setters[winner];action='JUMP SERVE ACE';defenderName=receiver?.name;actions.push(`${serving.name} serves with pressure`,`${receiver.name} cannot control the serve`);}
   else{
    actions.push(`${serving.name} serves`,`${receiver.name} receives`);
    const attacking=defender,defendingTeam=server;
    const striker=randomOne(attackers[attacking].length?attackers[attacking]:recvR,rng);
    const block=randomOne(servR.filter(c=>c.position==='MB').length?servR.filter(c=>c.position==='MB'):servR,rng);
    const setAccuracy=Number(setters[attacking]?.set)||Number(setters[attacking]?.power)||75;
    const attackPower=Number(striker?.attack)||Number(striker?.power)||75;
    const blockPower=Number(block?.defense)||Number(block?.power)||75;
    const fatigue=Math.min(6,Math.max(0,rally-15)*.16);
    const advantage=(attackPower*.48+setAccuracy*.23+playerPower[attacking]*.29)-(blockPower*.42+avg(servR,'defense')*.38+playerPower[defendingTeam]*.20)-fatigue;
    const killChance=clamp(.49+advantage*.013,.20,.80);
    setter=setters[attacking];
    actions.push(`${setter.name} sets ${striker.name}`,`${striker.name} attacks against ${block.name}`);
    if(rng()<killChance){winner=attacking;actor=striker;defenderName=block.name;action=attackPower>98&&rng()<.22?'THUNDER SPIKE':'CROSS-COURT SPIKE';actions.push(`${striker.name} beats the block`);}
    else {winner=defendingTeam;actor=block;defenderName=striker.name;action=rng()<.66?'IRON WALL BLOCK':'MIRACLE DIG';actions.push(`${block.name} reads the shot and scores`);}
   }
   // Always provide a legible, chronological rally story and real character names.
   return {winner,actor:actor?.name||'Player',setter:setter?.name||'Setter',defender:defenderName||'Defence',action,phases:actions,serve:server,rally:rally+1};
 }
 return {intro,cleanup,simulate,slots};
})();
