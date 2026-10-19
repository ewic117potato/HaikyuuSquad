from pathlib import Path
p=Path('/mnt/data/SpikeLegends_V3/server.js')
s=p.read_text()
s=s.replace("const {STYLES,sanitizeSquad,teamwork,chooseRally,isFinished}=require('./server/match-engine');", "const {STYLES,sanitizeSquad,teamwork,chooseRally,isFinished}=require('./server/match-engine');\nconst {SPIKE_ROSTER}=require('./public/roster-data.js');\nconst https=require('https');")
s=s.replace("const server=http.createServer((req,res)=>{",'''const portraitCache=new Map();
function apiPortrait(req,res){
  const name=new URL(req.url,'http://localhost').searchParams.get('name')||'';
  if(!/^[\\p{L}\\p{M} .'-]{2,60}$/u.test(name)){res.writeHead(400);res.end('{}');return;}
  const entry=portraitCache.get(name);
  if(entry&&entry.until>Date.now()){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'public,max-age=86400'});res.end(JSON.stringify({url:entry.url}));return;}
  // Optional fandom image resolution, never required for game to work.
  // The image is displayed from its owner site; no third-party art is bundled.
  const url='https://haikyuu.fandom.com/api.php?action=query&format=json&redirects=1&prop=pageimages&pithumbsize=420&titles='+encodeURIComponent(name);
  const fail=()=>{portraitCache.set(name,{url:'',until:Date.now()+3600000});res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'public,max-age=3600'});res.end('{"url":""}');};
  const request=https.get(url,{headers:{'User-Agent':'SpikeLegendsFanProject/3.0 (fan-created UI; public character metadata)','Accept':'application/json'}},response=>{
   if(response.statusCode!==200){response.resume();fail();return;}
   let body='';response.setEncoding('utf8');response.on('data',c=>{body+=c;if(body.length>150000)response.destroy();});response.on('end',()=>{
    try{const data=JSON.parse(body);const pages=Object.values(data.query?.pages||{});const image=pages[0]?.thumbnail?.source||'';
    const clean=image.startsWith('https://')&&(new URL(image).hostname.endsWith('wikia.nocookie.net')||new URL(image).hostname.endsWith('fandom.com'))?image:'';
    portraitCache.set(name,{url:clean,until:Date.now()+86400000});res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'public,max-age=3600'});res.end(JSON.stringify({url:clean}));}catch{fail();}
   });response.on('error',fail);
  });request.setTimeout(2800,()=>request.destroy());request.on('error',fail);
}
const server=http.createServer((req,res)=>{''')
s=s.replace("if(route==='/health')", "if(route==='/api/portrait'){apiPortrait(req,res);return;}\n if(route==='/health')")
s=s.replace("version:'rival-ascension-v2.1-haikyuu'", "version:'squad-draft-v3'")
s=s.replace("function snapshot(room){",'''const rand=(max)=>crypto.randomInt(max);
function draftCard(i,v){const b=SPIKE_ROSTER[i],pow=[72,84,92,97][v]+(i*7+v*3)%[10,7,5,3][v];const power=Math.min(99,pow);
 return {key:`${i}-${v}`,name:b.name,school:b.school,position:b.pos,variant:['Classic','Nationals','Timeskip','Professional'][v],portrait:i<52?`portraits/${String(i).padStart(2,'0')}.svg`:'',power,attack:Math.min(99,power+(b.pos==='OH'||b.pos==='OP'?4:-2)),defense:Math.min(99,power+(b.pos==='L'||b.pos==='MB'?5:-3)),set:Math.min(99,power+(b.pos==='S'?5:-4))};}
function newOffer(room,p){
 const all=[...new Set(SPIKE_ROSTER.filter(c=>!c.proOnly).map(c=>c.school))];
 const school=all[rand(all.length)];let pool=SPIKE_ROSTER.map((x,i)=>({x,i})).filter(a=>a.x.school===school);
 const chosen=[],seen=new Set();for(let n=0;n<4;n++){
  let candidates=pool.filter(a=>!seen.has(a.i));if(!candidates.length){seen.clear();candidates=pool;}
  const q=candidates[rand(candidates.length)];seen.add(q.i);
  const t=rand(100);let v=t<48?0:t<78?1:t<95?2:3;
  if(q.x.proOnly)v=3;
  chosen.push(draftCard(q.i,v));
 }
 p.offer={school,cards:chosen};
 send(p.ws,{type:'draft_offer',round:room.draftRound+1,total:6,school,cards:chosen,rerolls:p.rerolls});
}
function startDraft(room){room.status='draft';room.draftRound=0;room.players.forEach(p=>{p.squad=[];p.rerolls=2;p.offer=null;p.picked=false;newOffer(room,p);});snapshot(room);}
function snapshot(room){''')
s=s.replace("status:room.status,players:", "status:room.status,mode:room.mode||'saved',draftRound:room.draftRound||0,players:")
s=s.replace("power:Math.round(x.squad.reduce((s,y)=>s+y.power,0)/6)","power:x.squad.length?Math.round(x.squad.reduce((s,y)=>s+y.power,0)/x.squad.length):0")
s=s.replace("function begin(room){room.status='playing'", "function begin(room){room.status='playing'")
s=s.replace("const squad=sanitizeSquad(m.squad);if(squad.length!==6){send(ws,{type:'error',text:'Equip six athletes before entering a duel.'});return;}", "const mode=m.type==='create'&&m.mode==='fresh'?'fresh':'saved';\n    const squad=mode==='fresh'||m.type==='join'&&rooms.get(String(m.code||'').toUpperCase())?.mode==='fresh'?[]:sanitizeSquad(m.squad);\n    if(mode!=='fresh'&&m.type==='create'&&squad.length!==6){send(ws,{type:'error',text:'Equip six athletes before entering a saved-squad duel.'});return;}")
s=s.replace("if(!target){target={code:roomCode,status:'waiting',", "if(!target){target={code:roomCode,mode,status:'waiting',")
s=s.replace("target.players.push({ws,name:safeName(m.name),ready:false,squad,strategy:STYLES[m.strategy]?m.strategy:'balanced'});ws.roomCode=roomCode;\n    snapshot(target);return;", """if(target.mode==='saved'&&squad.length!==6){send(ws,{type:'error',text:'Equip six players before joining this saved-squad duel.'});return;}
    target.players.push({ws,name:safeName(m.name),ready:false,squad,strategy:STYLES[m.strategy]?m.strategy:'balanced'});ws.roomCode=roomCode;
    if(target.mode==='fresh'&&target.players.length===2)startDraft(target);else snapshot(target);return;""")
s=s.replace("if(m.type==='ready'&&room.status==='waiting'){",'''if(m.type==='draft_reroll'&&room.status==='draft'){
    if(player.picked)return;
    if(player.rerolls<=0){send(ws,{type:'error',text:'No draft rerolls left.'});return;}
    player.rerolls--;newOffer(room,player);return;
   }
   if(m.type==='draft_pick'&&room.status==='draft'){
    if(player.picked||!player.offer)return;
    const choice=player.offer.cards.find(c=>c.key===m.key);
    if(!choice){send(ws,{type:'error',text:'That card is not in your offer.'});return;}
    player.squad.push({...choice,id:choice.key,slot:['OH','MB','OP','OH','S','MB'][room.draftRound]});
    player.picked=true;send(ws,{type:'draft_picked',pick:choice,round:room.draftRound+1});
    if(room.players.every(x=>x.picked)){
     room.draftRound++;
     if(room.draftRound===6){room.status='waiting';broadcast(room,{type:'draft_complete',players:room.players.map(x=>({name:x.name,squad:x.squad}))});snapshot(room);}
     else{room.players.forEach(x=>{x.picked=false;newOffer(room,x);});snapshot(room);}
    }
    return;
   }
   if(m.type==='ready'&&room.status==='waiting'){''')
p.write_text(s)
print('patched server',len(s))
