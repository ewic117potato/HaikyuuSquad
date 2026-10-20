'use strict';
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const Module=require('node:module'),http=require('node:http');
const old={load:Module._load,createServer:http.createServer,setTimeout:global.setTimeout,clearTimeout:global.clearTimeout,setInterval:global.setInterval,clearInterval:global.clearInterval};
const timers=[];
global.setTimeout=(fn,ms)=>{const t={fn,ms,cleared:false,done:false};timers.push(t);return t;};
global.clearTimeout=t=>{if(t)t.cleared=true};
global.setInterval=(fn,ms)=>({fn,ms,unref(){}});
global.clearInterval=()=>{};
http.createServer=()=>({listen(port,host,callback){callback?.();}});
class Socket extends EventEmitter{constructor(){super();this.readyState=1;this.sent=[];}send(payload){this.sent.push(JSON.parse(payload))}ping(){}close(){this.readyState=3;this.emit('close')}}
Socket.OPEN=1;
let wss=null;
class FakeWSS extends EventEmitter{constructor(){super();this.clients=new Set();wss=this;}}
Module._load=function(request,parent,main){if(request==='ws')return {WebSocketServer:FakeWSS,WebSocket:Socket};return old.load.apply(this,arguments)};
const read=(s,type)=>s.sent.filter(x=>x.type===type);
const message=(s,body)=>s.emit('message',Buffer.from(JSON.stringify(body)));
function runTimer(ms){const task=timers.find(x=>x.ms===ms&&!x.cleared&&!x.done);assert(task,'Missing raid timer '+ms);task.done=true;task.fn();}
try{
 require('../server.js');assert(wss);
 const a=new Socket(),b=new Socket();wss.clients.add(a);wss.clients.add(b);wss.emit('connection',a);wss.emit('connection',b);
 const positions=['OH','MB','OP','MB','OH','S'];
 const make=(prefix)=>positions.map((position,i)=>({name:`${prefix} ${i}`,id:`${prefix}${i}`,school:prefix,position,power:93,attack:93,defense:93,set:93}));
 message(a,{type:'raid_create',name:'Coach One',level:'normal',squad:make('A')});
 const room=read(a,'raid_room').at(-1);assert(room.code,JSON.stringify(a.sent));
 message(b,{type:'raid_join',name:'Coach Two',code:room.code,squad:make('B')});
 assert.equal(read(a,'raid_room').at(-1).players.length,2);
 assert.equal(read(b,'raid_room').at(-1).maxPlayers,4);
 message(a,{type:'raid_ready',ready:true});message(b,{type:'raid_ready',ready:true});
 const start=read(a,'raid_start').at(-1);assert(start);
 assert.equal(start.team.length,6);assert.equal(start.owners.length,6);
 assert.equal(new Set(start.team.map(x=>x.name)).size,6);
 assert.equal(read(b,'raid_start').length,1);
 runTimer(1200);
 assert(read(a,'raid_turn').length===1);
 message(a,{type:'raid_action',action:'quick'});message(b,{type:'raid_action',action:'power'});
 assert.equal(read(a,'raid_action_ack').at(-1).action,'quick');
 runTimer(2600);
 const e=read(a,'raid_rally').at(-1);assert(e);
 assert.equal(e.score.reduce((a,b)=>a+b,0),1);
 assert.deepEqual(read(b,'raid_rally').at(-1).score,e.score);
 assert(Array.isArray(e.beats)&&e.beats.length>0);
 assert.equal(e.type,'raid_rally');
 // Ensure leaving the raid actually cancels the partner's live match.
 message(b,{type:'raid_leave'});
 assert.equal(read(a,'raid_cancelled').length,1);
 console.log('PASS V26 raid server: invite code, two-player shared squad, sync, tactical calls, animation beats, disconnect cancellation.');
}finally{
 Module._load=old.load;http.createServer=old.createServer;
 global.setTimeout=old.setTimeout;global.clearTimeout=old.clearTimeout;
 global.setInterval=old.setInterval;global.clearInterval=old.clearInterval;
}
