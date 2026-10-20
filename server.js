'use strict';
const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {WebSocketServer,WebSocket}=require('ws');
const {STYLES,sanitizeSquad,teamwork,chooseRally,isFinished}=require('./server/match-engine');
const {SPIKE_SCHOOL_TEAMS,SPIKE_ROSTER,SPIKE_COACHES,SPIKE_NATIONALS_SCHOOLS}=require('./public/roster-data.js');
const Draft=require('./public/draft-rules.js');
const Balance=require('./public/balance.js');
const Tactics=require('./public/tactical-engine.js');
const https=require('https');
const {portraitInfoFor,getStatus}=require('./server/anime-portraits');
const PORT=process.env.PORT||3000;
const root=path.join(__dirname,'public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8','.ico':'image/x-icon'};
const portraitCache=new Map();
function sendPortrait(res,info){
 res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'public,max-age=1800'});
 res.end(JSON.stringify(info));
}
const rosterNames=[...new Set([...SPIKE_ROSTER,...SPIKE_COACHES].map(x=>x.name))];
function portraitStatus(req,res){
 const resolved=[...portraitCache.entries()];
 res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
 res.end(JSON.stringify({rosterSize:SPIKE_ROSTER.length,uniquePlayers:new Set(SPIKE_ROSTER.map(x=>x.name)).size,staff:SPIKE_COACHES.length,uniquePortraitNames:rosterNames.length,checked:resolved.length,withOnlineImage:resolved.filter(([,v])=>v.info.url).length,missing:resolved.filter(([,v])=>!v.info.url).map(([name])=>name),sources:getStatus(),note:'A real anime image cannot be guaranteed for every minor or manga-only character. SVG backup art remains available.'}));
}

function fandomFallback(name){
 // Backup source only. Some fan-wiki servers block automatic lookup.
 const url='https://haikyuu.fandom.com/api.php?action=query&format=json&redirects=1&prop=pageimages&pithumbsize=420&titles='+encodeURIComponent(name);
 return new Promise(resolve=>{
  let done=false;
  const finish=value=>{if(done)return;done=true;resolve(value)};
  const request=https.get(url,{headers:{'User-Agent':'SpikeLegendsFanProject/3.1','Accept':'application/json'}},response=>{
   if(response.statusCode!==200){response.resume();finish('');return;}
   let body='';response.setEncoding('utf8');response.on('data',chunk=>{
    body+=chunk;if(body.length>150000){request.destroy();finish('');}
   });
   response.on('end',()=>{
    try{
     const data=JSON.parse(body),pages=Object.values(data.query?.pages||{}),img=pages[0]?.thumbnail?.source||'',u=new URL(img);
     finish(u.protocol==='https:'&&(u.hostname.endsWith('wikia.nocookie.net')||u.hostname.endsWith('fandom.com'))?u.href:'');
    }catch{finish('')}
   });
   response.on('error',()=>finish(''));
  });
  request.setTimeout(2500,()=>request.destroy());request.on('error',()=>finish(''));
 });
}
async function apiPortrait(req,res){
 const name=new URL(req.url,'http://localhost').searchParams.get('name')||'';
 if(!/^[\p{L}\p{M} .'-]{2,60}$/u.test(name)){res.writeHead(400);res.end('{}');return;}
 const entry=portraitCache.get(name);
 if(entry&&entry.until>Date.now()){sendPortrait(res,entry.info);return;}
 let info={url:'',source:'none',alternates:[]};
 try{info=await portraitInfoFor(name);}catch{}
 if(!info.url){try{const url=await fandomFallback(name);if(url)info={url,source:'Haikyuu Wiki thumbnail (may be manga)',alternates:[]};}catch{}}
 portraitCache.set(name,{info,until:Date.now()+(info.url?43200000:900000)});
 sendPortrait(res,info);
}
const server=http.createServer((req,res)=>{
 const route=(req.url||'/').split('?')[0];
 if(route==='/api/portrait'){apiPortrait(req,res);return;}
 if(route==='/api/portrait-status'){portraitStatus(req,res);return;}
 if(route==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true,service:'spike-legends',version:'v21-school-scout'}));return;}
 if(route==='/api/public-config'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({supabaseUrl:process.env.SUPABASE_URL||'',supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY||''}));return;}
 let pathname;
 try{pathname=decodeURIComponent(route)}catch{res.writeHead(400);res.end('Bad request');return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);});
});
const wss=new WebSocketServer({server,maxPayload:12000});
const rooms=new Map();
const INTRO_MS=7500;
const TICK=Math.max(80,Math.min(10000,Number(process.env.RALLY_INTERVAL_MS)||1750));
const safeName=x=>String(x||'PLAYER').replace(/[^\w \-]/g,'').trim().slice(0,18)||'PLAYER';
function send(ws,obj){if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj));}
function broadcast(room,obj){for(const p of room.players)send(p.ws,obj);}
function code(){let out;do{out=crypto.randomBytes(3).toString('hex').toUpperCase()}while(rooms.has(out));return out;}
function clearTimer(room){if(room.timer)clearTimeout(room.timer);if(room.phaseTimer)clearTimeout(room.phaseTimer);room.timer=null;room.phaseTimer=null;room.pendingTactics=null;}
const rand=(max)=>crypto.randomInt(max);
function draftCard(i,v){const p=SPIKE_ROSTER[i];return Balance.buildCard(p,i,v===1&&!SPIKE_NATIONALS_SCHOOLS.includes(p.school)?0:v);}
function newOffer(room,p){
 const result=Draft.makeOffer({roster:SPIKE_ROSTER,allowedSchools:SPIKE_SCHOOL_TEAMS,existing:p.squad,avoidSchool:p.offer?.school||p.lastSchool||null,rand:()=>rand(1000000000)/1000000000,cardFromIndex:draftCard,versionSampler:()=>0,weightForIndex:i=>Balance.weightFor(SPIKE_ROSTER[i],i)});
 p.offer=result;
 send(p.ws,{type:'draft_offer',round:p.squad.length+1,total:6,school:result.school,cards:result.cards,
   rerolls:p.rerolls,schoolRolls:p.schoolRolls,needed:Draft.needs(p.squad),settings:room.settings});
}
function rerollSameSchool(room,p){
 const result=Draft.makeOffer({roster:SPIKE_ROSTER,allowedSchools:SPIKE_SCHOOL_TEAMS,existing:p.squad,targetSchool:p.offer.school,
  rand:()=>rand(1000000000)/1000000000,cardFromIndex:draftCard,versionSampler:()=>0,weightForIndex:i=>Balance.weightFor(SPIKE_ROSTER[i],i)});
 p.offer=result;
 send(p.ws,{type:'draft_offer',round:p.squad.length+1,total:6,school:result.school,cards:result.cards,
   rerolls:p.rerolls,schoolRolls:p.schoolRolls,needed:Draft.needs(p.squad),settings:room.settings});
}
// V23: Both friends draft at their own pace. There is NO per-pick round lock.
// Offers are private to their owner until both teams finish and the reveal begins.
function startDraft(room){
 room.status='draft';room.draftRound=0;
 room.players.forEach(p=>{
  p.squad=[];p.ready=false;p.rerolls=room.settings.rerolls;
  p.schoolRolls=room.settings.extraRolls;p.offer=null;p.picked=false;
  newOffer(room,p);
 });
 snapshot(room);
}
function snapshot(room){
 room.players.forEach((p,i)=>send(p.ws,{type:'room',code:room.code,youIndex:i,
 status:room.status,mode:room.mode||'saved',settings:room.settings,draftRound:room.draftRound||0,
 players:room.players.map(x=>({name:x.name,ready:x.ready,picks:x.squad.length,
  draftFinished:room.mode==='fresh'&&x.squad.length===6,
  // Keep the draft secret before the six-card showdown.
  power:room.status==='draft'?null:(x.squad.length?Math.round(x.squad.reduce((s,y)=>s+y.power,0)/x.squad.length):0),
  strategy:x.strategy,school:room.status==='draft'?'HIDDEN':teamwork(x.squad).topSchool})),
 strategies:room.players.map(x=>x.strategy),playModes:room.players.map(x=>x.playMode),format:'First to 15 · win by 2'}));
}
function reset(room){clearTimer(room);room.status='waiting';room.score=[0,0];room.serving=0;room.rally=0;room.stats=[{aces:0,blocks:0,digs:0,spikes:0},{aces:0,blocks:0,digs:0,spikes:0}];room.boxScore=[{},{}];room.rematchVotes.clear();room.players.forEach(p=>p.ready=false);snapshot(room);}
function finish(room){clearTimer(room);room.status='finished';const winner=room.score[0]>room.score[1]?0:1;
 const mvp=room.boxScore.map(b=>Object.entries(b).sort((a,b)=>b[1]-a[1])[0]||['Unknown',0]);
 broadcast(room,{type:'finish',winner,score:room.score.slice(),rallies:room.rally,stats:room.stats,mvp,at:Date.now()});}
const DECISION_MS=12000;
const TACTIC_PHASES=['serve','receive','set','attack','defense'];
function nextRally(room,tacticalPlans=null){
 if(room.status!=='playing')return;
 const ev=chooseRally(room,Math.random,tacticalPlans||{});
 room.serving=ev.winner; // Winning team retains or wins service for the next rally.
 broadcast(room,ev);
 if(isFinished(room)){finish(room);return;}
 // One scheduled call per rally, never overlapping client commands.
 room.timer=setTimeout(()=>startRally(room),TICK);
}
function expectedTacticPlayers(room,phase){
 const serving=room.serving===0||room.serving===1?room.serving:(room.score[0]+room.score[1])%2;
 if(phase==='serve')return [serving];
 if(phase==='receive')return [1-serving];
 if(phase==='attack')return [0,1].filter(i=>room.pendingTactics.plans[i].set!=='dump');
 return [0,1];
}
function pendingComplete(room){
 const p=room.pendingTactics;if(!p)return false;
 const needed=expectedTacticPlayers(room,p.phase).filter(i=>room.players[i].playMode==='manual');
 return needed.every(i=>p.selected.has(i));
}
function advancePhase(room){
 if(room.phaseTimer)clearTimeout(room.phaseTimer);room.phaseTimer=null;
 const pending=room.pendingTactics;
 if(!pending||room.status!=='playing')return;
 pending.phaseIndex++;
 if(pending.phaseIndex>=TACTIC_PHASES.length){
  const plans={home:pending.plans[0],away:pending.plans[1]};room.pendingTactics=null;
  nextRally(room,plans);return;
 }
 issuePhase(room);
}
function issuePhase(room){
 const pending=room.pendingTactics;if(!pending||room.status!=='playing')return;
 pending.phase=TACTIC_PHASES[pending.phaseIndex];pending.selected=new Set();
 const expected=expectedTacticPlayers(room,pending.phase);
 const manual=expected.filter(i=>room.players[i].playMode==='manual');
 if(!manual.length){advancePhase(room);return;}
 room.players.forEach((p,i)=>send(p.ws,{type:'tactical_prompt',phase:pending.phase,
  canAct:manual.includes(i),rally:room.rally+1,score:room.score.slice(),
  step:pending.phaseIndex+1,total:TACTIC_PHASES.length,timeoutMs:DECISION_MS,
  text:manual.includes(i)?'Choose your tactical action.':'Waiting for the opponent to choose...'}));
 room.phaseTimer=setTimeout(()=>{if(room.pendingTactics===pending){
  for(const i of manual)if(!pending.selected.has(i)){
   // A missed deadline falls back to the safest legal auto recommendation.
   pending.plans[i][pending.phase]=Tactics.autoPlan(room.players[i].squad,room.players[1-i].squad)[pending.phase];
   pending.selected.add(i);
  }
  advancePhase(room);
 }},DECISION_MS);
}
function startRally(room){
 if(room.status!=='playing')return;
 room.timer=null;
 if(!room.players.some(p=>p.playMode==='manual')){nextRally(room);return;}
 room.pendingTactics={phaseIndex:0,phase:null,selected:new Set(),plans:room.players.map((p,i)=>Tactics.autoPlan(p.squad,room.players[1-i].squad))};
 issuePhase(room);
}
function begin(room){room.status='playing';room.rally=0;room.score=[0,0];room.serving=0;room.stats=[{aces:0,blocks:0,digs:0,spikes:0},{aces:0,blocks:0,digs:0,spikes:0}];room.boxScore=[{},{}];
 broadcast(room,{type:'start',players:room.players.map(p=>({name:p.name,squad:p.squad,strategy:p.strategy,synergy:teamwork(p.squad)})),score:room.score.slice(),at:Date.now(),revealMs:room.mode==='fresh'?0:INTRO_MS,playModes:room.players.map(p=>p.playMode)});
 room.timer=setTimeout(()=>startRally(room),room.mode==='fresh'?450:INTRO_MS+350);
}

function leave(ws){const room=rooms.get(ws.roomCode);ws.roomCode=null;if(!room)return;
 const wasPlaying=room.status==='playing',p=room.players.find(p=>p.ws===ws);clearTimer(room);
 room.players=room.players.filter(p=>p.ws!==ws);
 if(room.players.length===0){rooms.delete(room.code);return;}
 reset(room);broadcast(room,{type:'notice',text:wasPlaying?'Opponent disconnected. The match was cancelled; no result recorded.':'Opponent left the room.'});
}
wss.on('connection',ws=>{
 ws.isAlive=true;
 ws.on('pong',()=>{ws.isAlive=true;});
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw.toString())}catch{return;}
  try{
   if(m.type==='create'||m.type==='join'){
    // Validate before leaving an existing room, so an invalid request cannot destroy a match.
    const mode=m.type==='create'&&m.mode==='fresh'?'fresh':'saved';
    const squad=mode==='fresh'||m.type==='join'&&rooms.get(String(m.code||'').toUpperCase())?.mode==='fresh'?[]:sanitizeSquad(m.squad);
    if(mode!=='fresh'&&m.type==='create'&&squad.length!==6){send(ws,{type:'error',text:'Equip six athletes before entering a saved-squad duel.'});return;}
    const roomCode=m.type==='create'?code():String(m.code||'').trim().toUpperCase();
    let target=rooms.get(roomCode);
    if(m.type==='join'&&ws.roomCode===roomCode){send(ws,{type:'error',text:'You are already in this room.'});return;}
    if(m.type==='join'&&(!target||target.players.length>=2||target.status!=='waiting')){send(ws,{type:'error',text:'Room is full, started, or no longer exists.'});return;}
    leave(ws);
    if(!target){target={code:roomCode,mode,settings:{extraRolls:Draft.numSetting(m.settings?.extraRolls,8),rerolls:Draft.numSetting(m.settings?.rerolls,5),coaches:m.settings?.coaches!==false},status:'waiting',players:[],score:[0,0],rally:0,timer:null,rematchVotes:new Set(),stats:[{},{}],boxScore:[{},{}],createdAt:Date.now()};rooms.set(roomCode,target);}
    if(target.mode==='saved'&&squad.length!==6){send(ws,{type:'error',text:'Equip six players before joining this saved-squad duel.'});return;}
    target.players.push({ws,name:safeName(m.name),ready:false,squad,coachBuff:target.settings.coaches?Math.max(0,Math.min(18,Number(m.coachBuff)||0)):0,coachSchool:String(m.coachSchool||'').slice(0,32),coachType:String(m.coachType||'').slice(0,16),strategy:STYLES[m.strategy]?m.strategy:'balanced',playMode:m.tacticalMode==='manual'?'manual':'auto'});ws.roomCode=roomCode;
    if(target.mode==='fresh'&&target.players.length===2)startDraft(target);else snapshot(target);return;
   }
   const room=rooms.get(ws.roomCode);if(!room)return;
   const player=room.players.find(p=>p.ws===ws);if(!player)return;
   if(m.type==='draft_reroll'&&room.status==='draft'){
    if(player.squad.length>=6)return;
    if(player.rerolls<=0){send(ws,{type:'error',text:'No draft rerolls left.'});return;}
    player.rerolls--;rerollSameSchool(room,player);return;
   }
   if(m.type==='draft_school_roll'&&room.status==='draft'){
    if(player.squad.length>=6||!player.offer)return;
    if(player.schoolRolls<=0){send(ws,{type:'error',text:'No extra school rolls left.'});return;}
    player.schoolRolls--;newOffer(room,player);return;
   }
   if(m.type==='draft_pick'&&room.status==='draft'){
    if(player.squad.length>=6||!player.offer)return;
    const choice=player.offer.cards.find(c=>c.key===m.key);
    if(!choice){send(ws,{type:'error',text:'That card is not in your offer.'});return;}
    if(!Draft.eligible(player.squad,choice)){
     send(ws,{type:'error',text:'That position is already filled. Choose a needed position or reroll.'});return;
    }
    player.lastSchool=player.offer.school;
    player.squad.push({...choice,id:choice.key,slot:choice.position});
    player.offer=null; // Prevent replaying a previous choice with a second message.
    send(ws,{type:'draft_picked',pick:choice,round:player.squad.length,total:6});
    if(player.squad.length<6){
     // The NEXT SCHOOL IS FREE and available immediately, even if your friend is behind.
     newOffer(room,player);
    }else{
     const ordered=Draft.lineup(player.squad);
     if(!ordered){send(ws,{type:'error',text:'Invalid final squad; contact support.'});return;}
     player.squad=ordered.map((c,i)=>({...c,slot:['OH','MB','OP',ordered[3].position,'OH','S'][i]}));
     if(!room.players.every(x=>x.squad.length===6)){
      send(ws,{type:'draft_waiting',picks:6,total:6,text:'Your squad is ready. Your friend can finish drafting at their own pace.'});
     }
    }
    room.draftRound=Math.max(...room.players.map(x=>x.squad.length));
    if(room.players.every(x=>x.squad.length===6)){
     room.status='waiting';room.draftRound=6;
     broadcast(room,{type:'draft_complete',players:room.players.map(x=>({name:x.name,squad:x.squad}))});
    }
    snapshot(room);
    return;
   }
   if(m.type==='ready'&&room.status==='waiting'){
    player.ready=!!m.ready;snapshot(room);if(room.players.length===2&&room.players.every(p=>p.ready))begin(room);
   }
   if(m.type==='match_mode'&&(room.status==='playing'||room.status==='waiting')&&['manual','auto'].includes(m.mode)){
    player.playMode=m.mode;
    broadcast(room,{type:'match_mode',playModes:room.players.map(p=>p.playMode),by:room.players.indexOf(player)});
    // If a player switches to auto halfway through their turn, do not block the room.
    if(room.pendingTactics){
     if(pendingComplete(room))advancePhase(room);
     else if(m.mode==='manual'){
      const phase=room.pendingTactics.phase,expected=expectedTacticPlayers(room,phase),index=room.players.indexOf(player);
      if(expected.includes(index)&&!room.pendingTactics.selected.has(index))
       send(player.ws,{type:'tactical_prompt',phase,canAct:true,rally:room.rally+1,score:room.score.slice(),step:room.pendingTactics.phaseIndex+1,total:5,timeoutMs:DECISION_MS,text:'Choose your tactical action.'});
     }
    }
    return;
   }
   if(m.type==='tactical_choice'&&room.status==='playing'&&room.pendingTactics){
    const pending=room.pendingTactics,phase=pending.phase,index=room.players.indexOf(player);
    if(player.playMode!=='manual'||m.phase!==phase||!expectedTacticPlayers(room,phase).includes(index)||pending.selected.has(index))return;
    if(!Tactics.OPTIONS[phase].some(opt=>opt.id===m.choice))return;
    pending.plans[index][phase]=m.choice;pending.selected.add(index);
    send(player.ws,{type:'tactical_confirm',phase,choice:m.choice});
    if(pendingComplete(room))advancePhase(room);
    return;
   }
   if(m.type==='strategy'&&(room.status==='playing'||room.status==='waiting')){
    if(!STYLES[m.strategy])return;player.strategy=m.strategy;
    broadcast(room,{type:'strategy',strategies:room.players.map(p=>p.strategy),by:room.players.indexOf(player)});
   }
   if(m.type==='rematch'&&room.status==='finished'){
    room.rematchVotes.add(player);if(room.rematchVotes.size===2){if(room.mode==='fresh'){room.rematchVotes.clear();room.players.forEach(p=>p.ready=false);startDraft(room);}else reset(room);}
    else send(ws,{type:'rematch_wait',text:'Waiting for opponent to request a rematch.'});
   }
   if(m.type==='leave')leave(ws);
  }catch(error){console.error('WebSocket error',error);send(ws,{type:'error',text:'Server error; try joining again.'});}
 });
 ws.on('close',()=>leave(ws));
});
const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(ws.isAlive===false){ws.terminate();continue;}ws.isAlive=false;ws.ping();}},25000);heartbeat.unref();
const expiry=setInterval(()=>{const limit=Date.now()-90*60*1000;for(const room of rooms.values())if(room.createdAt<limit&&room.status!=='playing'){broadcast(room,{type:'notice',text:'Lobby expired; create a new room.'});for(const p of [...room.players]){p.ws.roomCode=null;}clearTimer(room);rooms.delete(room.code);}},60000);expiry.unref();
server.listen(PORT,'0.0.0.0',()=>console.log(`SPIKE LEGENDS Haikyuu Fan Roster listening at http://localhost:${PORT}`));
