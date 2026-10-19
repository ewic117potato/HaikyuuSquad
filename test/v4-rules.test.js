'use strict';
const assert=require('node:assert/strict');
const D=require('../public/draft-rules');
const {SPIKE_ROSTER}=require('../public/roster-data');
for(let run=0;run<600;run++){
 const squad=[];
 for(let round=0;round<6;round++){
  const o=D.makeOffer({roster:SPIKE_ROSTER,existing:squad,rand:Math.random,cardFromIndex:(idx,stage)=>({key:`${idx}-${stage}`,name:SPIKE_ROSTER[idx].name,school:SPIKE_ROSTER[idx].school,position:SPIKE_ROSTER[idx].pos,stage})});
  assert(o.cards.length>=1&&o.cards.length<=4);
  assert(o.cards.every(c=>c.school===o.school));
  assert(o.cards.some(c=>D.eligible(squad,c)),`No usable card on run ${run} round ${round}`);
  const choice=o.cards.filter(c=>D.eligible(squad,c));
  squad.push(choice[Math.floor(Math.random()*choice.length)]);
 }
 assert(D.validTeam(squad),'A six-card run must be a legal lineup');
 assert(D.lineup(squad).length===6);
}
assert(!D.eligible([{position:'OP'}],{position:'OP'}));
assert.equal(D.numSetting(-2,8),0);
const schools=SPIKE_ROSTER.filter(x=>!x.proOnly&&x.pos==='OH').map(x=>x.school);
if(new Set(schools).size>1){const old=schools[0];const next=D.makeOffer({roster:SPIKE_ROSTER,avoidSchool:old,cardFromIndex:i=>({position:SPIKE_ROSTER[i].pos})});assert.notEqual(next.school,old);}
assert.equal(D.numSetting(77,8),30);
assert.equal(D.numSetting('wrong',8),8);
assert.equal(D.numSetting(3.1,8),8);
const cards=[{position:'OH'},{position:'OH'},{position:'MB'},{position:'S'},{position:'OP'}];
assert(D.needs(cards).includes('L')&&D.needs(cards).includes('MB'));
console.log('PASS: 600 complete six-card drafts; guaranteed needed role on each offer; role validation; safe custom room limits.');
