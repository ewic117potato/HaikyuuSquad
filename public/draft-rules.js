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
function sameAthlete(a,b){
 // Older saves may omit names; compare only when both entries identify an athlete.
 return !!(a&&b&&a.name&&b.name&&a.name.trim().toLowerCase()===b.name.trim().toLowerCase());
}
function eligible(cards,c){
 if(cards.length>=6||cards.some(x=>sameAthlete(x,c)))return false;
 return needs(cards).includes(c.position);
}
function validTeam(cards){
 if(cards.length!==6||needs(cards).length!==0)return false;
 return !cards.some((c,i)=>cards.slice(i+1).some(x=>sameAthlete(c,x)));
}
function lineup(cards){if(!validTeam(cards))return null;const arr=[...cards],take=role=>arr.splice(arr.findIndex(c=>c.position===role),1)[0];return [take('OH'),take('MB'),take('OP'),arr.find(c=>c.position==='L')?take('L'):take('MB'),take('OH'),take('S')];}
function numSetting(x,def=0){if(x===undefined||x===null||x==='')return def;const n=Number(x);return Number.isInteger(n)?Math.max(0,Math.min(30,n)):def;}
function makeOffer({roster,existing=[],targetSchool=null,avoidSchool=null,allowedSchools=null,rand=Math.random,cardFromIndex,versionSampler=null,weightForIndex=null}){
 const needed=needs(existing);
 if(!needed.length)throw new Error('Squad already complete');
 const draftedNames=new Set(existing.map(x=>String(x.name||'').trim().toLowerCase()).filter(Boolean));
 // One school card per named athlete. Never use a professional-team entry in school scouting.
 const unique=new Map();
 roster.forEach((c,i)=>{
  if(c.proOnly||(Array.isArray(allowedSchools)&&!allowedSchools.includes(c.school))||draftedNames.has(String(c.name||'').trim().toLowerCase()))return;
  const identity=c.school+'|'+String(c.name||'').trim().toLowerCase();
  if(!unique.has(identity))unique.set(identity,{c,i});
 });
 const bySchool=new Map();
 for(const row of unique.values()){
  if(!bySchool.has(row.c.school))bySchool.set(row.c.school,[]);
  bySchool.get(row.c.school).push(row);
 }
 let schools=[...bySchool.keys()].filter(s=>bySchool.get(s).some(x=>needed.includes(x.c.pos)));
 if(!schools.length)throw new Error('No school contains an undrafted player for a needed position');
 // All real featured schools remain available. A school with only three
 // known athletes shows three unique cards rather than inventing a duplicate.
 const available=avoidSchool&&schools.length>1?schools.filter(x=>x!==avoidSchool):schools;
 const n=Math.max(0,Math.min(available.length-1,Math.floor(rand()*available.length)));
 const school=targetSchool&&schools.includes(targetSchool)?targetSchool:available[n];
 const pool=bySchool.get(school);
 const chooseWeighted=list=>{
  if(!list.length)throw new Error('Insufficient unique athletes to produce an offer');
  if(!weightForIndex)return list[Math.floor(rand()*list.length)];
  const weights=list.map(o=>Math.max(.001,Number(weightForIndex(o.i))||1));
  let draw=rand()*weights.reduce((x,y)=>x+y,0);
  for(let j=0;j<list.length;j++){draw-=weights[j];if(draw<0)return list[j];}
  return list[list.length-1];
 };
 const selected=[];
 const first=chooseWeighted(pool.filter(x=>needed.includes(x.c.pos)));
 selected.push(first);
 while(selected.length<Math.min(4,pool.length)){
  const used=new Set(selected.map(x=>x.i));
  const remaining=pool.filter(x=>!used.has(x.i));
  selected.push(chooseWeighted(remaining));
 }
 const cards=selected.map(x=>cardFromIndex(x.i,versionSampler?versionSampler(rand):0));
 for(let i=cards.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 return {school,cards};
}

return {needs,eligible,validTeam,lineup,numSetting,makeOffer,GOALS,order};
});
