'use strict';
// Offline transport simulation: verify both players receive the same server-generated draft and match.
const assert=require('assert'),fs=require('fs'),vm=require('vm'),events=require('events'),path=require('path');
let wss;
class FakeWSS extends events.EventEmitter {constructor(){super();this.clients=new Set();wss=this;}}
class FakeSocket extends events.EventEmitter {constructor(){super();this.isAlive=true;this.readyState=1;this.messages=[];wss.clients.add(this);wss.emit('connection',this);} send(raw){this.messages.push(JSON.parse(raw));} ping(){this.emit('pong');} terminate(){this.emit('close');}}
const waits=[];const interval=(cb)=>{const x={cb,active:true,unref(){}};waits.push(x);return x;};
const main=fs.readFileSync(path.resolve('server.js'),'utf8')+"\nglobalThis.__suite = {rooms, wss, nextRally};";
const realRequire=require;
const context={Buffer,console,process:{env:{PORT:'0'}},__dirname:process.cwd(),setInterval:interval,clearInterval:x=>x.active=false,Date,Math,URL,decodeURIComponent,encodeURIComponent,Set,Map,Object,JSON,Uint8Array};
context.require=name=>name==='ws'?{WebSocketServer:FakeWSS,WebSocket:{OPEN:1}}:name==='http'?{createServer:()=>({listen(){}})}:realRequire(name.startsWith('.')?path.resolve(name):name);
vm.runInNewContext(main,context);
const {rooms,nextRally}=context.__suite;
const a=new FakeSocket(),b=new FakeSocket();
function send(sock,msg){sock.emit('message',Buffer.from(JSON.stringify(msg)))}
function last(sock,type){return sock.messages.filter(x=>x.type===type).at(-1)}
send(a,{type:'create',name:'PLAYER A',mode:'fresh',squad:[],settings:{extraRolls:4,rerolls:3,coaches:false}});
const code=last(a,'room').code;
assert.match(code,/^[0-9A-F]{6}$/);
send(b,{type:'join',code,name:'PLAYER B',squad:[]});
assert.strictEqual(last(a,'draft_offer').round,1);
assert.strictEqual(last(b,'draft_offer').round,1);
for(let n=1;n<=6;n++){
 const aa=last(a,'draft_offer'),bb=last(b,'draft_offer');
 assert(aa.cards.length>=1&&aa.cards.length<=4);assert(bb.cards.length>=1&&bb.cards.length<=4);
 assert(aa.cards.every(c=>c.school===aa.school));
 if(n===1){send(a,{type:'draft_school_roll'});assert.strictEqual(last(a,'draft_offer').schoolRolls,3);
  for(let x=0;x<3;x++)send(a,{type:'draft_school_roll'});
  assert.strictEqual(last(a,'draft_offer').schoolRolls,0);
  const count=a.messages.length;send(a,{type:'draft_school_roll'});assert.equal(a.messages.length,count+1);assert.equal(a.messages.at(-1).type,'error');}
 if(n===2){send(a,{type:'draft_reroll'});assert.strictEqual(last(a,'draft_offer').rerolls,2);
  for(let x=0;x<2;x++)send(a,{type:'draft_reroll'});
  assert.equal(last(a,'draft_offer').rerolls,0);const count=a.messages.length;send(a,{type:'draft_reroll'});assert.equal(a.messages.length,count+1);assert.equal(a.messages.at(-1).type,'error');}
 {const offer=last(a,'draft_offer');send(a,{type:'draft_pick',key:offer.cards.find(c=>offer.needed.includes(c.position)).key});}
 send(b,{type:'draft_pick',key:bb.cards.find(c=>bb.needed.includes(c.position)).key});
 if(n<6){assert.strictEqual(last(a,'draft_offer').round,n+1);assert.strictEqual(last(b,'draft_offer').round,n+1);}
}
const room=rooms.get(code);assert.equal(room.players[0].squad.length,6);assert.equal(room.players[1].squad.length,6);
assert.equal(room.status,'waiting');assert.equal(room.players[0].coachBuff,0);assert.equal(room.settings.rerolls,3);assert.equal(room.settings.extraRolls,4);assert.equal(room.settings.coaches,false);assert(last(a,'draft_complete'));assert(last(b,'draft_complete'));
send(a,{type:'ready',ready:true});send(b,{type:'ready',ready:true});assert(last(a,'start'));
for(let i=0;i<45&&room.status==='playing';i++)nextRally(room);
assert.equal(room.status,'finished');assert.deepStrictEqual(last(a,'finish').score,last(b,'finish').score);
console.log('PASS: server-authoritative two-player fresh draft, host-configured rolls and rerolls, free offers after picks, position guarantee, synced rally results.');
