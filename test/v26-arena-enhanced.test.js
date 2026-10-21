'use strict';
const assert=require('node:assert/strict');
const Arena=require('../public/v22-arena3d.js');
const roster=(prefix)=>['OH','MB','OP','MB','OH','S'].map((position,i)=>({name:`${prefix} ${i}`,position,power:91+i,school:prefix}));
const squads=[roster('KARASUNO'),roster('NEKOMA')];
const beats=[
 {side:0,kind:'serve',name:'KARASUNO 5',zone:1},
 {side:1,kind:'dig',name:'NEKOMA 4'},
 {side:1,kind:'set',name:'NEKOMA 5'},
 {side:1,kind:'spike',name:'NEKOMA 0',zone:3},
 {side:0,kind:'receive',name:'KARASUNO 4'},
 {side:0,kind:'set',name:'KARASUNO 5'},
 {side:0,kind:'spike',name:'KARASUNO 1',zone:1},
];
const tracks=Arena.setupTracks({beats,serve:0,winner:0},squads);
assert.equal(tracks.length,beats.length);
for(let i=0;i<tracks.length-1;i++)assert.deepEqual(tracks[i].to,tracks[i+1].from,'each flight lands at the next actual player contact');
assert(tracks[0].actorPos[2]>9,'the service takes place behind the end line');
assert(tracks[2].actorPos[2]<0,'away team sets on their own side');
assert(tracks[3].actorPos[2]<0,'away attacker approaches the net');
assert(tracks.at(-1).to[2]<0,'home attack crosses into away court');
assert(Arena.zoneAtScreen(.5,.5,0,'broadcast')!==undefined);
Arena.setCamera('broadcast');assert.equal(Arena.getCamera(),'broadcast');Arena.setCamera('cinematic');
console.log('PASS enhanced arena: 9×18 court logic, serve behind baseline, linked pass → set → spike flights, attacking net positioning, camera switching.');
