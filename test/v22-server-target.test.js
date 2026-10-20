'use strict';
// Server-authoritative friend tactic integration test without external WebSocket packages.
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events'),Module=require('node:module'),http=require('node:http');
const original={load:Module._load,createServer:http.createServer,setTimeout:global.setTimeout,clearTimeout:global.clearTimeout,setInterval:global.setInterval,clearInterval:global.clearInterval};
const tasks=[];const schedule=(fn,ms)=>{const t={fn,ms,cleared:false};tasks.push(t);return t};
global.setTimeout=schedule;global.clearTimeout=t=>{if(t)t.cleared=true};
global.setInterval=(fn,ms)=>({fn,ms,cleared:false,unref(){}});global.clearInterval=t=>{if(t)t.cleared=true};
http.createServer=()=>({listen(port,host,callback){if(callback)callback();}});
class Socket extends EventEmitter{constructor(){super();this.sent=[];this.readyState=1;}send(x){this.sent.push(JSON.parse(x))}ping(){}close(){this.readyState=3;this.emit('close')}}
Socket.OPEN=1;
let handler=null;
class FakeWSS extends EventEmitter{constructor(){super();handler=this;this.clients=new Set();}}
Module._load=function(req,parent,main){if(req==='ws')return {WebSocketServer:FakeWSS,WebSocket:Socket};return original.load.apply(this,arguments)};
const read=(sock,type)=>sock.sent.filter(m=>m.type===type);
const message=(sock,obj)=>sock.emit('message',Buffer.from(JSON.stringify(obj)));
const runTimer=(min=0,max=Infinity)=>{const next=tasks.find(t=>!t.cleared&&!t.done&&t.ms>=min&&t.ms<=max);assert(next,`missing timer ${min}..${max}`);next.done=true;next.fn()};
try{
 require('../server.js');assert(handler);
 const a=new Socket(),b=new Socket();handler.clients.add(a);handler.clients.add(b);handler.emit('connection',a);handler.emit('connection',b);
 const make=(name,power)=>['OH','MB','OP','MB','OH','S'].map((position,i)=>({name:`${name} ${i}`,id:`${name}${i}`,power,attack:power,defense:power,set:power,school:name,position}));
 const squadA=make('A',92),squadB=make('B',80);
 message(a,{type:'create',name:'Coach A',squad:squadA,mode:'saved',tacticalMode:'manual'});
 const room=read(a,'room').at(-1);assert(room&&room.code);
 message(b,{type:'join',name:'Coach B',code:room.code,squad:squadB,tacticalMode:'auto'});
 assert.equal(read(b,'room').at(-1).playModes[1],'auto');
 message(a,{type:'ready',ready:true});message(b,{type:'ready',ready:true});
 assert.equal(read(a,'start').length,1);assert.equal(read(b,'start').length,1);
 runTimer(7850,7850); // end synchronized pre-match intros
 let prompt=read(a,'tactical_prompt').at(-1);assert.equal(prompt.phase,'serve');assert.equal(prompt.canAct,true);
 const before=read(a,'tactical_confirm').length;
 message(a,{type:'tactical_choice',phase:'serve',choice:'MAGIC SERVE'});
 assert.equal(read(a,'tactical_confirm').length,before,'invalid actions must be ignored');
 message(a,{type:'tactical_choice',phase:'serve',choice:'jump',zone:1});
 assert.equal(read(a,'tactical_confirm').at(-1).choice,'jump');
 prompt=read(a,'tactical_prompt').at(-1);assert.equal(prompt.phase,'set');
 message(a,{type:'tactical_choice',phase:'set',choice:'dump'});
 // Dump skips this team's attack action in a synchronized turn.
 prompt=read(a,'tactical_prompt').at(-1);assert.equal(prompt.phase,'defense');
 message(a,{type:'tactical_choice',phase:'defense',choice:'cover'});
 let ev=read(a,'rally').at(-1);assert(ev&&read(b,'rally').at(-1));
 assert.equal(ev.serveZone,1,'Server did not preserve selected serve target');
 assert(Array.isArray(ev.beats)&&ev.beats.length>0,'Server must send 3D choreography data');
 assert.equal(ev.beats[0].zone,1,'3D serve should land in the selected zone');
 assert.deepEqual(read(b,'rally').at(-1).score,ev.score);
 assert.equal(ev.score[0]+ev.score[1],1);
 // Switch to automatic play at any point in the match.
 message(a,{type:'match_mode',mode:'auto'});
 assert.deepEqual(read(b,'match_mode').at(-1).playModes,['auto','auto']);
 runTimer(1750,1750);
 assert.equal(read(a,'rally').length,2);
 assert.equal(read(a,'rally')[1].serve,ev.winner,'rally winner should serve next');
 // Server retains the ability to restore manual mode and timeout if abandoned.
 message(a,{type:'match_mode',mode:'manual'});
 runTimer(1750,1750);
 prompt=read(a,'tactical_prompt').at(-1);assert.equal(prompt.phase,read(a,'rally').at(-1).winner===0?'serve':'receive');
 runTimer(12000,12000); // defaults unanswered serving/receiving decision rather than freezing
 assert(read(a,'tactical_prompt').some(x=>x.phase==='set'));
 console.log('PASS V22 live: two browser sockets, independent manual/auto modes, invalid input rejected, serve/setter dump/defence actions, synced scores, auto toggle, 12s fallback.');
}finally{
 Module._load=original.load;http.createServer=original.createServer;
 global.setTimeout=original.setTimeout;global.clearTimeout=original.clearTimeout;
 global.setInterval=original.setInterval;global.clearInterval=original.clearInterval;
}
