'use strict';
const assert=require('node:assert/strict');
const A=require('../public/v22-arena3d');
const teams=[0,1].map(side=>Array.from({length:6},(_,i)=>({name:`${side}-${i}`})));
const empty={beats:[],serve:0};A.setupTracks(empty,teams);assert.equal(empty.beats.length,0,'rendering must not modify the authoritative event log');
const tracks=A.setupTracks({beats:[{side:0,kind:'serve',name:'0-5'},{side:1,kind:'receive',name:'1-3'},{side:1,kind:'set',name:'1-5'},{side:1,kind:'spike',name:'1-0',zone:1}]},teams);
for(const t of tracks){assert.deepEqual(A.flightPoint(t,.38),t.from,'ball meets player at contact');assert(A.flightPoint(t,1).every((v,i)=>Math.abs(v-t.to[i])<1e-9),'ball arrives at the next contact');for(let i=0;i<=100;i++)assert(A.flightPoint(t,i/100).every(Number.isFinite));}
assert(A.flightPoint(tracks[0],0)[1]<tracks[0].from[1],'serve includes a toss');
for(let i=0;i<tracks.length-1;i++)assert.deepEqual(tracks[i].to,tracks[i+1].from,'no ball teleport between touches');
console.log('PASS V26.3: contact timing, linked trajectories, finite geometry, serve toss, immutable event log');
