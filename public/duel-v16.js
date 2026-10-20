/* V16 duel presentation and local school-match simulation. */
'use strict';
window.DuelV16=(()=>{
 const slots=['OUTSIDE HITTER 1','MIDDLE BLOCKER 1','OPPOSITE','MIDDLE / LIBERO','OUTSIDE HITTER 2','SETTER'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 let token=0,clock=null;
 const cleanup=()=>{token++;if(clock)clearTimeout(clock);clock=null};
 const safePath=x=>/^(?:portraits|cards\/players)\/[\w.\-\/]+\.(?:svg|webp|png)$/.test(x||'')?x:'';
 function photo(c){
   // Full character-specific artwork even if a saved squad only carries a UID.
   const roster=(typeof SPIKE_ROSTER!=='undefined'&&Array.isArray(SPIKE_ROSTER))?SPIKE_ROSTER:[];
   const athlete=roster.find(x=>x.name===c?.name&&x.school===c?.school);
   const idx=Number.isInteger(c?.idx)?c.idx:(athlete?.id??null);
   const raw=String(c?.cardKey||c?.key||c?.id||'');
   const key=/^\d+-[0-3](?:_(?:elite|apex))?$/.test(raw)?raw:idx!==null?`${idx}-0`:'';
   const fallback=safePath(c?.portrait)||(idx!==null?`portraits/${String(idx).padStart(2,'0')}.svg`:'portraits/staff-placeholder.svg');
   const card=key?safePath(`cards/players/${key}.webp`):'';
   const individual=(idx!==null&&typeof V17_INDIVIDUAL_PORTRAITS!=='undefined')?V17_INDIVIDUAL_PORTRAITS[idx]:'';
   return {src:individual||card||fallback,card:card||fallback,fallback};
 }
 function intro(rosters,names,onDone,ms=9600){
   cleanup();const current=token;
   const host=document.getElementById('modal');if(!host){onDone();return;}
   const a=Array.isArray(rosters?.[0])?rosters[0]:[],b=Array.isArray(rosters?.[1])?rosters[1]:[];
   const totals=[a,b].map(r=>r.reduce((sum,c)=>sum+(Number(c?.power)||0),0));
   host.innerHTML=`<div class="overlay v23-reveal-overlay" id="overlay"><div class="dialog v16-dialog v23-reveal-dialog" role="dialog" aria-modal="true" aria-label="Final squad reveal">
     <div class="v16-kicker">⚔ HAIKYUU LEGENDS · SQUAD SHOWDOWN</div><h2 class="v16-title">THE FINAL REVEAL</h2>
     <p class="v23-reveal-sub">No wait between draft picks. Now reveal each team member one by one.</p>
     <div class="v16-intro-score"><b>${esc(names?.[0]||'HOME')}</b><span>VS</span><b>${esc(names?.[1]||'AWAY')}</b></div>
     <div class="v23-reveal-stage"><div class="v23-stadium-beams" aria-hidden="true"></div><div class="v16-reveal" id="v16-reveal" aria-live="polite"></div></div>
     <div class="v23-reveal-score" id="v23-reveal-score">??? OVR <span>VS</span> ??? OVR</div>
     <div class="v16-progress"><div id="v16-progress"></div></div>
     <div class="v16-foot"><span id="v16-count">REVEAL 1 / 12</span><button type="button" class="btn ghost sm" id="v16-skip">SKIP TO READY →</button></div>
     <p class="v23-reveal-sub">${esc(names?.[0]||'HOME')}: ${a.length} players &nbsp;·&nbsp; ${esc(names?.[1]||'AWAY')}: ${b.length} players</p>
    </div></div>`;
   const panel=document.getElementById('v16-reveal'),meter=document.getElementById('v16-progress'),counter=document.getElementById('v16-count'),score=document.getElementById('v23-reveal-score');
   const face=(c,side,shown)=>{
     if(!shown)return `<article class="v16-face v23-mystery v16-${side}" aria-label="Mystery opponent"><div class="v23-mystery-mark">?</div><strong>HIDDEN CARD</strong><small>TO BE REVEALED</small></article>`;
     const art=photo(c||{});const power=Math.round(Number(c?.power)||0);
     return `<article class="v16-face v16-${side} v23-flash" style="--side:${side==='home'?'#ff994e':'#39b7ff'}"><span class="v23-card-shine" aria-hidden="true"></span><div class="v16-portrait"><img src="${art.src}" alt="${esc(c?.name||'Unknown player')}" onerror="if(!this.dataset.cardFallback){this.dataset.cardFallback='1';this.src='${art.card}'}else{this.onerror=null;this.src='${art.fallback}'}"></div><b class="v16-ovr">${power}<small> OVR</small></b><strong>${esc(c?.name||'UNKNOWN')}</strong><small>${esc(c?.school||'')} · ${esc(c?.position||'')}</small></article>`;
   };
   const reduced=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   const duration=Math.max(3200,Number(ms)||9600),step=Math.floor((duration-300)/12),actualStep=reduced?Math.min(180,step):step;
   let idx=0;
   function paint(k){if(token!==current)return;
     const position=Math.floor(k/2),revealAway=k%2===1;
     panel.innerHTML=face(a[position],'home',true)+`<div class="v16-versus">${revealAway?'VS':'⚡'}</div>`+face(b[position],'away',revealAway);
     panel.setAttribute('data-side',revealAway?'away':'home');
     meter.style.width=((k+1)/12*100)+'%';
     counter.textContent=`${slots[position]} · ${k+1}/12 CARDS REVEALED`;
     const one=totals[0],two=totals[1];
     score.innerHTML=`${k===11?one:'???'} OVR <span>VS</span> ${k===11?two:'???'} OVR`;
   }
   function finish(){if(token!==current)return;cleanup();onDone();}
   function advance(){if(token!==current)return;idx++;if(idx>=12){finish();return;}paint(idx);clock=setTimeout(advance,actualStep);}
   paint(0);
   document.getElementById('v16-skip')?.addEventListener('click',finish);
   clock=setTimeout(advance,actualStep);
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
