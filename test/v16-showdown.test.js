'use strict';
const assert=require('assert');const fs=require('fs');const vm=require('vm');
const src=fs.readFileSync('public/duel-v16.js','utf8');const context={window:{},document:{},Math};vm.runInNewContext(src,context);
const fx=context.window.DuelV16;assert(fx&&fx.slots.length===6);const one=(base,side)=>Array.from({length:6},(_,i)=>({name:`${side} ${i}`,position:['OH','MB','OP','MB','OH','S'][i],school:side,power:base,attack:base,defense:base,set:base}));
let a=one(100,'A'),b=one(68,'B'),wins=[0,0];for(let i=0;i<1000;i++){const ev=fx.simulate([a,b],[i%15,i%12],i%40,[5,0]);assert.equal(typeof ev.action,'string');assert(ev.phases.length>=2);assert([0,1].includes(ev.winner));assert(ev.actor);wins[ev.winner]++;}
assert(wins[0]>wins[1],`Strong side must win more often: ${wins}`);
const client=fs.readFileSync('public/game-v3.js','utf8'),server=fs.readFileSync('server.js','utf8'),markup=fs.readFileSync('public/index.html','utf8');
assert(client.includes('DuelV16.intro(duel.rosters'));assert(client.includes('DuelV16.simulate('));assert(server.includes('revealMs:INTRO_MS'));assert(markup.includes('duel-v16.js'));assert(markup.includes('v16-duels.css'));
console.log('PASS V16: six position reveals, bot phase simulation, ratings influence results, server intro sync and assets linked');
