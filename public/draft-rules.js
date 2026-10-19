/* Shared browser/server draft rules. No build step required. */
(function(root,factory){const rules=factory();if(typeof module==='object'&&module.exports)module.exports=rules;root.SpikeDraftRules=rules;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const GOALS={OH:2,MB:2,OP:1,S:1,L:1};
const order={OH:0,MB:1,OP:2,S:3,L:4};
function needs(cards){
 const count={OH:0,MB:0,OP:0,S:0,L:0};
 for(const c of cards)if(Object.hasOwn(count,c.position))count[c.position]++;
 const missing=[];
 if(count.OH<2)missing.push('OH');
 if(count.OP<1)missing.push('OP');
 if(count.S<1)missing.push('S');
 if(count.MB===0)missing.push('MB');
 // Two middle/defensive slots: either two MB or one MB + one Libero.
 if(count.MB+count.L<2){if(count.MB<2)missing.push('MB');if(count.L<1)missing.push('L');}
 return [...new Set(missing)];
}
function eligible(cards,c){if(cards.length>=6)return false;const roles=needs(cards);return roles.includes(c.position);}
function validTeam(cards){return cards.length===6&&needs(cards).length===0;}
function lineup(cards){if(!validTeam(cards))return null;const arr=[...cards],take=role=>arr.splice(arr.findIndex(c=>c.position===role),1)[0];return [take('OH'),take('MB'),take('OP'),arr.find(c=>c.position==='L')?take('L'):take('MB'),take('OH'),take('S')];}
function numSetting(x,def=0){if(x===undefined||x===null||x==='')return def;const n=Number(x);return Number.isInteger(n)?Math.max(0,Math.min(30,n)):def;}
function makeOffer({roster,existing=[],targetSchool=null,avoidSchool=null,rand=Math.random,cardFromIndex,versionSampler=null,weightForIndex=null}){
 const needed=needs(existing);
 if(!needed.length)throw new Error('Squad already complete');
 const schools=[...new Set(roster.map(x=>x.school))].filter(s=>roster.some(x=>x.school===s&&needed.includes(x.pos)&&!x.proOnly));
 if(!schools.length)throw new Error('No school contains a needed position');
 const available=avoidSchool&&schools.length>1?schools.filter(x=>x!==avoidSchool):schools;
 const school=targetSchool&&schools.includes(targetSchool)?targetSchool:available[Math.floor(rand()*available.length)];
 const pool=roster.map((c,i)=>({c,i})).filter(x=>x.c.school===school&&!x.c.proOnly);
 const chosen=[],used=new Set();
 const forced=pool.filter(x=>needed.includes(x.c.pos));
 const chooseWeighted=list=>{if(!weightForIndex)return list[Math.floor(rand()*list.length)];const weights=list.map(o=>Math.max(.001,Number(weightForIndex(o.i))||1));let draw=rand()*weights.reduce((x,y)=>x+y,0);for(let j=0;j<list.length;j++){draw-=weights[j];if(draw<0)return list[j];}return list[list.length-1];};
 const first=chooseWeighted(forced);
 chosen.push(first);used.add(first.i);
 while(chosen.length<4){let available=pool.filter(x=>!used.has(x.i));if(!available.length){used.clear();available=pool;}const next=chooseWeighted(available);chosen.push(next);used.add(next.i);}
 const cards=chosen.map(x=>{const r=rand();const version=versionSampler?versionSampler(rand):r<.95?0:r<.98?1:r<.99?2:3;return cardFromIndex(x.i,version)});
 // Randomize card display order so the position guarantee is not visually predictable.
 for(let i=cards.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 return {school,cards};
}
return {needs,eligible,validTeam,lineup,numSetting,makeOffer,GOALS,order};
});
