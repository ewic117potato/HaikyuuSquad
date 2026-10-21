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
const SCHOOLS=[...SPIKE_SCHOOL_TEAMS,...SPIKE_SECONDARY_TEAMS];
const POS=['OH','MB','OP','MB/L','OH','S'];
const Balance=SpikeBalance;
const Draft=SpikeDraftRules;
const Gauntlet=SpikeGauntlet;
const Quality=typeof SpikeQuality!=='undefined'?SpikeQuality:{speed:v=>[1,2,4].includes(Number(v))?Number(v):1,interval:v=>Math.round(1050/(Number(v)||1)),recommend:()=>'',CHOICE_ADVICE:{},questStatus:()=>({claimable:0,claimed:0,total:0})};
let careerChapter=0;
const COACH_RARITIES=['Common','Rare','Epic','Legendary','Mythic','Secret'];
const COACH_CHANCES=[30,29,20,12,7,2];
function staffTier(){let k=Math.random()*100;for(let i=0;i<COACH_CHANCES.length;i++){k-=COACH_CHANCES[i];if(k<0)return i;}return 5;}
function ratedCoach(base,tier){return {...base,portrait:`portraits/staff/${String(Number(base.id.split('-').at(-1))).padStart(2,'0')}.svg`,tier,rarity:COACH_RARITIES[tier],value:Math.min(10,Math.max(1,Math.round(base.value*[.35,.55,.85,1.12,1.45,1.9][tier])))};}
const VERSIONS=Balance.STAGES;
const Links=SpikeChemistry;
const DUOS=Links.PAIRS.map(([a,b,label,bonus])=>[a,b,label,bonus]);
const REGION_UNLOCKS=[
 {school:'NOHEBI',wins:2,label:'Regional Trial I'},
 {school:'JOHZENJI',wins:4,label:'Regional Trial II'},
 {school:'TSUBAKIHARA',wins:6,label:'Regional Trial III'},
 {school:'TOKONAMI',wins:8,label:'Regional Master'}
];
const unlockedSchools=()=>[...SPIKE_SCHOOL_TEAMS,...REGION_UNLOCKS.filter(x=>state.career>=x.wins).map(x=>x.school)];
const SCHEMES={KARASUNO:'Offensive tempo',NEKOMA:'Receiving & endurance',FUKURODANI:'Ace power',INARIZAKI:'Serve & attack',SHIRATORIZAWA:'Raw power','DATE TECH':'Blocking','AOBA JOHSAI':'Precision setting',KAMOMEDAI:'Block & balance'};
const SQUAD_NAMES=['Main Team','All-Rounders','Championship','Defence Unit','Dream Team'];
function generatedCard(i,v){return Balance.buildCard(SPIKE_ROSTER[i],i,v);}
// Keep the existing school draft untouched; premium shop cards are additional
// collectible variants and are only available from premium packs or long quests.
// Strict card families: High School (+ Nationals for actual qualifiers) in school
// scouting; adult Timeskip and Professional only in their own packs/quests.
const BASE_CATALOG=SPIKE_ROSTER.flatMap((x,i)=>{
 const variants=x.proOnly?[3]:x.supportRoster?[0]:[0,
  ...(SPIKE_NATIONALS_SCHOOLS.includes(x.school)?[1]:[]),
  ...(SpikePacks.TIMESKIP_NAMES.has(x.name)?[2]:[])];
 return variants.map(v=>generatedCard(i,v));
});
// Legend Road cards are separate collectibles: NEVER school rolls, pack drops or
// paid shop purchases. Each requires a one-time quest claim.
const QUEST_LEGENDS=[
 {key:'legend-bokuto-thunder',name:'Kotaro Bokuto',title:'BOKUTO · THUNDER ACE',power:104,ability:'Thunder Ace Awakening',school:'FUKURODANI'},
 {key:'legend-hinata-sky',name:'Shoyo Hinata',title:'HINATA · SKY BREAKER',power:103,ability:'Sky Breaker',school:'KARASUNO'},
 {key:'legend-kenma-oracle',name:'Kenma Kozume',title:'KENMA · COURT ORACLE',power:100,ability:'Perfect Game Plan',school:'NEKOMA'},
 {key:'legend-kageyama-king',name:'Tobio Kageyama',title:'KAGEYAMA · COURT KING',power:105,ability:'King of Setters',school:'KARASUNO'},
 {key:'legend-ushijima-power',name:'Wakatoshi Ushijima',title:'USHIJIMA · LEFT ARM',power:105,ability:'Unstoppable Cannon',school:'SHIRATORIZAWA'}
].map(spec=>{
 const original=BASE_CATALOG.find(c=>c.name===spec.name&&c.stage===0);
 return {...original,...spec,stage:4,variant:spec.title,rarity:spec.power>=100?5:4,
  questOnly:true,cardSource:'quest',packTier:undefined,proOnly:false,
  attack:Math.min(110,Math.max(original?.attack||85,spec.power+1)),
  defense:Math.min(110,Math.max(original?.defense||85,spec.power-2))};
});
const QUEST_LEGEND_MAP=Object.fromEntries(QUEST_LEGENDS.map(c=>[c.key,c]));
const CATALOG=BASE_CATALOG.concat(
 BASE_CATALOG.filter(SpikePacks.eliteCandidate).map(c=>SpikePacks.upgradeCard(c,'elite')),
 BASE_CATALOG.filter(SpikePacks.apexCandidate).map(c=>SpikePacks.upgradeCard(c,'apex')),
 QUEST_LEGENDS
);
const BY_KEY=Object.fromEntries(CATALOG.map(x=>[x.key,x]));
const DEFAULT=()=>({name:'ROOKIE',coins:2500,tickets:4,items:[],squad:[null,null,null,null,null,null],bench:[null,null,null,null],coach:null,coaches:[],savedTeams:[null,null,null,null,null],wins:0,losses:0,level:1,xp:0,trophies:0,rolls:0,career:0,meta:{},v3:{runs:0,run:null,offer:null,rerolls:2,packs:0,coachPacks:0,coinsWon:0,quests:{},weekly:{},claimed:{},weeklyClaimed:{},milestoneClaimed:{},day:nowDay(),week:week(),duelGames:0,duelWins:0,proOwned:0,squadCrafts:0,crewBought:0,quickTokens:0}});
let state;try{state=Object.assign(DEFAULT(),JSON.parse(localStorage.getItem('spike-legends-save-v1')||'{}'));}catch{state=DEFAULT()}
if(!state.v3)state.v3=DEFAULT().v3;
state.v3=Object.assign(DEFAULT().v3,state.v3);
// Persistent preference: full tactical decisions or hands-free match simulation.
state.v3.matchMode=state.v3.matchMode==='manual'?'manual':'auto';
state.v3.autoSpeed=Quality.speed(state.v3.autoSpeed);
// Older embedded browser test harnesses may load game-v3.js without its V25 companion.
// The deployed index.html loads v25-features.js first and uses the full implementation.
const V25=typeof SpikeV25!=='undefined'?SpikeV25:{
 threshold:(v,d=91)=>v===0||v==='0'?0:Number.isFinite(Number(v))?Math.max(60,Math.min(110,Math.round(Number(v)))):d,
 protectedCards:()=>[],tier:()=>'STANDARD',autoInterval:(v)=>Math.round(1050/(Number(v)||1)),replayDuration:()=>1100
};
state.v3.fastReveals=Boolean(state.v3.fastReveals);
// V25 per-player preferences; 0 disables discard warnings, otherwise valid 60–110 OVR.
state.v3.warnOvr=V25.threshold(state.v3.warnOvr??91);
state.v3.cinematicOvr=V25.threshold(state.v3.cinematicOvr??95,95);
state.v3.cinemaMatch=state.v3.cinemaMatch!==false;
state.v3.packPity=state.v3.packPity||{};
for(const pack of ['timeskip','professional'])state.v3.packPity[pack]=SpikePacks.pityState(state.v3.packPity[pack]);
state.v3.nationalsRoad=state.v3.nationalsRoad||{cleared:0,claimed:{},chapter:0};
state.v3.nationalsRoad.cleared=Math.max(0,Math.min(100,Number(state.v3.nationalsRoad.cleared)||0));
state.v3.chemistryDiscovered=state.v3.chemistryDiscovered||{};
// V9 migration: a pending school offer from a retired school cannot be used.
if(state.v3.offer?.school&&!SPIKE_SCHOOL_TEAMS.includes(state.v3.offer.school))state.v3.offer=null;
// If a previously unfinished draft included now-retired school players, reset that
// draft instead of leaving the user unable to fill the remaining positions.
const validLegacySchoolKeys=new Set(SPIKE_ROSTER.filter(x=>!x.proOnly).map(x=>String(x.id)));
if(state.v3.run?.picks?.length){
 const items=Array.isArray(state.items)?state.items:[];
 const hasRetired=state.v3.run.picks.some(uid=>{const item=items.find(x=>x.uid===uid);return item&&!validLegacySchoolKeys.has(String(item.key).split('-')[0]);});
 if(hasRetired){state.v3.run=null;state.v3.offer=null;}
}


// V10 migration: collapse duplicate inventory cards without destroying lineups.
function migrateUniqueInventory(data){
 if(data?.v3?.uniqueCardsV10)return;
 if(!data?.v3)return;
 const firstByKey=new Map(),replacement=new Map(),unified=[];
 for(const item of data.items||[]){
  if(!item||!item.key||!item.uid)continue;
  const first=firstByKey.get(item.key);
  if(first){first.level=Math.max(first.level||0,item.level||0);replacement.set(item.uid,first.uid);}
  else{const copy={...item};firstByKey.set(item.key,copy);unified.push(copy);}
 }
 data.items=unified;
 const normalize=ids=>{
  if(!Array.isArray(ids))return ids;
  const used=new Set();return ids.map(uid=>{
   if(!uid)return null;
   const id=replacement.get(uid)||uid;
   // The same physical card cannot fill two positions at once.
   if(used.has(id))return null;
   used.add(id);return id;
  });
 };
 data.squad=normalize(data.squad);
 data.bench=normalize(data.bench);
 data.savedTeams=(data.savedTeams||[]).map(t=>t?{...t,squad:normalize(t.squad),bench:normalize(t.bench)}:t);
 if(data.v3.run){
  data.v3.run.picks=normalize(data.v3.run.picks||[]).filter(Boolean);
  const names=new Set();
  data.v3.run.picks=data.v3.run.picks.filter(uid=>{
   const item=data.items.find(x=>x.uid===uid);
   const base=item&&SPIKE_ROSTER.find(x=>String(x.id)===String(item.key).split('-')[0]);
   const name=base?.name;
   if(!name||names.has(name))return false;
   names.add(name);return true;
  });
  data.v3.offer=null; // Regenerate old offers, which can contain duplicated school cards.
 }
 data.v3.uniqueCardsV10=true;
}
migrateUniqueInventory(state);
careerChapter=Gauntlet.chapterForStage(Math.min(Math.max(0,Number(state.career)||0),Gauntlet.STAGES.length-1)).index;

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
// V11: persistent Nationals journeys and unique first-clear rewards.
state.v3.nationals=Object.assign({runs:0,bestWins:0,history:[],active:null,day:nowDay(),dailyEntries:0},state.v3.nationals||{});
if(!Array.isArray(state.v3.nationals.history))state.v3.nationals.history=[];
const Nationals=typeof SpikeNationals!=='undefined'?SpikeNationals:null;
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
// Refresh OVR from the current balance without changing a player's saved ownership or upgrade level.
const owned=()=>state.items.map(o=>({...o,...(BY_KEY[o.key]||{}),uid:o.uid,level:o.level||0})).filter(o=>o.name);
const ownedCoaches=()=>state.coaches.map(o=>{const base=SPIKE_COACHES.find(c=>c.id===o.key);return base?{...ratedCoach(base,Math.max(0,Math.min(5,o.tier||0))),...o,type:staffType(base)}:null}).filter(Boolean);
const player=uid=>owned().find(o=>o.uid===uid);
const coach=()=>ownedCoaches().find(x=>x.uid===state.coach&&x.type==='coach');
const manager=()=>ownedCoaches().find(x=>x.uid===state.manager&&x.type==='manager');
const MANAGER_IDS=new Set([16,17,18,19,20,21,27,28,29]);
const staffType=base=>MANAGER_IDS.has(Number(String(base.id).split('-').at(-1)))?'manager':'coach';
const starting=()=>state.squad.map(player).filter(Boolean);
const bench=()=>state.bench.map(player).filter(Boolean);
function chem(cards=starting(),staff=coach()){
 const links=Links.evaluate(cards);
 const staffBonus=(staff?(staff.value||0)+(staff.school===links.main[0]?3:0):0)+(manager()?.value||0)*.55;
 const benchBonus=Math.min(3,bench().length);
 const awakeningBonus=Math.min(18,cards.reduce((sum,c)=>sum+(c.packTier==='apex'?6:c.packTier==='elite'?3:0),0));
 // Each card gets its own link boosts up to +20. Staff and bench buffs remain separate.
 return {main:links.main,schools:links.schools,schoolBonus:links.schoolBonus,
  duos:links.links.map(x=>[x.a,x.b,x.label,x.bonus,x.type]),
  duoBonus:links.linkBonus,friendBonus:links.duoBonus,rivalryBonus:links.rivalryBonus,
  staffBonus,benchBonus,awakeningBonus,
  total:links.total+staffBonus+benchBonus+awakeningBonus};
}
function avg(cards=starting()){return cards.length?Math.round(cards.reduce((a,c)=>a+c.power+(c.level||0),0)/cards.length):0;}
function ovr(){const cards=starting();if(!cards.length)return 0;const powered=Links.boostedSquad(cards);return clamp(Math.round(powered.reduce((v,c)=>v+c.power+(Number(c.level)||0),0)/powered.length+(chem().staffBonus||0)),0,135)}
function addCard(key,source='standard'){
 const c=BY_KEY[key];if(!c)return null;
 // Quest exclusives can only enter the collection after validating the quest.
 if(c.questOnly&&source!=='quest-reward')return null;
 // One copy of every exact character-version card in the collection.
 // Recruited duplicate cards reuse the original UID (keeps saved squads intact).
 const previous=state.items.find(x=>x.key===key);
 if(previous)return {...c,...previous};
 const obj={key,uid:id(),level:0};state.items.push(obj);return {...c,...obj};
}
function save(){state.savedAt=Date.now();try{localStorage.setItem('spike-legends-save-v1',JSON.stringify(state));saveWarningShown=false;}catch(e){if(!saveWarningShown){saveWarningShown=true;notice('Browser storage full — export a save backup now!');}console.error('Local game save failed:',e);}updateHeader();window.queueCloudSave?.()}
let revealSeq=0,lastDraftSignature='',legendTimer=null;
let pendingRestore=null;
let saveWarningShown=false;
let draftRevealActive=false,draftRevealFinished=false;
let timingState=null,timingRaf=0;
let raidWs=null,raidRoom=null,raidMatch=null,raidPendingChoice='',raidLevel='normal';
let view='home',selectionSlot=0,filters='',chosenSchool='ALL SCHOOLS',offer=null,room=null,ws=null,duel=null,botTick=null,tab='daily',duelMode='fresh',friendSettings={extraRolls:8,rerolls:5,coaches:true},coachTab='coaches',pendingQuest='',tempRerolls=0;
function updateHeader(){const a=$('#coins'),b=$('#tickets'),n=$('#playerName');if(a)a.textContent=f(state.coins);if(b)b.textContent=f(state.tickets);if(n)n.textContent=state.name;const gems=$('#gems');if(gems)gems.textContent=f(state.gems);const rr=$('#rerolls');if(rr)rr.textContent=f(state.v3.rerolls);const lvl=$('#headerLevel');if(lvl)lvl.textContent=f(state.level);const st=$('#staffCount');if(st)st.textContent=f(state.coaches.length);}
function notice(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.setAttribute?.('role','status');el.setAttribute?.('aria-live','polite');el.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.classList.remove('show'),4000)}
function popup(body){
 if(typeof Spike3D!=='undefined'&&!((body.includes('id="v22Match3D"')&&$('#v22Match3D'))||(body.includes('id="v26Raid3D"')&&$('#v26Raid3D'))))Spike3D.unmount();
 const old=$('#modal .dialog');const prevScroll=old?.scrollTop||0;
 const current=document.activeElement;const remember=current?.dataset?.v==='tacticChoice'?{phase:current.dataset.phase,choice:current.dataset.choice}:null;
 $('#modal').innerHTML=`<div class="overlay" id="overlay"><div class="dialog v3-dialog" role="dialog" aria-modal="true" aria-label="Haikyuu Legends game panel"><button class="close" aria-label="Close panel" data-v="close">✕</button>${body}</div></div>`;
 const next=$('#modal .dialog');if(next)next.scrollTop=prevScroll;
 if(remember){const choice=$$('#modal [data-v="tacticChoice"]').find(x=>x.dataset.phase===remember.phase&&x.dataset.choice===remember.choice);if(choice)choice.focus({preventScroll:true});}
 loadOnlinePortraits();
}
function close(){if(timingState){timingState=null;cancelAnimationFrame?.(timingRaf);}if(typeof Spike3D!=='undefined')Spike3D.unmount();$('#modal').innerHTML=''}
function head(tag,title,sub=''){return `<div class="headingline"><div><div class="eyebrow">${tag}</div><h1 class="h1">${title}</h1><div class="sub">${sub}</div></div></div>`}
function rarity(c){return RR[c.rarity]||RR[0]}
function img(c){const local=c.portrait||'', fallback=local?`<img src="${local}" loading="lazy" alt="${escapeHtml(c.name)}" onerror="this.style.display='none'">`:`<div class="v3-avatar-fallback" style="--team:${SPIKE_COLORS[c.school]||'#78a4b8'}">${escapeHtml(c.name.split(' ').map(x=>x[0]).slice(-2).join(''))}</div>`;
 return `<div class="v3-image" data-img-name="${escapeHtml(c.name)}">${fallback}</div>`}
const V17_INDIVIDUAL_PORTRAITS = {"0": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141619_43371d1f-4b55-463d-8229-9e9e3376afb4.png", "1": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_140054_97f93608-2030-4c16-9144-556234fa2849.png", "2": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141537_757e8e4f-2945-4d37-9296-5bc3f70c00b2.png", "3": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141536_eac34f12-8fc3-4648-b051-b3b99fe8218d.png", "4": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_140053_6d1a355a-ffb6-4ab1-8075-efe89d3be7b0.png", "5": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141537_bdfaac6b-962c-45b5-b93c-a793e3e33dd5.png", "6": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_140053_2c95a9db-a702-4861-bac2-92d2b8926973.png", "7": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141619_5ac88377-3863-4ac3-9185-cccb6dd5f6ba.png", "8": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141536_b8c37d46-2907-4a28-a812-6d5403e97a4b.png", "9": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141618_30bd70c3-b521-418f-a9a5-4670a5c9e32d.png", "10": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233351_ef482565-1883-4f1d-b300-e1d91d01b943.png", "11": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233351_8005a33c-bf84-4900-a267-a3808934fef3.png", "12": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233351_b2d1e81e-1f7c-41e5-a1e9-d44a0a669bf1.png", "14": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_140054_a0e42db7-732f-43ff-924a-7ede6732b94f.png", "15": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_232939_7bc7e36e-87a6-4907-9257-eb4e9ecd4b1f.png", "16": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_232940_e1eef726-1dd5-412d-8484-8be563f45cb5.png", "17": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233351_1c5ceb5f-4ecb-40a5-84ce-cc318ce43583.png", "18": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233027_511ccc54-71d1-4a7c-a83d-78eb6eb5a755.png", "19": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233409_537589b5-8d97-42c0-a1b1-8749cde09dea.png", "20": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233027_93b747de-7038-4348-aee6-daebd38132c1.png", "21": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233026_11d26ddc-fb3f-4ad6-850a-a38aabbb695e.png", "22": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_232940_38be6449-e21f-489b-a5bb-88c14b003eef.png", "23": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233409_934d161c-6746-42af-b8ec-4c4494e8dbe6.png", "24": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233026_b51963e9-5498-4e18-89c2-f95740225a6f.png", "25": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233409_e5bb1a25-ba73-4cd0-8ad7-fc2fd08ae5f8.png", "26": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233409_d03070c6-3843-4a30-b2b9-a19cf68302f6.png", "27": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233426_0d7625f4-23be-4206-bd9e-941255e0958e.png", "28": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233426_b8a28eb4-c6a4-4c87-b372-472eeb569fec.png", "29": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233426_56d795e2-35ba-4a86-b39e-d5c7dd97493d.png", "30": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_233426_903743b0-6f22-405b-9d3d-074be453887a.png", "31": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234237_3304463a-f5e0-4cbf-a037-a6237fdf6d38.png", "32": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_141618_13a43ea0-be73-4dce-ab7f-4b30b5130701.png", "36": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234237_7a7a5bcf-e789-4ccd-9d7e-f6b0800a3663.png", "37": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234236_536707c9-5a06-463c-a84e-e235509eb81a.png", "38": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234237_53a23b6f-6b76-417f-8b29-7ede728bf6a8.png", "39": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234256_38e84f62-6c6e-4355-a9b8-87ce081fc120.png", "40": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234256_7d5674be-5221-4d96-8ef2-dcf37ac8a8b1.png", "42": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234256_aaed7c43-bc63-4004-bf48-84018a4e9938.png", "43": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234256_f5bf12a9-3869-4f32-948c-d44c3b3f7993.png", "45": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234316_7b5a4050-2e93-4b30-a377-1e2a1b0d783d.png", "46": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234315_ae619ead-3a1f-48e1-972e-6caf0b84ecfc.png", "47": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234316_fa648453-72b5-43b0-b7e1-815b206a562f.png", "49": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234315_4f73b559-117b-4015-86d2-336524cb4dfa.png", "52": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234333_a070cb6c-512f-4997-873d-8f90ba43951b.png", "53": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234333_82507e9d-cf22-4227-a90b-72003c6c82bc.png", "55": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234333_9e058b30-e269-418e-a26f-807a8db0eb01.png", "56": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234333_fd8418cd-16ff-4615-bfa6-37d93a89079f.png", "59": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234350_1225d7cd-36e8-42cc-83b6-5ad092e57d45.png", "60": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234351_f0392876-1cb0-4dce-bbf9-d367fc77fcf7.png", "61": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234350_ea128908-267a-48dc-a2ab-e2fcffd1f11c.png", "62": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234350_c8c45a8f-29c2-4df4-95ce-960d6928fc5b.png", "64": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234408_f681a7b8-3486-46aa-980b-c2786add6475.png", "65": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234408_7b91eb49-e4d7-4b46-af0e-473d857f13d8.png", "66": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234408_2644c4a4-c650-48a2-8152-24b55cf3f37a.png", "68": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_234408_f8eab0d6-a1aa-48cc-95f0-c39d4cb24608.png", "103": "https://d8j0ntlcm91z4.cloudfront.net/user_3IwAt93rOrD0F1V81PG3d3zpGoM/hf_20261019_232940_05230b09-4567-4c50-b1ba-d813ca938fa3.png"};
function v17Portrait(c){ return V17_INDIVIDUAL_PORTRAITS[Number(c.idx)] ? `ai-portraits/local/${Number(c.idx)}.webp` : null; }
function v13CardPath(c){
 const key=String(c.key||'').replace(/[^a-zA-Z0-9_-]/g,'_');
 return `cards/players/${key}.webp`;
}
function v13StaffPath(c){return `cards/staff/${String(c.key||c.id).replace(/[^a-zA-Z0-9_-]/g,'_')}-tier-${Math.max(0,Math.min(5,Number(c.tier)||0))}.webp`;}
function card(c,{click='',tiny=false,selected=false,disabled=false,boost=0}={}){
 if(!boost&&state?.squad?.includes(c.uid))boost=Links.evaluate(starting()).byName[c.name]?.bonus||0;
 if(boost)c={...c,power:Number(c.power)+boost,bondBonus:boost};
 const b=rarity(c),fullImage=v13CardPath(c),high=Number(c.power)>=100, individual=v17Portrait(c);
 return `<button type="button" class="v3-card v13-illustrated-card v14-card ${high?'v14-over100':''} ${c.questOnly?'v12-legend-card v14-quest-card':''} ${tiny?'compact':''} ${selected?'chosen':''} ${disabled?'v4-unavailable':''}" data-stage="${Number(c.stage)||0}" style="--rarity:${b.color}" ${disabled?'disabled title="Position already filled"':''} ${click?`data-v="${click}"`:''} data-key="${escapeHtml(c.key||'')}" data-uid="${escapeHtml(c.uid||'')}" aria-label="${escapeHtml(c.name)} ${c.power+(c.level||0)} overall. ${escapeHtml(c.variant)}">
 <span class="v14-card-art" data-img-name="${escapeHtml(c.name)}"><img class="v13-card-image" src="${escapeHtml(fullImage)}" loading="lazy" alt="${escapeHtml(c.name)}. ${c.power} overall. ${escapeHtml(c.school)}. ${escapeHtml(c.variant)}." onerror="this.onerror=null;this.src='${escapeHtml(c.portrait||'portraits/staff-placeholder.svg')}'"></span>
 ${individual?`<span class="v17-portrait" aria-hidden="true"><img src="${individual}" loading="lazy" alt="" onerror="if(!this.dataset.remoteTried){this.dataset.remoteTried='1';this.src=V17_INDIVIDUAL_PORTRAITS[Number('${Number(c.idx)}')]||''}else this.parentElement.style.display='none'"></span><span class="v17-rating">${Number(c.power)+(Number(c.level)||0)} <small>OVR</small></span><span class="v17-brand">${escapeHtml(c.variant)}</span><span class="v17-caption"><b>${escapeHtml(c.name)}</b><small>${escapeHtml(c.school)} · ${escapeHtml(c.position)}</small></span>`:''}
 ${c.bondBonus?`<span class="v26-bond-card-mark">✦ +${c.bondBonus} BOND OVR</span>`:''}
 ${high?'<span class="v14-high-rating">★ 100+ CLUB</span>':''}
 ${Number(c.level)>0?`<span class="v13-card-level">LEVEL +${Number(c.level)}</span>`:''}
 ${selected?'<span class="v13-card-selected">✓ SELECTED</span>':''}
 </button>`;
}
function coachCard(c,click=''){
 const tier=c.tier||0,rare=COACH_RARITIES[tier]||'Common',type=c.type||staffType(c),isEquipped=type==='manager'?state.manager===c.uid:state.coach===c.uid;
 return `<button type="button" class="v3-coach-card v13-illustrated-staff ${isEquipped?'v5-staff-selected':''}" style="--rarity:${RR[tier].color}" ${click?`data-v="${click}"`:''} data-coach="${escapeHtml(c.uid||c.id)}" aria-label="${escapeHtml(c.name)} ${rare} ${type}, +${c.value}% ${escapeHtml(c.buff)}">
 <span class="v14-card-art" data-img-name="${escapeHtml(c.name)}"><img class="v13-staff-card-image" src="${escapeHtml(v13StaffPath(c))}" loading="lazy" alt="${escapeHtml(c.name)} ${rare} ${type}" onerror="this.onerror=null;this.src='${escapeHtml(c.portrait||'portraits/staff-placeholder.svg')}'"></span>
 ${isEquipped?'<span class="v13-card-selected">✓ EQUIPPED</span>':''}
 </button>`;
}
function show(v){if(v!=='roll')endLegendReveal();view=v;render();$$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===v);if(b.dataset.view===v)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('#bread').textContent='HOME / '+v.toUpperCase();if(typeof window.scrollTo==='function')window.scrollTo({top:0,behavior:'instant'});}
function render(){let out='';const pages={home,roll:rollPage,squad:squadPage,collection:collectionPage,staff:staffPage,shop:shopPage,quests:questsPage,duels:duelPage,raids:raidPage,career:careerPage,nationals:nationalsPage};try{out=(pages[view]||home)();}catch(e){console.error(e);out='<div class="v20-render-error"><h2>Screen unavailable</h2><p>Your collection is safe. Try returning to the lobby or refreshing the page.</p><button class="btn" data-go="home">RETURN HOME</button></div>'}$('#view').innerHTML=out;updateHeader();loadOnlinePortraits();queueDraftReveal();}
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
 <div class="v5-court"><div class="v5-court-surface"><span class="v5-front-label">NET / FRONT ROW</span><span class="v5-back-label">BACK COURT</span><div class="v5-court-grid">${COURT_POS.map((pos,i)=>{const c=placed[i];const a=c?`<div class="v5-court-portrait v14-court-card" data-img-name="${escapeHtml(c.name)}"><img src="${escapeHtml(v13CardPath(c))}" loading="lazy" alt="${escapeHtml(c.name)}" /></div>`:`<div class="v5-empty-athlete">${pos.label==='M / L'?'M/L':pos.label}</div>`;
 return `<${interactive?'button':'div'} ${interactive?'type="button" data-v="selectSlot" data-idx="'+i+'"':''} class="v5-court-slot ${c?'filled':'empty'} ${selected===i?'selected':''}" style="--team:${c?SPIKE_COLORS[c.school]||'#e39d55':'#a7d4ea'}"><span class="v5-slot-no">0${i+1} · ${pos.label}</span>${a}<div class="v5-court-name">${c?escapeHtml(c.name):'OPEN POSITION'}</div><span class="v5-court-sub">${c?`${Links.evaluate(placed.filter(Boolean)).byName[c.name]?.effective||c.power} OVR · ${escapeHtml(c.variant)}`:pos.hint}</span></${interactive?'button':'div'}>`}).join('')}</div><span class="v5-court-watermark">SPIKE LEAGUE</span></div></div></section>`;
}

function chemistryPanel(cards=starting()){
 const info=Links.evaluate(cards),pairs=info.links;
 const group=(label,arr,type)=>`<section class="v26-link-group"><h3>${label}</h3>${arr.length?arr.map(x=>`<div class="v26-bond-line ${type}"><span><b>${escapeHtml(x.label)}</b><small>${escapeHtml(x.a)} + ${escapeHtml(x.b)} · BOTH GET +${x.bonus}</small></span><strong>+${x.bonus} EACH</strong></div>`).join(''):'<p>Scout connected characters to activate bonds.</p>'}</section>`;
 return `<section class="v26-bond-panel"><div class="v26-panel-header"><div><small>V26 · CHARACTER BONDS</small><h2>CHEMISTRY & SAME-TEAM RIVALRIES</h2></div><b>UP TO +20 PER CARD</b></div><p>Bonuses upgrade EACH character’s effective OVR, attacks, blocks, receives and sets. School bonuses stack with named links, capped at +20 per athlete.</p><div class="v26-bond-grid">${cards.map(c=>{const item=info.byName[c.name];return `<div class="v26-player-bond"><span>${escapeHtml(c.name)}</span><b>${item?.effective||c.power} <small>OVR</small></b><em>${item?.bonus?`+${item.bonus} FROM BONDS`:'NO ACTIVE BOND'}</em></div>`}).join('')}</div><div class="v26-chem-link-grid">${group('⚡ DUO CHEMISTRY',pairs.filter(x=>x.type==='duo'),'duo')}${group('⚔ SAME-TEAM RIVALRY',pairs.filter(x=>x.type==='rivalry'),'rivalry')}${group('🏫 SCHOOL LINKS',info.schools.map(x=>({a:x.school,b:x.count+' athletes',label:x.school,bonus:x.bonus})),'school')}</div></section>`;
}
function regionalUnlockPanel(){return `<section class="v14-regions"><div class="v14-chem-header"><div><span class="eyebrow">REGIONAL SCOUTING</span><h2>UNLOCK MORE SCHOOLS</h2></div><button class="btn ghost sm" data-go="career">SCHOOL BATTLES →</button></div><div class="v14-region-grid">${REGION_UNLOCKS.map(t=>`<div class="v14-region ${state.career>=t.wins?'ready':'locked'}"><b>${escapeHtml(t.school)}</b><small>${state.career>=t.wins?'✓ Available in school scouting':`Clear ${t.wins} career stages to unlock`}</small></div>`).join('')}</div></section>`;}
function homeSpotlights(){
 const latest=owned().at(-1),best=owned().reduce((a,b)=>!a||b.power>a.power?b:a,null);
 const unlocked=QUEST_LEGENDS.filter(c=>state.items.some(x=>x.key===c.key)).length;
 return `<section class="v14-home-cards">
 <div class="v14-home-banner pro"><small>NEW SEASON · LIMITED CONTRACTS</small><h2>THE PROFESSIONAL LEAGUE</h2><p>Only actual Pro athletes are in Professional packs. Elite and Apex outcomes are rare.</p><button class="btn sm" data-go="shop">EXPLORE PRO PACKS →</button></div>
 <div class="v14-home-banner quest"><small>QUEST EXCLUSIVES · ${unlocked}/${QUEST_LEGENDS.length} UNLOCKED</small><h2>THE LEGEND ROAD</h2><p>Thunder Ace Bokuto, Court King Kageyama, Sky Breaker Hinata and more.</p><button class="btn sm" data-go="quests">VIEW LEGEND QUESTS →</button></div>
 <div class="v14-home-banner latest"><small>YOUR COLLECTION · ${owned().length} CARDS</small><h2>${latest?escapeHtml(latest.name):'YOUR NEXT RECRUIT'}</h2><p>${latest?`${latest.power} OVR · ${escapeHtml(latest.school)} · ${escapeHtml(latest.variant)}`:'Complete a school scout to collect your first card.'}</p><button class="btn sm" data-go="collection">OPEN COLLECTION →</button></div>
 </section>`;
}
// V15 polished neon arena homepage. All featured cards are real catalog entries.
function v15SchoolTile(school,locked=false){
 const entries=BASE_CATALOG.filter(c=>c.stage===0&&c.school===school&&!c.proOnly).sort((a,b)=>b.power-a.power);
 const top=entries.slice(0,3),tone=SPIKE_COLORS[school]||'#6cb9ee';
 return `<button type="button" class="v15-school-tile ${locked?'is-locked':''}" style="--school:${tone}" data-v="schoolInfo" data-school="${escapeHtml(school)}" aria-label="${escapeHtml(school)} school roster${locked?', locked':''}">
 <span class="v15-school-art">${top.map((c,i)=>`<img src="${escapeHtml(v13CardPath(c))}" loading="lazy" alt="" style="--n:${i}" onerror="this.style.display='none'">`).join('')}</span>
 <strong>${escapeHtml(school)}</strong><span class="v15-school-foot">${locked?'🔒 UNLOCK':entries.length+' PLAYERS'}</span></button>`;
}
function v15CourtPlayer(c,slot,preview){
 const labels=['OH','MB','OP','M / L','OH','S'];
 return `<div class="v15-field-card ${c?'filled':''}" style="--player-color:${c?rarity(c).color:'#5c789c'}">
 ${c?`<img src="${escapeHtml(v13CardPath(c))}" loading="lazy" alt="${escapeHtml(c.name)} ${c.power} overall" onerror="this.onerror=null;this.src='${escapeHtml(c.portrait||'portraits/staff-placeholder.svg')}'">`:`<span class="v15-empty-symbol">${labels[slot]}</span>`}
 <span class="v15-field-position">${labels[slot]}</span>${c?`<div class="v15-field-label"><b>${escapeHtml(c.name.split(' ').at(-1))}</b><span>${c.power} OVR</span></div>`:''}</div>`;
}
function v15ChemLinks(cards){
 const data=Links.evaluate(cards);
 const items=data.links.slice(0,3);
 return `<div class="v15-active-links"><div class="v15-chem-caption">⚡ ACTIVE CHEMISTRIES <b>+${data.total}</b></div>
 ${data.schools.length?`<div><span>${escapeHtml(data.schools[0].school)} (${data.schools[0].count}/6)</span><b>+${data.schoolBonus}</b></div>`:''}
 ${items.map(x=>`<div><span>${escapeHtml(x.label)}</span><b>+${x.bonus}</b></div>`).join('')}
 ${!data.schools.length&&!items.length?`<p>Connect teammates and rivals to earn squad bonuses.</p>`:''}
 <button type="button" data-go="squad">VIEW SYNERGIES ↗</button></div>`;
}
function v15MiniCard(c){return `<button class="v15-mini-card" type="button" data-go="collection" aria-label="Open collection: ${escapeHtml(c.name)}, ${c.power} overall"><img loading="lazy" src="${escapeHtml(v13CardPath(c))}" alt="${escapeHtml(c.name)} ${c.power} overall" onerror="this.onerror=null;this.src='${escapeHtml(c.portrait||'portraits/staff-placeholder.svg')}'"></button>`;}
function v15QuestList(){
 const qDef=[{name:'Complete a School Draft',progress:Math.min(1,state.v3.runs||0),goal:1,reward:'2 ROLLS'},
 {name:'Win 3 Matches',progress:Math.min(3,state.wins||0),goal:3,reward:'GEMS'},
 {name:'Activate a Chemistry Link',progress:Math.min(1,state.v3.chemistryRuns||0),goal:1,reward:'REROLLS'}];
 return qDef.map(q=>`<button type="button" class="v15-quest-line" data-go="quests"><span class="v15-quest-diamond">✦</span><span class="v15-quest-text"><strong>${q.name}</strong><small><i style="width:${q.progress/q.goal*100}%"></i></small></span><span>${q.progress}/${q.goal}</span></button>`).join('');
}
// V26.1 legacy landing page retained as a compatibility/fallback renderer; V26.2 uses the focused dashboard by default.
function legacyHome(){
 const equipped=state.squad.map(player);const hasTeam=equipped.some(Boolean);
 const showcaseKeys=['0-0','1-0','15-0','6-0','13-0','4-0'];
 const lineup=hasTeam?equipped:showcaseKeys.map(k=>BY_KEY[k]||null);
 const chemistry=Links.evaluate(lineup.filter(Boolean));
 const squadScore=lineup.reduce((sum,c)=>sum+(c?.power||0),0)+chemistry.total;
 const schoolCards=SPIKE_SCHOOL_TEAMS.map(s=>v15SchoolTile(s)).join('');
 const regionCards=SPIKE_SECONDARY_TEAMS.map(s=>v15SchoolTile(s,!unlockedSchools().includes(s))).join('');
 const karasuno=BASE_CATALOG.filter(c=>c.school==='KARASUNO'&&c.stage===0).sort((a,b)=>b.power-a.power).slice(0,6);
 const selectCards=(stage,limit)=>CATALOG.filter(c=>c.stage===stage&&!c.questOnly).sort((a,b)=>b.power-a.power).filter((c,i,arr)=>arr.findIndex(v=>v.name===c.name)===i).slice(0,limit);
 const latest=owned().at(-1);
 return `<div class="v15-home">
 <div class="v15-home-title"><span><i>●</i> SQUAD HEADQUARTERS <b>NEON ARENA · V20</b></span><button class="v15-text-link" data-go="roll">▶ START NEW DRAFT</button></div>
 <div class="v20-home-dashboard"><div><small>SCHOOL GAUNTLET</small><b>${Math.min(57,Math.max(0,state.career))}<span> / 57</span></b><div class="v20-progress"><i style="width:${Math.round(Math.min(57,Math.max(0,state.career))/57*100)}%"></i></div></div><div><small>YOUR COLLECTION</small><b>${owned().length}<span> CARDS</span></b><span class="v20-small-line">${QUEST_LEGENDS.filter(c=>state.items.some(x=>x.key===c.key)).length} / 5 Quest Legends</span></div><div><small>DAILY CLAIMS READY</small><b>${Quality.questStatus(DAILY,'daily',state.v3,state.v3.claimed).claimable}</b><button type="button" data-go="quests">CLAIM REWARDS →</button></div><div><small>MATCH MODE</small><b>${state.v3.matchMode==='manual'?'TACTICAL':'AUTO PLAY'}</b><button type="button" data-v="gameGuide">HOW TO PLAY →</button></div></div><button type="button" class="v18-home-banner" data-go="career"><span>🏆 SCHOOL GAUNTLET · 57 STAGES</span><strong>Win school battles · Earn 20 rolls at every chapter boss</strong><small>${Math.min(57,Math.max(0,state.career))}/57 CLEARED → CONTINUE YOUR ROAD TO NATIONALS</small></button>
 <section class="v15-home-grid">
 <div class="v15-arena">
  <div class="v15-arena-lights" aria-hidden="true"></div>
  <div class="v15-arena-heading"><span>YOUR STARTING SIX</span><strong>${hasTeam?'MY SQUAD':'EXAMPLE SQUAD'} <small>${hasTeam?'YOUR OWNED CARDS':'DRAFT TO BUILD YOUR OWN'}</small></strong></div>
  <div class="v15-perspective-court" aria-hidden="true"><div class="v15-court-net"></div></div>
  <div class="v15-lineup">${lineup.map((c,i)=>v15CourtPlayer(c,i,!hasTeam)).join('')}</div>
  <div class="v15-arena-footer"><div class="v15-team-number"><span>TEAM SCORE</span><strong>${squadScore}</strong><small>${hasTeam?`${ovr()} EFFECTIVE OVR`:'EXAMPLE LINEUP'}</small></div><div class="v15-bonus-meter"><small>CHEMISTRY BONUS</small><strong>+${chemistry.total}</strong><span>${chemistry.links.length} ACTIVE CONNECTIONS</span></div></div>
  ${v15ChemLinks(lineup.filter(Boolean))}
  <div class="v15-arena-actions"><button data-go="squad">▦ VIEW TEAM</button><button data-go="roll">◈ DRAFT</button></div>
 </div>
 <aside class="v15-spotlight">
  <button type="button" class="v15-promo pro" data-go="shop" aria-label="View Pro Pack shop"><span class="v15-promo-kicker">FEATURED CONTRACT</span><strong>PRO PACK</strong><b>100–105+ OVR</b><small>MSBY · SCHWEIDEN</small><span class="v15-promo-cta">SHOP PACKS →</span></button>
  <div class="v15-promo-row"><button type="button" class="v15-promo quest" data-go="quests"><small>QUEST LEGEND</small><strong>BOKUTO</strong><span>THUNDER ACE · 104 OVR</span><b>UNLOCK QUEST →</b></button><button type="button" class="v15-promo nationals" data-go="nationals"><small>SPRING HIGH</small><strong>NATIONALS</strong><span>TAKE ON THE BEST</span><b>ENTER →</b></button></div>
  <div class="v15-promo-row lower"><div class="v15-quest-widget"><header><strong>DAILY GOALS</strong><span>${state.v3.runs||0} DRAFTS</span></header>${v15QuestList()}</div><button type="button" class="v15-latest" data-go="collection"><small>RECENT UNLOCK</small>${latest?`<img src="${escapeHtml(v13CardPath(latest))}" alt="${escapeHtml(latest.name)}">`:`<img src="${escapeHtml(v13CardPath(BY_KEY['4-0']))}" alt="Kageyama showcase">`}<strong>${latest?escapeHtml(latest.name):'YOUR NEXT STAR'}</strong></button></div>
 </aside>
 </section>
 <section class="v15-panel v15-schools"><div class="v15-section-head"><div><strong>SCHOOL DRAFTS</strong><span>REGULAR SCHOOL CARDS ONLY · FOUR CHOICES PER ROLL</span></div><button type="button" data-go="roll">SCOUT A RANDOM SCHOOL →</button></div><div class="v15-school-row">${schoolCards}</div>
 <div class="v15-section-head subheading"><div><strong>UNLOCK MORE SCHOOLS</strong><span>WIN CAREER BATTLES TO FIND MORE ROSTERS</span></div><button data-go="career">CAREER BATTLES →</button></div><div class="v15-school-row v15-locked-row">${regionCards}</div></section>
 <div class="v15-below-grid"><section class="v15-panel v15-card-showcase"><div class="v15-section-head"><div><strong>COLLECTIBLE CARDS</strong><span>KARASUNO · BASE SCHOOL ROSTER</span></div><button data-go="collection">YOUR COLLECTION →</button></div><div class="v15-card-strip">${karasuno.map(v15MiniCard).join('')}</div><div class="v15-stage-key"><span>🏫 SCHOOL</span><span>🏆 NATIONALS</span><span>⚡ TIMESKIP</span><span>👑 PROFESSIONAL</span><span>✦ QUEST LEGENDS</span></div></section>
 <section class="v15-panel v15-chem-showcase"><div class="v15-section-head"><div><strong>CHEMISTRY SYSTEM</strong><span>BUILD YOUR MOST POWERFUL COMBINATIONS</span></div><button data-go="squad">VIEW BONUSES →</button></div><div class="v15-chem-list"><div><b>🏫 SCHOOL CHEMISTRY</b><p>2 teammates <strong>+2</strong> · 4 teammates <strong>+4</strong> · 6 teammates <strong>+5</strong></p></div><div><b>⚡ DUO CHEMISTRY</b><p>Hinata + Kageyama <strong>Freak Quick +10</strong></p><p>Bokuto + Akaashi <strong>Ace Awakening +10</strong></p></div><div><b>⚔ RIVALRY</b><p>Hinata + Kenma <strong>Battle of Minds +8</strong></p><p>Kageyama + Oikawa <strong>Rival Setters +10</strong></p></div></div></section></div>
 <section class="v15-panel v15-elite-reel"><div class="v15-section-head"><div><strong>TOP SCHOOL CARDS</strong><span>STARS WORTH CHASING</span></div><button data-go="roll">SCOUT NOW →</button></div><div class="v15-card-reel">${selectCards(0,9).map(v15MiniCard).join('')}</div></section>
 <section class="v15-premium-reels">${[{s:1,title:'NATIONALS',desc:'TOURNAMENT REWARDS'},{s:2,title:'TIMESKIP',desc:'FUTURE STARS'},{s:3,title:'PROFESSIONAL',desc:'100+ OVR CONTRACTS'}].map(t=>`<div class="v15-panel"><div class="v15-section-head"><div><strong>${t.title}</strong><span>${t.desc}</span></div><button data-go="${t.s===1?'nationals':'shop'}">VIEW →</button></div><div class="v15-card-reel">${selectCards(t.s,5).map(v15MiniCard).join('')}</div></div>`).join('')}</section>
 <div class="v15-home-foot"><span>◈ HAIKYUU LEGENDS V26 · UNOFFICIAL FAN PROJECT</span><span>Progress saves in this browser, with optional Supabase cloud backup.</span><button data-go="quests">EARN MORE ROLLS →</button></div>
 </div>`;
}

function home(){
 const cards=owned(), equipped=state.squad.map(player), fielded=equipped.filter(Boolean);
 const complete=fielded.length===6, hasPicks=Boolean(state.v3.run);
 const drafted=state.v3.run?.picks?.length||0;
 const links=Links.evaluate(fielded);
 const road=Math.min(100,Math.max(0,Number(state.v3.nationalsRoad?.cleared)||0));
 const career=Math.min(57,Math.max(0,Number(state.career)||0));
 const claimable=Quality.questStatus(DAILY,'daily',state.v3,state.v3.claimed).claimable;
 const recent=cards.at(-1);
 const bonding=links.links.slice(0,2);
 const roadPct=Math.round(road), careerPct=Math.round(career/57*100);
 const currentGoal=!complete?'Finish your six-player squad':career<57?'Win your next School Battle':road<100?'Continue Nationals Road':'Challenge your friends or raid bosses';
 const goalView=!complete?'roll':career<57?'career':road<100?'nationals':'raids';
 const nextTitle=hasPicks?'Continue your draft':complete?'Scout a stronger squad':'Start your first draft';
 const nextDesc=hasPicks?`${drafted}/6 recruits selected · keep your progress`:'Choose from four players each roll · build your six';
 const linkCount=links.links.length;
 const roster=equipped.map((c,i)=>`<div class="v262-slot ${c?'filled':''}">
  ${c?`<img src="${escapeHtml(v13CardPath(c))}" loading="lazy" alt="${escapeHtml(c.name)}" onerror="this.onerror=null;this.src='${escapeHtml(c.portrait||'portraits/staff-placeholder.svg')}'">`:`<span aria-hidden="true">${['OH','MB','OP','LIB','OH','S'][i]}</span>`}
  <div class="v262-slot-text"><b>${c?escapeHtml(c.name.split(' ').at(-1)):['Outside','Middle','Opposite','Defence','Outside','Setter'][i]}</b><small>${c?`${c.power+(Number(c.level)||0)+(links.byName?.[c.name]?.bonus||0)} OVR`:'EMPTY SLOT'}</small></div>
 </div>`).join('');
 const progress=(title,value,total,subtitle,go)=>`<button type="button" class="v262-track" data-go="${go}"><span class="v262-track-line"><strong>${title}</strong><b>${value} / ${total}</b></span><span class="v262-meter"><i style="width:${Math.max(0,Math.min(100,Math.round(value/total*100)))}%"></i></span><small>${subtitle}</small></button>`;
 return `<div class="v262-home">
  <header class="v262-welcome"><div><div class="v262-eyebrow">● SQUAD HEADQUARTERS <span>V26.3 COURTSIDE</span></div><h1>YOUR COURT. YOUR NEXT MOVE.</h1><p>Everything you need to play, draft and progress — without hunting through menus.</p></div><div class="v262-profile-strip"><strong>${complete?ovr():'—'}</strong><span>TEAM OVR</span><small>${cards.length} cards collected</small></div></header>
  <section class="v262-main-actions" aria-label="Start playing">
   <button type="button" class="v262-action v262-action-draft" data-go="roll"><span class="v262-action-over">01 · BUILD YOUR TEAM</span><strong>◈ ${nextTitle.toUpperCase()}</strong><small>${nextDesc}</small>${hasPicks?`<span class="v262-meter"><i style="width:${Math.round(drafted/6*100)}%"></i></span>`:''}<span class="v262-action-enter">OPEN DRAFT ↗</span></button>
   <button type="button" class="v262-action v262-action-play" data-go="${goalView}"><span class="v262-action-over">02 · PICK UP WHERE YOU LEFT OFF</span><strong>▶ ${complete?'CONTINUE PLAYING':'BUILD YOUR FIRST SIX'}</strong><small>${currentGoal}${complete?` · ${career}/57 battles cleared`:''}</small><span class="v262-action-enter">${complete?'CONTINUE →':'GET STARTED →'}</span></button>
  </section>
  <section class="v262-shortcuts" aria-label="Game modes">
    <button type="button" data-go="career"><span>⚡</span><strong>School Battles</strong><small>${career}/57 complete</small></button>
    <button type="button" data-go="nationals"><span>🏆</span><strong>Nationals</strong><small>${road}/100 stages</small></button>
    <button type="button" data-go="duels"><span>⚔</span><strong>1v1 Friends</strong><small>Normal school draft</small></button>
    <button type="button" data-go="raids"><span>👥</span><strong>Co-op Raids</strong><small>Up to 4 friends</small></button>
  </section>
  <section class="v262-center">
   <div class="v262-panel v262-team"><div class="v262-panel-heading"><div><span class="v262-eyebrow">YOUR LINEUP</span><h2>${complete?'READY TO PLAY':'STARTING SIX'}</h2></div><button type="button" data-go="squad">EDIT SQUAD ↗</button></div>
    <div class="v262-six" aria-label="Your six starting positions">${roster}</div>
    <div class="v262-bonds"><div><span>⚡ ACTIVE LINKS</span><strong>${linkCount}</strong></div><div><span>⬆ INDIVIDUAL CARD BOOSTS</span><strong>+${links.total||0} OVR</strong></div></div>
    ${bonding.length?`<div class="v262-bond-lines">${bonding.map(x=>`<span>${escapeHtml(x.label)} <b>+${x.bonus} EACH</b></span>`).join('')}</div>`:'<p class="v262-muted">Draft linked characters to unlock individual chemistry and rivalry boosts.</p>'}
    ${recent?`<div class="v262-recent">LAST RECRUIT: <b>${escapeHtml(recent.name)}</b> · ${recent.power} OVR <button type="button" data-go="collection">VIEW COLLECTION ↗</button></div>`:''}
   </div>
   <aside class="v262-panel v262-progress"><div class="v262-panel-heading"><div><span class="v262-eyebrow">CAREER PROGRESS</span><h2>YOUR NEXT REWARDS</h2></div><button type="button" data-go="quests">ALL QUESTS ↗</button></div>
    ${progress('School Gauntlet · 57 STAGES',career,57,career<57?'UNLOCK MORE SCHOOLS by clearing chapters':'All school battles cleared','career')}
    ${progress('Nationals Road',road,100,road<100?`Next challenge: stage ${road+1}`:'Road completed','nationals')}
    <button type="button" class="v262-claim" data-go="quests"><span>✦ DAILY QUEST REWARDS</span><strong>${claimable?`${claimable} READY TO CLAIM`:'EARN ROLLS & REROLLS'}</strong><small>Every quest has its own progress bar. View objectives →</small></button>
   </aside>
  </section>
  <footer class="v262-footer"><div><b>QUICK LINKS</b><span>Manage cards, packs and settings without crowding your homepage.</span></div><nav aria-label="Quick links"><button type="button" data-go="shop">PACK SHOP</button><button type="button" data-go="collection">COLLECTION</button><button type="button" data-go="quests">QUESTS</button><button type="button" data-v="gameGuide">HOW TO PLAY</button></nav></footer>
 </div>`;
}
function drawFromSchool(school='ALL SCHOOLS',avoidSchool=null){return Draft.makeOffer({roster:SPIKE_ROSTER,allowedSchools:unlockedSchools(),existing:(state.v3.run?.picks||[]).map(player).filter(Boolean),targetSchool:school==='ALL SCHOOLS'?null:school,avoidSchool,cardFromIndex:(i,v)=>{
 const original=SPIKE_ROSTER[i];
 const stage=v===1&&SPIKE_NATIONALS_SCHOOLS.includes(original.school)?1:0;
 return BY_KEY[`${original.id}-${stage}`];
},versionSampler:()=>0,weightForIndex:i=>Balance.weightFor(SPIKE_ROSTER[i],i),rand:Math.random});}
function startRun(){if(state.v3.run){popup('<h2 class="h1">START A NEW RUN?</h2><p>Your unfinished six-card draft will be replaced. Cards you already claimed stay in your collection.</p><div class="flexgap"><button class="btn" data-v="confirmNewRun">START FRESH</button><button class="btn ghost" data-v="close">CANCEL</button></div>');return;}newRun()}
function newRun(){state.v3.run={picks:[],started:Date.now(),bonusPaid:false};state.v3.lastSchool=null;state.v3.offer=null;newRunOffer();}
function newRunOffer(sameSchool=false){if(!state.v3.run)return;const old=state.v3.offer;state.v3.offer=drawFromSchool(sameSchool&&old?old.school:'ALL SCHOOLS',sameSchool?null:old?.school||state.v3.lastSchool);revealSeq++;save();show('roll')}
function onlineRareAction(action,key){
 if(!offer||offer.kind!=='online'||ws?.readyState!==WebSocket.OPEN)return;
 const type={pick:'draft_pick',reroll:'draft_reroll',school:'draft_school_roll'}[action];
 if(!type)return;
 const needed=offer.needed||[];
 if(action==='pick'&&!offer.cards?.some(c=>c.key===key&&needed.includes(c.position)))return;
 const endangered=V25.protectedCards({cards:offer.cards,needed,action,selectedKey:key,warnAt:state.v3.warnOvr});
 if(!endangered.length){ws.send(JSON.stringify({type,...(key&&action==='pick'?{key}:{})}));return;}
 const best=endangered[0];
 popup(`<div class="eyebrow">⚠ HIGH-OVR SCOUT WARNING</div><h2 class="h1">ARE YOU SURE?</h2><div class="v25-rare-alert"><strong>${escapeHtml(best.name)} · ${best.power} OVR</strong><p>${action==='pick'?'You are about to leave a stronger card behind.':'You are about to discard this rare offer.'}</p></div><div class="flexgap"><button class="v25-cancel" data-v="v25OnlineCancel">KEEP CARDS</button><button class="btn" data-v="v25OnlineConfirm" data-action="${action}" data-key="${escapeHtml(key||'')}">DISCARD & CONTINUE</button></div>`);
}
function performRareAction(action,key){
 if(action==='pick')return runPick(key);
 if(action==='reroll')return rerollOffer();
 if(action==='school')return changeSchool();
 if(action==='restart')return startRun();
}
function protectedOfferAction(action,key){
 if(!state.v3.run||!state.v3.offer)return performRareAction(action,key);
 const selected=state.v3.offer.cards.find(c=>c.key===key);
 if(action==='pick'&&!selected)return notice('That player is no longer offered.');
 const needed=Draft.needs(state.v3.run.picks.map(player).filter(Boolean));
 const endangered=V25.protectedCards({cards:state.v3.offer.cards,needed,action,selectedKey:key,warnAt:state.v3.warnOvr});
 if(!endangered.length)return performRareAction(action,key);
 const highest=endangered[0];
 popup(`<div class="eyebrow">⚠ HIGH-OVR CARD PROTECTION</div><h2 class="h1">ARE YOU SURE?</h2><div class="v25-rare-alert"><strong>${escapeHtml(highest.name)} · ${highest.power} OVR</strong><p>${action==='pick'?'Picking the selected player will discard this stronger card.':'You are about to lose a high-rated character from your four-card offer.'}</p></div><div class="v25-rare-list">${endangered.map(c=>`<span>${escapeHtml(c.name)} · ${c.power} OVR</span>`).join('')}</div><p>Your warning setting is ${state.v3.warnOvr} OVR. This is a safeguard, not an extra roll cost.</p><div class="flexgap"><button class="v25-cancel" data-v="close">KEEP THESE CARDS</button><button class="btn" data-v="confirmRareAction" data-action="${action}" data-key="${escapeHtml(key||'')}">YES, CONTINUE →</button></div>`);
}
function runPick(key){endLegendReveal();const run=state.v3.run,arr=state.v3.offer?.cards||[];if(!run||run.picks.length>=6){notice('Start a new squad run first.');return;}const c=arr.find(x=>x.key===key);if(!c){notice('Pick one of the offered cards.');return;}if(!Draft.eligible(run.picks.map(player).filter(Boolean),c))return notice('Choose an undrafted athlete in a missing position.');const o=addCard(key);run.picks.push(o.uid);state.v3.lastSchool=state.v3.offer.school;state.v3.offer=null;state.v3.packs++;state.rolls=(state.rolls||0)+1;track('picks');if(o.power>=90)track('rare');if(o.stage===3)track('pro');if(run.picks.length===6){if(Links.evaluate(run.picks.map(player).filter(Boolean)).links.length)track('chemistry');finishRun();return;}newRunOffer();}
function finishRun(){const run=state.v3.run,cards=run.picks.map(player).filter(Boolean);const reward=500+Math.round(avg(cards)*7)+Math.max(0,chem(cards,null).total*12);const rewardGems=[85,90,95,99].filter(n=>avg(cards)+Math.min(11,Math.floor(chem(cards,coach()).total/3))>=n&&!state.v3.highOvrClaimed[n]);for(const n of rewardGems){state.v3.highOvrClaimed[n]=true;state.gems+={85:20,90:35,95:60,99:100}[n];}state.coins+=reward;state.v3.coinsWon+=reward;state.v3.runs++;state.v3.squadCrafts++;track('runs');const arranged=Draft.lineup(cards);state.squad=arranged?arranged.map(x=>x.uid):run.picks.slice(0,6);state.v3.run=null;state.v3.offer=null;if(Links.evaluate(cards).links.length)state.v3.chemistryRuns=(state.v3.chemistryRuns||0)+1;save();show('squad');const nat=nationalsForecast();popup(`<div class="eyebrow">SQUAD RUN COMPLETE</div><h2 class="h1">+${f(reward)} COINS${rewardGems.length?' · +'+rewardGems.reduce((s,n)=>s+({85:20,90:35,95:60,99:100}[n]),0)+' GEMS':''}</h2><p>You recruited six permanent players, equipped them as your new active squad, and earned money for the completed run.</p>${nat?`<div class="v11-draft-forecast">🏆 <b>SPRING HIGH FORECAST:</b> ${escapeHtml(nat.medianFinish)} · ${(nat.championChance*100).toFixed(1)}% championship chance</div>`:''}<div class="v3-card-grid mini">${cards.map(c=>card(c,{tiny:true})).join('')}</div><div class="flexgap"><button class="btn" data-go="nationals">🏆 SEE NATIONALS FORECAST</button><button class="btn ghost" data-v="close">VIEW SQUAD</button><button class="btn ghost" data-go="shop">PRO SHOP</button></div>`);}


function endLegendReveal(){clearTimeout(legendTimer);const overlay=document.querySelector('#v12-legend-overlay');if(overlay&&typeof overlay.remove==='function')overlay.remove();}
function queueDraftReveal(){
 if(view!=='roll'||!state.v3.offer||!state.v3.run)return;
 const offered=state.v3.offer;
 const sign=[offered.school,...offered.cards.map(c=>c.key),state.v3.run.picks.length,revealSeq].join('|');
 if(sign===lastDraftSignature)return;
 lastDraftSignature=sign;
 const nodes=$$('#view .v12-scout-card');
 const reduced=state.v3.fastReveals||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 nodes.forEach((node,i)=>{node.classList.remove('v12-show');node.style.setProperty('--i',i);if(reduced)node.classList.add('v12-show');});
 if(reduced){endLegendReveal();return;}
 // Four choices reveal in sequence. Using CSS avoids many JS timers.
 (typeof requestAnimationFrame==='function'?requestAnimationFrame:fn=>fn())(()=>nodes.forEach(n=>n.classList.add('v12-show')));
 const star=offered.cards.filter(c=>c.power>=state.v3.cinematicOvr&&state.v3.cinematicOvr>0).sort((a,b)=>b.power-a.power)[0];
 if(!star||typeof document.createElement!=='function')return;
 endLegendReveal();
 // Let all four options land before the celebration starts.
 legendTimer=setTimeout(()=>{
  if(view!=='roll'||sign!==lastDraftSignature)return;
  const category=V25.tier(star.power);
  const cover=document.createElement('div');cover.id='v12-legend-overlay';cover.className='v12-legend-overlay v25-legend-overlay v25-'+category.toLowerCase();
  cover.innerHTML=`<div class="v12-cinematic-frame"><span class="eyebrow">✦ SPECIAL SCOUT DISCOVERY ✦</span><div class="v12-cinematic-rank">${category} REVEAL</div><img class="v25-legend-art" src="${escapeHtml(v13CardPath(star))}" alt="${escapeHtml(star.name)} card"><div class="v12-cinematic-ovr">${star.power}<small> OVR</small></div><h2>${escapeHtml(star.name)}</h2><p>${escapeHtml(star.school)} · ${escapeHtml(star.position)} · Choose whether to recruit or keep rolling.</p><button class="btn" data-v="skipLegendReveal">REVEAL ALL FOUR CARDS →</button></div>`;
  document.body.appendChild(cover);
  legendTimer=setTimeout(endLegendReveal,5100);
 },2050);
}
function bondOfferPreview(existing,c){
 const insight=Links.preview(existing,c),links=insight.links;
 return `<div class="v26-offer-bond ${insight.kind}"><b>${links.length?(insight.kind==='rivalry'?'⚔ RIVALRY READY':'⚡ CHEMISTRY READY'):'🏫 SCHOOL BOND'}</b><span>${c.power+(Number(c.level)||0)} → <strong>${insight.card.effective}</strong> OVR (+${insight.card.bonus})</span>${links.length?`<small>${links.map(l=>escapeHtml(l.label)+' · +'+l.bonus+' EACH').join(' · ')}</small>`:''}${insight.changes.length?`<small>${insight.changes.map(x=>escapeHtml(x.name)+' '+x.before+' → '+x.after).join(' · ')}</small>`:''}</div>`;
}
function rollPage(){
 if(state.v3.run&&!state.v3.offer&&state.v3.run.picks.length<6){
  state.v3.offer=drawFromSchool('ALL SCHOOLS',state.v3.lastSchool);
 }
 const run=state.v3.run,offer=state.v3.offer,chosen=run?.picks.map(player).filter(Boolean)||[];
 const required=Draft.needs(chosen);
 const colors=offer?SPIKE_COLORS[offer.school]||'#76a9c5':'#738ac4';
 const chemInfo=chem(chosen,null);
 return `<section class="v12-draft-world" style="--school-color:${colors}">
  <div class="v12-world-lights" aria-hidden="true"></div>
  <div class="v12-header"><span class="eyebrow">THE SPRING HIGH · SCHOOL SCOUTING</span><h1>BUILD A <em>VOLLEYBALL SQUAD.</em></h1><p>Roll a school. Reveal four unique athletes. Pick one player, and your next school roll is free.</p></div>
  <div class="v12-stage-top"><div class="v12-score"><span>YOUR DRAFT OVR</span><b>${chosen.length?Math.round(avg(chosen)):0}</b><small>${chosen.length}/6 STARTERS</small></div><div class="v12-progress"><span>SCOUT ROUND ${run?chosen.length+1:'—'} / 6</span><div class="v12-progress-track"><div style="width:${chosen.length/6*100}%"></div></div></div>
   <div class="v12-currency"><span>✦ ${f(state.tickets)} EXTRA SCHOOL ROLLS</span><span>⟲ ${f(state.v3.rerolls)} CARD REROLLS</span></div></div>
  <div class="v12-stage-grid">
    <aside class="v12-scout-side">
      <div class="v12-scout-banner"><small>NOW SCOUTING</small><strong>${escapeHtml(offer?.school||'THE NEXT TEAM')}</strong><span>${escapeHtml(SCHEMES[offer?.school]||'School volleyball · High School cards')}</span></div>
      <div class="v12-scout-actions">
       <button class="v12-control primary" data-v="startRun">${run?'✦ RESTART DRAFT':'✦ START FREE DRAFT'}</button>
       <button class="v12-control" data-v="changeSchool" ${!run||state.tickets<1?'disabled':''}>↻ DIFFERENT SCHOOL <b>${state.tickets}</b></button>
       <button class="v12-control" data-v="rerollOffer" ${!run||state.v3.rerolls<1?'disabled':''}>⟳ REFRESH 4 CARDS <b>${state.v3.rerolls}</b></button>
       <button class="v12-control ghost" data-go="quests">✧ EARN MORE ROLLS</button>
       <button class="v12-control ghost" data-go="collection">▣ YOUR COLLECTION</button><button class="v12-control ghost v20-skip" data-v="toggleFastReveal" aria-pressed="${state.v3.fastReveals}">${state.v3.fastReveals?'✓ INSTANT CARD REVEAL':'◷ CARD REVEAL ANIMATIONS'}</button>
      </div>
      <div class="v25-settings"><div class="v25-settings-title">✦ SCOUT CINEMATICS & SAFETY</div><div class="v25-settings-grid"><label>WARN BEFORE LOSING OVR ≥<input id="v25WarnOvr" type="number" min="0" max="110" step="1" inputmode="numeric" value="${state.v3.warnOvr}" aria-label="Warn before losing cards at this OVR (zero disables)"></label><label>SPECIAL REVEAL OVR ≥<input id="v25RevealOvr" type="number" min="0" max="110" step="1" inputmode="numeric" value="${state.v3.cinematicOvr}" aria-label="Show rare cinematic at this OVR (zero disables)"></label></div><small>Default warning: 91 OVR. Type 0 to turn a setting off. Choices remain yours—no card is auto-selected.</small><button class="v25-save-settings" data-v="v25SavePrefs">SAVE DRAFT SETTINGS</button></div>
      <div class="v12-scout-guide"><b>SCOUTING RULES</b><span>100% High School scout pool · one card per athlete.</span><span>At least one choice fills a missing slot.</span><span>Quest-exclusive cards are earned, not rolled.</span></div>
    </aside>
    <div class="v12-offer-side">
      <div class="v12-section-title"><span>${offer?'PICK ONE CHARACTER':'WAITING FOR YOUR SCOUT'}</span><small>${offer?offer.cards.length+' choices':'4 choices per round'}</small></div>
      ${offer&&run?`<div class="v12-offer-list">${offer.cards.map((c,i)=>{
       const disabled=!Draft.eligible(chosen,c);const tone=rarity(c).color;const intel=Links.preview(chosen,c);
       return `<button class="v12-scout-card ${intel.links.length?`v26-synergy-offer ${intel.kind}`:``} ${disabled?'ineligible':''}" style="--i:${i};--card-color:${tone}" data-v="chooseOffer" data-key="${escapeHtml(c.key)}" ${disabled?'disabled title="This position is already filled"':''}>
        <div class="v12-scout-art" data-img-name="${escapeHtml(c.name)}"><img class="v13-scout-card-art" loading="lazy" src="${escapeHtml(v13CardPath(c))}" alt="${escapeHtml(c.name)} collectible card"></div>
        <div class="v12-scout-description"><span>${escapeHtml(c.school)} · ${escapeHtml(c.position)}</span><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.variant)} · ${escapeHtml(c.ability)}</small>${intel.card.bonus?bondOfferPreview(chosen,c):''}</div>
        <div class="v12-card-power"><b>${intel.card.effective}</b><small>OVR</small><span>${disabled?'LOCKED':'PICK'}</span></div></button>`}).join('')}</div>`:
      `<div class="v12-start-art"><span>✦</span><strong>YOUR NEXT LEGEND STARTS HERE</strong><p>Get four athletes from a randomly selected school. Build six positions, win coins and enter Nationals.</p><button class="btn" data-v="startRun">START DRAFT →</button></div>`}
      <div class="v12-position-line"><b>STILL NEEDED</b>${required.length?required.map(role=>`<span>${role}</span>`).join(''):'<span>FULL SIX COMPLETE</span>'}</div>
    </div>
    <div class="v12-court-column">
      ${courtBoard(chosen,{caption:'YOUR DRAFT COURT'})}
      <div class="v12-chem-bars"><div><b>✦ SCHOOL CHEMISTRY</b><strong>+${chemInfo.schoolBonus} OVR</strong></div><div><b>⚡ FRIENDS & RIVALS</b><strong>+${Math.round(chemInfo.duoBonus)} EACH</strong></div><small>${chemInfo.duos.length?chemInfo.duos.map(x=>x[2]).join(' · '):'Recruit connected players to unlock glowing chemistry bonuses.'}</small></div>
    </div>
  </div>
  ${regionalUnlockPanel()}
  <div class="v12-draft-bottom"><div><b>QUEST LEGENDS</b><small>Bokuto Thunder and other special editions are earned through challenges, not ordinary school rolls.</small></div><button class="btn sm" data-go="quests">OPEN LEGEND ROAD →</button></div>
 </section>`;
}
 function rerollOffer(){if(!state.v3.run)return notice('Start a squad run first');if(state.v3.rerolls<=0)return notice('Earn more rerolls from quests');state.v3.rerolls--;track('rerollsSpent');newRunOffer(true);}
 function changeSchool(){if(!state.v3.run)return notice('Start a squad run first');if(state.tickets<=0)return notice('Earn more Rolls from quests');state.tickets--;track('schoolRollsSpent');newRunOffer(false);}
function collectSelect(i,slotType){const c=player(i);if(!c)return;const otherStarters=state.squad.filter(uid=>uid&&uid!==i).map(player);if(otherStarters.some(x=>x?.name===c.name))return notice('You can only field one version of each athlete.');const places=slotType==='bench'?state.bench:state.squad;const slot=slotType==='bench'?selectionSlot-6:selectionSlot;if(slotType!=='bench'&&!slotCompatible(slot,c)){notice('This court slot needs a '+POS[slot]+' player.');return;}for(const arr of [state.squad,state.bench]){const prev=arr.indexOf(i);if(prev>=0)arr[prev]=null;}places[slot]=i;save();show('squad');}
function squadPage(){const sy=chem(),valid=owned().filter(c=>`${c.name} ${c.school} ${c.variant}`.toLowerCase().includes(filters.toLowerCase())).sort((a,b)=>b.power-a.power);
 return head('TEAM MANAGEMENT','YOUR COURT, YOUR RULES','Choose any of the six marked court positions, then tap a compatible player below.')+
 `<div class="v11-squad-shortcut"><div><b>🏆 SPRING HIGH NATIONALS</b><small>Predict how far this lineup can go against Japan's top schools.</small></div><button class="btn sm" data-go="nationals" ${starting().length!==6?'disabled':''}>${starting().length===6?'VIEW NATIONALS FORECAST →':'EQUIP 6 PLAYERS'}</button></div>`+
 `<div class="v3-stats"><div><small>SQUAD POWER</small><strong>${ovr()}</strong><span>Effective overall</span></div><div><small>SCHOOL CHEMISTRY</small><strong>+${sy.schoolBonus} OVR</strong><span>${escapeHtml(sy.main[0])} · ${sy.main[1]} players</span></div><div><small>RIVAL / DUO CHEMISTRY</small><strong>+${sy.duoBonus} OVR</strong><span>${sy.duos.length} connections · +${sy.awakeningBonus} awakening</span></div><div><small>STAFF BOOSTS</small><strong>+${Math.round(sy.staffBonus)}%</strong><span>${coach()?.name||'No coach'} + ${manager()?.name||'No manager'}</span></div></div>
 ${chemistryPanel()}
 ${courtBoard(state.squad.map(player),{interactive:true,selected:selectionSlot,caption:'SELECT A POSITION TO EDIT'})}
 <div class="v5-court-subnav"><span>SELECTED: <b>${COURT_POS[selectionSlot]?.label||'BENCH'}</b></span><button class="btn sm ghost" data-v="autoSquad">AUTO BEST SIX</button><button class="btn sm ghost" data-v="clearSlot">REMOVE PLAYER</button></div>
 <div class="sectionbar"><h2>BENCH / RESERVES</h2></div><div class="v3-slot-grid reserve">${state.bench.map((uid,i)=>`<button class="v3-slot ${selectionSlot===6+i?'active':''}" data-v="selectSlot" data-idx="${6+i}"><small>BENCH ${i+1}</small><b>${uid?escapeHtml(player(uid)?.name||'Unknown'):'EMPTY'}</b><span>${uid?(player(uid)?.power||0)+' OVR':'ADD SUBSTITUTE'}</span></button>`).join('')}</div>
 <div class="v5-staff-strip"><div><span>COACH</span><b>${coach()?escapeHtml(coach().name):'NOT EQUIPPED'}</b></div><div><span>MANAGER</span><b>${manager()?escapeHtml(manager().name):'NOT EQUIPPED'}</b></div><button class="btn ghost sm" data-go="staff">EDIT STAFF →</button></div>
 <div class="sectionbar"><h2>YOUR PLAYER COLLECTION</h2><span class="v3-mini">Tap a player to equip in the highlighted position</span></div><div class="toolbar"><input id="inventorySearch" value="${escapeHtml(filters)}" placeholder="Search character, school or version"/></div>${valid.length?`<div class="v3-card-grid mini">${valid.slice(0,85).map(x=>card(x,{click:'equipPlayer',tiny:true,disabled:selectionSlot<6&&!slotCompatible(selectionSlot,x)})).join('')}</div>`:'<div class="empty">No cards yet — draft some players.</div>'}
 <div class="sectionbar"><h2>ACTIVE CHEMISTRY · +${Math.round(sy.total)}%</h2></div><div class="v3-chem-list"><div><b>School coordination</b><small>${sy.main[1]} ${escapeHtml(sy.main[0])} players → +${sy.schoolBonus}%</small></div>${sy.duos.map(d=>`<div><b>⚡ ${escapeHtml(d[2])}</b><small>${escapeHtml(d[0])} + ${escapeHtml(d[1])} → +${d[3]}%</small></div>`).join('')||'<div>Try pairing Hinata + Kageyama, Hinata + Kenma, or Bokuto + Akaashi.</div>'}</div>
 <div class="sectionbar"><h2>FIVE SAVED TEAMS</h2></div><div class="v3-save-grid">${state.savedTeams.map((x,i)=>`<div class="v3-save-item"><b>${SQUAD_NAMES[i]}</b><small>${x?x.squad.filter(Boolean).length+' players · '+new Date(x.savedAt).toLocaleDateString():'Not yet saved'}</small><div class="flexgap"><button class="btn sm" data-v="savePreset" data-idx="${i}">SAVE</button><button class="btn sm ghost" data-v="loadPreset" data-idx="${i}" ${x?'':'disabled'}>LOAD</button></div></div>`).join('')}</div>`;
}
function slotCompatible(i,c){return i===0||i===4?c.position==='OH':i===1?c.position==='MB':i===2?c.position==='OP':i===3?['MB','L'].includes(c.position):i===5?c.position==='S':true;}

let collectionCategory='all';
function collectionPage(){const arr=owned().filter(x=>`${x.name} ${x.school} ${x.variant}`.toLowerCase().includes(filters.toLowerCase())).filter(x=>collectionCategory==='all'||(collectionCategory==='quest'?x.questOnly:collectionCategory==='school'?x.stage===0:collectionCategory==='nationals'?x.stage===1:collectionCategory==='premium'?x.stage===2||x.stage===3:false)).sort((a,b)=>b.power-a.power);return head('PLAYER ARCHIVE','YOUR PERMANENT COLLECTION',`${owned().length} cards · ${new Set(owned().map(x=>x.key)).size} unique variants · ${CATALOG.length} total available`)+`<div class="v12-collection-tabs">${[['all','ALL CARDS'],['school','SCHOOL'],['nationals','NATIONALS'],['premium','TIMESKIP / PRO'],['quest','QUEST EXCLUSIVE']].map(([key,label])=>`<button class="${collectionCategory===key?'active':''}" data-v="collectionCategory" data-category="${key}">${label}</button>`).join('')}</div><div class="toolbar"><input id="inventorySearch" value="${escapeHtml(filters)}" placeholder="Search characters, teams, versions"/><button class="btn ghost sm" data-go="squad">EQUIP SQUAD</button></div>${arr.length?`<div class="v3-card-grid">${arr.slice(0,170).map(x=>card(x,{click:'viewCard'})).join('')}</div>`:'<div class="empty">Nothing here yet. Start drafting characters.</div>'}`}
function staffPage(){const all=ownedCoaches(),group=coachTab==='managers'?'manager':'coach',arr=all.filter(x=>x.type===group),current=group==='manager'?manager():coach();return head('TACTICAL STAFF','COACHES & MANAGERS','Equip exactly ONE coach and ONE manager. Both have six rarity levels and different boosts.')+
 `<div class="v5-staff-grid"><div class="v5-active-staff"><small>YOUR COACH</small><strong>${coach()?escapeHtml(coach().name):'NOT ASSIGNED'}</strong><span>${coach()?`+${coach().value}% ${coach().buff}`:'Boosts skills and chemistry'}</span></div><div class="v5-active-staff"><small>YOUR MANAGER</small><strong>${manager()?escapeHtml(manager().name):'NOT ASSIGNED'}</strong><span>${manager()?`+${manager().value}% ${manager().buff}`:'Boosts rewards and momentum'}</span></div></div>
 <div class="v3-tabs"><button class="${group==='coach'?'active':''}" data-v="staffTab" data-tab="coaches">COACHES</button><button class="${group==='manager'?'active':''}" data-v="staffTab" data-tab="managers">MANAGERS</button></div>
 ${state.v3.staffOffer?.length?'<div class="v20-pending-recruit"><span>✦ You have an unclaimed staff recruit!</span><button class="btn sm" data-v="openStaffOffer">FINISH SELECTION →</button></div>':''}<div class="v3-shop-hero"><div><div class="eyebrow">GEM SCOUTING</div><h2>RECRUIT A ${group.toUpperCase()}</h2><p>Spend 40 gems to reveal three ${group} cards. Pick one. Higher rarities grant stronger bonuses.</p></div><button class="btn" data-v="staffRoll" ${state.gems<40?'disabled':''}>SCOUT ${group.toUpperCase()} · 💎40</button></div>
 <div class="v4-rarity-key">${COACH_RARITIES.map((x,i)=>`<span style="border-color:${RR[i].color}">${x} ${COACH_CHANCES[i]}%</span>`).join('')}</div><div class="sectionbar"><h2>YOUR ${group.toUpperCase()} CARDS · ${arr.length}</h2></div>
 ${arr.length?`<div class="v3-coach-grid">${arr.map(x=>coachCard(x,'equipCoach')).join('')}</div>`:'<div class="empty">No staff of this type yet. Complete quests to earn gems, then scout.</div>'}<div class="v3-note">Recruitment is separate from the player draft. Staff do not occupy the six court positions.</div>`}
function staffRoll(){if(state.v3.staffOffer?.length){openStaffOffer();return;}if(state.gems<40)return notice('Not enough gems. Earn them from quests and team milestones.');const group=coachTab==='managers'?'manager':'coach';const pool=SPIKE_COACHES.filter(x=>staffType(x)===group);if(pool.length<3)return notice('Not enough staff in that category');state.gems-=40;state.v3.coachPacks++;
 const choices=[];const seen=new Set();while(choices.length<3){const x=pick(pool);if(seen.has(x.id))continue;seen.add(x.id);choices.push({...ratedCoach(x,staffTier()),type:group});}
 state.v3.staffOffer=choices.map(x=>({key:x.id,tier:x.tier}));save();popup(`<div class="eyebrow">${group.toUpperCase()} SCOUTING</div><h2 class="h1">CHOOSE ONE ${group.toUpperCase()}</h2><div class="v3-coach-grid">${choices.map(x=>coachCard({...x,uid:`${x.id}|${x.tier}`},'chooseCoach')).join('')}</div>`)}
function chooseCoach(encoded){const [key,r]=String(encoded||'').split('|'),tier=Number(r);const offer=state.v3.staffOffer?.find(o=>o.key===key&&o.tier===tier);const x=SPIKE_COACHES.find(c=>c.id===key);if(!x||!offer)return;const c={key,uid:id(),tier};state.coaches.push(c);if(staffType(x)==='manager'){if(!manager())state.manager=c.uid;}else if(!coach())state.coach=c.uid;
 delete state.v3.staffOffer;track('staff');save();close();show('staff');notice(`${COACH_RARITIES[tier]} ${x.name} joined your staff.`)}

// Price, version and exact drop odds are always visible before purchase.
const SHOP=[
 {id:'timeskip',name:'TIMESKIP CHRONICLES',price:7500,stage:2,desc:'Time has passed. Recruit an older version of a school athlete.',theme:'time',label:'THE NEXT GENERATION'},
 {id:'professional',name:'PRO LEAGUE CONTRACT',price:22000,stage:3,desc:'Only verified professional-team athletes. Hunt Elite (10%) and Apex (1%) forms; both have guaranteed pity.',theme:'pro',label:'THE WORLD STAGE'}
];
const SKINS=[{id:'classic',name:'Classic Court',price:0},{id:'sunset',name:'Sunset Orange',price:50},{id:'midnight',name:'Midnight Blue',price:60},{id:'jade',name:'Jade Storm',price:80}];
function buyCosmetic(kind){const c=SKINS.find(x=>x.id===kind);if(!c)return;const owns=kind==='classic'||state.v3.cosmetics.includes(kind);if(!owns){if(state.gems<c.price)return notice('Not enough gems');state.gems-=c.price;state.v3.cosmetics.push(kind);}state.v3.skin=kind;document.body.dataset.skin=kind;save();render();notice(`${c.name} equipped`);}
function pendingReveal(){const p=state.v3.pendingPack;const c=p&&BY_KEY[p.key];if(!p||!c)return '';
 return `<div class="v6-pending"><div><b>⚠ UNCLAIMED ${escapeHtml(p.pack.toUpperCase())} PACK</b><p>Your card is reserved. Claim it before opening another pack.</p></div><button class="btn" data-v="revealPending">REVEAL YOUR CARD</button></div>`;
}
function packCover(stage){
 const names=stage===3?['Wakatoshi Ushijima','Tobio Kageyama','Kotaro Bokuto']:['Shoyo Hinata','Kenma Kozume','Atsumu Miya'];
 return `<div class="v8-pack-art"><span class="v8-pack-stamp">${stage===3?'PRO LEAGUE':'TIMESKIP'} ✦</span>${names.map((name,i)=>{const c=CATALOG.find(x=>x.name===name&&x.stage===stage&&(! (stage===3)||x.proOnly))||CATALOG.find(x=>x.name===name);return `<div class="v8-pack-face" data-img-name="${escapeHtml(name)}"><img src="${c?.portrait||'portraits/staff-placeholder.svg'}" loading="lazy" alt="${escapeHtml(name)}" /></div>`}).join('')}<span class="v8-pack-sigil">✦</span></div>`;
}
function shopPage(){const odds=SpikePacks.ODDS;
 return head('PROFESSIONAL SCOUTING','TIMESKIP & PRO PACKS','Earn coins from finished drafts, school battles and quests. Open one permanent card per pack; rare drops are genuinely hard to find.')+
 `<div class="v6-shop-banner"><div><div class="eyebrow">ASTRAL COURT • SEASON 10</div><h2>CHASE THE 1% APEX · PITY GUARANTEED.</h2><p>Every purchased pack reveals one permanent athlete. Strong cards are less common, even within the regular 89% pool.</p></div><div class="v6-shop-wallet"><small>YOUR COINS</small><strong>${f(state.coins)} ◉</strong><span>${state.v3.packsOpened} packs opened</span></div></div>`+
 pendingReveal()+
 `<div class="v6-drop-table"><div><b>STANDARD</b><strong>${odds.standard}%</strong><span>Regular character</span></div><div class="elite"><b>ELITE FORM</b><strong>${odds.elite}%</strong><span>Boosted OVR + abilities</span></div><div class="apex"><b>APEX FORM</b><strong>${odds.apex}%</strong><span>Ultra-rare awakening</span></div></div>`+
 `<p class="v6-pack-note">Chances are <b>per entire opened pack</b>, not per card and not multiplied by four. Hard pity guarantees at most 20 pulls without Elite-or-better and 100 without Apex, tracked independently for each pack type. Pity resets only when the corresponding tier (or higher) drops. No paid currency is required. Standard pulls favour lower-rated athletes; star players and Elite/Apex forms are difficult to obtain.</p>`+
 `<div class="v3-shop-grid v6-shop-grid">${SHOP.map(s=>`<article class="v3-store-card v6-store-card stage-${s.stage}">${packCover(s.stage)}<div class="eyebrow">GUARANTEED ${VERSIONS[s.stage].toUpperCase()} CHARACTER</div><h2>${s.name}</h2><p>${s.desc}</p><div class="v6-stats"><b>${f(s.price)} ◉</b><small>★ ELITE 10% &nbsp; ✦ APEX 1%</small></div>${["elite","apex"].map(tier=>{const n=(state.v3.packPity?.[s.id]?.[tier]||0),max=tier==='elite'?20:100;return `<div class="v26-pity-label"><span>${tier.toUpperCase()} PITY</span><b>${n}/${max}</b></div><div class="v26-progress"><i style="width:${100*n/max}%"></i></div>`}).join('')}<button class="btn" data-v="shopBuy" data-pack="${s.id}" ${(state.coins<s.price||state.v3.pendingPack)?'disabled':''}>OPEN ONE PACK →</button></article>`).join('')}</div>`+
 `<div class="v6-recent-grid"><div class="v3-feature"><h3>📜 EARN COINS + GUARANTEED CHARACTERS</h3><p>Daily and weekly quests provide spending money. Legend Road gives specific Nationals, Timeskip and Pro character rewards.</p><button class="btn ghost sm" data-go="quests">VIEW CHARACTER QUESTS</button></div><div class="v3-feature"><h3>⭐ YOUR PACK RECORD</h3><p>${f(state.v3.packsOpened)} packs opened · <b>${f(state.v3.eliteFound)}</b> Elite forms · <b>${f(state.v3.apexFound)}</b> Apex forms</p><p>${f(state.v3.coinsSpentOnPacks)} coins spent on packs.</p></div></div>`+
 `<div class="sectionbar"><h2>💎 GEM COSMETICS</h2></div><div class="v4-skins">${SKINS.map(c=>`<button class="btn ghost sm" data-v="skin" data-skin="${c.id}">${escapeHtml(c.name)} · ${c.id===state.v3.skin?'EQUIPPED':c.id==='classic'||state.v3.cosmetics.includes(c.id)?'OWNED':'💎 '+c.price}</button>`).join('')}</div>`;
}
function showPendingPack(){const p=state.v3.pendingPack,c=p&&BY_KEY[p.key];if(!c)return notice('No pack awaiting reveal.');
 const kind=c.packTier||'standard';
 popup(`<div class="v6-pack-reveal ${kind} ${kind!=='standard'||c.power>=state.v3.cinematicOvr&&state.v3.cinematicOvr>0?'v25-pack-wow':''}"><div class="eyebrow">${escapeHtml(p.pack.toUpperCase())} RECRUITMENT · ${kind.toUpperCase()}</div><h2 class="h1">${kind==='apex'?'✦ APEX 1% ✦':kind==='elite'?'★ ELITE 10% ★':'NEW ATHLETE!'}</h2><p>${kind==='apex'?'The rarest awakening has arrived!':kind==='elite'?'You landed an Elite Form.':'This character belongs to your collection once claimed.'}</p><div class="v3-single">${card(c,{click:'shopPick'})}</div><button class="btn" data-v="shopPick" data-key="${escapeHtml(c.key)}">CLAIM ${escapeHtml(c.name.toUpperCase())} →</button></div>`);
}
function buyPack(kind,fromToken=false){const s=SHOP.find(x=>x.id===kind);if(!s)return false;
 if(state.v3.pendingPack){showPendingPack();notice('Claim the previous pack first.');return false;}
 const pay=fromToken?0:s.price;if(state.coins<pay){notice('Not enough coins. Earn more through drafts, duels and quests.');return false;}
 // Exactly ONE result per purchase. 1% Apex is per pack, with a 100-pack hard pity.
 const result=SpikePacks.drawPack(CATALOG,s.stage,Math.random,state.v3.packPity[kind]);
 state.coins-=pay;state.v3.coinsSpentOnPacks+=pay;state.v3.packsOpened++;
 state.v3.packPity[kind]=result.pity;
 if(result.tier==='elite')state.v3.eliteFound++;
 if(result.tier==='apex')state.v3.apexFound++;
 state.v3.pendingPack={key:result.card.key,pack:kind,openedAt:Date.now(),tier:result.tier,guaranteed:result.guaranteed};
 offer={cards:[result.card],kind:'shop'};track('packsOpened');
 save();render();showPendingPack();return true;
}
function shopPick(key){const pending=state.v3.pendingPack;if(!pending||pending.key!==key)return;
 const duplicate=state.items.some(x=>x.key===key);
 const cardObj=addCard(key);if(!cardObj)return;
 // Exactly one owned card per version. Repeated premium pulls pay coins back
 // instead of cluttering the collection or silently eating an entire pack.
 const duplicateCoins=duplicate?(cardObj.stage===3?5000:1600):0;
 if(duplicateCoins)state.coins+=duplicateCoins;
 if(!duplicate){
  if(cardObj.stage>=2)track('rare');
  if(cardObj.stage===3){state.v3.proOwned++;track('pro');}
  if(cardObj.packTier==='elite')track('elites');
  if(cardObj.packTier==='apex')track('apex');
 }
 state.v3.pendingPack=null;offer=null;save();close();show('shop');
 popup(`<div class="eyebrow">${duplicate?'DUPLICATE CARD CONVERTED':'PERMANENT RECRUIT ACQUIRED'}</div><h2 class="h1">${escapeHtml(cardObj.name.toUpperCase())}</h2><div class="v3-single">${card(cardObj)}</div><p>${duplicate?`You already own this exact card, so you received ${f(duplicateCoins)} coins instead. Your collection stays unique.`:`${escapeHtml(cardObj.variant)} · ${cardObj.power} OVR. Saved permanently to your collection.`}</p><button class="btn" data-v="close">CONTINUE</button>`);
}
function track(metric,n=1){rollover();state.v3.quests[metric]=(state.v3.quests[metric]||0)+n;state.v3.weekly[metric]=(state.v3.weekly[metric]||0)+n;}
const DAILY=[['pick1','First Scouting Pick','Choose your first school character today','picks',1,{tickets:2,rerolls:1}],['pick3','Build Momentum','Recruit three characters in one day','picks',3,{tickets:2,rerolls:2}],['practice','Daily Practice','Finish one school or bot duel','duels',1,{tickets:2,coins:350}],['national1','National Debut','Complete one Spring High tournament run','nationalsRuns',1,{tickets:2,coins:500}],['nationwin','Tournament Momentum','Win one Spring High tournament match','nationalsWins',1,{rerolls:2,coins:650}],['run1','Squad Architect','Complete one six-player draft','runs',1,{coins:500,tickets:1}],['draft4','Talent Scout','Pick four characters','picks',4,{coins:380,rerolls:2}],['duel1','Enter the Court','Complete a duel','duels',1,{coins:400,gems:12}],['win1','First Point','Win one duel','wins',1,{coins:650,tickets:2}],['staff1','Coach Recruitment','Recruit one coach','staff',1,{coins:700,gems:30}],['rare1','Spot a Star','Recruit one 90+ OVR card','rare',1,{tokens:1,gems:25}],['pack1','Pack Opening Day','Open one Timeskip or Pro pack','packsOpened',1,{coins:750,gems:10}],['run2','Double Draft Payday','Finish two squad drafts today','runs',2,{coins:1800,tickets:1}],['chemistry','Connected Six','Complete a squad run with an active duo or rivalry link','chemistry',1,{tickets:3,rerolls:3,gems:15}],['duel3','Three-Game Bonus','Finish three duels today','duels',3,{coins:1350,rerolls:2}]];
const WEEKLY=[['tenpicks','School Recruiter','Pick ten characters this week','picks',10,{tickets:6,rerolls:4}],['twoWins','Winning Scout','Win two duels this week','wins',2,{tickets:4,coins:1300}],['week3','Squad Streak','Finish 3 squad drafts','runs',3,{coins:2200,tickets:4}],['week10','Court Veteran','Play 10 duels','duels',10,{coins:2800,rerolls:5}],['week5','Win Five','Win 5 duels','wins',5,{coins:3600,gems:80}],['week15','Special Scout','Pick 15 characters','picks',15,{tokens:2}],['weeknat','National Tournament Veteran','Win four Spring High matches this week','nationalsWins',4,{coins:3000,tickets:3}],['weekpro','Professional Path','Obtain 2 pro cards','pro',2,{coins:6200}],['wpack3','Pack Collector','Open 3 premium packs this week','packsOpened',3,{coins:3200,gems:35}],['wruns7','Seven Squads','Complete seven full drafts this week','runs',7,{coins:8000,tickets:5}],['wduels12','Tournament Earnings','Finish 12 duels','duels',12,{coins:10500,proTokens:1}]];
const QUESTLINE=[['m0','Your First Recruit','Pick your first character',()=>state.items.length>=1,{tickets:3,rerolls:2}],['m1','The First Six','Complete your first squad draft',()=>state.v3.runs>=1,{coins:1200}],['m2','Seasoned Coach','Recruit three staff members',()=>state.coaches.length>=3,{tokens:1,gems:25}],['m3','National Prospect','Win 10 matches',()=>state.wins>=10,{coins:7000}],['m4','Volleyball Collector','Own 25 different character cards',()=>owned().length>=25,{tokens:2}],['m5','True Rivals','Win 20 matches against players or bots',()=>state.wins>=20,{proTokens:1}],['m6','Professional Champion','Win 40 matches',()=>state.wins>=40,{proTokens:2}],['m7','The Greatest Squad','Complete 25 squad runs',()=>state.v3.runs>=25,{proTokens:2}],
 ['nationalm1','Quarterfinal Breakthrough','Reach Top 8 at Spring High',()=>state.v3.nationals.bestWins>=3,{tokens:1,coins:2500}],['nationalm2','National Champion','Win the Spring High final',()=>state.v3.nationals.bestWins>=6,{tokens:2,proTokens:1,coins:12000}],['m8','First National Star','Complete 3 squad drafts',()=>state.v3.runs>=3,{coins:1500,cardName:'Shoyo Hinata',cardStage:1}],
 ['m9','The Setter Journey','Win 12 matches',()=>state.wins>=12,{coins:7000,cardName:'Tobio Kageyama',cardStage:1}],
 ['m10','Timeskip Challenger','Complete 12 squad drafts',()=>state.v3.runs>=12,{coins:10500,cardName:'Kenma Kozume',cardStage:2}],
 ['m11','Pro Road','Win 60 matches',()=>state.wins>=60,{coins:25000,cardName:'Shoyo Hinata',cardStage:3}],
 ['m12','Elite Hunter','Open 75 card packs',()=>state.v3.packsOpened>=75,{coins:18000,cardName:'Atsumu Miya',cardStage:3,cardTier:'elite'}],
 ['m13','Apex Legend','Win 250 matches',()=>state.wins>=250,{coins:50000,cardName:'Wakatoshi Ushijima',cardStage:3,cardTier:'apex'}],
 // Unique, earned-only forms. These are NOT included in school scouting or shops.
 ['ql-bokuto','Thunder Ace Trial','Win 50 matches and complete 20 chemistry-linked squads',()=>state.wins>=50&&state.v3.chemistryRuns>=20,{questKey:'legend-bokuto-thunder',coins:7000}],
 ['ql-hinata','Sky Breaker Journey','Reach the Spring High semifinals and complete 10 drafts',()=>state.v3.nationals.bestWins>=4&&state.v3.runs>=10,{questKey:'legend-hinata-sky',tickets:7}],
 ['ql-kenma','The Perfect Strategist','Finish 18 full six-player drafts',()=>state.v3.runs>=18,{questKey:'legend-kenma-oracle',rerolls:10}],
 ['ql-kageyama','King of Setters','Win 60 matches and become National Champion',()=>state.wins>=60&&state.v3.nationals.bestWins>=6,{questKey:'legend-kageyama-king',coins:11000}],
 ['ql-ushijima','Unstoppable Left Arm','Become Nationals champion and win 100 matches',()=>state.v3.nationals.bestWins>=6&&state.wins>=100,{questKey:'legend-ushijima-power',coins:18000}]
];
// V18: substantial repeatable scouting rewards. Earlier starter quests retain their IDs
// and claim history, so users upgrading do not lose previously earned progress.
DAILY.unshift(
 ['d18-scout8','Scout Marathon','Pick eight players today','picks',8,{tickets:20,rerolls:5}],
 ['d18-three-squads','Triple Squad Shift','Complete three full squad drafts today','runs',3,{tickets:20,rerolls:10,coins:1600}],
 ['d18-court3','School Battle Training','Win three school campaign matches today','careerWins',3,{tickets:20,rerolls:5}],
 ['d18-school6','School Circuit Sprint','Win six school battles today','careerWins',6,{tickets:20,rerolls:10,coins:2400}],
 ['d18-five-rerolls','Persistence Pays','Use five four-card rerolls today','rerollsSpent',5,{tickets:20,coins:1100}],
 ['d18-ten-schoolrolls','School Scout Expedition','Spend ten extra school rolls today','schoolRollsSpent',10,{tickets:20,rerolls:15}],
 ['d18-fivewins','Five-Win Run','Win five matches today','wins',5,{tickets:20,rerolls:6}],
 ['d18-ninepicks','Collector Shift','Choose nine school players today','picks',9,{tickets:20,gems:35}],
 ['d18-nation3','National Match Day','Win three Spring High matches today','nationalsWins',3,{tickets:20,rerolls:10}],
 ['d18-chem3','Chemistry Practice','Finish three drafts with chemistry links','chemistry',3,{tickets:20,rerolls:8}]
);
WEEKLY.unshift(
 ['w18-circuit12','Circuit Challenger','Win 12 school battles this week','careerWins',12,{tickets:40,rerolls:20,coins:6000}],
 ['w18-boss3','Boss Breaker','Win three school chapter boss battles this week','bossWins',3,{tickets:40,rerolls:20,gems:60}],
 ['w18-scout24','24-Card Scouting','Recruit 24 school cards this week','picks',24,{tickets:35,rerolls:12}],
 ['w18-squad8','Eight Squad Architect','Finish eight full drafts this week','runs',8,{tickets:35,rerolls:20}],
 ['w18-wins10','Ten Victories','Win ten duels or school matches this week','wins',10,{tickets:35,rerolls:12,coins:8000}],
 ['w18-chem5','Synergy Engineer','Complete five chemistry-linked draft runs','chemistry',5,{tickets:35,rerolls:15}],
 ['w18-nat6','National Road Trip','Win six Nationals tournament matches','nationalsWins',6,{tickets:40,rerolls:15}],
 ['w18-swap20','Reroll Specialist','Use twenty rerolls during drafting','rerollsSpent',20,{tickets:35,rerolls:20}],
 ['w18-school20','Rolling Across Japan','Spend 20 extra school rolls','schoolRollsSpent',20,{tickets:35,rerolls:25}],
 ['w18-pack4','Professional Collector','Open four Timeskip/Pro packs','packsOpened',4,{tickets:30,rerolls:10,gems:80}],
 ['w18-duels15','Fifteen Match Veteran','Finish fifteen matches','duels',15,{tickets:40,rerolls:20}],
 ['w18-rare6','Star Finder','Recruit six 90+ OVR cards','rare',6,{tickets:30,rerolls:20}]
);
QUESTLINE.push(
 ['m18-first-school','The First School Victory','Clear your first school battle',()=>state.career>=1,{tickets:20,rerolls:10,coins:1500}],
 ['m18-first-chapter','Opening Circuit Champion','Clear the first nine school battles',()=>state.career>=9,{tickets:20,rerolls:10,gems:30}],
 ['m18-tokyo','Tokyo Circuit Champion','Clear stage 17 — Tokyo Invitational',()=>state.career>=17,{tickets:30,rerolls:15,coins:4000}],
 ['m18-miyagi','Miyagi Grand Prix Champion','Clear stage 25 — Miyagi Grand Prix',()=>state.career>=25,{tickets:30,rerolls:15,coins:5500}],
 ['m18-interhigh','Interhigh Conqueror','Clear stage 33 — Interhigh Road',()=>state.career>=33,{tickets:30,rerolls:15,coins:8000}],
 ['m18-springhigh','Spring High Rival','Clear stage 41 — Spring High Showdown',()=>state.career>=41,{tickets:40,rerolls:20,coins:11000}],
 ['m18-elite','Elite Nationals Champion','Clear stage 49 — Elite Nationals',()=>state.career>=49,{tickets:40,rerolls:20,coins:15000}],
 ['m18-final','Ultimate School Champion','Clear all 57 school campaign battles',()=>state.career>=57,{tickets:50,rerolls:30,coins:25000,proTokens:1}],
 ['m18-wins8','Eight Duel Champion','Win eight total matches',()=>state.wins>=8,{tickets:20,rerolls:10}],
 ['m18-wins25','Twenty-Five Win Breakthrough','Win 25 matches',()=>state.wins>=25,{tickets:30,rerolls:15}],
 ['m18-wins75','Champion of Seventy-Five','Win 75 matches',()=>state.wins>=75,{tickets:40,rerolls:20,coins:12000}],
 ['m18-drafts5','Five Formations','Complete five six-player squad drafts',()=>state.v3.runs>=5,{tickets:20,rerolls:10}],
 ['m18-drafts15','Fifteen Formations','Complete fifteen six-player drafts',()=>state.v3.runs>=15,{tickets:30,rerolls:20}],
 ['m18-drafts40','Forty Formations','Complete forty full squads',()=>state.v3.runs>=40,{tickets:50,rerolls:30}],
 ['m18-nat2','Spring High Contender','Reach the second round at Spring High',()=>state.v3.nationals.bestWins>=2,{tickets:20,rerolls:10}],
 ['m18-nat4','Spring High Semifinalist','Reach the Spring High semifinals',()=>state.v3.nationals.bestWins>=4,{tickets:30,rerolls:15}],
 ['m18-nat6','Spring High Crown','Become Spring High national champion',()=>state.v3.nationals.bestWins>=6,{tickets:50,rerolls:25,coins:10000}],
 ['m18-chem10','Chemistry Collector','Finish ten full drafts with chemistry',()=>state.v3.chemistryRuns>=10,{tickets:20,rerolls:20}],
 ['m18-chem30','Rivalry Master','Finish thirty drafts with duo or rivalry chemistry',()=>state.v3.chemistryRuns>=30,{tickets:40,rerolls:25}],
 ['m18-collection50','50-Card Collector','Own fifty unique character cards',()=>owned().length>=50,{tickets:30,rerolls:15}]
);
QUESTLINE.push(
 ['v26-road5','Nationals Opening Five','Clear the first five Nationals Road battles',()=>state.v3.nationalsRoad.cleared>=5,{tickets:20,rerolls:5}],
 ['v26-road25','Elite Road Challenger','Clear 25 Nationals Road battles',()=>state.v3.nationalsRoad.cleared>=25,{tickets:35,rerolls:10}],
 ['v26-road50','Halfway to Legend','Clear 50 Nationals Road battles',()=>state.v3.nationalsRoad.cleared>=50,{tickets:45,proTokens:1}],
 ['v26-road100','Ultimate Nationals','Clear all 100 Nationals Road battles',()=>state.v3.nationalsRoad.cleared>=100,{tickets:100,proTokens:2}]
);
DAILY.push(['v26-raid-one','Raid Team Training','Complete one co-op raid today','raidRuns',1,{tickets:20,rerolls:5}]);
WEEKLY.push(['v26-raid-three','Alliance Champions','Win three co-op raids this week','raidWins',3,{tickets:40,rerolls:15,gems:60}]);
QUESTLINE.push(['v26-raid-veteran','Raid Veteran','Win ten co-op raids',()=>Number(state.v3.raidVictories||0)>=10,{tickets:50,coins:5000}]);
function claimedRewards(reward){state.coins+=(reward.coins||0);state.gems+=(reward.gems||0);state.tickets+=(reward.tickets||0);state.v3.rerolls+=(reward.rerolls||0);state.v3.quickTokens+=(reward.tokens||0);state.v3.proTokens=(state.v3.proTokens||0)+(reward.proTokens||0);
 if(reward.questKey&&QUEST_LEGEND_MAP[reward.questKey])addCard(reward.questKey,'quest-reward');
 if(reward.cardName){const matches=CATALOG.filter(x=>x.name===reward.cardName&&x.stage===reward.cardStage&&(x.packTier||'standard')===(reward.cardTier||'standard'));const c=matches.find(x=>reward.cardStage===3&&x.proOnly)||matches[0];if(c){addCard(c.key);if(c.stage===3){state.v3.proOwned++;}}}
}
// Earned Nationals passes are guaranteed scout recruits, not shop packs.
function redeemNationalsPass(){
 if((state.v3.quickTokens||0)<1)return notice('Earn a Nationals Scout Pass from quests first.');
 const pool=BASE_CATALOG.filter(x=>x.stage===1&&!x.proOnly);
 if(!pool.length)return notice('No available Nationals recruits.');
 const chosen=SpikePacks.weightedChoose(pool);
 state.v3.quickTokens--;const gained=addCard(chosen.key);if(!gained)return;
 save();render();popup(`<div class="eyebrow">NATIONALS SCOUT PASS REDEEMED</div><h2 class="h1">NEW NATIONALS ATHLETE</h2><div class="v3-single">${card(gained)}</div><p>${escapeHtml(gained.name)} · ${gained.power} OVR. Added permanently to your collection.</p><button class="btn" data-v="close">CONTINUE</button>`);
}
function questMeasure(key,passed){
 const stages=Number(state.career)||0,wins=Number(state.wins)||0,runs=Number(state.v3.runs)||0,road=Number(state.v3.nationalsRoad?.cleared)||0;
 const map={'m18-first-school':[stages,1],'m18-first-chapter':[stages,9],'m18-tokyo':[stages,17],'m18-miyagi':[stages,25],'m18-interhigh':[stages,33],'m18-springhigh':[stages,41],'m18-elite':[stages,49],'m18-final':[stages,57],'m18-wins8':[wins,8],'m18-wins25':[wins,25],'m18-wins75':[wins,75],'m18-drafts5':[runs,5],'m18-drafts15':[runs,15],'m18-drafts40':[runs,40],'m18-nat2':[state.v3.nationals.bestWins,2],'m18-nat4':[state.v3.nationals.bestWins,4],'m18-nat6':[state.v3.nationals.bestWins,6],'m18-chem10':[state.v3.chemistryRuns||0,10],'m18-chem30':[state.v3.chemistryRuns||0,30],'m18-collection50':[owned().length,50],'v26-road5':[road,5],'v26-road25':[road,25],'v26-road50':[road,50],'v26-road100':[road,100],'v26-raid-veteran':[state.v3.raidVictories||0,10]};
 return map[key]||[passed?1:0,1];
}
function questRows(rows,period){return rows.map(([key,name,desc,metric,target,reward])=>{const full=period==='milestone'?metric():Math.min(target,Number(state.v3[period==='weekly'?'weekly':'quests'][metric]||0));const complete=period==='milestone'?full:full>=target;const tracker=period==='milestone'?'milestoneClaimed':period==='weekly'?'weeklyClaimed':'claimed';const taken=!!state.v3[tracker][key];const [amount,goal]=period==='milestone'?questMeasure(key,complete):[full,target];const pct=Math.round(100*Math.max(0,Math.min(1,amount/Math.max(1,goal))));return `<div class="v3-quest v26-quest-row"><div><b>${name}</b><p>${desc}</p><div class="v26-quest-counter"><span>${Math.min(amount,goal)} / ${goal}</span><b>${pct}%</b></div><div class="v26-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(amount,goal)}" aria-label="${escapeHtml(name)} progress"><i style="width:${pct}%"></i></div><small>${period==='milestone'?(complete?'COMPLETE':'LOCKED'):`${full}/${target}`} • ${reward.coins?'◉ '+f(reward.coins):''}${reward.tokens?' ✦ '+reward.tokens+' Nationals passes':''}${reward.gems?' 💎 '+reward.gems:''}${reward.tickets?' ↻ '+reward.tickets+' rolls':''}${reward.rerolls?' ⟳ '+reward.rerolls+' rerolls':''}${reward.proTokens?' ★ '+reward.proTokens+' PRO tokens':''}${reward.cardName?' 🏐 '+escapeHtml(reward.cardTier?reward.cardTier.toUpperCase()+' ':'')+escapeHtml(reward.cardName)+' ('+escapeHtml(VERSIONS[reward.cardStage])+')':''}${reward.questKey?' ✦ EXCLUSIVE: '+escapeHtml(QUEST_LEGEND_MAP[reward.questKey]?.title||'Legend') :''}</small></div><button class="btn sm" data-v="claimQuest" data-quest="${period}|${key}" ${taken||!complete?'disabled':''}>${taken?'CLAIMED':complete?'CLAIM':'IN PROGRESS'}</button></div>`}).join('')}
function legendRoadPanel(){
 return `<section class="v12-legend-road"><div class="v12-panel-intro"><span class="eyebrow">UNTRADEABLE · EARNED ONLY</span><h2>LEGEND ROAD · QUEST CARDS</h2><p>Unique alternate cards are not in school rolls, Timeskip packs or Professional packs. Complete their difficult quests to recruit them permanently.</p></div>
 <div class="v12-legend-grid">${QUEST_LEGENDS.map(legend=>{
  const quest=QUESTLINE.find(q=>q[4]?.questKey===legend.key);
  const claimed=quest&&state.v3.milestoneClaimed?.[quest[0]];
  const unlocked=Boolean(quest?.[3]());
  const ownedCard=Boolean(state.items.find(i=>i.key===legend.key));
  return `<article class="v12-legend-reward ${ownedCard?'obtained':''}">
    <div class="v12-legend-face" data-img-name="${escapeHtml(legend.name)}"><img src="${escapeHtml(legend.portrait)}" loading="lazy" alt="${escapeHtml(legend.name)}"></div>
    <div class="v12-legend-detail"><div class="eyebrow">${ownedCard?'✓ OWNED':'QUEST EXCLUSIVE'} · ${legend.power} OVR</div><h3>${escapeHtml(legend.title)}</h3><p>${escapeHtml(quest?.[2]||'Complete the challenge')}</p>
      <button class="btn sm ${unlocked&&!claimed?'':'ghost'}" ${!unlocked||claimed?'disabled':''} data-v="claimQuest" data-quest="milestone|${quest?.[0]||''}">${claimed||ownedCard?'COLLECTED':unlocked?'CLAIM CHARACTER':'LOCKED · KEEP PLAYING'}</button>
    </div></article>`}).join('')}</div></section>`;
}
function questsPage(){const currentTab=tab==='weekly'?'weekly':tab==='milestone'?'milestone':'daily';const qList=currentTab==='milestone'?QUESTLINE:currentTab==='weekly'?WEEKLY:DAILY;const tracker=currentTab==='milestone'?'milestoneClaimed':currentTab==='weekly'?'weeklyClaimed':'claimed';const available=Quality.questStatus(qList,currentTab,state.v3,state.v3[tracker]);return head('PROGRESSION','SCOUT ROLLS & CHARACTER JOURNEYS','Earn 20-roll scouting bundles from tougher daily quests, huge weekly rewards, and 57 school-battle stages. Win duels to unlock rare cards.')+`<div class="v18-quest-banner"><span>SCOUTING SEASON · V20</span><strong>20 ROLLS PER BIG DAILY QUEST</strong><p>Complete the featured daily challenges to earn 20 school rolls each. Weekly quests pay 30–40 rolls, and chapter boss victories award 20 rolls + 10 rerolls on their first clear.</p><button class="btn sm" data-go="career">57 SCHOOL BATTLES →</button></div><div class="v3-stats"><div><small>SCHOOL ROLLS</small><strong>${f(state.tickets)}</strong></div><div><small>FOUR-CARD REROLLS</small><strong>${f(state.v3.rerolls)}</strong></div><div><small>NATIONALS SCOUT PASSES</small><strong>${state.v3.quickTokens||0}</strong></div><div><small>PRO TOKENS</small><strong>${state.v3.proTokens||0}</strong></div><div><small>COMPLETE RUNS</small><strong>${state.v3.runs}</strong></div></div><div class="v3-actionrow"><button class="btn" data-v="spendToken" data-token="nation" ${(state.v3.quickTokens||0)<1?'disabled':''}>USE NATIONALS PASS</button><button class="btn" data-v="spendToken" data-token="professional" ${(state.v3.proTokens||0)<1?'disabled':''}>USE PRO TOKEN</button></div><div class="v6-quest-tip"><strong>♛ REWARDS YOU CAN EARN</strong><span>Coins to buy packs · Gems for staff & cosmetics · Named character cards from Legend Road. The 10% / 1% probabilities apply to pack openings, not quest rewards.</span></div>${legendRoadPanel()}<div class="v3-tabs"><button data-v="questTab" data-tab="legends" class="${tab==='legends'?'active':''}">QUEST LEGENDS</button><button data-v="questTab" data-tab="daily" class="${tab==='daily'?'active':''}">DAILY</button><button data-v="questTab" data-tab="weekly" class="${tab==='weekly'?'active':''}">WEEKLY</button><button data-v="questTab" data-tab="milestone" class="${tab==='milestone'?'active':''}">LEGEND ROAD</button></div><div class="v20-quest-tools"><div><strong>${available.claimable} QUEST${available.claimable===1?'':'S'} READY</strong><small>${available.claimed}/${available.total} claimed in this section · ${currentTab.toUpperCase()}</small></div><button class="btn" data-v="claimAllQuests" ${tab==='legends'||!available.claimable?'disabled':''}>✦ CLAIM ALL AVAILABLE</button></div><div class="v3-quest-panel">${tab==='legends'?'<p class="v12-quest-tip">These five rare cards are earned through achievements, never pulled in a standard school roll. See the challenges above.</p>':tab==='daily'?questRows(DAILY,'daily'):tab==='weekly'?questRows(WEEKLY,'weekly'):questRows(QUESTLINE.map(x=>[x[0],x[1],x[2],x[3],1,x[4]]),'milestone')}</div>`}
function claimQuest(key){const [period,idKey]=key.split('|');const tracker=period==='milestone'?'milestoneClaimed':period==='weekly'?'weeklyClaimed':'claimed';if(state.v3[tracker][idKey])return;
 const list=period==='milestone'?QUESTLINE:period==='weekly'?WEEKLY:DAILY;const quest=list.find(x=>x[0]===idKey);if(!quest)return;const ok=period==='milestone'?quest[3]():Number(state.v3[period==='weekly'?'weekly':'quests'][quest[3]]||0)>=quest[4];if(!ok)return notice('Quest not finished');state.v3[tracker][idKey]=true;claimedRewards(period==='milestone'?quest[4]:quest[5]);save();render();notice('QUEST COMPLETE — rewards collected!');}
// ━━━ V11 SPRING HIGH NATIONALS — predicted placement + persistent tournament run ━━━
function nationalsPower(cards=starting()){
 if(!Array.isArray(cards)||cards.length!==6)return 0;
 const base=avg(cards);const bonuses=chem(cards,coach());
 // Real cards matter most; strong rival/school chemistry and staff help.
 return clamp(base+bonuses.schoolBonus*.32+bonuses.duoBonus*.19+
  bonuses.staffBonus*.17+bonuses.awakeningBonus*.22+bonuses.benchBonus*.08,55,110);
}
function nationalsKey(){return Nationals?Nationals.snapshotKey(starting(),state.coach,state.manager):'';}
function nationalsSuggested(){
 if(!Nationals||starting().length!==6)return null;
 const existing=state.v3.nationals.active;
 if(existing&&!existing.finished)return existing.bracket;
 return Nationals.makeBracket(Nationals.hashString(nationalsKey()+'|'+(state.v3.nationals.runs||0)));
}
function nationalsStage(wins){return wins>=6?'NATIONAL CHAMPION':wins===5?'RUNNER-UP':wins===4?'TOP 4':wins===3?'TOP 8':wins===2?'TOP 16':wins===1?'SECOND ROUND':'FIRST ROUND';}
function nationalsLabel(wins){return wins===6?'CHAMPIONS':wins===5?'FINALISTS':wins===4?'TOP FOUR':wins===3?'QUARTERFINALISTS':wins===2?'TOP SIXTEEN':wins===1?'SECOND ROUND':'FIRST ROUND EXIT';}
function nationalsForecast(){
 if(!Nationals)return null;
 const active=state.v3.nationals.active;
 if(starting().length!==6&&!active)return null;
 const bracket=active&&!active.finished?active.bracket:nationalsSuggested()||active?.bracket;
 const power=active&&!active.finished?active.power:nationalsPower();
 if(!Nationals.validateBracket(bracket))return null;
 return {...Nationals.projection(power,bracket),power,bracket};
}
function v26RoadPage(){
 const progress=state.v3.nationalsRoad,cleared=progress.cleared||0;
 const chapter=Math.max(0,Math.min(19,Number(progress.chapter)||0));
 const slice=(typeof SpikeV26Progress!=='undefined'?SpikeV26Progress.chapter(chapter):{name:'NATIONALS ROAD',stages:[]}),done=Math.max(0,Math.min(5,cleared-chapter*5));
 const story=typeof SpikeV26Story!=='undefined'?SpikeV26Story:null;const episode=story?.stage(slice.stages[0])||null;
 const labels=slice.stages.map(st=>{const passed=st.number<=cleared,open=st.number===cleared+1,locked=st.number>cleared+1;
 return `<div class="v26-road-stage ${passed?'cleared':open?'available':'locked'}"><span>${passed?'✓':open?'▶':'🔒'} STAGE ${st.number}</span><div><b>${escapeHtml(st.school)}</b><small>${escapeHtml(st.feature)} · ${st.power} OVR</small>${story?`<small class="v26-stage-goal">OPTIONAL: ${escapeHtml(story.stage(st).goal)}</small>`:''}</div><div>${st.number%5===0?'<em>CHAPTER BOSS</em>':''}${passed?'<strong>CLEARED</strong>':open?`<button class="btn sm" data-v="v26RoadFight" data-stage="${st.number}" ${starting().length!==6?'disabled':''}>CHALLENGE →</button>`:'<small>LOCKED</small>'}</div></div>`}).join('');
 return `<section class="v26-road"><div class="v26-panel-header"><div><small>V26 · 100 STAGES · 20 CHAPTERS</small><h2>THE NATIONALS ROAD</h2><p>Only five stages unlock per chapter. Win in order; boss wins unlock the next group, with guaranteed character milestones.</p></div><strong>${cleared}/100 CLEARED</strong></div><div class="v26-progress"><i style="width:${cleared}%"></i></div><div class="v26-road-chapters">${Array.from({length:20},(_,i)=>`<button data-v="v26RoadChapter" data-chapter="${i}" class="${i===chapter?'selected':''}" ${i>Math.floor(cleared/5)?'disabled':''}>${i+1}</button>`).join('')}</div><div class="v26-panel-header"><div><small>CHAPTER ${chapter+1} / 20</small><h3>${escapeHtml(slice.name)}</h3></div><b>${done}/5</b></div><div class="v26-progress"><i style="width:${done*20}%"></i></div>${episode?`<aside class="v26-story-scene"><small>CHAPTER STORY · ${escapeHtml(episode.title)}</small><p>${escapeHtml(episode.intro)}</p><blockquote>“${escapeHtml(episode.dialogue)}”</blockquote></aside>`:''}<div class="v26-road-list">${labels}</div><p class="v26-road-tip">Character rewards at stages 5, 10, 20, 30, 50, 75 and 100. Rewards are awarded once and repeat clears cannot duplicate milestone prizes.</p></section>`;
}
function v26AwardRoad(stage){
 const road=state.v3.nationalsRoad,n=Number(stage);
 if(!SpikeV26Progress.canPlay(road.cleared,n))return null;
 road.cleared=n;road.chapter=Math.floor(Math.min(n,99)/5);
 const reward=SpikeV26Progress.reward(n);claimedRewards(reward);
 track('nationalsRoadWins');track('nationalsWins');
 let unlocked=null;
 if(reward.minPower){
  const pool=CATALOG.filter(c=>c.stage>=1&&c.stage<=2&&c.power>=reward.minPower&&!c.packTier&&!c.questOnly&&!c.proOnly);
  const unowned=pool.filter(c=>!state.items.some(x=>x.key===c.key));
  const candidates=unowned.length?unowned:pool;
  const chosen=candidates.sort((a,b)=>Math.abs(a.power-reward.minPower)-Math.abs(b.power-reward.minPower))[0];
  if(chosen)unlocked=addCard(chosen.key);
 }
 save();return {reward,unlocked};
}
function v26FightRoad(stage){
 const road=state.v3.nationalsRoad,n=Number(stage);
 if(!SpikeV26Progress.canPlay(road.cleared,n))return notice('Clear the previous Nationals Road stage first.');
 if(starting().length!==6)return notice('Equip six athletes to challenge Nationals Road.');
 const enemy=SpikeV26Progress.STAGES[n-1],episode=typeof SpikeV26Story!=='undefined'?SpikeV26Story.stage(enemy):null;
 if(episode){popup(`<div class="v26-story-intro"><div class="eyebrow">NATIONALS ROAD · STAGE ${n}${episode.boss?' · CHAPTER BOSS':''}</div><h2 class="h1">${escapeHtml(enemy.school)}</h2><p>${escapeHtml(episode.intro)}</p><blockquote>“${escapeHtml(episode.dialogue)}”</blockquote><p class="v26-stage-goal">BONUS OBJECTIVE: ${escapeHtml(episode.goal)}</p><div class="flexgap"><button class="btn" data-v="v26StoryStart" data-stage="${n}">ENTER THE COURT →</button><button class="btn ghost" data-v="close">BACK</button></div></div>`);return;}
 botMatch(enemy.power,-1,n);
}
function nationalsPage(){
 if(!Nationals)return head('NATIONALS','SPRING HIGH','Tournament engine could not load. Refresh to retry.');
 const n=state.v3.nationals;
 if(starting().length!==6&&!n.active)return head('THE ROAD TO NATIONALS','SPRING HIGH NATIONALS','Your journey begins when your six-player team is ready.')+
 `<section class="v11-empty-nationals"><div class="v11-trophy">🏆</div><h2>COMPLETE YOUR SQUAD FIRST</h2><p>Draft your six starting players: 2 outside hitters, 1 setter, 1 opposite and 2 middle/blocking roles (one may be a libero). Then see how far they could reach in the Spring High Nationals.</p><button class="btn" data-go="roll">START A SCHOOL DRAFT →</button><button class="btn ghost" data-go="squad">MANAGE YOUR TEAM</button></section>`+v26RoadPage();
 const active=n.active;
 const fc=nationalsForecast();
 const power=active?.power||(fc?.power||0);
 const cardSix=active?.players?.length?active.players:starting();
 const bracket=active?.bracket||fc?.bracket||[];
 const shownProjection=Nationals.projection(power,bracket);
 const stages=shownProjection?.stages||[];
 const wins=active?.wins||0;
 const complete=Boolean(active?.finished);
 const ongoing=Boolean(active&&!active.finished);
 const row=stages.map((s,i)=>{
  const match=active?.results?.[i];const current=ongoing&&wins===i;
  return `<div class="v11-bracket-row ${match?.win?'won':''} ${match&&!match.win?'lost':''} ${current?'current':''} ${ongoing&&i>wins?'upcoming':''}">
   <div class="v11-round-tag"><span>${escapeHtml(Nationals.ROUNDS[i].short)}</span><small>${escapeHtml(s.name)}</small></div>
   <div class="v11-round-school"><b>${escapeHtml(bracket[i]?.name||'UNKNOWN')}</b><small>${match?`SETS ${escapeHtml(match.score)} · ${match.win?'WIN':'LOSS'}`:`${s.power} OVR · ${Math.round(s.winChance*100)}% MATCH WIN CHANCE`}</small></div>
   <div class="v11-round-status">${match?match.win?'✓ WON':'✕ OUT':current?'⚔ NEXT':ongoing&&i>wins?'🔒':'◇'}</div>
  </div>`;
 }).join('');
 const highest=n.bestWins||0;
 const history=(n.history||[]).slice(0,5).map(x=>`<div class="v11-history-row"><strong>${escapeHtml(nationalsStage(x.wins))}</strong><small>${escapeHtml(x.date||'')} · ${Math.round(x.power||0)} OVR · ${Number(x.coins)||0} coins earned</small></div>`).join('');
 const rewardPreview=[180,250,360,550,850,1500].map((num,i)=>`<span class="v11-prize-chip ${highest>=i+1?'collected':''}">${escapeHtml(Nationals.ROUNDS[i].short)} +${f(num)} ${highest>=i+1?'✓':''}</span>`).join('');
 const championOdds=shownProjection?.championChance||0;
 const championText=championOdds>0&&championOdds<.001?'<0.1%':(100*championOdds).toFixed(1)+'%';
 const badge=complete?active.wins===6?'👑 NATIONAL CHAMPION':`🏐 ${nationalsStage(active.wins)}`:ongoing?`ROUND ${wins+1} OF 6`:`${fc?.medianFinish||'FIRST ROUND'}`;
 return head('HAIKYUU LEGENDS / SPRING HIGH','HOW FAR WILL YOUR TEAM GO?','An alternate-history six-round, single-elimination tournament inspired by the Spring High Nationals. Your chemistry, players and coach affect each match.')+
 `<section class="v11-nationals-hero"><div class="v11-national-emblem">🏆</div><div class="v11-nationals-intro"><div class="eyebrow">THE ROAD TO THE NATIONAL CHAMPIONSHIP</div><h2>${escapeHtml(badge)}</h2><p>${ongoing?'Your original lineup is locked until this tournament ends.':complete?'The tournament is over. Improve your squad and try again.':'Based on your active six and their chemistry, see the predicted finish — then test your chances.'}</p></div><div class="v11-national-score"><small>TEAM STRENGTH</small><strong>${power.toFixed(1)}</strong><span>Effective OVR</span></div></section>
 <div class="v11-nationals-overview"><div><small>PROJECTED FINISH</small><b>${escapeHtml(shownProjection?.medianFinish||'—')}</b><span>Median predicted outcome</span></div><div><small>CHAMPIONSHIP ODDS</small><b>${escapeHtml(championText)}</b><span>Entire tournament</span></div><div><small>PERSONAL BEST</small><b>${escapeHtml(highest?nationalsStage(highest):'UNRANKED')}</b><span>${n.runs||0} tournament runs</span></div><div><small>ACTIVE RUN</small><b>${active?`${wins} / 6 WINS`:'NOT STARTED'}</b><span>${ongoing?'In progress':complete?'Finished':'Select start below'}</span></div></div>
 <div class="v11-bracket-layout"><section class="v11-panel"><div class="v11-section-head"><div><div class="eyebrow">SIX ELIMINATION ROUNDS</div><h3>YOUR NATIONALS BRACKET</h3></div><span class="v11-badge">${ongoing?'● IN PROGRESS':'✦ SPRING HIGH'}</span></div><div class="v11-bracket-list">${row}</div>
 <div class="v11-action-area">${ongoing?`<button class="btn v11-main-cta" data-v="nationalsNext">⚔ PLAY ${escapeHtml(Nationals.ROUNDS[wins].name)} →</button><button class="btn ghost sm" data-v="nationalsAuto">▶ SIMULATE REST OF TOURNAMENT</button><button class="btn ghost sm" data-v="nationalsRetire">WITHDRAW FROM RUN</button>`:
 `<button class="btn v11-main-cta" data-v="nationalsStart" ${starting().length!==6?'disabled':''}>🏆 ${active?'START ANOTHER TOURNAMENT':'BEGIN THE NATIONALS'} →</button><button class="btn ghost sm" data-go="squad">EDIT SQUAD</button>`}</div>
 <p class="v11-disclaimer">Matches are simulated, not scripted or actual canon results. Semifinals and final use best-of-five sets; earlier rounds use best-of-three.</p></section>
 <aside class="v11-sidebar"><section class="v11-panel"><div class="v11-section-head"><div class="eyebrow">YOUR DREAM TEAM</div><b>${cardSix.length} STARTERS</b></div><div class="v11-lineup">${cardSix.map(p=>`<div class="v11-lineup-item"><div class="v11-lineup-image" data-img-name="${escapeHtml(p.name)}"><img src="${escapeHtml(p.portrait||'')}" alt="${escapeHtml(p.name)}" loading="lazy"></div><span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.position)} · ${escapeHtml(p.school)}</small></span><strong>${Number(p.power)+(Number(p.level)||0)}</strong></div>`).join('')}</div></section>
 <section class="v11-panel"><div class="eyebrow">ONE-TIME NATIONALS PRIZES</div><h3>CHAMPIONSHIP REWARDS</h3><p>First time you clear each stage, earn coins. Win the final to unlock a Nationals Scout Pass. Repeat matches give a small daily-capped bonus.</p><div class="v11-rewards">${rewardPreview}</div></section>
 </aside></div>
 ${active?.results?.length?`<section class="v11-panel v11-results-panel"><div class="v11-section-head"><h3>MATCH RESULTS</h3><small>Score is sets won, not rally points</small></div><div class="v11-results-list">${active.results.map((r,i)=>`<div class="v11-result"><div><b>${escapeHtml(Nationals.ROUNDS[i].name)} · ${escapeHtml(r.school)}</b><span>${escapeHtml(r.sets.join(' · '))}</span></div><strong class="${r.win?'positive':'negative'}">${escapeHtml(r.score)} ${r.win?'WIN':'LOSS'}</strong></div>`).join('')}</div>${complete?`<div class="v11-finish-banner">${active.wins===6?'🏆 YOU ARE THE NATIONAL CHAMPIONS!':`Tournament ended: ${escapeHtml(nationalsStage(active.wins))}`}</div>`:''}</section>`:''}
 ${history?`<section class="v11-panel v11-history-panel"><div class="v11-section-head"><h3>PREVIOUS TOURNAMENTS</h3><small>Most recent five</small></div>${history}</section>`:''}` + v26RoadPage();
}
function nationalsStart(){
 if(!Nationals)return notice('Tournament files are still loading.');
 if(starting().length!==6)return notice('Equip your full six-player squad first.');
 const n=state.v3.nationals;if(n.active&&!n.active.finished)return notice('Finish your current tournament first.');
 if(n.day!==nowDay()){n.day=nowDay();n.dailyEntries=0;}
 const bracket=nationalsSuggested();if(!Nationals.validateBracket(bracket))return notice('Could not generate a bracket.');
 n.active={players:starting().map(p=>({name:p.name,key:p.key,position:p.position,school:p.school,power:p.power,level:p.level||0,portrait:p.portrait||''})),
   bracket, wins:0,results:[],power:nationalsPower(),started:Date.now(),finished:false,
   bonusEligible:n.dailyEntries<3,coinsWon:0};
 n.dailyEntries++;n.runs++;save();show('nationals');notice('National tournament started! Your lineup is locked for this run.');
}
function nationalsNext(silent=false){
 if(!Nationals)return;
 const n=state.v3.nationals,run=n.active;
 if(!run||run.finished)return notice('Start a tournament to play.');
 const round=run.wins,enemy=run.bracket[round];if(!enemy||round>=6)return;
 const result=Nationals.simulateMatch(run.power,enemy.power,round);
 const earned=result.win?(round+1>n.bestWins?Nationals.ROUNDS[round].prize:0)+(run.bonusEligible?70:0):0;
 if(result.win){
  run.wins++;state.coins+=earned;run.coinsWon+=earned;
  n.bestWins=Math.max(n.bestWins,run.wins);
  track('nationalsWins');
  if(run.wins===6&&!n.championPassClaimed){n.championPassClaimed=true;run.earnedPass=true;state.v3.quickTokens=(state.v3.quickTokens||0)+1;}
 }
 run.results.push({...result,school:enemy.name,power:enemy.power,coins:earned});
 if(!result.win||run.wins===6){
  run.finished=true;track('nationalsRuns');
  n.history.unshift({wins:run.wins,power:run.power,date:nowDay(),coins:run.coinsWon,results:run.results.map(({school,score,win})=>({school,score,win}))});
  n.history=n.history.slice(0,10);
 }
 save();if(silent)return result;show('nationals');
 popup(`<div class="eyebrow">${escapeHtml(Nationals.ROUNDS[round].name)} · SPRING HIGH</div><h2 class="h1">${result.win?'🏐 MATCH WON':'✕ ELIMINATED'}</h2><div class="v11-modal-score"><span>YOUR SIX</span><strong>${escapeHtml(result.score)}</strong><span>${escapeHtml(enemy.name)}</span></div><div class="v11-set-list">${result.sets.map((s,i)=>`<span>SET ${i+1}<b>${escapeHtml(s)}</b></span>`).join('')}</div><p>${result.win?`You advance to ${escapeHtml(Nationals.ROUNDS[round].advance)}!`:`You finished ${escapeHtml(nationalsStage(run.wins))}.`}${earned?` Earned ${f(earned)} coins.`:''}${run.earnedPass?' You also earned a guaranteed Nationals Scout Pass for your first championship win.':''}</p><button class="btn" data-v="nationalsClose">${run.finished?'VIEW TOURNAMENT RESULTS':'NEXT ROUND →'}</button>`);
}
function nationalsSimulateAll(){
 const n=state.v3.nationals,run=n.active;
 if(!run||run.finished)return notice('Start a Nationals run first.');
 let played=0;
 while(!run.finished&&played<6){nationalsNext(true);played++;}
 show('nationals');
 popup(`<div class="eyebrow">SPRING HIGH / TOURNAMENT SUMMARY</div><h2 class="h1">${run.wins===6?'👑 NATIONAL CHAMPIONS!':'🏆 '+escapeHtml(nationalsStage(run.wins))}</h2><p>Your squad won ${run.wins} of the six elimination rounds. ${run.wins===6?'You conquered the entire tournament!':'Try a stronger squad or build better chemistry for your next attempt.'}</p><div class="v11-results-list">${run.results.map((m,i)=>`<div class="v11-result"><div><b>${escapeHtml(Nationals.ROUNDS[i].name)} · ${escapeHtml(m.school)}</b><span>${escapeHtml(m.sets.join(' · '))}</span></div><strong class="${m.win?'positive':'negative'}">${escapeHtml(m.score)} ${m.win?'WIN':'LOSS'}</strong></div>`).join('')}</div><p>Total earned: ${f(run.coinsWon)} coins.${run.earnedPass?' + 1 Nationals Scout Pass.':''}</p><button class="btn" data-v="nationalsClose">VIEW RESULTS</button>`);
}
function nationalsRetire(){
 const run=state.v3.nationals.active;if(!run||run.finished)return;
 popup(`<div class="eyebrow">WITHDRAW FROM NATIONALS?</div><h2 class="h1">END CURRENT RUN</h2><p>You will keep rewards already earned but cannot resume this bracket. You can start again with a new team or the same squad.</p><div class="flexgap"><button class="btn" data-v="nationalsConfirmRetire">WITHDRAW</button><button class="btn ghost" data-v="close">KEEP PLAYING</button></div>`);
}
function nationalsConfirmRetire(){
 const n=state.v3.nationals,run=n.active;if(!run||run.finished)return;
 run.finished=true; // Withdrawing isn't a completed tournament quest.
 n.history.unshift({wins:run.wins,power:run.power,date:nowDay(),coins:run.coinsWon,withdrew:true});
 n.history=n.history.slice(0,10);save();close();show('nationals');
}
// ━━━ END NATIONALS ━━━

function matchModePanel(){return `<section class="v19-mode-select"><div><strong>🏐 RALLY PLAY STYLE</strong><small>Switch modes anytime during an AI or School Battle. Full Control lets you call serves, passes, sets, dumps, spikes and blocks.</small></div><div class="v19-mode-buttons"><button type="button" data-v="tacticMode" data-mode="manual" class="${state.v3.matchMode==='manual'?'active':''}" aria-pressed="${state.v3.matchMode==='manual'}">🎮 FULL CONTROL</button><button type="button" data-v="tacticMode" data-mode="auto" class="${state.v3.matchMode==='auto'?'active':''}" aria-pressed="${state.v3.matchMode==='auto'}">⏩ AUTO PLAY</button></div></section>`;}
function raidPage(){
 const levelList=[['normal','Date Tech Iron Wall','87+ OVR'],['hard','Inarizaki Twin Kings','96+ OVR'],['legendary','Shiratorizawa Ace','106+ OVR'],['mythic','Nationals All-Stars','116+ OVR']];
 return head('V26 · MULTIPLAYER','COOPERATIVE RAID ARENA','Two to four friends contribute cards to one six-player squad against a powerful boss. No 2v2 format.')+
 `<section class="v26-panel"><div class="v26-panel-header"><div><small>STEP 1 · CHOOSE YOUR BOSS</small><h2>RAID DIFFICULTY</h2></div><b>${starting().length}/6 CURRENT STARTERS</b></div><div class="v26-raid-levels">${levelList.map(([id,name,power])=>`<button data-v="v26RaidLevel" data-level="${id}" class="${raidLevel===id?'active':''}"><small>${id.toUpperCase()}</small><strong>${name}</strong><span>Opponent ${power}</span></button>`).join('')}</div><p>Each player needs six equipped cards. The server merges different athletes into a shared, position-valid six. Friends can make tactical calls during the raid.</p></section>
 <div class="v3-panels two"><section class="v3-feature"><h2>CREATE CO-OP RAID</h2><p>Generate a six-character code for your friends.</p><button class="btn" data-v="v26RaidCreate" ${starting().length!==6?'disabled':''}>CREATE RAID LOBBY →</button></section><section class="v3-feature"><h2>JOIN YOUR FRIENDS</h2><p>Enter their co-op room code.</p><input class="field" id="v26RaidCode" placeholder="6-CHARACTER CODE" maxlength="6"><button class="btn ghost" data-v="v26RaidJoin" ${starting().length!==6?'disabled':''}>JOIN RAID →</button></section></div>
 <section class="v26-panel"><h3>RAID REWARDS</h3><p>First-win or repeat-win prizes include school rolls, rerolls, gems and coins. Raid bonuses count toward V26 raid quests. Losses only grant consolation coins.</p><p>All teammates see identical, server-authoritative rallies and score updates. Games are simulated using volleyball rules, not arbitrary health bars.</p></section>`;
}
function raidLobbyView(){
 if(!raidRoom)return;
 const players=raidRoom.players||[];
 popup(`<section class="v26-raid-lobby"><div class="eyebrow">● LIVE COOPERATIVE RAID</div><h2 class="h1">ROOM ${escapeHtml(raidRoom.code)}</h2><h3>${escapeHtml(raidRoom.boss)}</h3><p>${players.length}/4 friends · ${escapeHtml(raidRoom.status)} · Need at least 2 players, then all press Ready.</p><div class="v26-raid-party">${players.map((player,i)=>`<div><span>${i+1}. ${escapeHtml(player.name)}</span><b>${player.ready?'✓ READY':'WAITING'}</b></div>`).join('')}</div><div class="flexgap"><button class="btn" data-v="v26RaidReady" ${raidRoom.status!=='waiting'?'disabled':''}>${players[raidRoom.youIndex]?.ready?'CANCEL READY':'READY FOR RAID'}</button><button class="btn ghost" data-v="v26RaidCopy">COPY INVITE</button><button class="btn ghost" data-v="v26RaidLeave">LEAVE RAID</button></div></section>`);
}
function raidShowMatch(){
 if(!raidMatch)return;
 const r=raidMatch,ev=r.events.at(-1);
 popup(`<div class="v26-raid-match"><div class="eyebrow">◈ CO-OP RAID · ${escapeHtml(r.boss)} · ${r.phase||'OPENING'}</div><div class="v5-duel-score"><div><small>YOUR ALLIANCE</small><b>${escapeHtml(raidRoom?.code||'SQUAD')}</b></div><strong>${r.score[0]} <em>:</em> ${r.score[1]}</strong><div><small>RAID BOSS</small><b>${escapeHtml(r.boss)}</b></div></div><div class="v22-court-block"><div class="v22-header"><b>🎥 V26 CINEMATIC COURT</b><div class="v22-cameras"><button data-v="v26RaidCamera" data-camera="cinematic">CINEMATIC</button><button data-v="v26RaidCamera" data-camera="broadcast">BROADCAST</button><button data-v="v26RaidCamera" data-camera="side">SIDE</button></div></div><div class="v22-canvas v25-court-stage" id="v26Raid3D"><div class="v22-overlay-prompt v22-move-label">${escapeHtml(ev?.action||'READY FOR SERVE')}</div><div class="v25-court-hud"><span>ALLIANCE <b>${r.score[0]}</b></span><span>RALLY ${r.rally}</span><span><b>${r.score[1]}</b> BOSS</span></div></div></div><div class="v26-raid-tactics"><b>${r.turn?'CHOOSE YOUR NEXT TACTIC':'WATCHING LIVE RALLY'}</b><p>Each teammate can pick an action. Choices combine on the server. If nobody chooses, the team plays automatically.</p><div>${[['quick','⚡ Quick Set'],['power','💥 Power Spike'],['tip','🤫 Tip'],['block','🧱 Commit Block'],['dump','🃏 Setter Dump'],['float','🌪️ Float Serve']].map(([id,label])=>`<button data-v="v26RaidAction" data-action="${id}" class="${raidPendingChoice===id?'chosen':''}" ${!r.turn?'disabled':''}>${label}</button>`).join('')}</div></div><div class="v26-raid-roster"><b>SHARED SIX-PLAYER SQUAD</b>${(r.owners||[]).map(item=>`<span>${escapeHtml(item.name)}<small>${escapeHtml(item.owner)}</small></span>`).join('')}</div><button class="btn ghost sm" data-v="v26RaidLeave">LEAVE RAID</button></div>`);
 r.v25ReplayMs=V25.replayDuration(ev?.beats?.length||4,state.v3.autoSpeed,true);
 Spike3D.mount($('#v26Raid3D'),r);
}
function v26RaidConnect(kind,code=''){
 if(starting().length!==6){notice('You need a complete squad to join a raid.');return;}
 if(raidWs&&raidWs.readyState<=WebSocket.OPEN)raidWs.close();
 raidRoom=null;raidMatch=null;raidPendingChoice='';raidWs=new WebSocket(location.origin.replace(/^http/,'ws'));
 raidWs.onopen=()=>raidWs.send(JSON.stringify({type:'raid_'+kind,code,name:state.name,level:raidLevel,squad:asRoster()}));
 raidWs.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return;}v26RaidMessage(m)};
 raidWs.onerror=()=>notice('Could not connect to the raid server.');
 raidWs.onclose=()=>{if(raidMatch){raidMatch=null;notice('Raid connection closed.');}raidRoom=null;};
 notice('Connecting to cooperative raid...');
}
function v26RaidMessage(m){
 if(m.type==='error'){notice(m.text||'Raid error');return;}
 if(m.type==='raid_room'){raidRoom=m;if(!raidMatch)raidLobbyView();return;}
 if(m.type==='raid_cancelled'){raidMatch=null;close();notice(m.text||'Raid cancelled.');show('raids');return;}
 if(m.type==='raid_start'){
  raidMatch={type:'raid',boss:m.name,names:['YOUR ALLIANCE',m.name],rosters:[m.team,m.enemy],owners:m.owners,score:[0,0],events:[],rally:0,phase:'OPENING',turn:false};raidShowMatch();return;
 }
 if(m.type==='raid_turn'&&raidMatch){raidMatch.turn=true;raidPendingChoice='';raidShowMatch();return;}
 if(m.type==='raid_action_ack'&&raidMatch){raidPendingChoice=m.action;notice('Tactic locked: '+m.action);return;}
 if(m.type==='raid_rally'&&raidMatch){raidMatch.turn=false;raidMatch.rally=m.rally;raidMatch.score=m.score;raidMatch.events.push(m);raidMatch.phase=m.bossPhase;raidShowMatch();return;}
 if(m.type==='raid_finish'){
  const prize=m.reward||{},won=m.won;
  state.v3.raidClaims=state.v3.raidClaims||{};
  const claimKey=m.code+'-'+m.rallies;
  if(!state.v3.raidClaims[claimKey]){state.v3.raidClaims[claimKey]=true;claimedRewards(prize);track('raidRuns');if(won){track('raidWins');state.v3.raidVictories=(Number(state.v3.raidVictories)||0)+1;}save();}
  raidMatch=null;close();show('raids');popup(`<div class="eyebrow">CO-OP RAID COMPLETE</div><h2 class="h1">${won?'🏆 ALLIANCE VICTORY':'RAID DEFEAT'}</h2><h3>${m.score.join(' : ')}</h3><p>${won?'Your shared squad defeated the boss!':'Build stronger character bonds and try again.'}</p><p>+${f(prize.coins||0)} coins · +${f(prize.tickets||0)} school rolls · +${f(prize.rerolls||0)} rerolls · +${f(prize.gems||0)} gems</p><button class="btn" data-v="v26RaidLeave">BACK TO RAID LOBBY</button></div>`);return;
 }
}
function v26RaidLeave(){raidWs?.send(JSON.stringify({type:'raid_leave'}));raidWs?.close();raidWs=null;raidRoom=null;raidMatch=null;close();show('raids');}
function duelPage(){return head('COMPETITIVE ARENA','DUEL YOUR FRIENDS','Both friends draft six players independently using the normal four-card school scout, then watch a one-by-one reveal.')+matchModePanel()+
 `<section class="v26-panel"><div class="eyebrow">STANDARD SCHOOL DRAFT · 1V1</div><h2>ONE DRAFT. ONE DUEL.</h2><p>Both players start the exact same four-card school draft as normal scouting. Build your own six independently, then reveal the teams one card at a time before the match.</p></section>
 <div class="v4-custom"><h2>FRIENDLY DUEL SETTINGS</h2><p>These apply equally to both players. Your first school and every school after a pick are always FREE.</p><div class="v4-controls"><label>EXTRA SCHOOL ROLLS <input type="number" min="0" max="30" id="extraRolls" value="${friendSettings.extraRolls}"></label><label>FOUR-CARD REROLLS <input type="number" min="0" max="30" id="friendRerolls" value="${friendSettings.rerolls}"></label><label class="v4-check"><input type="checkbox" id="friendCoaches" ${friendSettings.coaches?'checked':''}> Enable coach boosts</label></div></div>
 <div class="v3-panels two"><div class="v3-feature"><h2>CREATE PRIVATE ROOM</h2><p>Set the rules and get a six-character room code. Your friend joins with the same settings.</p><button class="btn" data-v="createRoom">CREATE SCHOOL DRAFT DUEL</button></div><div class="v3-feature"><h2>JOIN FRIEND ROOM</h2><p>Enter their code. The host's duel rules will apply.</p><input id="roomCode" class="field" placeholder="6-CHARACTER CODE" maxlength="6"><button class="btn ghost" data-v="joinRoom">JOIN DUEL →</button></div></div><div class="v3-feature"><h2>TRAIN AGAINST A BOT</h2><p>Build a saved squad and earn coins from AI duels.</p><div class="v3-actionrow"><button class="btn sm" data-v="bot" data-difficulty="easy">EASY</button><button class="btn sm ghost" data-v="bot" data-difficulty="medium">NORMAL</button><button class="btn sm ghost" data-v="bot" data-difficulty="hard">HARD</button></div></div><div class="v3-note">Friendly draft limits only affect the current match; your permanent collection is unchanged.</div>`;}
// Chapter battles retain the first nine original indexes for save compatibility.
const CAREER_STAGES=Gauntlet.STAGES;
const CAREER_SCHOOLS=CAREER_STAGES.map(x=>x.school);
const CAREER_OVR=CAREER_STAGES.map(x=>x.power);
function careerPage(){
 const completed=Math.max(0,Math.min(CAREER_STAGES.length,Number(state.career)||0));
 const activeChapter=Gauntlet.chapterForStage(Math.min(completed,CAREER_STAGES.length-1));
 if(!Number.isInteger(careerChapter)||careerChapter<0||careerChapter>=Gauntlet.CHAPTERS.length)careerChapter=activeChapter.index;
 const part=Gauntlet.CHAPTERS[careerChapter],levels=CAREER_STAGES.slice(part.start,part.start+part.length);
 const stageRows=levels.map(s=>{
  const unlocked=s.index<=completed,cleared=s.index<completed;
  const bonus=Gauntlet.firstClearReward(s);
  return `<article class="v18-stage ${cleared?'cleared':''} ${s.boss?'boss':''} ${!unlocked?'locked':''}">
   <div class="v18-stage-number">${s.boss?'🏆':String(s.index+1).padStart(2,'0')}</div>
   <div class="v18-stage-details"><b>${escapeHtml(s.title)}</b><span>${escapeHtml(s.school)} · Opponent ${s.power} OVR ${s.boss?'· CHAPTER BOSS':''}</span>
   <small>First clear: ${bonus.tickets} school rolls · ${bonus.rerolls} rerolls · ${f(bonus.coins)} coins ${bonus.gems?'· '+bonus.gems+' gems':''} ${bonus.tokens?'· Nationals pass':''}${bonus.proTokens?' · Pro token':''} · School card</small></div>
   <button class="btn sm ${cleared?'ghost':''}" data-v="careerFight" data-idx="${s.index}" ${!unlocked?'disabled':''}>${!unlocked?'LOCKED':cleared?'REPLAY':s.boss?'BOSS FIGHT':'CHALLENGE'}</button>
  </article>`;
 }).join('');
 return head('57-STAGE SCHOOL CAMPAIGN','ROAD TO THE NATIONALS','Seven chapters, 57 escalating school battles, boss rewards, guaranteed school cards and repeatable matches.')+matchModePanel()+
 `<section class="v18-gauntlet">
  <header class="v18-gauntlet-head"><div><span class="eyebrow">SCHOOL BATTLE ROADMAP</span><h2>${completed} / ${CAREER_STAGES.length} CLEARED</h2><small>First-clear rewards can only be earned once per stage. Replays still give match coins and quest progress.</small></div><div class="v18-progress-track"><div style="width:${Math.round(completed/CAREER_STAGES.length*100)}%"></div></div></header>
  <nav class="v18-chapter-nav" aria-label="Choose a battle chapter">${Gauntlet.CHAPTERS.map(ch=>`<button type="button" data-v="careerChapter" data-chapter="${ch.index}" class="${careerChapter===ch.index?'selected':''}" aria-pressed="${careerChapter===ch.index}"><span>CH ${ch.index+1}</span><b>${escapeHtml(ch.name)}</b><small>${completed>ch.finish?'✓ CLEARED':completed>=ch.start?'● IN PROGRESS':'🔒 UPCOMING'}</small></button>`).join('')}</nav>
  <div class="v18-chapter-title"><div><span class="eyebrow">CHAPTER ${careerChapter+1} / 7</span><h2>${escapeHtml(part.name)}</h2></div><strong>${Math.max(0,Math.min(part.length,completed-part.start))} / ${part.length}</strong></div>
  <div class="v18-stage-list">${stageRows}</div>
  <footer class="v18-reward-tip">✦ Clear a chapter boss for <b>20 school rolls + 10 rerolls</b>. The toughest milestone quests grant even more. Your existing progress carries over.</footer>
  ${completed>=CAREER_STAGES.length?'<p class="v18-victory">🏆 ALL 57 STAGES CLEARED — REPLAY ANY STAGE FOR COINS AND DAILY QUESTS!</p>':''}
 </section>`;
}
function schoolOpponentRoster(school,level){const pool=CATALOG.filter(c=>c.school===school&&c.stage===0),seen=new Set();return POS.map((role,i)=>{const options=pool.filter(c=>(role==='MB/L'?['MB','L'].includes(c.position):c.position===role)&&!seen.has(c.idx));const fallback=pool.filter(c=>!seen.has(c.idx));const c=(options.length?options:fallback).sort((a,b)=>b.power-a.power)[0];if(c){seen.add(c.idx);return {...c};}return pool.length?{...pool[i%pool.length]}:null;}).map(c=>{if(!c)return {name:'Rival Player',school,position:'OH',power:level,attack:level,defense:level,set:level};const diff=level-(pool.reduce((n,x)=>n+x.power,0)/Math.max(1,pool.length));return {...c,power:clamp(Math.round(c.power+diff),60,118),attack:clamp(Math.round(c.attack+diff),60,118),defense:clamp(Math.round(c.defense+diff),60,118),set:clamp(Math.round(c.set+diff),60,118)};});}

function asRoster(cards=starting()){return cards.map(c=>({id:c.uid||c.key,cardKey:c.key,name:c.name,position:c.position,school:c.school,power:Math.min(115,c.power+(c.level||0)),attack:Math.min(115,c.attack+(c.level||0)),defense:Math.min(115,c.defense+(c.level||0)),set:Math.min(115,c.set+(c.level||0)),awakening:c.packTier==='apex'?6:c.packTier==='elite'?3:0}));}
function popupRoom(){if(!room||draftRevealActive)return;const players=room.players||[];popup(`<div class="eyebrow">PRIVATE ${room.mode==='fresh'?'DRAFT':'SAVED SQUAD'} DUEL</div><h2 class="h1">ROOM ${room.code}</h2><p>Share this code with a friend. ${room.mode==='fresh'?`Extra school rolls: ${room.settings?.extraRolls??8} · Card rerolls: ${room.settings?.rerolls??5} · Coaches: ${room.settings?.coaches?'on':'off'}. `:''}${room.status==='draft'?'Draft separately with no waiting between picks. Reveal both teams when finished.':'Both players must press Ready before starting.'} Match style: Full Control or Auto Play for each player.</p><div class="v3-guestrows">${players.map((p,i)=>`<div><b>${escapeHtml(p.name)}</b><span>${p.power||0} OVR</span><em>${room.status==='draft'?`${Number(p.picks)||0}/6 PICKS`:p.ready?'READY':'WAITING'}</em></div>`).join('')}${players.length<2?'<div>Waiting for opponent to join...</div>':''}</div>${room.status==='waiting'?`<div class="flexgap"><button class="btn" data-v="ready">${players[room.youIndex]?.ready?'CANCEL READY':'READY UP'}</button><button class="btn ghost" data-v="copyInvite">COPY INVITE</button><button class="btn ghost" data-v="leaveRoom">LEAVE</button></div>`:`<div class="flexgap"><button class="btn ghost" data-v="leaveRoom">LEAVE ROOM</button></div>`}`)}
let friendDraftPicks=[];
function connect(action,code=''){friendDraftPicks=[];if(action==='create'){friendSettings={extraRolls:Draft.numSetting($('#extraRolls')?.value,8),rerolls:Draft.numSetting($('#friendRerolls')?.value,5),coaches:$('#friendCoaches')?.checked!==false};}if(action==='create'&&duelMode==='saved'&&starting().length!==6)return notice('Equip six starters before creating a saved-squad duel');
 draftRevealActive=false;draftRevealFinished=false;if(ws&&ws.readyState<=WebSocket.OPEN)ws.close();ws=new WebSocket(location.origin.replace(/^http/,'ws'));ws.onopen=()=>{ws.send(JSON.stringify({type:action,code,name:state.name,squad:asRoster(),mode:duelMode,settings:friendSettings,coachBuff:(coach()?.value||0)+(manager()?.value||0)*.55,coachSchool:coach()?.school||manager()?.school||'',coachType:coach()?.buff||'',strategy:'balanced',tacticalMode:state.v3.matchMode}));};ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}onMessage(m)};ws.onclose=()=>{if(duel?.type!=='live')notice('Connection closed. You can rejoin another room.')};ws.onerror=()=>notice('Could not connect to multiplayer server.');notice('Connecting to game server...')}
function onMessage(m){if(m.type==='error'||m.type==='notice'){notice(m.text||'Room notice');return;}if(m.type==='room'){room={...m};if(room.status==='waiting'&&!duel&&!draftRevealActive)popupRoom();return;}
 if(m.type==='draft_offer'){room=room||{};room.mode='fresh';room.draftRound=m.round-1;room.status='draft';draftRevealFinished=false;offer={kind:'online',round:m.round,school:m.school,cards:m.cards,rerolls:m.rerolls,schoolRolls:m.schoolRolls,needed:m.needed};popupDraft();return;}
 // Picking a card is immediate. Your friend can still be on another round.
 if(m.type==='draft_picked'){
  if(m.pick&&!friendDraftPicks.some(x=>x.name===m.pick.name))friendDraftPicks.push(m.pick);
  offer=null;notice(`${m.pick.name} drafted · ${m.round}/6 · Next scout is FREE`);return;
 }
 if(m.type==='draft_waiting'){
  offer=null;popup(`<section class="v23-draft-complete"><div class="eyebrow">✓ YOUR SIX ARE READY</div><h2 class="h1">SQUAD LOCKED IN</h2><p>Your friend is still drafting. You can finish your six cards at your own pace—there is no waiting between picks.</p><p>Both complete teams will be revealed <b>one card at a time</b> when they finish.</p><div class="v23-wait-orb" aria-hidden="true">✦</div><button class="btn ghost" data-v="leaveRoom">LEAVE DUEL</button></section>`);return;
 }
 if(m.type==='draft_complete'){
  offer=null;room=room||{};room.mode='fresh';room.status='waiting';
  draftRevealActive=true;draftRevealFinished=false;
  const roster=m.players.map(p=>p.squad),names=m.players.map(p=>p.name);
  DuelV16.intro(roster.map(team=>Links.boostedSquad(team)),names,()=>{
   draftRevealActive=false;draftRevealFinished=true;
   if(room?.status==='waiting'&&!duel)popupRoom();
  },9600);
  return;
 }
 if(m.type==='start'){
  offer=null;draftRevealActive=false;DuelV16.cleanup();close();
  duel={type:'live',names:m.players.map(p=>p.name),rosters:m.players.map(p=>p.squad),score:[0,0],events:[],rally:0,at:Date.now(),intro:false,mode:state.v3.matchMode,playModes:m.playModes||['auto','auto'],waiting:false,pendingPhase:null,serving:0};
  // Fresh drafts were already revealed immediately after both players locked their six.
  if(room?.mode==='fresh'||m.revealMs===0){drawArena();return;}
  duel.intro=true;
  DuelV16.intro(duel.rosters,duel.names,()=>{if(duel?.type==='live'){duel.intro=false;drawArena();}},m.revealMs||7500);
  return;
 }
 if(m.type==='tactical_prompt'&&duel?.type==='live'){duel.pendingPhase=m.canAct?m.phase:null;duel.waiting=!m.canAct;duel.prompt=m;if(!duel.intro)drawArena();return;}
 if(m.type==='tactical_confirm'&&duel?.type==='live'){duel.pendingPhase=null;duel.waiting=true;if(!duel.intro)drawArena();return;}
 if(m.type==='match_mode'&&duel?.type==='live'){duel.playModes=m.playModes||duel.playModes;if(!duel.intro)drawArena();return;}
 if(m.type==='rally'&&duel?.type==='live'){duel.score=m.score;duel.rally=m.rally;duel.serving=m.winner;duel.pendingPhase=null;duel.waiting=false;duel.prompt=null;duel.events.push(m);if(!duel.intro)drawArena();return;}
 if(m.type==='finish'&&duel?.type==='live'){DuelV16.cleanup();const win=m.winner===room?.youIndex;completeMatch(win,win?380:120,false);const sc=m.score;duel=null;popup(`<div class="eyebrow">ONLINE DUEL FINAL</div><h2 class="h1">${win?'🏆 VICTORY':'DEFEAT'}</h2><h2 class="v3-bigscore">${sc.join(' : ')}</h2><p>Earned ${win?380:120} coins. Both friends received the same server-calculated result.</p><div class="flexgap"><button class="btn" data-v="rematch">REMATCH</button><button class="btn ghost" data-v="leaveRoom">LEAVE</button></div>`);render();return;}
 if(m.type==='rematch_wait')notice('Waiting for your friend to request a rematch');}
function popupDraft(){
 if(!offer||offer.kind!=='online')return;
 const me=room?.players?.[room.youIndex]?.picks??friendDraftPicks.length;
 const other=room?.players?.[room.youIndex===0?1:0]?.picks??0;
 const progress=(n,label)=>`<div class="v23-draft-meter"><span>${label} · ${n}/6</span><div><i style="width:${Math.min(100,Math.max(0,n/6*100))}%"></i></div></div>`;
 popup(`<section class="v12-draft-world v26-friend-standard"><div class="v12-header"><span class="eyebrow">FRIENDLY 1V1 · THE SAME SCHOOL DRAFT</span><h1>SCOUT YOUR <em>SIX ATHLETES</em></h1><p>Standard four-card school offers, the same position rules, same rerolls, and live bonds. Both friends draft independently.</p></div><div class="v23-draft-progress">${progress(Math.max(me,offer.round-1),'YOUR SQUAD')}${progress(other,'FRIEND')}</div><div class="v12-section-title"><span>SCOUTING ${escapeHtml(offer.school)} · ROUND ${offer.round}/6</span><small>${offer.needed.map(escapeHtml).join(' · ')} needed</small></div><div class="v12-offer-list">${offer.cards.map((c,i)=>{const linked=Links.preview(friendDraftPicks,c),locked=!offer.needed.includes(c.position);return `<button class="v12-scout-card ${linked.links.length?'v26-synergy-offer '+linked.kind:''} ${locked?'ineligible':''}" style="--i:${i};--card-color:${rarity(c).color}" data-v="onlinePick" data-key="${escapeHtml(c.key)}" ${locked?'disabled':''}><div class="v12-scout-art"><img src="${escapeHtml(v13CardPath(c))}" loading="lazy" alt="${escapeHtml(c.name)} card"></div><div class="v12-scout-description"><span>${escapeHtml(c.school)} · ${escapeHtml(c.position)}</span><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.variant)}</small>${linked.card.bonus?bondOfferPreview(friendDraftPicks,c):''}</div><div class="v12-card-power"><b>${linked.card.effective}</b><small>OVR</small><span>${locked?'LOCKED':'PICK'}</span></div></button>`}).join('')}</div><div class="v23-draft-actions"><button class="btn" data-v="onlineSchoolRoll" ${offer.schoolRolls<=0?'disabled':''}>↻ CHANGE SCHOOL · ${offer.schoolRolls}</button><button class="btn ghost" data-v="onlineReroll" ${offer.rerolls<=0?'disabled':''}>⟳ REROLL FOUR · ${offer.rerolls}</button><button class="btn ghost" data-v="leaveRoom">LEAVE</button></div><div class="v26-friend-current">${friendDraftPicks.length?friendDraftPicks.map(c=>{const b=Links.evaluate(friendDraftPicks).byName[c.name];return `<span>${escapeHtml(c.name)} · <b>${b?.effective||c.power} OVR</b></span>`}).join(''):'Your drafted characters appear here with active chemistry and rivalry upgrades.'}</div></section>`);
}
// One-time guaranteed stage reward. Safe against replay, refresh and old V9 saves.
// This is only called after a successful school battle.
function awardCareerFirstClear(stage){
 if(!stage||!Number.isInteger(stage.index)||!Gauntlet.STAGES[stage.index])return null;
 state.v3.careerCardsClaimed=state.v3.careerCardsClaimed||{};
 if(state.v3.careerCardsClaimed[stage.index])return null;
 state.v3.careerCardsClaimed[stage.index]=true;
 const reward=Gauntlet.firstClearReward(stage);
 claimedRewards(reward);track('careerFirstClears');
 const pool=BASE_CATALOG.filter(x=>x.school===stage.school&&x.stage===0&&!x.proOnly);
 const remaining=pool.filter(c=>!state.items.some(o=>o.key===c.key));
 const dropped=remaining.length?addCard(pick(remaining).key):null;
 const duplicatePrize=dropped?0:750;
 if(duplicatePrize)state.coins+=duplicatePrize;
 if(stage.boss)track('chaptersCleared');
 save();
 return {reward,dropped,duplicatePrize};
}
function completeMatch(win,coin,career=false){if(coach()?.buff==='coins')coin=Math.round(coin*(1+coach().value/100));if(manager())coin=Math.round(coin*(1+(manager().value||0)/100));state.coins+=coin;state.v3.coinsWon+=coin;state.xp=(state.xp||0)+(win?70:20);if(win){state.wins=(state.wins||0)+1;state.trophies=(state.trophies||0)+15;if(state.wins%3===0)state.tickets++;track('wins');if(Number.isInteger(career)&&career>=0&&state.career<=career)state.career=career+1;}else state.losses=(state.losses||0)+1;track('duels');save();}
// V19 tactical match system: full control pauses between decisions and rallies;
// auto play uses exactly the same simulation and team-strength calculations.
function tacticalPhases(game){const serving=game.serving===0;return [serving?'serve':'receive','set','attack','defense'];}
function prepareTacticalRally(game){game.aim={serveZone:4,attackZone:4,setTo:4};game.plan={};game.phaseList=tacticalPhases(game);game.phaseIndex=0;game.showOutcome=false;drawArena();}
function runBotAuto(game){
 clearInterval(botTick);
 if(game!==duel||game.type!=='bot'||game.mode!=='auto'||game.paused)return;
 game.plan={};game.showOutcome=false;
 // A rally finishes playing before the next is computed: adapt the timer to
 // actual serve/pass/set/spike event count, not a fixed 1-second slideshow.
 const schedule=(delay)=>{
  clearInterval(botTick);
  botTick=setInterval(()=>{
   if(game!==duel||game.mode!=='auto'||game.paused){clearInterval(botTick);return;}
   if(typeof Spike3D!=='undefined'&&Spike3D.isPlaying())return;
   resolveBotRally(game,{});
   if(game!==duel||game.mode!=='auto'||game.paused)return;
   const count=game.events?.at(-1)?.beats?.length||4;
   const replay=V25.replayDuration(count,state.v3.autoSpeed,state.v3.cinemaMatch);
   const next=Math.max(V25.autoInterval(state.v3.autoSpeed,state.v3.cinemaMatch),replay+390);
   if(Math.abs(next-delay)>150)schedule(next);
  },delay);
 };
 schedule(V25.autoInterval(state.v3.autoSpeed,state.v3.cinemaMatch));
}
function toggleMatchCinema(){state.v3.cinemaMatch=!state.v3.cinemaMatch;save();if(duel?.type==='bot'&&duel.mode==='auto'&&!duel.paused)runBotAuto(duel);drawArenaSafe();notice(state.v3.cinemaMatch?'Cinematic rally replays enabled.':'Fast rally replays enabled.');}
function setAutoSpeed(speed){const next=Quality.speed(speed);state.v3.autoSpeed=next;save();if(duel?.type==='bot'&&duel.mode==='auto'&&!duel.paused&&!duel.intro)runBotAuto(duel);drawArenaSafe();}
function toggleAutoPause(){if(duel?.type!=='bot'||duel.mode!=='auto')return;duel.paused=!duel.paused;if(duel.paused){clearInterval(botTick);Spike3D.pause();}else{Spike3D.resume();runBotAuto(duel);}drawArenaSafe();}
function drawArenaSafe(){if(duel&&!duel.intro)drawArena();else render();}
function changeTacticalMode(next){if(next!=='manual'&&next!=='auto')return;state.v3.matchMode=next;save();if(duel?.type==='bot'&&!duel.intro){duel.mode=next;clearInterval(botTick);if(next==='auto'){timingState=null;if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(timingRaf);duel.paused=false;runBotAuto(duel);drawArena();}else{duel.paused=false;prepareTacticalRally(duel);}}else if(duel?.type==='live'){duel.mode=next;duel.pendingPhase=null;duel.waiting=false;if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'match_mode',mode:next}));drawArena();}else render();}
function timingAthlete(phase){
 const side=duel?.type==='live'?(room?.youIndex||0):0;
 if(!duel?.rosters?.[side]?.length)return {power:75};
 const team=Links.boostedSquad(duel.rosters[side]);
 return phase==='set'?team.find(p=>p.position==='S')||team[5]:phase==='receive'?team.find(p=>p.position==='L')||team[3]:phase==='attack'?team.filter(p=>!['S','L'].includes(p.position)).sort((a,b)=>b.attack-a.attack)[0]:phase==='defense'?team.find(p=>p.position==='MB')||team[1]:team[5]||team[0];
}
function v26BeginTiming(phase,value){
 const court=$('#v22Match3D');if(!court||typeof performance==='undefined'||typeof requestAnimationFrame!=='function'){v26ApplyTactic(phase,value,0);return;}
 const player=timingAthlete(phase),ability=phase==='set'?'set':phase==='receive'||phase==='defense'?'defense':'attack';
 const rating=Number(player?.[ability])||75,width=Math.max(.085,Math.min(.31,.11+Math.max(0,rating-80)*.0045));
 timingState={phase,value,start:performance.now(),duration:1760,width,player:player?.name||'ATHLETE'};
 const bar=document.createElement('div');bar.id='v26-timing';bar.className='v26-timing';
 bar.innerHTML=`<div class="v26-timing-top"><b>${escapeHtml(phase.toUpperCase())} · TIMING CHALLENGE</b><span>${escapeHtml(player?.name||'PLAYER')} · ${Math.round(rating)} STAT</span></div><div class="v26-timing-track"><i class="v26-timing-perfect" style="left:${(0.5-width/2)*100}%;width:${width*100}%"></i><i class="v26-timing-marker" id="v26TimingMarker"></i></div><div class="v26-timing-bottom"><span>HIT when the marker enters the green zone</span><button type="button" class="btn" data-v="v26Hit">🏐 HIT · SPACE</button></div>`;
 court.append(bar);
 function tick(now){if(!timingState)return;const delta=now-timingState.start,pos=(1-Math.cos(2*Math.PI*delta/timingState.duration))/2;
  const cursor=$('#v26TimingMarker');if(cursor)cursor.style.left=(pos*100)+'%';
  if(delta>=6700){v26ResolveTiming(true);return;}
  timingRaf=requestAnimationFrame(tick);
 }
 timingRaf=requestAnimationFrame(tick);
}
function v26ResolveTiming(timedOut=false){
 const current=timingState;if(!current)return;
 timingState=null;if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(timingRaf);$('#v26-timing')?.remove();
 const delta=performance.now()-current.start,pos=(1-Math.cos(2*Math.PI*delta/current.duration))/2,dist=Math.abs(pos-.5);
 const perfect=dist<=current.width*.23,good=dist<=current.width*.55;
 const quality=timedOut?-1:perfect?1:good?.50:dist<.28?-.22:-.8;
 notice((timedOut?'⏱ TIMEOUT':perfect?'✦ PERFECT TIMING':good?'✓ GOOD TIMING':'⚠ EARLY / LATE')+' · '+current.player);
 v26ApplyTactic(current.phase,current.value,quality);
}
function v26ApplyTactic(phase,value,quality){
 const game=duel;if(!game||game.mode!=='manual')return;
 if(game.type==='live'){
  if(ws?.readyState===WebSocket.OPEN&&game.waiting&&game.timingPhase===phase){
   game.timingPhase=null;
   const target=game.aim||{};
   ws.send(JSON.stringify({type:'tactical_choice',phase,choice:value,timingQuality:quality,
    ...(phase==='serve'?{zone:target.serveZone||4}:phase==='attack'?{zone:target.attackZone||4}:phase==='set'?{setTo:target.setTo||4}:{})}));
   drawArena();
  }
  return;
 }
 if(game.type!=='bot')return;
 game.plan[phase]=value;
 game.plan.timingSum=(game.plan.timingSum||0)+quality;
 game.plan.timingCount=(game.plan.timingCount||0)+1;
 game.plan.timingQuality=game.plan.timingSum/game.plan.timingCount;
 if(phase==='serve')game.plan.serveZone=game.aim?.serveZone??4;
 if(phase==='attack')game.plan.attackZone=game.aim?.attackZone??4;
 game.phaseIndex++;
 if(phase==='set')game.plan.setTo=game.aim?.setTo??4;
 if(phase==='set'&&value==='dump'&&game.phaseList[game.phaseIndex]==='attack')game.phaseIndex++;
 if(game.phaseIndex>=game.phaseList.length)resolveBotRally(game,game.plan);
 else drawArena();
}
function tacticChoose(phase,value){const game=duel;if(!game||game.mode!=='manual'||game.intro)return;
 if(game.type==='live'){if(game.pendingPhase===phase&&SpikeTactics.OPTIONS[phase]?.some(o=>o.id===value)&&ws?.readyState===WebSocket.OPEN){game.pendingPhase=null;game.waiting=true;game.timingPhase=phase;v26BeginTiming(phase,value);}return;}
 if(game.type!=='bot'||game.showOutcome)return;
 if(game.phaseList[game.phaseIndex]!==phase||!SpikeTactics.OPTIONS[phase]?.some(o=>o.id===value))return;
 v26BeginTiming(phase,value);
}
function botMatch(level=75,careerIdx=-1,roadStage=0){
 if(starting().length!==6)return notice('Equip a full squad of six first.');
 if(careerIdx>=0&&(!Number.isInteger(careerIdx)||careerIdx>state.career||careerIdx>=CAREER_STAGES.length))return notice('Beat the previous stage to unlock this battle.');
 const opponents=['Training Bots','Rival Academy','Regional Champions','Nationals Elite','Top Pros'];
 const name=roadStage?SpikeV26Progress.STAGES[roadStage-1]?.school||'National Rival':careerIdx>=0?CAREER_SCHOOLS[careerIdx]||'Career Rival':opponents[clamp(Math.floor((level-60)/10),0,4)];
 const our=starting(),enemy=careerIdx>=0||roadStage?schoolOpponentRoster(name,level):Array.from({length:6},(_,i)=>({name:`${name} #${i+1}`,school:'RIVALS',position:POS[i],power:level,attack:level,defense:level,set:level}));
 clearInterval(botTick);DuelV16.cleanup();
 duel={type:'bot',names:[state.name,name],rosters:[our,enemy],score:[0,0],events:[],rally:0,intro:true,mode:state.v3.matchMode,careerIdx,roadStage,serving:0,paused:false,aim:{serveZone:4,attackZone:4,setTo:4}};
 const current=duel;
 DuelV16.intro(current.rosters,current.names,()=>{if(duel!==current)return;current.intro=false;if(current.mode==='auto'){drawArena();runBotAuto(current);}else prepareTacticalRally(current);},7500);
}
function resolveBotRally(current,userChoices){
 if(duel!==current||current.intro)return;
 const upgraded=current.rosters.map(team=>Links.boostedSquad(team));
 const road=typeof SpikeV26Story!=='undefined'&&current.roadStage?SpikeV26Story.stage(SpikeV26Progress.STAGES[current.roadStage-1]):null;
 const event=SpikeTactics.simulate(upgraded,current.score,current.rally,[chem(current.rosters[0],coach()).staffBonus||0,0],{home:userChoices,away:road?.tactics,serveSide:current.serving});
 current.rally++;current.score[event.winner]++;event.score=[...current.score];current.serving=event.winner;
 current.events.push(event);if(current.events.length>60)current.events.shift();
 current.showOutcome=true;
 const score=current.score,careerIdx=current.careerIdx;
 if((Math.max(...score)>=15&&Math.abs(score[0]-score[1])>=2)||current.rally>=45){
  clearInterval(botTick);const won=score[0]>score[1],stage=careerIdx>=0?CAREER_STAGES[careerIdx]:null;
  const prize=won?(stage?400+Math.round(careerIdx*85):320):95;
  completeMatch(won,prize,careerIdx);
  let dropped=null,firstReward=null,duplicatePrize=0;const roadPrize=won&&current.roadStage?v26AwardRoad(current.roadStage):null;
  if(roadPrize&&typeof SpikeV26Story!=='undefined'&&SpikeV26Story.objectiveDone(current.events,current.roadStage)){
   state.v3.nationalsRoad.claimed=state.v3.nationalsRoad.claimed||{};
   if(!state.v3.nationalsRoad.claimed[current.roadStage]){
    state.v3.nationalsRoad.claimed[current.roadStage]=true;state.tickets+=5;roadPrize.objectiveReward=5;save();
   }
  }
  if(won&&stage){track('careerWins');if(stage.boss)track('bossWins');const first=awardCareerFirstClear(stage);if(first){firstReward=first.reward;dropped=first.dropped;duplicatePrize=first.duplicatePrize;}save();}
  const rewardLabel=firstReward?`<b>FIRST CLEAR REWARDS:</b> +${firstReward.tickets} rolls, +${firstReward.rerolls} rerolls, +${f(firstReward.coins)} coins${firstReward.gems?', +'+firstReward.gems+' gems':''}${firstReward.tokens?', +Nationals pass':''}${firstReward.proTokens?', +Pro token':''}${dropped?', plus '+escapeHtml(dropped.name)+' ('+dropped.power+' OVR) school card':''}${duplicatePrize?', plus '+duplicatePrize+' duplicate compensation':''}.`:'Replay for coins, or move to the next challenge.';
  if(stage&&won)careerChapter=Gauntlet.chapterForStage(Math.min(state.career,CAREER_STAGES.length-1)).index;
  duel=null;popup(`<div class="eyebrow">${current.roadStage?'NATIONALS ROAD · STAGE '+current.roadStage+' / 100':stage?'SCHOOL GAUNTLET · STAGE '+(careerIdx+1)+' / '+CAREER_STAGES.length:'BOT MATCH'} · ${current.rally} RALLIES</div><h2 class="h1">${won?'🏆 VICTORY':'DEFEAT'}</h2><h2 class="v3-bigscore">${score.join(' : ')}</h2><p>Earned ${f(prize)} match coins. ${won?rewardLabel:'Try again with better chemistry or a stronger squad.'}${roadPrize?` +${f(roadPrize.reward.coins)} Road coins, +${roadPrize.reward.tickets} rolls${roadPrize.objectiveReward?', plus +5 BONUS OBJECTIVE rolls':''}${roadPrize.unlocked?' · GUARANTEED '+escapeHtml(roadPrize.unlocked.name)+' CARD':''}.`:''}</p><div class="flexgap"><button class="btn" data-v="close">CONTINUE</button><button class="btn ghost" data-go="career">SCHOOL MAP →</button><button class="btn ghost" data-go="nationals">NATIONALS ROAD →</button><button class="btn ghost" data-go="quests">CLAIM QUESTS →</button></div>`);render();
 }else drawArena();
}
function drawArena(){if(!duel||duel.intro)return;const ev=duel.events.at(-1),a=duel.rosters[0],b=duel.rosters[1];const aces=duel.events.filter(e=>String(e.action||'').includes('ACE')).length;const dumps=duel.events.filter(e=>String(e.action||'').includes('DUMP')).length;const blocks=duel.events.filter(e=>String(e.action||'').includes('BLOCK')).length;
 const teamMarkup=(cards,away=false)=>`<div class="v5-duel-team ${away?'away':''}">${cards.map((p,i)=>{const item=CATALOG.find(x=>x.name===p.name),pic=item?.portrait||'portraits/staff-placeholder.svg';return `<div class="v5-duel-athlete" style="--team:${SPIKE_COLORS[p.school]||'#517f9e'}"><div data-img-name="${escapeHtml(p.name)}" class="v5-duel-face"><img loading="lazy" src="${pic}" alt="${escapeHtml(p.name)}" /></div><b>${escapeHtml(p.name.split(' ').at(-1))}</b><small>${p.position||'OH'} · ${p.power||'-'}</small></div>`;}).join('')}</div>`;
 let controls='';
 if(duel.type==='bot'){
  const manual=duel.mode==='manual';
  const currentPhase=duel.phaseList?.[duel.phaseIndex];
  const choices=manual&&!duel.showOutcome&&currentPhase?SpikeTactics.OPTIONS[currentPhase]:null;
  const suggested=choices?Quality.recommend(currentPhase,duel.rosters[0],duel.rosters[1]):null;
  const instruction={serve:'Before the whistle, choose your serving style.',receive:'Your opponent serves. Choose how your squad receives.',set:'Call your setter’s play. A setter dump attacks on the second touch.',attack:'Choose the finish for your hitter.',defense:'Set your block and floor coverage for the opponent’s attack.'};
  controls=`<section class="v19-panel"><div class="v19-panel-top"><div><strong>🎮 MATCH COMMANDS</strong><small>${manual?'Full Control · decisions affect rally odds':'Auto Play · watch the simulation'}</small></div><div class="v19-mode-buttons"><button type="button" class="${manual?'active':''}" data-v="tacticMode" data-mode="manual" aria-pressed="${manual}">FULL CONTROL</button><button type="button" class="${!manual?'active':''}" data-v="tacticMode" data-mode="auto" aria-pressed="${!manual}">AUTO PLAY</button></div></div>${choices?`<div class="v19-phase-head"><b>STEP ${duel.phaseIndex+1}/${duel.phaseList.length} · ${currentPhase.toUpperCase()}</b><small>${instruction[currentPhase]}</small></div><div class="v19-choice-grid">${choices.map((opt,i)=>`<button type="button" data-v="tacticChoice" data-phase="${currentPhase}" data-choice="${opt.id}" class="${opt.id===suggested?'v20-recommended':''}" aria-label="${i+1}: ${escapeHtml(opt.name)}. ${escapeHtml(Quality.CHOICE_ADVICE[currentPhase]?.[opt.id]||opt.hint)}"><span>${opt.icon}</span><strong>${opt.name}</strong><small>${escapeHtml(Quality.CHOICE_ADVICE[currentPhase]?.[opt.id]||opt.hint)}</small>${opt.id===suggested?'<em>★ SUGGESTED</em>':''}<kbd>${i+1}</kbd></button>`).join('')}</div><small class="v20-tactic-footer">After selecting a tactic, press SPACE or HIT at the right time for a skill bonus. Manual timing affects the real rally probabilities.</small>`:manual?`<div class="v19-after-rally"><span>${ev?.action==='SETTER DUMP'?'🃏 SETTER DUMP SCORES!':ev?'Rally complete. Make your next call.':'Prepare your first rally.'}</span><button type="button" class="btn sm" data-v="tacticNext">NEXT RALLY →</button></div>`:`<div class="v19-auto"><span class="v19-pulse"></span>${duel.paused?'Simulation paused — ready when you are.':`Auto-simulating each rally · ${state.v3.autoSpeed}× speed`}</div><div class="v20-autoplay-tools"><span>AUTO SPEED</span>${[1,2,4].map(s=>`<button type="button" class="${state.v3.autoSpeed===s?'active':''}" data-v="autoSpeed" data-speed="${s}" aria-pressed="${state.v3.autoSpeed===s}">${s}×</button>`).join('')}<button type="button" class="v20-pause" data-v="togglePause">${duel.paused?'▶ RESUME':'Ⅱ PAUSE'}</button></div>`}</section>`;
 }else{
  const manual=duel.mode==='manual',phase=duel.pendingPhase,options=manual&&phase?SpikeTactics.OPTIONS[phase]:null;
  const note=duel.timingPhase?'Time your action with SPACE or HIT…':duel.waiting?'Waiting for your opponent or the next server phase…':manual?'Choose your next action when it is your turn. After 12 seconds, the server plays automatically.':'Server simulates your decisions automatically; switch to Full Control whenever you want.';
  controls=`<section class="v19-panel v19-online-note"><div class="v19-panel-top"><div><strong>⚔ LIVE FRIEND TACTICS</strong><small>Both friends use the same server-authoritative rally engine.</small></div><div class="v19-mode-buttons"><button type="button" data-v="tacticMode" data-mode="manual" class="${manual?'active':''}" aria-pressed="${manual}">FULL CONTROL</button><button type="button" data-v="tacticMode" data-mode="auto" class="${!manual?'active':''}" aria-pressed="${!manual}">AUTO PLAY</button></div></div>${options?`<div class="v19-phase-head"><b>STEP ${duel.prompt?.step||1}/5 · ${phase.toUpperCase()}</b><small>Choose a tactic, then press SPACE or HIT in the green zone before the 12-second timeout.</small></div><div class="v19-choice-grid">${options.map(o=>`<button type="button" data-v="tacticChoice" data-phase="${phase}" data-choice="${o.id}"><span>${o.icon}</span><strong>${o.name}</strong><small>${o.hint}</small></button>`).join('')}</div>`:`<div class="v19-auto">${escapeHtml(note)}</div>`}</section>`;
 }
 popup(`<div class="v5-duel-arena"><div class="eyebrow">${duel.type==='live'?'● LIVE FRIEND DUEL':'● SCHOOL / AI MATCH'} · RALLY ${duel.rally}</div><div class="v5-duel-score"><div><small>HOME</small><b>${escapeHtml(duel.names[0])}</b></div><strong>${duel.score[0]} <em>:</em> ${duel.score[1]}</strong><div><small>AWAY</small><b>${escapeHtml(duel.names[1])}</b></div></div>${controls}<section class="v22-court-block"><div class="v22-header"><span>◈ ANIMATED 3D COURT <small>12 athletic 3D players · moving cameras</small></span><button class="v25-cinema-toggle" data-v="v25Cinema" aria-pressed="${state.v3.cinemaMatch}">${state.v3.cinemaMatch?'✦ CINEMATIC REPLAY ON':'⚡ FAST REPLAY ON'}</button><div class="v22-cameras"><button type="button" data-v="v22Camera" data-camera="cinematic">🎥 CINEMATIC</button><button type="button" data-v="v22Camera" data-camera="broadcast">BROADCAST</button><button type="button" data-v="v22Camera" data-camera="side">SIDE</button><button type="button" data-v="v22Camera" data-camera="top">TOP</button><button type="button" data-v="v22Replay">↻ REPLAY</button></div></div><div class="v22-canvas v25-court-stage" id="v22Match3D" aria-label="3D animated volleyball court"><div class="v22-overlay-prompt v22-move-label">${ev?escapeHtml(ev.action):'READY FOR YOUR SERVE'}</div><div class="v25-court-hud"><span>🏐 ${escapeHtml(duel.names[0])} <b>${duel.score[0]}</b></span><span>⚡ RALLY ${duel.rally}</span><span><b>${duel.score[1]}</b> ${escapeHtml(duel.names[1])}</span></div></div><div class="v22-status">◉ ${duel.serving===0?'YOUR SERVE':'OPPONENT SERVE'} <span>· ${duel.rally} RALLIES</span> <span>12 ANIMATED ATHLETES</span></div>${duel.type==='bot'&&duel.mode==='manual'?`<div class="v22-aim"><div><strong>🎯 TARGET YOUR ${duel.phaseList?.[duel.phaseIndex]==='serve'?'SERVE':'SPIKE'}</strong><small>Choose your landing zone, or click the opponents' court in 3D. Your selection changes scoring odds.</small></div><div class="v22-zone">${[4,3,2,5,6,1].map(i=>`<button type="button" data-v="aimZone" data-zone="${i}" aria-pressed="${(duel.aim?.[duel.phaseList?.[duel.phaseIndex]==='serve'?'serveZone':'attackZone']||4)===i}">ZONE ${i}</button>`).join('')}</div></div><div class="v22-hitter"><span>SELECT HITTER FOR NEXT SET</span><div>${duel.rosters[0].map((p,i)=>`<button type="button" data-v="v22Hitter" data-hitter="${i}" ${['S','L'].includes(p.position)?'disabled':''} aria-pressed="${(duel.aim?.setTo??4)===i}">${escapeHtml(p.name.split(' ').at(-1))}</button>`).join('')}</div></div>`:'<div class="v22-modehint">Animated replay uses the real simulated rally result. Friend-duel outcomes still come from the multiplayer server.</div>'}</section><div class="v20-score-rules"><span>FIRST TO 15 · WIN BY 2</span><span>${(duel.type==='live'?duel.serving===room?.youIndex:duel.serving===0)?'◉ YOUR SERVE':'◉ OPPONENT SERVES'}</span><span>RALLY ${duel.rally}${duel.rally>=32?' · FINAL STRETCH':''}</span></div><div class="v20-rally-stats"><span>⚡ ${aces} <small>ACES</small></span><span>🃏 ${dumps} <small>DUMPS</small></span><span>🧱 ${blocks} <small>BLOCKS</small></span></div><div class="v5-duel-action">${ev?`⚡ ${escapeHtml(ev.setter||'SETTER')} → ${escapeHtml(ev.actor)} · ${escapeHtml(ev.action)}`:'🏐 FIRST SERVE INCOMING'}</div>${ev?.special?`<div class="v26-special-flash"><b>${escapeHtml(ev.special.type==='rivalry'?'⚔ RIVALRY BREAKTHROUGH':'⚡ CHEMISTRY PLAY')}</b><strong>${escapeHtml(ev.special.label)}</strong><small>${escapeHtml(ev.special.setting)} → ${escapeHtml(ev.special.hitter)}</small></div>`:''}${ev?.phases?.length?`<div class="v16-phases">${ev.phases.map(v=>`<span>${escapeHtml(v)}</span>`).join('')}</div>`:''}<div class="v3-logs" aria-label="Recent rally results">${duel.events.slice(-3).reverse().map(e=>`<div>${escapeHtml(e.actor)} — ${escapeHtml(e.action)} · point for ${escapeHtml(duel.names[e.winner])}</div>`).join('')}</div>${duel.type==='bot'?'<button class="btn ghost sm" data-v="stopBot">STOP MATCH</button>':'<small class="v3-note">Both players see the same server-generated rally results.</small>'}</div>`);
 if(typeof Spike3D!=='undefined'){
  duel.v25ReplayMs=V25.replayDuration(ev?.beats?.length||4,state.v3.autoSpeed,state.v3.cinemaMatch);
  Spike3D.mount(document.getElementById('v22Match3D'),duel);
 }
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
function gameGuide(){
 popup(`<div class="eyebrow">NEW TO HAIKYUU LEGENDS?</div><h2 class="h1">FOUR STEPS TO THE TOP</h2><div class="v20-guide"><div><b>01 · DRAFT</b><p>Roll a school to reveal four unique characters. Pick one. The next roll is free. Reroll four choices or spend extra rolls to change schools.</p></div><div><b>02 · BUILD CHEMISTRY</b><p>Place six different athletes into correct positions. Pair school teammates and rivals for boosts. Equip a coach and manager.</p></div><div><b>03 · CHALLENGE SCHOOLS</b><p>57 stages across seven chapters. Bosses award bundles of rolls and rerolls. Toggle between Full Control and Auto Play at any time.</p></div><div><b>04 · COLLECT & ADVANCE</b><p>Claim quests, enter Spring Nationals, save squads, and spend coins on Timeskip and Pro packs. Quest Legends are earned through hard challenges.</p></div></div><div class="flexgap"><button class="btn" data-go="roll">START DRAFT →</button><button class="btn ghost" data-go="career">SCHOOL BATTLES</button><button class="btn ghost" data-v="saveTools">BACKUP SAVE</button></div>`);
}
function saveTools(){
 const updated=state.savedAt?new Date(state.savedAt).toLocaleString():'Not yet';
 popup(`<div class="eyebrow">PLAYER DATA / SETTINGS</div><h2 class="h1">YOUR PROGRESS IS YOURS</h2><p>Last local save: <b>${escapeHtml(updated)}</b>. Download a backup before changing devices or replacing the game. Cloud saves need Supabase configured separately.</p><div class="v20-save-actions"><button class="btn" data-v="exportSave">⬇ EXPORT SAVE (.JSON)</button><button class="btn ghost" data-v="importPrompt">⬆ IMPORT BACKUP</button></div><div class="v20-save-privacy">An imported save replaces your local collection, squads, quests and coins. You will be asked to confirm first. Export your current save before restoring another.</div><div class="v20-settings"><b>GAMEPLAY PREFERENCES</b><button data-v="toggleFastReveal" aria-pressed="${state.v3.fastReveals}">${state.v3.fastReveals?'✓ Instant card reveals ON':'✦ Cinematic card reveals ON'}</button><span>Default match mode: <b>${state.v3.matchMode==='manual'?'Full Control':'Auto Play'}</b></span></div>`);
}
function exportSave(){
 const payload={...state,exportedAt:new Date().toISOString(),format:'haikyuu-legends-v20'};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='haikyuu-legends-save-'+nowDay()+'.json';anchor.hidden=true;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);notice('Backup exported. Keep the JSON file somewhere safe.');
}
function importPrompt(){const input=document.querySelector('#v20-import-file');if(input){input.value='';input.click();}else notice('Import control unavailable; try refreshing.');}
function restoreBackup(){if(!pendingRestore)return;state=Object.assign(DEFAULT(),pendingRestore);state.v3=Object.assign(DEFAULT().v3,state.v3||{});state.v3.matchMode=state.v3.matchMode==='manual'?'manual':'auto';state.v3.autoSpeed=Quality.speed(state.v3.autoSpeed);state.v3.nationals=Object.assign({runs:0,bestWins:0,history:[],active:null,day:nowDay(),dailyEntries:0},state.v3.nationals||{});migrateUniqueInventory(state);state.v3.packPity=state.v3.packPity||{};state.v3.nationalsRoad=state.v3.nationalsRoad||{cleared:0,claimed:{},chapter:0};pendingRestore=null;save();close();show('home');notice('Backup restored. Please check your collection and team.');}
function claimAllQuests(){
 const period=tab==='weekly'?'weekly':tab==='milestone'?'milestone':'daily';
 const tracker=period==='milestone'?'milestoneClaimed':period==='weekly'?'weeklyClaimed':'claimed';
 const source=period==='weekly'?'weekly':'quests';const list=period==='milestone'?QUESTLINE:period==='weekly'?WEEKLY:DAILY;
 let count=0,tickets=0,rerolls=0,coins=0,gems=0;
 for(const quest of list){const key=quest[0];if(state.v3[tracker][key])continue;
  const meets=period==='milestone'?quest[3]():Number(state.v3[source][quest[3]]||0)>=quest[4];if(!meets)continue;
  const reward=period==='milestone'?quest[4]:quest[5];state.v3[tracker][key]=true;claimedRewards(reward);
  count++;tickets+=(reward.tickets||0);rerolls+=(reward.rerolls||0);coins+=(reward.coins||0);gems+=(reward.gems||0);
 }
 if(!count)return notice('No completed unclaimed quests in this tab.');
 save();render();notice(`Claimed ${count} quests: +${tickets} rolls, +${rerolls} rerolls, +${f(coins)} coins, +${gems} gems!`);
}
function openStaffOffer(){const offer=state.v3.staffOffer;if(!Array.isArray(offer)||!offer.length)return;
 const cards=offer.map(o=>{const base=SPIKE_COACHES.find(c=>c.id===o.key);return base?{...ratedCoach(base,Math.max(0,Math.min(5,o.tier||0))),type:staffType(base),uid:`${o.key}|${o.tier}`} : null;}).filter(Boolean);
 if(!cards.length){delete state.v3.staffOffer;save();return;}
 const group=cards[0].type;
 popup(`<div class="eyebrow">PENDING ${group.toUpperCase()} RECRUITMENT</div><h2 class="h1">CHOOSE ONE ${group.toUpperCase()}</h2><p>Your previously purchased choices are still waiting. No extra gems required.</p><div class="v3-coach-grid">${cards.map(x=>coachCard(x,'chooseCoach')).join('')}</div>`);
}
function actionEvent(e){const t=e.target.closest('[data-go],[data-v],[data-view]');if(!t){if(e.target.id==='overlay'&&!duel)close();return;}if(t.dataset.go||t.dataset.view){close();show(t.dataset.go||t.dataset.view);return;}const v=t.dataset.v;switch(v){case'v26RaidLevel':raidLevel=['normal','hard','legendary','mythic'].includes(t.dataset.level)?t.dataset.level:'normal';render();break;case'v26RaidCreate':v26RaidConnect('create');break;case'v26RaidJoin':v26RaidConnect('join',($('#v26RaidCode')?.value||'').trim().toUpperCase());break;case'v26RaidReady':raidWs?.send(JSON.stringify({type:'raid_ready',ready:!raidRoom?.players?.[raidRoom?.youIndex]?.ready}));break;case'v26RaidAction':if(raidMatch?.turn){raidPendingChoice=t.dataset.action;raidWs?.send(JSON.stringify({type:'raid_action',action:raidPendingChoice}));raidShowMatch();}break;case'v26RaidCamera':Spike3D.setCamera(t.dataset.camera);raidShowMatch();break;case'v26RaidLeave':v26RaidLeave();break;case'v26RaidCopy':{if(!raidRoom)break;const url=new URL(location.href);url.searchParams.set('raid',raidRoom.code);if(navigator.clipboard)navigator.clipboard.writeText(url.href).then(()=>notice('Raid invitation copied'));else prompt('Copy raid code',raidRoom.code);break;}case'v26Hit':v26ResolveTiming();break;case'v26RoadChapter':state.v3.nationalsRoad.chapter=Math.max(0,Math.min(Math.floor(state.v3.nationalsRoad.cleared/5),Number(t.dataset.chapter)||0));save();render();break;case'v26RoadFight':v26FightRoad(t.dataset.stage);break;case'v26StoryStart':{const stage=Number(t.dataset.stage);if(!SpikeV26Progress.canPlay(state.v3.nationalsRoad.cleared,stage))break;const enemy=SpikeV26Progress.STAGES[stage-1];close();botMatch(enemy.power,-1,stage);break;}case'gameGuide':gameGuide();break;case'saveTools':saveTools();break;case'exportSave':exportSave();break;case'importPrompt':importPrompt();break;case'confirmRestore':restoreBackup();break;case'claimAllQuests':claimAllQuests();break;case'openStaffOffer':openStaffOffer();break;case'toggleFastReveal':state.v3.fastReveals=!state.v3.fastReveals;endLegendReveal();lastDraftSignature='';save();if(view==='roll')render();else saveTools();notice(state.v3.fastReveals?'Instant card reveals enabled':'Cinematic reveals enabled');break;case'autoSpeed':setAutoSpeed(t.dataset.speed);break;case'v25Cinema':toggleMatchCinema();break;case'togglePause':toggleAutoPause();break;case'close':if(duel?.type==='bot'){clearInterval(botTick);DuelV16.cleanup();duel=null;}close();break;case'schoolInfo':{const school=t.dataset.school||'';const unlocked=unlockedSchools().includes(school);const roster=BASE_CATALOG.filter(c=>c.school===school&&c.stage===0&&!c.proOnly).sort((a,b)=>b.power-a.power);popup(`<div class="v15-school-dialog"><div class="eyebrow">SCHOOL SCOUTING DIRECTORY</div><h2>${escapeHtml(school)}</h2><p>${unlocked?'School available. School drafting chooses a random school, then displays four distinct candidates.':'Locked regional school. Win school career stages to unlock it.'}</p>${school==='ITACHIYAMA'?'<p class="v21-scout-note">Only Sakusa, Komori and Iizuna are named in the series. The other scout options are clearly labelled anonymous team reserves for gameplay. Sakusa is rare, not guaranteed.</p>':''}<div class="v15-dialog-cards">${roster.slice(0,8).map(v15MiniCard).join('')}</div><div class="flexgap"><button class="btn" data-go="${unlocked?'roll':'career'}">${unlocked?'START SCHOOL DRAFT':'PLAY CAREER'}</button><button class="btn ghost" data-v="close">CLOSE</button></div></div>`);break;}case'startRun':startRun();break;case'confirmNewRun':close();newRun();break;case'chooseOffer':protectedOfferAction('pick',t.dataset.key);break;case'rerollOffer':protectedOfferAction('reroll');break;case'changeSchool':protectedOfferAction('school');break;case'confirmRareAction':{const action=t.dataset.action,key=t.dataset.key;close();performRareAction(action,key);break;}case'v25SavePrefs':{const warn=Number($('#v25WarnOvr')?.value),reveal=Number($('#v25RevealOvr')?.value);state.v3.warnOvr=V25.threshold(Number.isFinite(warn)?warn:91);state.v3.cinematicOvr=V25.threshold(Number.isFinite(reveal)?reveal:95,95);save();render();notice('Draft warning and cinematic settings saved.');break;}case'skin':buyCosmetic(t.dataset.skin);break;case'staffRoll':staffRoll();break;case'staffTab':coachTab=t.dataset.tab==='managers'?'managers':'coaches';render();break;case'chooseCoach':chooseCoach(t.dataset.coach);break;case'equipCoach':{const c=ownedCoaches().find(x=>x.uid===t.dataset.coach);if(!c)return;if(c.type==='manager')state.manager=c.uid;else state.coach=c.uid;save();render();notice((c.type==='manager'?'Manager':'Coach')+' equipped.');break;}case'shopBuy':buyPack(t.dataset.pack);break;case'shopPick':shopPick(t.dataset.key);break;case'revealPending':showPendingPack();break;case'viewCard':infoCard(t.dataset.uid);break;case'openSquad':close();show('squad');break;case'selectSlot':selectionSlot=+t.dataset.idx;render();break;case'equipPlayer':collectSelect(t.dataset.uid,selectionSlot>=6?'bench':'squad');break;case'clearSlot':if(selectionSlot>=6)state.bench[selectionSlot-6]=null;else state.squad[selectionSlot]=null;save();render();break;case'autoSquad':{const sorted=owned().sort((a,b)=>b.power-a.power),used=new Set(),usedNames=new Set();state.squad=POS.map((p,i)=>{const x=sorted.find(c=>slotCompatible(i,c)&&!used.has(c.uid)&&!usedNames.has(c.name));if(x){used.add(x.uid);usedNames.add(x.name);}return x?.uid||null});save();render();notice('Best eligible six selected.');break;}case'savePreset':{const idx=+t.dataset.idx;state.savedTeams[idx]={squad:[...state.squad],bench:[...state.bench],coach:state.coach,manager:state.manager,savedAt:Date.now()};save();render();notice('Saved squad '+(idx+1));break;}case'loadPreset':{const o=state.savedTeams[+t.dataset.idx];if(!o)return;const keep=new Set(state.items.map(c=>c.uid));state.squad=o.squad.map(x=>keep.has(x)?x:null);state.bench=(o.bench||[]).map(x=>keep.has(x)?x:null);state.coach=o.coach;state.manager=o.manager||null;save();render();notice('Squad loaded');break;}case'collectionCategory':collectionCategory=t.dataset.category||'all';render();break;case'skipLegendReveal':endLegendReveal();break;case'questTab':tab=t.dataset.tab;render();break;case'claimQuest':claimQuest(t.dataset.quest);break;case'spendToken':{if(t.dataset.token!=='professional'){redeemNationalsPass();break;}if((state.v3.proTokens||0)<1)return;if(buyPack('professional',true)){state.v3.proTokens--;save();}break;}case'nationalsStart':nationalsStart();break;case'nationalsNext':nationalsNext();break;case'nationalsAuto':nationalsSimulateAll();break;case'nationalsRetire':nationalsRetire();break;case'nationalsConfirmRetire':nationalsConfirmRetire();break;case'nationalsClose':close();show('nationals');break;case'tacticMode':changeTacticalMode(t.dataset.mode);break;case'tacticChoice':tacticChoose(t.dataset.phase,t.dataset.choice);break;case'aimZone':{if(duel?.type==='bot'&&duel.mode==='manual'){const zone=Number(t.dataset.zone);if(Number.isInteger(zone)&&zone>=1&&zone<=6){const phase=duel.phaseList?.[duel.phaseIndex]==='serve'?'serveZone':'attackZone';duel.aim??={serveZone:4,attackZone:4,setTo:4};duel.aim[phase]=zone;drawArena();}}break;}case'v22Camera':Spike3D.setCamera(t.dataset.camera);drawArena();break;case'v22Hitter':{const i=Number(t.dataset.hitter);if(duel?.type==='bot'&&duel.mode==='manual'&&Number.isInteger(i)&&i>=0&&i<6&&!['S','L'].includes(duel.rosters[0][i].position)){duel.aim.setTo=i;drawArena();}break;}case'v22Replay':{if(duel?.events?.length){const stage=document.getElementById('v22Match3D');Spike3D.unmount();Spike3D.mount(stage,{...duel,rally:duel.rally+0.001});}break;}case'tacticNext':if(duel?.type==='bot'&&duel.mode==='manual'&&duel.showOutcome)prepareTacticalRally(duel);break;case'duelMode':duelMode=t.dataset.mode;render();break;case'createRoom':connect('create');break;case'joinRoom':connect('join',($('#roomCode')?.value||'').trim().toUpperCase());break;case'ready':if(ws?.readyState===WebSocket.OPEN){const me=room?.players?.[room.youIndex];ws.send(JSON.stringify({type:'ready',ready:!me?.ready}));}break;case'onlinePick':onlineRareAction('pick',t.dataset.key);break;case'onlineReroll':onlineRareAction('reroll');break;case'onlineSchoolRoll':onlineRareAction('school');break;case'v25OnlineCancel':if(offer?.kind==='online')popupDraft();else close();break;case'v25OnlineConfirm':{const type={pick:'draft_pick',reroll:'draft_reroll',school:'draft_school_roll'}[t.dataset.action];if(type&&offer?.kind==='online'&&ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify({type,...(t.dataset.action==='pick'?{key:t.dataset.key}:{})}));popupDraft();}else close();break;}case'leaveRoom':ws?.send(JSON.stringify({type:'leave'}));ws?.close();DuelV16.cleanup();draftRevealActive=false;draftRevealFinished=false;room=null;offer=null;duel=null;close();render();break;case'copyInvite':{const url=new URL(location.href);url.searchParams.set('join',room.code);if(navigator.clipboard)navigator.clipboard.writeText(url.href).then(()=>notice('Invite link copied'),()=>prompt('Copy invitation link',url.href));else prompt('Copy invitation link',url.href);break;}case'rematch':ws?.send(JSON.stringify({type:'rematch'}));notice('Rematch requested.');break;case'bot':botMatch(({easy:67,medium:80,hard:93})[t.dataset.difficulty]);break;case'careerChapter':careerChapter=clamp(Number(t.dataset.chapter)||0,0,Gauntlet.CHAPTERS.length-1);render();break;case'careerFight':botMatch(CAREER_OVR[+t.dataset.idx],+t.dataset.idx);break;case'stopBot':clearInterval(botTick);DuelV16.cleanup();duel=null;close();break;}}
document.addEventListener('v22-aim',e=>{if(duel?.type==='bot'&&duel.mode==='manual'){const zone=Number(e.detail?.zone);if(Number.isInteger(zone)&&zone>=1&&zone<=6){duel.aim??={serveZone:4,attackZone:4,setTo:4};const key=duel.phaseList?.[duel.phaseIndex]==='serve'?'serveZone':'attackZone';duel.aim[key]=zone;drawArena();}}});document.addEventListener('click',actionEvent);document.addEventListener('change',e=>{if(e.target.id==='schoolChoice'){chosenSchool=e.target.value;if(!SCHOOLS.includes(chosenSchool))chosenSchool='ALL SCHOOLS';if(state.v3.run&&state.v3.offer){if(chosenSchool!=='ALL SCHOOLS'&&state.coins<80){notice('Need 80 coins to target a school');chosenSchool='ALL SCHOOLS';render();return;}newRunOffer();}}});document.addEventListener('input',e=>{if(e.target.id==='inventorySearch'){filters=e.target.value;const pos=e.target.selectionStart;render();const input=$('#inventorySearch');if(input){input.focus();input.setSelectionRange(pos,pos)}}});$('#profileBtn').addEventListener('click',()=>popup(`<div class="eyebrow">PLAYER PROFILE</div><h2 class="h1">${escapeHtml(state.name)}</h2><label for="renameInput">DISPLAY NAME</label><input id="renameInput" class="field" maxlength="18" value="${escapeHtml(state.name)}"/><button class="btn" data-v="rename">SAVE NAME</button><p>Level ${state.level} • ${state.wins} wins • ${state.v3.runs} squad runs. Progress saves in your browser; connect Supabase for cloud saving.</p><button class="btn ghost" data-v="saveTools">⚙ SAVE BACKUP / SETTINGS</button>`));document.addEventListener('click',e=>{if(e.target.closest('[data-v="rename"]')){state.name=($('#renameInput')?.value||'ROOKIE').replace(/[^\w -]/g,'').trim().slice(0,18)||'ROOKIE';save();close();render();}},true);
// New accounts begin with a free draft, not a pre-completed squad. Existing browser saves remain unchanged.
if(typeof document.createElement==='function'&&typeof document.body?.append==='function'){
const backupInput=document.createElement('input');backupInput.type='file';backupInput.id='v20-import-file';backupInput.accept='.json,application/json';backupInput.hidden=true;document.body.append(backupInput);
backupInput.addEventListener('change',async()=>{
 const file=backupInput.files?.[0];if(!file)return;
 if(file.size>2_000_000){notice('Backup too large — maximum 2 MB.');return;}
 try{const data=Quality.safeBackup(JSON.parse(await file.text()));pendingRestore=data;
  popup(`<div class="eyebrow">CONFIRM RESTORE</div><h2 class="h1">REPLACE YOUR CURRENT SAVE?</h2><p>Restore <b>${escapeHtml(data.name)}</b> · ${data.items.length} cards · ${f(data.coins)} coins · Stage ${data.career}/57.</p><p class="v20-danger">This will overwrite current local progress. Export your current save first if you want to keep it.</p><div class="flexgap"><button class="btn" data-v="confirmRestore">YES, RESTORE BACKUP</button><button class="btn ghost" data-v="close">CANCEL</button></div>`);
 }catch(err){pendingRestore=null;notice('Could not import this save: '+String(err.message||err).slice(0,110));}
});
document.addEventListener('keydown',e=>{
 if(e.code==='Space'&&timingState){e.preventDefault();v26ResolveTiming();return;}
 if(e.key==='Escape'){if(document.querySelector('#v12-legend-overlay')){endLegendReveal();return;}if($('#modal .overlay')&&!duel){close();return;}}
 if(!duel||duel.mode!=='manual'||e.ctrlKey||e.altKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||''))return;
 const n=Number(e.key);if(n>=1&&n<=4){const choices=$$('#modal [data-v="tacticChoice"]');if(choices[n-1]){e.preventDefault();choices[n-1].click();}}
});
}
const invited=new URLSearchParams(location.search).get('join');const raidInvite=new URLSearchParams(location.search).get('raid');render();if(raidInvite&&/^[A-Z0-9]{6}$/i.test(raidInvite)){show('raids');setTimeout(()=>v26RaidConnect('join',raidInvite.toUpperCase()),550);}else if(typeof $('#nav [data-view="home"]')?.setAttribute==='function')$('#nav [data-view="home"]').setAttribute('aria-current','page');if(invited&&/^[A-Z0-9]{6}$/i.test(invited)){show('duels');setTimeout(()=>connect('join',invited.toUpperCase()),500);}
