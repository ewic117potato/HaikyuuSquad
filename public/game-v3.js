/* Spike Legends V3 — four-card school drafts, permanent collection, staff buffs,
   saved squads, friend drafts and persistent quests. No client build step. */
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const escapeHtml=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=n=>(Number(n)||0).toLocaleString();
const id=()=>crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const randint=n=>Math.floor(Math.random()*n);
const pick=a=>a[randint(a.length)];
const nowDay=()=>new Date().toISOString().slice(0,10);
const week=()=>{const d=new Date();d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)};
const RR=[{name:'Common',color:'#9ba9b6'},{name:'Rare',color:'#64bcff'},{name:'Epic',color:'#c59dff'},{name:'Legendary',color:'#ffd36e'},{name:'Mythic',color:'#ff778b'},{name:'Secret',color:'#86ffdb'}];
const SCHOOLS=[...new Set(SPIKE_ROSTER.filter(c=>!c.proOnly).map(c=>c.school))];
const POS=['OH','MB','OP','MB/L','OH','S'];
const Balance=SpikeBalance;
const Draft=SpikeDraftRules;
const COACH_RARITIES=['Common','Rare','Epic','Legendary','Mythic','Secret'];
const COACH_CHANCES=[30,29,20,12,7,2];
function staffTier(){let k=Math.random()*100;for(let i=0;i<COACH_CHANCES.length;i++){k-=COACH_CHANCES[i];if(k<0)return i;}return 5;}
function ratedCoach(base,tier){return {...base,portrait:`portraits/staff/${String(Number(base.id.split('-').at(-1))).padStart(2,'0')}.svg`,tier,rarity:COACH_RARITIES[tier],value:Math.min(10,Math.max(1,Math.round(base.value*[.35,.55,.85,1.12,1.45,1.9][tier])))};}
const VERSIONS=Balance.STAGES;
const DUOS=[
 ['Shoyo Hinata','Tobio Kageyama','Freak Quick',7],['Shoyo Hinata','Kenma Kozume','Friendly Rivals',5],
 ['Kotaro Bokuto','Keiji Akaashi','Ace & Setter',7],['Tetsuro Kuroo','Kenma Kozume','Childhood Connection',6],
 ['Atsumu Miya','Osamu Miya','Miya Twins',7],['Toru Oikawa','Hajime Iwaizumi','Perfect Partnership',7],
 ['Kotaro Bokuto','Tetsuro Kuroo','Tokyo Training Camp',5],['Kei Tsukishima','Tetsuro Kuroo','Blocking Mentor',6],
 ['Shoyo Hinata','Kotaro Bokuto','Master & Disciple',5],['Shoyo Hinata','Atsumu Miya','New Generation Quick',8],
 ['Tobio Kageyama','Toru Oikawa','Rival Setters',5],['Shoyo Hinata','Korai Hoshiumi','Little Giants',7],
 ['Kiyoomi Sakusa','Atsumu Miya','Black Jackals Sync',6],['Wakatoshi Ushijima','Tobio Kageyama','Adlers Power',6],
 ['Shoyo Hinata','Yu Nishinoya','Karasuno Energy',4],['Kenma Kozume','Tobio Kageyama','Setter Mindgames',4],
 ['Shinsuke Kita','Atsumu Miya','Captain Discipline',5],['Wakatoshi Ushijima','Satori Tendo','Shiratorizawa Wall',6],
 ['Takanobu Aone','Kenji Futakuchi','Date Tech Iron Wall',6],['Kiyoomi Sakusa','Motoya Komori','Itachiyama Duo',6],
 ['Korai Hoshiumi','Sachiro Hirugami','Kamomedai Fortress',7],['Shoyo Hinata','Kageyama Tobio','Quick Strike',7]
];
const SCHEMES={KARASUNO:'Offensive tempo',NEKOMA:'Receiving & endurance',FUKURODANI:'Ace power',INARIZAKI:'Serve & attack',SHIRATORIZAWA:'Raw power','DATE TECH':'Blocking','AOBA JOHSAI':'Precision setting',KAMOMEDAI:'Block & balance'};
const SQUAD_NAMES=['Main Team','All-Rounders','Championship','Defence Unit','Dream Team'];
function generatedCard(i,v){return Balance.buildCard(SPIKE_ROSTER[i],i,v);}
// Keep the existing school draft untouched; premium shop cards are additional
// collectible variants and are only available from premium packs or long quests.
const BASE_CATALOG=SPIKE_ROSTER.flatMap((x,i)=>[0,1,2,3].filter(v=>!x.proOnly||v===3).map(v=>generatedCard(i,v)));
const CATALOG=BASE_CATALOG.concat(
 BASE_CATALOG.filter(SpikePacks.eliteCandidate).map(c=>SpikePacks.upgradeCard(c,'elite')),
 BASE_CATALOG.filter(SpikePacks.apexCandidate).map(c=>SpikePacks.upgradeCard(c,'apex'))
);
const BY_KEY=Object.fromEntries(CATALOG.map(x=>[x.key,x]));
const DEFAULT=()=>({name:'ROOKIE',coins:2500,tickets:4,items:[],squad:[null,null,null,null,null,null],bench:[null,null,null,null],coach:null,coaches:[],savedTeams:[null,null,null,null,null],wins:0,losses:0,level:1,xp:0,trophies:0,rolls:0,career:0,meta:{},v3:{runs:0,run:null,offer:null,rerolls:2,packs:0,coachPacks:0,coinsWon:0,quests:{},weekly:{},claimed:{},weeklyClaimed:{},milestoneClaimed:{},day:nowDay(),week:week(),duelGames:0,duelWins:0,proOwned:0,squadCrafts:0,crewBought:0,quickTokens:0}});
let state;try{state=Object.assign(DEFAULT(),JSON.parse(localStorage.getItem('spike-legends-save-v1')||'{}'));}catch{state=DEFAULT()}
if(!state.v3)state.v3=DEFAULT().v3;
state.v3=Object.assign(DEFAULT().v3,state.v3);
// V5 court layout: top OH / M / OP, bottom M-or-L / OH / S.
// Migrate existing V4 lineups once without losing any owned cards or presets.
if(!state.v3.courtV5){
 const transform=arr=>Array.isArray(arr)&&arr.length===6?[arr[0],arr[1],arr[2],arr[5],arr[3],arr[4]]:arr;
 state.squad=transform(state.squad);
 if(Array.isArray(state.savedTeams))state.savedTeams=state.savedTeams.map(t=>t?{...t,squad:transform(t.squad)}:t);
 state.v3.courtV5=true;
}
state.manager=state.manager||null;
state.gems=Number.isFinite(Number(state.gems))?Number(state.gems):100;
state.v3.highOvrClaimed=state.v3.highOvrClaimed||{};
state.v3.cosmetics=state.v3.cosmetics||[];
state.v3.skin=state.v3.skin||'classic';
// Persistent V6 pack stats and unclaimed reveals (safe against refreshes).
state.v3.packsOpened=Math.max(0,Number(state.v3.packsOpened)||0);
state.v3.eliteFound=Math.max(0,Number(state.v3.eliteFound)||0);
state.v3.apexFound=Math.max(0,Number(state.v3.apexFound)||0);
state.v3.coinsSpentOnPacks=Math.max(0,Number(state.v3.coinsSpentOnPacks)||0);
if(!state.v3.pendingPack||!state.v3.pendingPack.key)state.v3.pendingPack=null;
document.body.dataset.skin=state.v3.skin;
for(const k of ['bench','coaches','savedTeams','squad','items'])if(!Array.isArray(state[k]))state[k]=DEFAULT()[k];
if(!state.meta)state.meta={};
const q=(key)=>Number(state.v3.quests[key]||0);
function rollover(){const v=state.v3;if(v.day!==nowDay()){v.day=nowDay();v.quests={};v.claimed={};}if(v.week!==week()){v.week=week();v.weekly={};v.weeklyClaimed={};}}
rollover();
const owned=()=>state.items.map(o=>({...BY_KEY[o.key],...o})).filter(o=>o.name);
const ownedCoaches=()=>state.coaches.map(o=>{const base=SPIKE_COACHES.find(c=>c.id===o.key);return base?{...ratedCoach(base,Math.max(0,Math.min(5,o.tier||0))),...o,type:staffType(base)}:null}).filter(Boolean);
const player=uid=>owned().find(o=>o.uid===uid);
const coach=()=>ownedCoaches().find(x=>x.uid===state.coach&&x.type==='coach');
const manager=()=>ownedCoaches().find(x=>x.uid===state.manager&&x.type==='manager');
const MANAGER_IDS=new Set([16,17,18,19,20,21,27,28,29]);
const staffType=base=>MANAGER_IDS.has(Number(String(base.id).split('-').at(-1)))?'manager':'coach';
const starting=()=>state.squad.map(player).filter(Boolean);
const bench=()=>state.bench.map(player).filter(Boolean);
function chem(cards=starting(),staff=coach()){const counts={},names=new Set(cards.map(c=>c.name));cards.forEach(c=>{counts[c.school]=(counts[c.school]||0)+1});const main=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]||['NONE',0];const count=main[1];const schoolBonus=count>=6?12:count>=5?9:count>=4?7:count>=3?5:count>=2?3:0;
 const duos=DUOS.filter(([a,b])=>names.has(a)&&names.has(b));const duoBonus=duos.reduce((a,x)=>a+x[3],0);
 const staffBonus=(staff?(staff.value||0)+(staff.school===main[0]?3:0):0)+(manager()?.value||0)*.55;const benchBonus=Math.min(3,bench().length);
 const awakeningBonus=Math.min(18,cards.reduce((sum,c)=>sum+(c.packTier==='apex'?6:c.packTier==='elite'?3:0),0));
 return {main,schoolBonus,duos,duoBonus,staffBonus,benchBonus,awakeningBonus,total:schoolBonus+duoBonus+staffBonus+benchBonus+awakeningBonus};}
function avg(cards=starting()){return cards.length?Math.round(cards.reduce((a,c)=>a+c.power+(c.level||0),0)/cards.length):0;}
function ovr(){return clamp(avg()+Math.min(10,Math.floor(chem().total/4)),0,100)}
function addCard(key){const c=BY_KEY[key];if(!c)return null;const obj={key,uid:id(),level:0};state.items.push(obj);return {...c,...obj}}
function save(){state.savedAt=Date.now();try{localStorage.setItem('spike-legends-save-v1',JSON.stringify(state));}catch{}updateHeader();window.queueCloudSave?.()}
let view='home',selectionSlot=0,filters='',chosenSchool='ALL SCHOOLS',offer=null,room=null,ws=null,duel=null,botTick=null,tab='daily',duelMode='saved',friendSettings={extraRolls:8,rerolls:5,coaches:true},coachTab='coaches',pendingQuest='',tempRerolls=0;
function updateHeader(){const a=$('#coins'),b=$('#tickets'),n=$('#playerName');if(a)a.textContent=f(state.coins);if(b)b.textContent=f(state.tickets);if(n)n.textContent=state.name;const gems=$('#gems');if(gems)gems.textContent=f(state.gems);const st=$('#staffCount');if(st)st.textContent=f(state.coaches.length);}
function notice(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.classList.remove('show'),2900)}
function popup(body){$('#modal').innerHTML=`<div class="overlay" id="overlay"><div class="dialog v3-dialog"><button class="close" data-v="close">✕</button>${body}</div></div>`;loadOnlinePortraits()}
function close(){$('#modal').innerHTML=''}
function head(tag,title,sub=''){return `<div class="headingline"><div><div class="eyebrow">${tag}</div><h1 class="h1">${title}</h1><div class="sub">${sub}</div></div></div>`}
function rarity(c){return RR[c.rarity]||RR[0]}
function img(c){const local=c.portrait||'', fallback=local?`<img src="${local}" loading="lazy" alt="${escapeHtml(c.name)}" onerror="this.style.display='none'">`:`<div class="v3-avatar-fallback" style="--team:${SPIKE_COLORS[c.school]||'#78a4b8'}">${escapeHtml(c.name.split(' ').map(x=>x[0]).slice(-2).join(''))}</div>`;
 return `<div class="v3-image" data-img-name="${escapeHtml(c.name)}">${fallback}</div>`}
function card(c,{click='',tiny=false,selected=false,disabled=false}={}){const b=rarity(c);return `<button type="button" class="v3-card ${tiny?'compact':''} ${selected?'chosen':''} ${disabled?'v4-unavailable':''}" style="--rarity:${b.color}" ${disabled?'disabled title="Position already filled"':''} ${click?`data-v="${click}"`:''} data-key="${c.key||''}" data-uid="${c.uid||''}" aria-label="${escapeHtml(c.name)} ${c.power} overall"><div class="v3-card-top"><span>${b.name.toUpperCase()}</span><strong>${c.power+(c.level||0)}</strong></div>${img(c)}<div class="v3-card-info"><b>${escapeHtml(c.name)}</b><span>${escapeHtml(c.school)}</span><small>${c.position} • ${escapeHtml(c.variant)}</small></div><div class="v3-card-line"></div></button>`}
function coachCard(c,click=''){const tier=c.tier||0,rare=COACH_RARITIES[tier]||'Common',type=c.type||staffType(c),isEquipped=type==='manager'?state.manager===c.uid:state.coach===c.uid;return `<button type="button" class="v3-coach-card ${isEquipped?'v5-staff-selected':''}" style="--rarity:${RR[tier].color}" ${click?`data-v="${click}"`:''} data-coach="${c.uid||c.id}"><div class="v5-staff-art" data-img-name="${escapeHtml(c.name)}"><img src="${c.portrait||'portraits/staff-placeholder.svg'}" loading="lazy" alt="${escapeHtml(c.name)}" /></div><span class="v4-staff-rarity">${rare.toUpperCase()} · ${type.toUpperCase()}</span><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.school)}</small><span>+${c.value}% ${escapeHtml(c.buff)}</span>${isEquipped?'<em>✓ EQUIPPED</em>':''}</button>`}

function show(v){view=v;render();$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$('#bread').textContent='HOME / '+v.toUpperCase();window.scrollTo({top:0,behavior:'instant'});}
function render(){let out='';const pages={home,roll:rollPage,squad:squadPage,collection:collectionPage,staff:staffPage,shop:shopPage,quests:questsPage,duels:duelPage,career:careerPage};try{out=(pages[view]||home)();}catch(e){console.error(e);out='<p>Could not render this screen. Refresh to retry.</p>'}$('#view').innerHTML=out;updateHeader();loadOnlinePortraits();}
// Court layout matches the six positions drawn by the player (top OH / M / OP; bottom M/L / OH / S).
const COURT_POS=[{label:'OH',hint:'OUTSIDE HITTER'},{label:'M',hint:'MIDDLE BLOCKER'},{label:'OP',hint:'OPPOSITE'},{label:'M / L',hint:'MIDDLE / LIBERO'},{label:'OH',hint:'OUTSIDE HITTER'},{label:'S',hint:'SETTER'}];
function arrangePartial(cards){
 const slots=Array(6).fill(null);
 for(const c of cards){if(!c)continue;const sequence=c.position==='OH'?[0,4]:c.position==='MB'?[1,3]:c.position==='L'?[3]:c.position==='OP'?[2]:c.position==='S'?[5]:[];
 const idx=sequence.find(i=>!slots[i]);if(idx!==undefined)slots[idx]=c;}
 return slots;
}
function courtBoard(cards,{interactive=false,caption='YOUR STARTING SIX',selected=-1}={}){
 const placed=cards.length===6?cards:arrangePartial(cards);
 return `<section class="v5-court-section"><div class="v5-court-head"><div><span class="eyebrow">TACTICAL LINEUP BOARD</span><h2>${escapeHtml(caption)}</h2></div><div class="v5-court-legend"><span>● FRONT ROW</span><span>● BACK ROW</span></div></div>
 <div class="v5-court"><div class="v5-court-surface"><span class="v5-front-label">NET / FRONT ROW</span><span class="v5-back-label">BACK COURT</span><div class="v5-court-grid">${COURT_POS.map((pos,i)=>{const c=placed[i];const a=c?`<div class="v5-court-portrait" data-img-name="${escapeHtml(c.name)}"><img src="${c.portrait}" loading="lazy" alt="${escapeHtml(c.name)}" /></div>`:`<div class="v5-empty-athlete">${pos.label==='M / L'?'M/L':pos.label}</div>`;
 return `<${interactive?'button':'div'} ${interactive?'type="button" data-v="selectSlot" data-idx="'+i+'"':''} class="v5-court-slot ${c?'filled':'empty'} ${selected===i?'selected':''}" style="--team:${c?SPIKE_COLORS[c.school]||'#e39d55':'#a7d4ea'}"><span class="v5-slot-no">0${i+1} · ${pos.label}</span>${a}<div class="v5-court-name">${c?escapeHtml(c.name):'OPEN POSITION'}</div><span class="v5-court-sub">${c?`${c.power} OVR · ${escapeHtml(c.variant)}`:pos.hint}</span></${interactive?'button':'div'}>`}).join('')}</div><span class="v5-court-watermark">SPIKE LEAGUE</span></div></div></section>`;
}

function home(){
 return `<section class="v5-hero"><div class="v5-hero-accent">SEASON 06 · PRO PACK ASCENSION</div><div class="v5-hero-inner"><div><div class="eyebrow">THE ULTIMATE ANIME VOLLEYBALL SQUAD BUILDER</div><h1>BUILD YOUR<br><em>DREAM SIX.</em></h1><p>Draft a school. Choose your stars. Combine rival chemistry and staff bonuses. Challenge the best Haikyuu teams — or your friends.</p><div class="hero-actions"><button class="btn" data-go="roll">START FREE SCHOOL DRAFT →</button><button class="btn ghost" data-go="duels">⚔ FRIEND DUELS</button></div></div><div class="v5-hero-stats"><span>YOUR TEAM</span><strong>${ovr()} <small>OVR</small></strong><span>${starting().length}/6 PLAYERS LOCKED IN</span><b>${f(state.coins)} COINS IN THE VAULT</b></div></div></section>
 <div class="v3-stats"><div><small>ACTIVE TEAM OVR</small><strong>${ovr()}</strong><span>Max 100</span></div><div><small>CHARACTER COLLECTION</small><strong>${owned().length}</strong><span>${new Set(owned().map(c=>c.key)).size} unique cards</span></div><div><small>COACH / MANAGER</small><strong>${Number(!!coach())} / ${Number(!!manager())}</strong><span>One of each</span></div><div><small>CAREER WINS</small><strong>${state.wins}</strong><span>${state.losses} losses</span></div></div>
 ${courtBoard(state.squad.map(player),{caption:'YOUR ACTIVE SQUAD'})}
 <div class="v3-panels"><div class="v3-feature"><span class="eyebrow">95% SCHOOL CARDS</span><h3>DRAFT FOUR. PICK ONE.</h3><p>Schools are the main draw. Nationals (3%), Timeskip (1%) and Pro (1%) are special hits.</p><button class="btn sm" data-go="roll">OPEN DRAFT →</button></div><div class="v3-feature"><span class="eyebrow">BUILD YOUR STAFF</span><h3>ONE COACH + ONE MANAGER</h3><p>Coaches enhance your team. Managers increase rewards. Collect staff in six rarities.</p><button class="btn sm ghost" data-go="staff">STAFF ROOM →</button></div><div class="v3-feature"><span class="eyebrow">CHALLENGE THE WORLD</span><h3>SCHOOL & FRIEND DUELS</h3><p>Take on story schools or challenge friends with saved teams or fresh drafts.</p><button class="btn sm ghost" data-go="career">SCHOOL BATTLES →</button></div></div>`;
}
function drawFromSchool(school='ALL SCHOOLS',avoidSchool=null){return Draft.makeOffer({roster:SPIKE_ROSTER,existing:(state.v3.run?.picks||[]).map(player).filter(Boolean),targetSchool:school==='ALL SCHOOLS'?null:school,avoidSchool,cardFromIndex:(i,v)=>BY_KEY[`${i}-${v}`],versionSampler:Balance.versionForRoll,weightForIndex:i=>Balance.weightFor(SPIKE_ROSTER[i],i),rand:Math.random});}
function startRun(){if(state.v3.run){popup('<h2 class="h1">START A NEW RUN?</h2><p>Your unfinished six-card draft will be replaced. Cards you already claimed stay in your collection.</p><div class="flexgap"><button class="btn" data-v="confirmNewRun">START FRESH</button><button class="btn ghost" data-v="close">CANCEL</button></div>');return;}newRun()}
function newRun(){state.v3.run={picks:[],started:Date.now(),bonusPaid:false};state.v3.lastSchool=null;state.v3.offer=null;newRunOffer();}
function newRunOffer(sameSchool=false){if(!state.v3.run)return;const old=state.v3.offer;state.v3.offer=drawFromSchool(sameSchool&&old?old.school:'ALL SCHOOLS',sameSchool?null:old?.school||state.v3.lastSchool);save();show('roll')}
function runPick(key){const run=state.v3.run,arr=state.v3.offer?.cards||[];if(!run||run.picks.length>=6){notice('Start a new squad run first.');return;}const c=arr.find(x=>x.key===key);if(!c){notice('Pick one of the offered cards.');return;}if(!Draft.eligible(run.picks.map(player).filter(Boolean),c))return notice('That position is already filled. Pick a missing position.');const o=addCard(key);run.picks.push(o.uid);state.v3.lastSchool=state.v3.offer.school;state.v3.offer=null;state.v3.packs++;state.rolls=(state.rolls||0)+1;track('picks');if(o.power>=90)track('rare');if(o.stage===3)track('pro');if(run.picks.length===6){finishRun();return;}newRunOffer();}
function finishRun(){const run=state.v3.run,cards=run.picks.map(player).filter(Boolean);const reward=500+Math.round(avg(cards)*7)+Math.max(0,chem(cards,null).total*12);const rewardGems=[85,90,95,99].filter(n=>avg(cards)+Math.min(11,Math.floor(chem(cards,coach()).total/3))>=n&&!state.v3.highOvrClaimed[n]);for(const n of rewardGems){state.v3.highOvrClaimed[n]=true;state.gems+={85:20,90:35,95:60,99:100}[n];}state.coins+=reward;state.v3.coinsWon+=reward;state.v3.runs++;state.v3.squadCrafts++;track('runs');const arranged=Draft.lineup(cards);state.squad=arranged?arranged.map(x=>x.uid):run.picks.slice(0,6);state.v3.run=null;state.v3.offer=null;save();show('squad');popup(`<div class="eyebrow">SQUAD RUN COMPLETE</div><h2 class="h1">+${f(reward)} COINS${rewardGems.length?' · +'+rewardGems.reduce((s,n)=>s+({85:20,90:35,95:60,99:100}[n]),0)+' GEMS':''}</h2><p>You recruited six permanent players, equipped them as your new active squad, and earned money for the completed run.</p><div class="v3-card-grid mini">${cards.map(c=>card(c,{tiny:true})).join('')}</div><div class="flexgap"><button class="btn" data-v="close">VIEW SQUAD</button><button class="btn ghost" data-go="shop">OPEN PRO SHOP</button></div>`);}
function rollPage(){const r=state.v3.run,offer=state.v3.offer,chosen=r?.picks.map(player).filter(Boolean)||[],need=Draft.needs(chosen);
 return head('SCOUTING / SCHOOL ROLLS','DRAFT YOUR DREAM SIX','Each free school roll presents FOUR players. Pick one to lock him in; your next school arrives free.')+
 `<div class="v5-odds-strip"><b>MAIN SCHOOLS <span>95%</span></b><b>NATIONALS <span>3%</span></b><b>TIMESKIP <span>1%</span></b><b>PRO <span>1%</span></b></div>
 <div class="v3-runbar"><div><strong>${r?'ROUND '+(chosen.length+1)+' / 6':'READY TO SCOUT'}</strong><span>${chosen.length}/6 drafted · ${state.v3.runs} runs completed</span></div><div><span>EXTRA SCHOOL ROLLS / CARD REROLLS</span><strong>${state.tickets} / ${state.v3.rerolls}</strong></div><button class="btn ghost sm" data-v="startRun">${r?'NEW RUN':'START A RUN'}</button></div>
 <div class="v5-draft-layout"><div class="v5-draft-main">${offer&&r?`<div class="v3-school-banner" style="--team:${SPIKE_COLORS[offer.school]||'#608b9c'}"><div class="eyebrow">NOW SCOUTING · PICK ${chosen.length+1}/6</div><h2>${escapeHtml(offer.school)}</h2><p>${escapeHtml(SCHEMES[offer.school]||'Develop team chemistry and deadly combinations.')}</p></div>
 <div class="v3-card-grid v5-offer-grid">${offer.cards.map(c=>card(c,{click:'chooseOffer',disabled:!Draft.eligible(chosen,c)})).join('')}</div><div class="v3-actionrow"><button class="btn ghost" data-v="changeSchool" ${state.tickets<1?'disabled':''}>↻ NEW SCHOOL (${state.tickets} LEFT)</button><button class="btn" data-v="rerollOffer" ${state.v3.rerolls<1?'disabled':''}>⟳ REROLL THESE FOUR (${state.v3.rerolls} LEFT)</button></div>`:
 `<div class="v3-feature v5-start-panel"><span class="eyebrow">START YOUR JOURNEY</span><h2>YOUR FIRST ROLL IS FREE.</h2><p>After every character you pick, the next school is also free. Extra school rolls and rerolls are earned through quests.</p><button class="btn" data-v="startRun">◈ SCOUT A SCHOOL →</button></div>`}
 <div class="v4-needs"><b>POSITIONS TO FILL</b>${need.length?need.map(x=>`<span>${x}</span>`).join(''):'<span>ALL FILLED</span>'}<small>Every school offer includes at least one player for an open role.</small></div></div>
 <aside class="v5-draft-board">${courtBoard(chosen,{caption:'DRAFT BOARD'})}<div class="v5-board-caption"><b>TEAM PROGRESS ${chosen.length}/6</b><span>Front: OH / M / OP<br>Back: M or L / OH / S</span></div></aside></div>`;
}
 function rerollOffer(){if(!state.v3.run)return notice('Start a squad run first');if(state.v3.rerolls<=0)return notice('Earn more rerolls from quests');state.v3.rerolls--;newRunOffer(true);}
 function changeSchool(){if(!state.v3.run)return notice('Start a squad run first');if(state.tickets<=0)return notice('Earn more Rolls from quests');state.tickets--;newRunOffer(false);}
function collectSelect(i,slotType){const c=player(i);if(!c)return;const places=slotType==='bench'?state.bench:state.squad;const slot=slotType==='bench'?selectionSlot-6:selectionSlot;if(slotType!=='bench'&&!slotCompatible(slot,c)){notice('This court slot needs a '+POS[slot]+' player.');return;}for(const arr of [state.squad,state.bench]){const prev=arr.indexOf(i);if(prev>=0)arr[prev]=null;}places[slot]=i;save();show('squad');}
function squadPage(){const sy=chem(),valid=owned().filter(c=>`${c.name} ${c.school} ${c.variant}`.toLowerCase().includes(filters.toLowerCase())).sort((a,b)=>b.power-a.power);
 return head('TEAM MANAGEMENT','YOUR COURT, YOUR RULES','Choose any of the six marked court positions, then tap a compatible player below.')+
 `<div class="v3-stats"><div><small>SQUAD POWER</small><strong>${ovr()}</strong><span>Effective overall</span></div><div><small>SCHOOL CHEMISTRY</small><strong>+${sy.schoolBonus}%</strong><span>${escapeHtml(sy.main[0])} · ${sy.main[1]} players</span></div><div><small>RIVAL / DUO CHEMISTRY</small><strong>+${sy.duoBonus}%</strong><span>${sy.duos.length} connections · +${sy.awakeningBonus} awakening</span></div><div><small>STAFF BOOSTS</small><strong>+${Math.round(sy.staffBonus)}%</strong><span>${coach()?.name||'No coach'} + ${manager()?.name||'No manager'}</span></div></div>
 ${courtBoard(state.squad.map(player),{interactive:true,selected:selectionSlot,caption:'SELECT A POSITION TO EDIT'})}
 <div class="v5-court-subnav"><span>SELECTED: <b>${COURT_POS[selectionSlot]?.label||'BENCH'}</b></span><button class="btn sm ghost" data-v="autoSquad">AUTO BEST SIX</button><button class="btn sm ghost" data-v="clearSlot">REMOVE PLAYER</button></div>
 <div class="sectionbar"><h2>BENCH / RESERVES</h2></div><div class="v3-slot-grid reserve">${state.bench.map((uid,i)=>`<button class="v3-slot ${selectionSlot===6+i?'active':''}" data-v="selectSlot" data-idx="${6+i}"><small>BENCH ${i+1}</small><b>${uid?escapeHtml(player(uid)?.name||'Unknown'):'EMPTY'}</b><span>${uid?(player(uid)?.power||0)+' OVR':'ADD SUBSTITUTE'}</span></button>`).join('')}</div>
 <div class="v5-staff-strip"><div><span>COACH</span><b>${coach()?escapeHtml(coach().name):'NOT EQUIPPED'}</b></div><div><span>MANAGER</span><b>${manager()?escapeHtml(manager().name):'NOT EQUIPPED'}</b></div><button class="btn ghost sm" data-go="staff">EDIT STAFF →</button></div>
 <div class="sectionbar"><h2>YOUR PLAYER COLLECTION</h2><span class="v3-mini">Tap a player to equip in the highlighted position</span></div><div class="toolbar"><input id="inventorySearch" value="${escapeHtml(filters)}" placeholder="Search character, school or version"/></div>${valid.length?`<div class="v3-card-grid mini">${valid.slice(0,85).map(x=>card(x,{click:'equipPlayer',tiny:true,disabled:selectionSlot<6&&!slotCompatible(selectionSlot,x)})).join('')}</div>`:'<div class="empty">No cards yet — draft some players.</div>'}
 <div class="sectionbar"><h2>ACTIVE CHEMISTRY · +${Math.round(sy.total)}%</h2></div><div class="v3-chem-list"><div><b>School coordination</b><small>${sy.main[1]} ${escapeHtml(sy.main[0])} players → +${sy.schoolBonus}%</small></div>${sy.duos.map(d=>`<div><b>⚡ ${escapeHtml(d[2])}</b><small>${escapeHtml(d[0])} + ${escapeHtml(d[1])} → +${d[3]}%</small></div>`).join('')||'<div>Try pairing Hinata + Kageyama, Hinata + Kenma, or Bokuto + Akaashi.</div>'}</div>
 <div class="sectionbar"><h2>FIVE SAVED TEAMS</h2></div><div class="v3-save-grid">${state.savedTeams.map((x,i)=>`<div class="v3-save-item"><b>${SQUAD_NAMES[i]}</b><small>${x?x.squad.filter(Boolean).length+' players · '+new Date(x.savedAt).toLocaleDateString():'Not yet saved'}</small><div class="flexgap"><button class="btn sm" data-v="savePreset" data-idx="${i}">SAVE</button><button class="btn sm ghost" data-v="loadPreset" data-idx="${i}" ${x?'':'disabled'}>LOAD</button></div></div>`).join('')}</div>`;
}
function slotCompatible(i,c){return i===0||i===4?c.position==='OH':i===1?c.position==='MB':i===2?c.position==='OP':i===3?['MB','L'].includes(c.position):i===5?c.position==='S':true;}

function collectionPage(){const arr=owned().filter(x=>`${x.name} ${x.school} ${x.variant}`.toLowerCase().includes(filters.toLowerCase())).sort((a,b)=>b.power-a.power);return head('PLAYER ARCHIVE','YOUR PERMANENT COLLECTION',`${owned().length} cards · ${new Set(owned().map(x=>x.key)).size} unique variants · ${CATALOG.length} total available`)+`<div class="toolbar"><input id="inventorySearch" value="${escapeHtml(filters)}" placeholder="Search characters, teams, versions"/><button class="btn ghost sm" data-go="squad">EQUIP SQUAD</button></div>${arr.length?`<div class="v3-card-grid">${arr.slice(0,170).map(x=>card(x,{click:'viewCard'})).join('')}</div>`:'<div class="empty">Nothing here yet. Start drafting characters.</div>'}`}
function staffPage(){const all=ownedCoaches(),group=coachTab==='managers'?'manager':'coach',arr=all.filter(x=>x.type===group),current=group==='manager'?manager():coach();return head('TACTICAL STAFF','COACHES & MANAGERS','Equip exactly ONE coach and ONE manager. Both have six rarity levels and different boosts.')+
 `<div class="v5-staff-grid"><div class="v5-active-staff"><small>YOUR COACH</small><strong>${coach()?escapeHtml(coach().name):'NOT ASSIGNED'}</strong><span>${coach()?`+${coach().value}% ${coach().buff}`:'Boosts skills and chemistry'}</span></div><div class="v5-active-staff"><small>YOUR MANAGER</small><strong>${manager()?escapeHtml(manager().name):'NOT ASSIGNED'}</strong><span>${manager()?`+${manager().value}% ${manager().buff}`:'Boosts rewards and momentum'}</span></div></div>
 <div class="v3-tabs"><button class="${group==='coach'?'active':''}" data-v="staffTab" data-tab="coaches">COACHES</button><button class="${group==='manager'?'active':''}" data-v="staffTab" data-tab="managers">MANAGERS</button></div>
 <div class="v3-shop-hero"><div><div class="eyebrow">GEM SCOUTING</div><h2>RECRUIT A ${group.toUpperCase()}</h2><p>Spend 40 gems to reveal three ${group} cards. Pick one. Higher rarities grant stronger bonuses.</p></div><button class="btn" data-v="staffRoll" ${state.gems<40?'disabled':''}>SCOUT ${group.toUpperCase()} · 💎40</button></div>
 <div class="v4-rarity-key">${COACH_RARITIES.map((x,i)=>`<span style="border-color:${RR[i].color}">${x} ${COACH_CHANCES[i]}%</span>`).join('')}</div><div class="sectionbar"><h2>YOUR ${group.toUpperCase()} CARDS · ${arr.length}</h2></div>
 ${arr.length?`<div class="v3-coach-grid">${arr.map(x=>coachCard(x,'equipCoach')).join('')}</div>`:'<div class="empty">No staff of this type yet. Complete quests to earn gems, then scout.</div>'}<div class="v3-note">Recruitment is separate from the player draft. Staff do not occupy the six court positions.</div>`}
function staffRoll(){if(state.gems<40)return notice('Not enough gems. Earn them from quests and team milestones.');const group=coachTab==='managers'?'manager':'coach';const pool=SPIKE_COACHES.filter(x=>staffType(x)===group);if(pool.length<3)return notice('Not enough staff in that category');state.gems-=40;state.v3.coachPacks++;
 const choices=[];const seen=new Set();while(choices.length<3){const x=pick(pool);if(seen.has(x.id))continue;seen.add(x.id);choices.push({...ratedCoach(x,staffTier()),type:group});}
 state.v3.staffOffer=choices.map(x=>({key:x.id,tier:x.tier}));save();popup(`<div class="eyebrow">${group.toUpperCase()} SCOUTING</div><h2 class="h1">CHOOSE ONE ${group.toUpperCase()}</h2><div class="v3-coach-grid">${choices.map(x=>coachCard({...x,uid:`${x.id}|${x.tier}`},'chooseCoach')).join('')}</div>`)}
function chooseCoach(encoded){const [key,r]=String(encoded||'').split('|'),tier=Number(r);const offer=state.v3.staffOffer?.find(o=>o.key===key&&o.tier===tier);const x=SPIKE_COACHES.find(c=>c.id===key);if(!x||!offer)return;const c={key,uid:id(),tier};state.coaches.push(c);if(staffType(x)==='manager'){if(!manager())state.manager=c.uid;}else if(!coach())state.coach=c.uid;
 delete state.v3.staffOffer;track('staff');save();close();show('staff');notice(`${COACH_RARITIES[tier]} ${x.name} joined your staff.`)}

// Price, version and exact drop odds are always visible before purchase.
const SHOP=[
 {id:'nation',name:'NATIONALS PACK',price:2400,stage:1,desc:'One permanent Nationals athlete. Chase rarer forms.'},
 {id:'timeskip',name:'TIMESKIP PACK',price:7500,stage:2,desc:'One Timeskip athlete, with a chance at Elite or Apex.'},
 {id:'professional',name:'PROFESSIONAL PACK',price:18000,stage:3,desc:'One powerful Pro athlete. Elite 1% · Apex 0.1%.'}
];
const SKINS=[{id:'classic',name:'Classic Court',price:0},{id:'sunset',name:'Sunset Orange',price:50},{id:'midnight',name:'Midnight Blue',price:60},{id:'jade',name:'Jade Storm',price:80}];
function buyCosmetic(kind){const c=SKINS.find(x=>x.id===kind);if(!c)return;const owns=kind==='classic'||state.v3.cosmetics.includes(kind);if(!owns){if(state.gems<c.price)return notice('Not enough gems');state.gems-=c.price;state.v3.cosmetics.push(kind);}state.v3.skin=kind;document.body.dataset.skin=kind;save();render();notice(`${c.name} equipped`);}
function pendingReveal(){const p=state.v3.pendingPack;const c=p&&BY_KEY[p.key];if(!p||!c)return '';
 return `<div class="v6-pending"><div><b>⚠ UNCLAIMED ${escapeHtml(p.pack.toUpperCase())} PACK</b><p>Your card is reserved. Claim it before opening another pack.</p></div><button class="btn" data-v="revealPending">REVEAL YOUR CARD</button></div>`;
}
function shopPage(){const odds=SpikePacks.ODDS;
 return head('PROFESSIONAL SCOUTING','TIMESKIP & PRO PACKS','Earn coins from finished drafts, school battles and quests. Open one permanent card per pack; rare drops are genuinely hard to find.')+
 `<div class="v6-shop-banner"><div><div class="eyebrow">PRO PACK ASCENSION • SEASON 6</div><h2>CHASE THE 0.1% APEX.</h2><p>Every purchased pack reveals one permanent athlete. Strong cards are less common, even within the regular 98.9% pool.</p></div><div class="v6-shop-wallet"><small>YOUR COINS</small><strong>${f(state.coins)} ◉</strong><span>${state.v3.packsOpened} packs opened</span></div></div>`+
 pendingReveal()+
 `<div class="v6-drop-table"><div><b>STANDARD</b><strong>${odds.standard}%</strong><span>Regular character</span></div><div class="elite"><b>ELITE FORM</b><strong>${odds.elite}%</strong><span>Boosted OVR + abilities</span></div><div class="apex"><b>APEX FORM</b><strong>${odds.apex}%</strong><span>Ultra-rare awakening</span></div></div>`+
 `<p class="v6-pack-note">Chances are <b>per entire opened pack</b>, not per card and not multiplied by four. No paid currency is required. This is an in-game coin economy.</p>`+
 `<div class="v3-shop-grid v6-shop-grid">${SHOP.map(s=>`<article class="v3-store-card v6-store-card stage-${s.stage}"><div class="eyebrow">GUARANTEED ${VERSIONS[s.stage].toUpperCase()} CHARACTER</div><h2>${s.name}</h2><p>${s.desc}</p><div class="v6-stats"><b>${f(s.price)} ◉</b><small>★ ELITE 1% &nbsp; ✦ APEX 0.1%</small></div><button class="btn" data-v="shopBuy" data-pack="${s.id}" ${(state.coins<s.price||state.v3.pendingPack)?'disabled':''}>OPEN ONE PACK →</button></article>`).join('')}</div>`+
 `<div class="v6-recent-grid"><div class="v3-feature"><h3>📜 EARN COINS + GUARANTEED CHARACTERS</h3><p>Daily and weekly quests provide spending money. Legend Road gives specific Nationals, Timeskip and Pro character rewards.</p><button class="btn ghost sm" data-go="quests">VIEW CHARACTER QUESTS</button></div><div class="v3-feature"><h3>⭐ YOUR PACK RECORD</h3><p>${f(state.v3.packsOpened)} packs opened · <b>${f(state.v3.eliteFound)}</b> Elite forms · <b>${f(state.v3.apexFound)}</b> Apex forms</p><p>${f(state.v3.coinsSpentOnPacks)} coins spent on packs.</p></div></div>`+
 `<div class="sectionbar"><h2>💎 GEM COSMETICS</h2></div><div class="v4-skins">${SKINS.map(c=>`<button class="btn ghost sm" data-v="skin" data-skin="${c.id}">${escapeHtml(c.name)} · ${c.id===state.v3.skin?'EQUIPPED':c.id==='classic'||state.v3.cosmetics.includes(c.id)?'OWNED':'💎 '+c.price}</button>`).join('')}</div>`;
}
function showPendingPack(){const p=state.v3.pendingPack,c=p&&BY_KEY[p.key];if(!c)return notice('No pack awaiting reveal.');
 const kind=c.packTier||'standard';
 popup(`<div class="v6-pack-reveal ${kind}"><div class="eyebrow">${escapeHtml(p.pack.toUpperCase())} RECRUITMENT · ${kind.toUpperCase()}</div><h2 class="h1">${kind==='apex'?'✦ APEX 0.1% ✦':kind==='elite'?'★ ELITE 1% ★':'NEW ATHLETE!'}</h2><p>${kind==='apex'?'The rarest awakening has arrived!':kind==='elite'?'You landed an Elite Form.':'This character belongs to your collection once claimed.'}</p><div class="v3-single">${card(c,{click:'shopPick'})}</div><button class="btn" data-v="shopPick" data-key="${escapeHtml(c.key)}">CLAIM ${escapeHtml(c.name.toUpperCase())} →</button></div>`);
}
function buyPack(kind,fromToken=false){const s=SHOP.find(x=>x.id===kind);if(!s)return false;
 if(state.v3.pendingPack){showPendingPack();notice('Claim the previous pack first.');return false;}
 const pay=fromToken?0:s.price;if(state.coins<pay){notice('Not enough coins. Earn more through drafts, duels and quests.');return false;}
 // Exactly ONE result per purchase. A 0.1% drop remains 0.1%, not 1-in-4.
 const result=SpikePacks.drawPack(CATALOG,s.stage);
 state.coins-=pay;state.v3.coinsSpentOnPacks+=pay;state.v3.packsOpened++;
 if(result.tier==='elite')state.v3.eliteFound++;
 if(result.tier==='apex')state.v3.apexFound++;
 state.v3.pendingPack={key:result.card.key,pack:kind,openedAt:Date.now(),tier:result.tier};
 offer={cards:[result.card],kind:'shop'};track('packsOpened');
 save();render();showPendingPack();return true;
}
function shopPick(key){const pending=state.v3.pendingPack;if(!pending||pending.key!==key)return;
 const cardObj=addCard(key);if(!cardObj)return;
 if(cardObj.stage>=2)track('rare');
 if(cardObj.stage===3){state.v3.proOwned++;track('pro')}
 if(cardObj.packTier==='elite')track('elites');
 if(cardObj.packTier==='apex')track('apex');
 state.v3.pendingPack=null;offer=null;save();close();show('shop');
 popup(`<div class="eyebrow">PERMANENT RECRUIT ACQUIRED</div><h2 class="h1">${escapeHtml(cardObj.name.toUpperCase())}</h2><div class="v3-single">${card(cardObj)}</div><p>${escapeHtml(cardObj.variant)} · ${cardObj.power} OVR. Saved to your collection.</p><button class="btn" data-v="close">CONTINUE</button>`);
}
function track(metric,n=1){rollover();state.v3.quests[metric]=(state.v3.quests[metric]||0)+n;state.v3.weekly[metric]=(state.v3.weekly[metric]||0)+n;}
const DAILY=[['run1','Squad Architect','Complete one six-player draft','runs',1,{coins:500,tickets:1}],['draft4','Talent Scout','Pick four characters','picks',4,{coins:380,rerolls:2}],['duel1','Enter the Court','Complete a duel','duels',1,{coins:400,gems:12}],['win1','First Point','Win one duel','wins',1,{coins:650,tickets:2}],['staff1','Coach Recruitment','Recruit one coach','staff',1,{coins:700,gems:30}],['rare1','Spot a Star','Recruit one 90+ OVR card','rare',1,{tokens:1,gems:25}],['pack1','Pack Opening Day','Open one Nationals, Timeskip or Pro pack','packsOpened',1,{coins:750,gems:10}],['run2','Double Draft Payday','Finish two squad drafts today','runs',2,{coins:1800,tickets:1}],['duel3','Three-Game Bonus','Finish three duels today','duels',3,{coins:1350,rerolls:2}]];
const WEEKLY=[['week3','Squad Streak','Finish 3 squad drafts','runs',3,{coins:2200,tickets:4}],['week10','Court Veteran','Play 10 duels','duels',10,{coins:2800,rerolls:5}],['week5','Win Five','Win 5 duels','wins',5,{coins:3600,gems:80}],['week15','Special Scout','Pick 15 characters','picks',15,{tokens:2}],['weekpro','Professional Path','Obtain 2 pro cards','pro',2,{coins:6200}],['wpack3','Pack Collector','Open 3 premium packs this week','packsOpened',3,{coins:3200,gems:35}],['wruns7','Seven Squads','Complete seven full drafts this week','runs',7,{coins:8000,tickets:5}],['wduels12','Tournament Earnings','Finish 12 duels','duels',12,{coins:10500,proTokens:1}]];
const QUESTLINE=[['m1','The First Six','Complete your first squad draft',()=>state.v3.runs>=1,{coins:1200}],['m2','Seasoned Coach','Recruit three staff members',()=>state.coaches.length>=3,{tokens:1,gems:25}],['m3','National Prospect','Win 10 matches',()=>state.wins>=10,{coins:7000}],['m4','Volleyball Collector','Own 25 different character cards',()=>owned().length>=25,{tokens:2}],['m5','True Rivals','Win 20 matches against players or bots',()=>state.wins>=20,{proTokens:1}],['m6','Professional Champion','Win 40 matches',()=>state.wins>=40,{proTokens:2}],['m7','The Greatest Squad','Complete 25 squad runs',()=>state.v3.runs>=25,{proTokens:2}],
 ['m8','First National Star','Complete 3 squad drafts',()=>state.v3.runs>=3,{coins:1500,cardName:'Shoyo Hinata',cardStage:1}],
 ['m9','The Setter Journey','Win 12 matches',()=>state.wins>=12,{coins:7000,cardName:'Tobio Kageyama',cardStage:1}],
 ['m10','Timeskip Challenger','Complete 12 squad drafts',()=>state.v3.runs>=12,{coins:10500,cardName:'Kenma Kozume',cardStage:2}],
 ['m11','Pro Road','Win 60 matches',()=>state.wins>=60,{coins:25000,cardName:'Shoyo Hinata',cardStage:3}],
 ['m12','Elite Hunter','Open 75 card packs',()=>state.v3.packsOpened>=75,{coins:18000,cardName:'Atsumu Miya',cardStage:3,cardTier:'elite'}],
 ['m13','Apex Legend','Win 250 matches',()=>state.wins>=250,{coins:50000,cardName:'Wakatoshi Ushijima',cardStage:3,cardTier:'apex'}]
];
function claimedRewards(reward){state.coins+=(reward.coins||0);state.gems+=(reward.gems||0);state.tickets+=(reward.tickets||0);state.v3.rerolls+=(reward.rerolls||0);state.v3.quickTokens+=(reward.tokens||0);state.v3.proTokens=(state.v3.proTokens||0)+(reward.proTokens||0);
 if(reward.cardName){const c=CATALOG.find(x=>x.name===reward.cardName&&x.stage===reward.cardStage&&(x.packTier||'standard')===(reward.cardTier||'standard'));if(c){addCard(c.key);if(c.stage===3){state.v3.proOwned++;}}}
}
function questRows(rows,period){return rows.map(([key,name,desc,metric,target,reward])=>{const full=period==='milestone'?metric():Math.min(target,Number(state.v3[period==='weekly'?'weekly':'quests'][metric]||0));const complete=period==='milestone'?full:full>=target;const tracker=period==='milestone'?'milestoneClaimed':period==='weekly'?'weeklyClaimed':'claimed';const taken=!!state.v3[tracker][key];return `<div class="v3-quest"><div><b>${name}</b><p>${desc}</p><small>${period==='milestone'?(complete?'COMPLETE':'LOCKED'):`${full}/${target}`} • ${reward.coins?'◉ '+f(reward.coins):''}${reward.tokens?' ✦ '+reward.tokens+' Nationals tokens':''}${reward.gems?' 💎 '+reward.gems:''}${reward.tickets?' ↻ '+reward.tickets+' rolls':''}${reward.rerolls?' ⟳ '+reward.rerolls+' rerolls':''}${reward.proTokens?' ★ '+reward.proTokens+' PRO tokens':''}${reward.cardName?' 🏐 '+escapeHtml(reward.cardTier?reward.cardTier.toUpperCase()+' ':'')+escapeHtml(reward.cardName)+' ('+escapeHtml(VERSIONS[reward.cardStage])+')':''}</small></div><button class="btn sm" data-v="claimQuest" data-quest="${period}|${key}" ${taken||!complete?'disabled':''}>${taken?'CLAIMED':complete?'CLAIM':'IN PROGRESS'}</button></div>`}).join('')}
function questsPage(){return head('PROGRESSION','COIN QUESTS & CHARACTER JOURNEYS','Earn coins daily and weekly. Legend Road awards guaranteed Nationals, Timeskip and Pro characters—even Elite and Apex for major achievements.')+`<div class="v3-stats"><div><small>COINS</small><strong>${f(state.coins)}</strong></div><div><small>NATIONALS TOKENS</small><strong>${state.v3.quickTokens||0}</strong></div><div><small>PRO TOKENS</small><strong>${state.v3.proTokens||0}</strong></div><div><small>COMPLETE RUNS</small><strong>${state.v3.runs}</strong></div></div><div class="v3-actionrow"><button class="btn" data-v="spendToken" data-token="nation" ${(state.v3.quickTokens||0)<1?'disabled':''}>USE NATIONALS TOKEN</button><button class="btn" data-v="spendToken" data-token="professional" ${(state.v3.proTokens||0)<1?'disabled':''}>USE PRO TOKEN</button></div><div class="v6-quest-tip"><strong>♛ REWARDS YOU CAN EARN</strong><span>Coins to buy packs · Gems for staff & cosmetics · Named character cards from Legend Road. The 1% / 0.1% probabilities apply to pack openings, not quest rewards.</span></div><div class="v3-tabs"><button data-v="questTab" data-tab="daily" class="${tab==='daily'?'active':''}">DAILY</button><button data-v="questTab" data-tab="weekly" class="${tab==='weekly'?'active':''}">WEEKLY</button><button data-v="questTab" data-tab="milestone" class="${tab==='milestone'?'active':''}">LEGEND ROAD</button></div><div class="v3-quest-panel">${tab==='daily'?questRows(DAILY,'daily'):tab==='weekly'?questRows(WEEKLY,'weekly'):questRows(QUESTLINE.map(x=>[x[0],x[1],x[2],x[3],1,x[4]]),'milestone')}</div>`}
function claimQuest(key){const [period,idKey]=key.split('|');const tracker=period==='milestone'?'milestoneClaimed':period==='weekly'?'weeklyClaimed':'claimed';if(state.v3[tracker][idKey])return;
 const list=period==='milestone'?QUESTLINE:period==='weekly'?WEEKLY:DAILY;const quest=list.find(x=>x[0]===idKey);if(!quest)return;const ok=period==='milestone'?quest[3]():Number(state.v3[period==='weekly'?'weekly':'quests'][quest[3]]||0)>=quest[4];if(!ok)return notice('Quest not finished');state.v3[tracker][idKey]=true;claimedRewards(period==='milestone'?quest[4]:quest[5]);save();render();notice('QUEST COMPLETE — rewards collected!');}
function duelPage(){return head('COMPETITIVE ARENA','DUEL YOUR FRIENDS','Saved teams or customizable from-scratch drafts: free school roll after every player selection.')+
 `<div class="v3-duel-modes"><button class="v3-mode ${duelMode==='saved'?'active':''}" data-v="duelMode" data-mode="saved"><strong>⚔ SAVED SQUAD</strong><p>Use your strongest permanent lineup and active coach.</p></button><button class="v3-mode ${duelMode==='fresh'?'active':''}" data-v="duelMode" data-mode="fresh"><strong>🎴 FRIENDLY FRESH DRAFT</strong><p>Draft a new squad of six, one card from four each round.</p></button></div>
 ${duelMode==='fresh'?`<div class="v4-custom"><h2>FRIENDLY DUEL SETTINGS</h2><p>These apply equally to both players. Your first school and every school after a pick are always FREE.</p><div class="v4-controls"><label>EXTRA SCHOOL ROLLS <input type="number" min="0" max="30" id="extraRolls" value="${friendSettings.extraRolls}"></label><label>FOUR-CARD REROLLS <input type="number" min="0" max="30" id="friendRerolls" value="${friendSettings.rerolls}"></label><label class="v4-check"><input type="checkbox" id="friendCoaches" ${friendSettings.coaches?'checked':''}> Enable coach boosts</label></div></div>`:''}
 <div class="v3-panels two"><div class="v3-feature"><h2>CREATE PRIVATE ROOM</h2><p>Set the rules and get a six-character room code. Your friend joins with the same settings.</p><button class="btn" data-v="createRoom">CREATE ${duelMode==='fresh'?'DRAFT':'SAVED'} DUEL</button></div><div class="v3-feature"><h2>JOIN FRIEND ROOM</h2><p>Enter their code. The host's duel rules will apply.</p><input id="roomCode" class="field" placeholder="6-CHARACTER CODE" maxlength="6"><button class="btn ghost" data-v="joinRoom">JOIN DUEL →</button></div></div><div class="v3-feature"><h2>TRAIN AGAINST A BOT</h2><p>Build a saved squad and earn coins from AI duels.</p><div class="v3-actionrow"><button class="btn sm" data-v="bot" data-difficulty="easy">EASY</button><button class="btn sm ghost" data-v="bot" data-difficulty="medium">NORMAL</button><button class="btn sm ghost" data-v="bot" data-difficulty="hard">HARD</button></div></div><div class="v3-note">Friendly draft limits only affect the current match; your permanent collection is unchanged.</div>`;}
const CAREER_SCHOOLS=['TOKONAMI','WAKUNAN','DATE TECH','AOBA JOHSAI','NEKOMA','INARIZAKI','SHIRATORIZAWA'];
const CAREER_OVR=[65,71,77,83,89,94,98];
function careerPage(){return head('SCHOOL CHALLENGES','ROAD TO THE NATIONALS','Defeat each Haikyuu school using your best saved six. Earn coins and a guaranteed first-clear player card from that school.')+
 `<div class="v3-quest-panel">${CAREER_SCHOOLS.map((school,i)=>`<div class="v3-quest"><div><b>${i+1}. ${escapeHtml(school)}</b><p>Opponent rating ${CAREER_OVR[i]} · ${f(400+i*220)} coins on a win · First victory: school player card</p></div><button class="btn sm" data-v="careerFight" data-idx="${i}" ${i>state.career?'disabled':''}>${i<state.career?'REPLAY':'CHALLENGE'}</button></div>`).join('')}</div>`}
function schoolOpponentRoster(school,level){const pool=CATALOG.filter(c=>c.school===school&&c.stage===0),seen=new Set();return POS.map((role,i)=>{const options=pool.filter(c=>(role==='MB/L'?['MB','L'].includes(c.position):c.position===role)&&!seen.has(c.idx));const fallback=pool.filter(c=>!seen.has(c.idx));const c=(options.length?options:fallback).sort((a,b)=>b.power-a.power)[0];if(c){seen.add(c.idx);return {...c,power:level,attack:level,defense:level,set:level};}return {name:school+' PLAYER '+(i+1),school,position:role,power:level,attack:level,defense:level,set:level};});}

function asRoster(cards=starting()){return cards.map(c=>({id:c.uid||c.key,name:c.name,position:c.position,school:c.school,power:Math.min(100,c.power+(c.level||0)),attack:Math.min(100,c.attack+(c.level||0)),defense:Math.min(100,c.defense+(c.level||0)),set:Math.min(100,c.set+(c.level||0)),awakening:c.packTier==='apex'?6:c.packTier==='elite'?3:0}));}
function popupRoom(){if(!room)return;const players=room.players||[];popup(`<div class="eyebrow">PRIVATE ${room.mode==='fresh'?'DRAFT':'SAVED SQUAD'} DUEL</div><h2 class="h1">ROOM ${room.code}</h2><p>Share this code with a friend. ${room.mode==='fresh'?`Extra school rolls: ${room.settings?.extraRolls??8} · Card rerolls: ${room.settings?.rerolls??5} · Coaches: ${room.settings?.coaches?'on':'off'}. `:''}${room.status==='draft'?'Draft your squad together!':'Both players must press Ready before starting.'}</p><div class="v3-guestrows">${players.map((p,i)=>`<div><b>${escapeHtml(p.name)}</b><span>${p.power||0} OVR</span><em>${p.ready?'READY':'WAITING'}</em></div>`).join('')}${players.length<2?'<div>Waiting for opponent to join...</div>':''}</div>${room.status==='waiting'?`<div class="flexgap"><button class="btn" data-v="ready">${players[room.youIndex]?.ready?'CANCEL READY':'READY UP'}</button><button class="btn ghost" data-v="copyInvite">COPY INVITE</button><button class="btn ghost" data-v="leaveRoom">LEAVE</button></div>`:`<div class="flexgap"><button class="btn ghost" data-v="leaveRoom">LEAVE ROOM</button></div>`}`)}
function connect(action,code=''){if(action==='create'){friendSettings={extraRolls:Draft.numSetting($('#extraRolls')?.value,8),rerolls:Draft.numSetting($('#friendRerolls')?.value,5),coaches:$('#friendCoaches')?.checked!==false};}if(action==='create'&&duelMode==='saved'&&starting().length!==6)return notice('Equip six starters before creating a saved-squad duel');
 if(ws&&ws.readyState<=WebSocket.OPEN)ws.close();ws=new WebSocket(location.origin.replace(/^http/,'ws'));ws.onopen=()=>{ws.send(JSON.stringify({type:action,code,name:state.name,squad:asRoster(),mode:duelMode,settings:friendSettings,coachBuff:(coach()?.value||0)+(manager()?.value||0)*.55,coachSchool:coach()?.school||manager()?.school||'',coachType:coach()?.buff||'',strategy:'balanced'}));};ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}onMessage(m)};ws.onclose=()=>{if(duel?.type!=='live')notice('Connection closed. You can rejoin another room.')};ws.onerror=()=>notice('Could not connect to multiplayer server.');notice('Connecting to game server...')}
function onMessage(m){if(m.type==='error'||m.type==='notice'){notice(m.text||'Room notice');return;}if(m.type==='room'){room={...m};if(room.status==='waiting'&&!duel)popupRoom();return;}
 if(m.type==='draft_offer'){room=room||{};room.mode='fresh';room.draftRound=m.round-1;room.status='draft';offer={kind:'online',round:m.round,school:m.school,cards:m.cards,rerolls:m.rerolls,schoolRolls:m.schoolRolls,needed:m.needed};popupDraft();return;}
 if(m.type==='draft_picked'){offer=null;popup(`<div class="eyebrow">DRAFT ROUND ${m.round}/6</div><h2 class="h1">CARD SECURED!</h2><div class="v3-single">${card(m.pick)}</div><p>Waiting for both players to finish this round...</p><button class="btn ghost" data-v="leaveRoom">LEAVE</button>`);return;}
 if(m.type==='draft_complete'){offer=null;room.status='waiting';popup(`<div class="eyebrow">DRAFT COMPLETE</div><h2 class="h1">YOUR TEAMS ARE READY</h2><p>Both friends have drafted six temporary athletes. Press Ready to start.</p><button class="btn" data-v="ready">READY UP</button>`);return;}
 if(m.type==='start'){offer=null;close();duel={type:'live',names:m.players.map(p=>p.name),rosters:m.players.map(p=>p.squad),score:[0,0],events:[],rally:0,at:Date.now()};drawArena();return;}
 if(m.type==='rally'&&duel?.type==='live'){duel.score=m.score;duel.rally=m.rally;duel.events.push(m);drawArena();return;}
 if(m.type==='finish'&&duel?.type==='live'){const win=m.winner===room?.youIndex;completeMatch(win,win?380:120,false);const sc=m.score;duel=null;popup(`<div class="eyebrow">ONLINE DUEL FINAL</div><h2 class="h1">${win?'🏆 VICTORY':'DEFEAT'}</h2><h2 class="v3-bigscore">${sc.join(' : ')}</h2><p>Earned ${win?380:120} coins. Both friends received the same server-calculated result.</p><div class="flexgap"><button class="btn" data-v="rematch">REMATCH</button><button class="btn ghost" data-v="leaveRoom">LEAVE</button></div>`);render();return;}
 if(m.type==='rematch_wait')notice('Waiting for your friend to request a rematch');}
function popupDraft(){if(!offer||offer.kind!=='online')return;popup(`<div class="eyebrow">LIVE FRIEND DRAFT • PICK ${offer.round}/6</div><h2 class="h1">${escapeHtml(offer.school)}</h2><p>Choose a position you still need: ${offer.needed.join(', ')}. The next school's first offer is free after a pick.</p><div class="v3-card-grid">${offer.cards.map(c=>card(c,{click:'onlinePick',disabled:!offer.needed.includes(c.position)})).join('')}</div><div class="flexgap"><button class="btn ghost" data-v="onlineSchoolRoll" ${offer.schoolRolls<=0?'disabled':''}>↻ NEW SCHOOL (${offer.schoolRolls} LEFT)</button><button class="btn ghost" data-v="onlineReroll" ${offer.rerolls<=0?'disabled':''}>⟳ REROLL 4 (${offer.rerolls} LEFT)</button><button class="btn ghost" data-v="leaveRoom">LEAVE</button></div>`)}
function completeMatch(win,coin,career=false){if(coach()?.buff==='coins')coin=Math.round(coin*(1+coach().value/100));if(manager())coin=Math.round(coin*(1+(manager().value||0)/100));state.coins+=coin;state.v3.coinsWon+=coin;state.xp=(state.xp||0)+(win?70:20);if(win){state.wins=(state.wins||0)+1;state.trophies=(state.trophies||0)+15;track('wins');if(Number.isInteger(career)&&career>=0&&state.career<=career)state.career=career+1;}else state.losses=(state.losses||0)+1;track('duels');save();}
function botMatch(level=75,careerIdx=-1){if(starting().length!==6)return notice('Equip a full squad of six first.');const opponents=['Training Bots','Rival Academy','Regional Champions','Nationals Elite','Top Pros'];const name=careerIdx>=0?CAREER_SCHOOLS[careerIdx]||'Career Rival':opponents[clamp(Math.floor((level-60)/10),0,4)];const our=starting(),rosterEnemy=careerIdx>=0?schoolOpponentRoster(name,level):Array.from({length:6},(_,i)=>({name:`${name} #${i+1}`,school:'RIVALS',position:POS[i],power:level,attack:level,defense:level,set:level}));duel={type:'bot',names:[state.name,name],rosters:[our,rosterEnemy],score:[0,0],events:[],rally:0};drawArena();clearInterval(botTick);let serve=0;botTick=setInterval(()=>{if(!duel||duel.type!=='bot'){clearInterval(botTick);return;}const t1=avg(our)+chem(our,coach()).total*.50,t2=level;const p=clamp(.5+(t1-t2)*.015,.1,.90);const winner=Math.random()<p?0:1;duel.rally++;duel.score[winner]++;const score=[...duel.score],who=pick(duel.rosters[winner]);duel.events.push({winner,actor:who.name,setter:duel.rosters[winner].find(c=>c.position==='S')?.name||'Setter',action:pick(['QUICK ATTACK','POWER SPIKE','JUMP SERVE ACE','PERFECT DIG','IRON WALL BLOCK']),score});drawArena();if((Math.max(...score)>=15&&Math.abs(score[0]-score[1])>=2)||duel.rally>=43){clearInterval(botTick);const won=score[0]>score[1],prize=won?careerIdx>=0?400+careerIdx*220:320:95;completeMatch(won,prize,careerIdx);
 let dropped=null;if(won&&careerIdx>=0){state.v3.careerCardsClaimed=state.v3.careerCardsClaimed||{};if(!state.v3.careerCardsClaimed[careerIdx]){const target=CATALOG.filter(x=>x.school===name&&x.stage===0);if(target.length){dropped=addCard(pick(target).key);state.v3.careerCardsClaimed[careerIdx]=true;save();}}}
 duel=null;popup(`<div class="eyebrow">MATCH COMPLETE</div><h2 class="h1">${won?'🏆 VICTORY':'DEFEAT'}</h2><h2 class="v3-bigscore">${score.join(' : ')}</h2><p>Earned ${f(prize)} coins. ${dropped?'Bonus first-clear player: '+escapeHtml(dropped.name)+' ('+dropped.power+' OVR)!':'Spend rewards in the Pro Shop.'}</p><button class="btn" data-v="close">CONTINUE</button>`);render();}},850)}
function drawArena(){if(!duel)return;const ev=duel.events.at(-1),a=duel.rosters[0],b=duel.rosters[1];
 const teamMarkup=(cards,away=false)=>`<div class="v5-duel-team ${away?'away':''}">${cards.map((p,i)=>{const item=CATALOG.find(x=>x.name===p.name),pic=item?.portrait||'portraits/staff-placeholder.svg';return `<div class="v5-duel-athlete" style="--team:${SPIKE_COLORS[p.school]||'#517f9e'}"><div data-img-name="${escapeHtml(p.name)}" class="v5-duel-face"><img loading="lazy" src="${pic}" alt="${escapeHtml(p.name)}" /></div><b>${escapeHtml(p.name.split(' ').at(-1))}</b><small>${p.position||'OH'} · ${p.power||'-'}</small></div>`;}).join('')}</div>`;
 popup(`<div class="v5-duel-arena"><div class="eyebrow">${duel.type==='live'?'● LIVE FRIEND DUEL':'● SCHOOL / AI MATCH'} · RALLY ${duel.rally}</div><div class="v5-duel-score"><div><small>HOME</small><b>${escapeHtml(duel.names[0])}</b></div><strong>${duel.score[0]} <em>:</em> ${duel.score[1]}</strong><div><small>AWAY</small><b>${escapeHtml(duel.names[1])}</b></div></div><div class="v5-duel-court"><div class="v5-duel-half">${teamMarkup(a)}</div><div class="v5-duel-net"><span>NET</span></div><div class="v5-duel-half away">${teamMarkup(b,true)}</div><span class="v5-duel-ball">🏐</span></div><div class="v5-duel-action">${ev?`⚡ ${escapeHtml(ev.setter||'SETTER')} → ${escapeHtml(ev.actor)} · ${escapeHtml(ev.action)}`:'🏐 FIRST SERVE INCOMING'}</div><div class="v3-logs">${duel.events.slice(-3).reverse().map(e=>`<div>${escapeHtml(e.actor)} — ${escapeHtml(e.action)} · point for ${escapeHtml(duel.names[e.winner])}</div>`).join('')}</div>${duel.type==='bot'?'<button class="btn ghost sm" data-v="stopBot">STOP MATCH</button>':'<small class="v3-note">Both players see the same server-generated rally results.</small>'}</div>`);
}

function infoCard(uid){const c=player(uid);if(!c)return;popup(`<div class="eyebrow">PLAYER DETAILS</div><h2 class="h1">${escapeHtml(c.name)}</h2><div class="v3-single">${card(c)}</div><p>Team: ${escapeHtml(c.school)} • ${c.position} • ${c.variant}</p><p>Attack ${c.attack} · Defence ${c.defense} · Setting ${c.set}</p><p>Signature ability: ${escapeHtml(c.ability)}</p><div class="flexgap"><button class="btn" data-v="close">CLOSE</button><button class="btn ghost" data-v="openSquad">EQUIP IN SQUAD</button></div>`)}
// Anime portraits from verified series listings; SVGs remain as backups if an
// online source is missing or the original publisher blocks remote loading.
const remoteLoaded=new Map();const remotePending=new Map();let io;
function loadOnlinePortraits(){
 for(const el of $$('[data-img-name]')){
  const name=el.dataset.imgName;
  if(remoteLoaded.has(name)){
   const info=remoteLoaded.get(name);
   if(info?.url)insertRemote(el,info);
   continue;
  }
  if(!io&&'IntersectionObserver'in window){
   io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){io.unobserve(entry.target);resolvePortrait(entry.target);}
   }),{rootMargin:'350px'});
  }
  if(io)io.observe(el);else resolvePortrait(el);
 }
}
function insertRemote(el,info){
 if(!info?.url||el.querySelector('.v3-remote'))return;
 const urls=[info.url,...(Array.isArray(info.alternates)?info.alternates:[])].filter(Boolean);
 let next=0;
 const node=document.createElement('img');
 node.className='v3-remote';node.alt=el.dataset.imgName+' — Haikyuu character portrait';
 node.loading='lazy';node.decoding='async';node.referrerPolicy='no-referrer';
 node.dataset.source=info.source||'Online portrait';
 node.onerror=()=>{
  next++;
  if(next<urls.length)node.src=urls[next];
  else {node.remove();el.dataset.art='fallback';}
 };
 node.onload=()=>{el.dataset.art='online';};
 el.prepend(node);node.src=urls[0];
}
async function resolvePortrait(el){
 const name=el.dataset.imgName;
 if(!name)return;
 if(!remotePending.has(name)){
  const request=(async()=>{
   try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),16000);
    let res;
    try{res=await fetch('/api/portrait?name='+encodeURIComponent(name),{signal:controller.signal});}
    finally{clearTimeout(timeout);}
    if(!res.ok)throw new Error('Portrait lookup failed');
    const data=await res.json();
    const info=typeof data.url==='string'?data:{url:'',source:'none'};
    remoteLoaded.set(name,info);
    for(const other of $$('[data-img-name]'))if(other.dataset.imgName===name){
     if(info.url)insertRemote(other,info);else other.dataset.art='fallback';
    }
   }catch(e){
    // Do not cache transient network errors as permanent missing portraits.
    console.warn('Portrait request failed for',name,e.message);
   }finally{remotePending.delete(name);}
  })();
  remotePending.set(name,request);
 }
 await remotePending.get(name);
}
function actionEvent(e){const t=e.target.closest('[data-go],[data-v],[data-view]');if(!t){if(e.target.id==='overlay')close();return;}if(t.dataset.go||t.dataset.view){close();show(t.dataset.go||t.dataset.view);return;}const v=t.dataset.v;switch(v){case'close':close();break;case'startRun':startRun();break;case'confirmNewRun':close();newRun();break;case'chooseOffer':runPick(t.dataset.key);break;case'rerollOffer':rerollOffer();break;case'changeSchool':changeSchool();break;case'skin':buyCosmetic(t.dataset.skin);break;case'staffRoll':staffRoll();break;case'staffTab':coachTab=t.dataset.tab==='managers'?'managers':'coaches';render();break;case'chooseCoach':chooseCoach(t.dataset.coach);break;case'equipCoach':{const c=ownedCoaches().find(x=>x.uid===t.dataset.coach);if(!c)return;if(c.type==='manager')state.manager=c.uid;else state.coach=c.uid;save();render();notice((c.type==='manager'?'Manager':'Coach')+' equipped.');break;}case'shopBuy':buyPack(t.dataset.pack);break;case'shopPick':shopPick(t.dataset.key);break;case'revealPending':showPendingPack();break;case'viewCard':infoCard(t.dataset.uid);break;case'openSquad':close();show('squad');break;case'selectSlot':selectionSlot=+t.dataset.idx;render();break;case'equipPlayer':collectSelect(t.dataset.uid,selectionSlot>=6?'bench':'squad');break;case'clearSlot':if(selectionSlot>=6)state.bench[selectionSlot-6]=null;else state.squad[selectionSlot]=null;save();render();break;case'autoSquad':{const sorted=owned().sort((a,b)=>b.power-a.power),used=new Set();state.squad=POS.map((p,i)=>{const x=sorted.find(c=>slotCompatible(i,c)&&!used.has(c.uid));if(x)used.add(x.uid);return x?.uid||null});save();render();notice('Best eligible six selected.');break;}case'savePreset':{const idx=+t.dataset.idx;state.savedTeams[idx]={squad:[...state.squad],bench:[...state.bench],coach:state.coach,manager:state.manager,savedAt:Date.now()};save();render();notice('Saved squad '+(idx+1));break;}case'loadPreset':{const o=state.savedTeams[+t.dataset.idx];if(!o)return;const keep=new Set(state.items.map(c=>c.uid));state.squad=o.squad.map(x=>keep.has(x)?x:null);state.bench=(o.bench||[]).map(x=>keep.has(x)?x:null);state.coach=o.coach;state.manager=o.manager||null;save();render();notice('Squad loaded');break;}case'questTab':tab=t.dataset.tab;render();break;case'claimQuest':claimQuest(t.dataset.quest);break;case'spendToken':{const kind=t.dataset.token==='professional'?'proTokens':'quickTokens';if((state.v3[kind]||0)<1)return;if(buyPack(t.dataset.token==='professional'?'professional':'nation',true)){state.v3[kind]--;save();}break;}case'duelMode':duelMode=t.dataset.mode;render();break;case'createRoom':connect('create');break;case'joinRoom':connect('join',($('#roomCode')?.value||'').trim().toUpperCase());break;case'ready':if(ws?.readyState===WebSocket.OPEN){const me=room?.players?.[room.youIndex];ws.send(JSON.stringify({type:'ready',ready:!me?.ready}));}break;case'onlinePick':if(ws?.readyState===WebSocket.OPEN&&offer?.cards.some(x=>x.key===t.dataset.key&&offer.needed.includes(x.position)))ws.send(JSON.stringify({type:'draft_pick',key:t.dataset.key}));break;case'onlineReroll':if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'draft_reroll'}));break;case'onlineSchoolRoll':if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'draft_school_roll'}));break;case'leaveRoom':ws?.send(JSON.stringify({type:'leave'}));ws?.close();room=null;offer=null;duel=null;close();render();break;case'copyInvite':{const url=new URL(location.href);url.searchParams.set('join',room.code);if(navigator.clipboard)navigator.clipboard.writeText(url.href).then(()=>notice('Invite link copied'),()=>prompt('Copy invitation link',url.href));else prompt('Copy invitation link',url.href);break;}case'rematch':ws?.send(JSON.stringify({type:'rematch'}));notice('Rematch requested.');break;case'bot':botMatch(({easy:67,medium:80,hard:93})[t.dataset.difficulty]);break;case'careerFight':botMatch(CAREER_OVR[+t.dataset.idx],+t.dataset.idx);break;case'stopBot':clearInterval(botTick);duel=null;close();break;}}
document.addEventListener('click',actionEvent);document.addEventListener('change',e=>{if(e.target.id==='schoolChoice'){chosenSchool=e.target.value;if(!SCHOOLS.includes(chosenSchool))chosenSchool='ALL SCHOOLS';if(state.v3.run&&state.v3.offer){if(chosenSchool!=='ALL SCHOOLS'&&state.coins<80){notice('Need 80 coins to target a school');chosenSchool='ALL SCHOOLS';render();return;}newRunOffer();}}});document.addEventListener('input',e=>{if(e.target.id==='inventorySearch'){filters=e.target.value;const pos=e.target.selectionStart;render();const input=$('#inventorySearch');if(input){input.focus();input.setSelectionRange(pos,pos)}}});$('#profileBtn').addEventListener('click',()=>popup(`<div class="eyebrow">PLAYER PROFILE</div><h2 class="h1">${escapeHtml(state.name)}</h2><label for="renameInput">DISPLAY NAME</label><input id="renameInput" class="field" maxlength="18" value="${escapeHtml(state.name)}"/><button class="btn" data-v="rename">SAVE NAME</button><p>Level ${state.level} • ${state.wins} wins • ${state.v3.runs} squad runs. Progress saves in your browser; connect Supabase for cloud saving.</p>`));document.addEventListener('click',e=>{if(e.target.closest('[data-v="rename"]')){state.name=($('#renameInput')?.value||'ROOKIE').replace(/[^\w -]/g,'').trim().slice(0,18)||'ROOKIE';save();close();render();}},true);
// New accounts begin with a free draft, not a pre-completed squad. Existing browser saves remain unchanged.
const invited=new URLSearchParams(location.search).get('join');render();if(invited&&/^[A-Z0-9]{6}$/i.test(invited)){show('duels');setTimeout(()=>connect('join',invited.toUpperCase()),500);}
