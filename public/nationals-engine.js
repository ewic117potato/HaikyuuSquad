/* HAIKYUU LEGENDS V11 — fictional Spring High tournament simulator.
   Single-elimination; 6 matches (round 1, 2, 3, quarter, semi, final).
   Inspired by Spring High, not a recreation of the canon bracket. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SpikeNationals=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const ROUNDS=[
  {name:'FIRST ROUND',short:'R1',advance:'Second Round',prize:180},
  {name:'SECOND ROUND',short:'R2',advance:'Top 16',prize:250},
  {name:'THIRD ROUND',short:'R3',advance:'Top 8',prize:360},
  {name:'QUARTERFINAL',short:'QF',advance:'Top 4',prize:550},
  {name:'SEMIFINAL',short:'SF',advance:'National Finalist',prize:850},
  {name:'FINAL',short:'F',advance:'National Champion',prize:1500}
 ];
 // Opponent OVR ratings are game balancing estimates, not canon stats.
 const OPPONENTS=[
  [{name:'TSUBAKIHARA',power:73},{name:'SARUKAWA TECH',power:72},{name:'KIYOKAWA',power:71},{name:'EIWA',power:74}],
  [{name:'NEKOMA',power:83},{name:'INARIZAKI',power:88},{name:'KAMOMEDAI',power:86},{name:'MUJINAZAKA',power:85}],
  [{name:'NEKOMA',power:85},{name:'INARIZAKI',power:90},{name:'FUKURODANI',power:89},{name:'KAMOMEDAI',power:90}],
  [{name:'KAMOMEDAI',power:93},{name:'MUJINAZAKA',power:91},{name:'ITACHIYAMA',power:95},{name:'FUKURODANI',power:93}],
  [{name:'ITACHIYAMA',power:96},{name:'FUKURODANI',power:95},{name:'KAMOMEDAI',power:95},{name:'INUBUSHI HIGASHI',power:93}],
  [{name:'ICHIBAYASHI',power:97},{name:'ITACHIYAMA',power:97},{name:'FUKURODANI',power:96},{name:'INARIZAKI',power:96}]
 ];
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function hashString(input){let h=2166136261;for(const c of String(input||'')){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0;}
 function randomFrom(seed){let x=(seed>>>0)||0x729e1ae3;return function(){x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
 function makeBracket(seed){const random=randomFrom(seed);const used=new Set();return ROUNDS.map((round,index)=>{
  const options=OPPONENTS[index].filter(x=>!used.has(x.name));
  const pool=options.length?options:OPPONENTS[index];
  const opponent=pool[Math.floor(random()*pool.length)];used.add(opponent.name);
  return {...opponent,round:round.name,stage:index};
 });}
 function setChance(teamPower,opponentPower){
  const d=clamp(Number(teamPower)-Number(opponentPower),-55,55);
  return clamp(1/(1+Math.exp(-d/12)),.1,.9);
 }
 function matchChance(teamPower,oppPower,round){
  const p=setChance(teamPower,oppPower);
  // Binomial series formula for majority of either 3 or 5 sets.
  return round>=4 ? 10*p**3-15*p**4+6*p**5 : 3*p*p-2*p*p*p;
 }
 function projection(teamPower,bracket){
  if(!Array.isArray(bracket)||bracket.length!==ROUNDS.length)return null;
  let reach=1;const stages=bracket.map((opponent,i)=>{
   const chance=matchChance(teamPower,opponent.power,i);
   const stage={...opponent,name:ROUNDS[i].name,winChance:chance,reachChance:reach,advanceChance:reach*chance};
   reach*=chance;return stage;
  });
  const results=stages.map((s,i)=>({place:i===0?'First Round':i===1?'Second Round':i===2?'Top 16':i===3?'Top 8':i===4?'Top 4':'Runner-up',probability:s.reachChance*(1-s.winChance)}));
  results.push({place:'National Champion',probability:reach});
  const mostLikely=results.reduce((best,x)=>x.probability>best.probability?x:best,results[0]);
  const medianExit=results.find((_,i)=>results.slice(0,i+1).reduce((s,x)=>s+x.probability,0)>=.5)||results[6];
  return {stages,results,championChance:reach,mostLikely:mostLikely.place,medianFinish:medianExit.place};
 }
 // Real set-by-set simulated series, not just arbitrary 2-0 scores.
 function simulateMatch(teamPower,opponentPower,round,rng=Math.random){
  const target=round>=4?3:2;
  const chance=setChance(teamPower,opponentPower);
  const sets=[];let ours=0,theirs=0;
  while(ours<target&&theirs<target){
   const win=rng()<chance;
   let winnerPoints=25;
   let loserPoints=Math.floor(14+rng()*10);
   if(rng()<.23){winnerPoints=26+Math.floor(rng()*5);loserPoints=winnerPoints-2;}
   // The fifth set is played to 15 in a best-of-five.
   if(target===3&&sets.length===4){winnerPoints=15;loserPoints=Math.min(13,Math.floor(9+rng()*5));}
   sets.push(win?`${winnerPoints}–${loserPoints}`:`${loserPoints}–${winnerPoints}`);
   if(win)ours++;else theirs++;
  }
  return {win:ours>theirs,score:`${ours}–${theirs}`,sets,ourSets:ours,theirSets:theirs};
 }
 function snapshotKey(players,coach='',manager=''){
  return [...(players||[]).map(p=>`${p.key||p.name}:${p.level||0}`).sort(),coach||'',manager||''].join('|');
 }
 function validateBracket(bracket){return Array.isArray(bracket)&&bracket.length===6&&bracket.every((b,i)=>b&&typeof b.name==='string'&&Number.isFinite(b.power)&&b.power>=60&&b.power<=100&&b.stage===i);}
 return {ROUNDS,OPPONENTS,hashString,randomFrom,makeBracket,setChance,matchChance,projection,simulateMatch,snapshotKey,validateBracket};
});
