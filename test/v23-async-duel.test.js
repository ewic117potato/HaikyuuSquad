'use strict';
/* V23 regression: two users draft six cards independently, revealing squads only at the end. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),events=require('node:events');
const context={};let wss;
class WSS extends events.EventEmitter{constructor(){super();this.clients=new Set();wss=this;}}
class Client extends events.EventEmitter{
 constructor(){super();this.readyState=1;this.isAlive=true;this.messages=[];wss.clients.add(this);wss.emit('connection',this)}
 send(s){this.messages.push(JSON.parse(s))}ping(){}close(){this.readyState=3;this.emit('close')}
}
Client.OPEN=1;
const timers=[],setTimeoutFake=(cb,ms)=>{const t={cb,ms,active:true};timers.push(t);return t};
const fakeHttp={createServer:()=>({listen(){}})};
Object.assign(context,{Buffer,console,process:{env:{PORT:'0'}},__dirname:process.cwd(),setInterval:()=>({unref(){}}),clearInterval(){},setTimeout:setTimeoutFake,clearTimeout:t=>{if(t)t.active=false},Date,Math,URL,decodeURIComponent,encodeURIComponent,Set,Map,Object,JSON,Uint8Array});
context.require=mod=>mod==='ws'?{WebSocketServer:WSS,WebSocket:Client}:mod==='http'?fakeHttp:require(mod.startsWith('.')?path.resolve(mod):mod);
vm.runInNewContext(fs.readFileSync(path.resolve('server.js'),'utf8')+'\nglobalThis.__rooms=rooms;',context);
const a=new Client(),b=new Client();
const send=(socket,obj)=>socket.emit('message',Buffer.from(JSON.stringify(obj)));
const last=(socket,type)=>socket.messages.filter(m=>m.type===type).at(-1);
send(a,{type:'create',mode:'fresh',name:'PLAYER ONE',settings:{extraRolls:4,rerolls:3,coaches:false}});
const code=last(a,'room').code;
send(b,{type:'join',code,name:'PLAYER TWO'});
const room=context.__rooms.get(code);
assert.equal(room.status,'draft');
assert.equal(last(a,'draft_offer').round,1);assert.equal(last(b,'draft_offer').round,1);
// The whole six-character draft is completed by PLAYER ONE before PLAYER TWO chooses anything.
for(let i=1;i<=6;i++){
 const offer=last(a,'draft_offer');assert.equal(offer.round,i);
 assert.equal(last(b,'draft_offer').round,1,'Other user must not receive forced round advances');
 const pick=offer.cards.find(c=>offer.needed.includes(c.position));assert(pick);
 send(a,{type:'draft_pick',key:pick.key});
 assert.equal(last(a,'draft_picked').round,i);
 if(i<6)assert.equal(last(a,'draft_offer').round,i+1,'Next free school offer must arrive immediately');
}
assert.equal(room.players[0].squad.length,6);assert.equal(room.players[1].squad.length,0);
assert.equal(room.status,'draft');assert(last(a,'draft_waiting'));
const hidden=last(b,'room');assert.equal(hidden.players[0].picks,6);assert.equal(hidden.players[0].power,null);
assert(!last(a,'draft_complete'),'Neither side can see the full rival squad yet');
const block=a.messages.length;send(a,{type:'draft_reroll'});send(a,{type:'draft_school_roll'});send(a,{type:'draft_pick',key:'0-0'});
assert.equal(a.messages.length,block,'Finished user cannot spend draft currency or pick again');
// OTHER user chooses their own offers at their own pace.
for(let i=1;i<=6;i++){
 const offer=last(b,'draft_offer');assert.equal(offer.round,i);
 if(i===2){send(b,{type:'draft_reroll'});assert.equal(last(b,'draft_offer').rerolls,2)}
 const current=last(b,'draft_offer');const pick=current.cards.find(c=>current.needed.includes(c.position));assert(pick);
 send(b,{type:'draft_pick',key:pick.key});
 if(i<6)assert.equal(last(b,'draft_offer').round,i+1);
}
assert.equal(room.status,'waiting');
for(const sock of [a,b]){const done=last(sock,'draft_complete');assert(done&&done.players.length===2);assert(done.players.every(p=>p.squad.length===6));}
assert.equal(room.players[0].squad.length,6);assert.equal(room.players[1].squad.length,6);
send(a,{type:'ready',ready:true});send(b,{type:'ready',ready:true});
assert.equal(room.status,'playing');assert.equal(last(a,'start').revealMs,0,'Fresh duels reveal squads at end of draft, not twice');
assert(timers.some(t=>t.ms===450),'Fresh draft match must start right after ready, no second long intro');
console.log('PASS V23: six independent instant picks, no per-round waiting, safe private squads, one reveal after both complete, no second intro.');
// Verify final reveal presents 12 sequential cards, not four scout cards with delays.
const els={};let fakeTimes=[],frames=[];function el(id){return els[id]||(els[id]={innerHTML:'',textContent:'',style:{width:''},setAttribute(k,v){this[k]=v},addEventListener(k,cb){this[k]=cb}})}
const api={window:{matchMedia:()=>({matches:false})},document:{getElementById:el},setTimeout:(cb)=>{const t={cb,active:true};fakeTimes.push(t);return t},clearTimeout:t=>{if(t)t.active=false},console,Math,Date};
vm.runInNewContext(fs.readFileSync(path.resolve('public/duel-v16.js'),'utf8'),api);
const duo=api.window.DuelV16;assert.equal(duo.slots.length,6);
const team=x=>['OH','MB','OP','MB','OH','S'].map((role,i)=>({name:x+' '+i,school:x,position:role,power:90+i,key:i+'-0',portrait:'portraits/00.svg'}));
let finished=0;duo.intro([team('HOME'),team('AWAY')],['HOME','AWAY'],()=>finished++,9600);
function nextTimer(){const next=fakeTimes.find(t=>t.active&&!t.done);assert(next,'missing animation frame timer');next.done=true;next.cb()}
assert(el('v16-reveal').innerHTML.includes('HIDDEN CARD'),'Opposing card stays concealed during first reveal');
for(let k=1;k<12;k++){nextTimer();frames.push(el('v16-count').textContent);if(k%2===1)assert(!el('v16-reveal').innerHTML.includes('HIDDEN CARD'));else assert(el('v16-reveal').innerHTML.includes('HIDDEN CARD'));}
assert.equal(new Set(frames).size,11);assert.equal(finished,0);nextTimer();assert.equal(finished,1);
let skipped=0;duo.intro([team('A'),team('B')],['A','B'],()=>skipped++,9600);el('v16-skip').click();assert.equal(skipped,1);
console.log('PASS V23: sequential 12-step cinematic (one card at a time), score readout, skip and single completion callback.');
