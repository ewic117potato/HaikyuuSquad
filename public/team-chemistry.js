/* Haikyuu Legends V26: INDIVIDUAL card bonds, same-squad rivalry and discovery.
   Every rating boost belongs to a character, not to an invisible team multiplier.
   Shared pure module for client, opponent simulation and multiplayer server. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SpikeChemistry=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const PAIRS=Object.freeze([
 ['Shoyo Hinata','Tobio Kageyama','Freak Quick',10,'duo','quick'],
 ['Kotaro Bokuto','Keiji Akaashi','Ace Awakening',10,'duo','ace'],
 ['Atsumu Miya','Osamu Miya','Miya Twin Quick',12,'duo','quick'],
 ['Toru Oikawa','Hajime Iwaizumi','Perfect Connection',10,'duo','precision'],
 ['Tetsuro Kuroo','Kenma Kozume','Perfect Read',9,'duo','read'],
 ['Kiyoomi Sakusa','Motoya Komori','Elite Coordination',8,'duo','receive'],
 ['Takanobu Aone','Kenji Futakuchi','Iron Wall',8,'duo','block'],
 ['Wakatoshi Ushijima','Satori Tendo','Power & Instinct',8,'duo','block'],
 ['Korai Hoshiumi','Sachiro Hirugami','Seagull Fortress',8,'duo','block'],
 ['Wakatsu Kiryu','Michiru Usuri','Mujinazaka Ace',8,'duo','ace'],
 ['Daichi Sawamura','Koshi Sugawara','Captain’s Trust',7,'duo','receive'],
 ['Yu Nishinoya','Asahi Azumane','Guardian & Ace',7,'duo','receive'],
 ['Shinsuke Kita','Aran Ojiro','Captain’s Resolve',8,'duo','ace'],
 ['Rintaro Suna','Atsumu Miya','Lightning Middle',7,'duo','quick'],
 ['Shoyo Hinata','Kenma Kozume','Battle of Minds',8,'rivalry','read'],
 ['Tobio Kageyama','Toru Oikawa','Battle of Setters',10,'rivalry','precision'],
 ['Toru Oikawa','Wakatoshi Ushijima','Miyagi’s Greatest',9,'rivalry','power'],
 ['Shoyo Hinata','Korai Hoshiumi','Little Giants',10,'rivalry','jump'],
 ['Kotaro Bokuto','Tetsuro Kuroo','Tokyo Showdown',8,'rivalry','power'],
 ['Kei Tsukishima','Tetsuro Kuroo','Block Master Duel',8,'rivalry','block'],
 ['Shoyo Hinata','Wakatoshi Ushijima','Challenging the Ace',9,'rivalry','jump'],
 ['Tobio Kageyama','Atsumu Miya','Setter Kings',10,'rivalry','precision'],
 ['Shoyo Hinata','Kotaro Bokuto','Ace Apprenticeship',7,'duo','jump'],
 ['Shoyo Hinata','Atsumu Miya','Tempo Rivals',8,'rivalry','quick'],
 ['Kiyoomi Sakusa','Atsumu Miya','MSBY Precision',7,'duo','ace'],
 ['Kotaro Bokuto','Wakatoshi Ushijima','Ace Showdown',8,'rivalry','power']
]);
const SCHOOL_TIERS=Object.freeze({2:2,3:3,4:4,5:5,6:5});
const MAX_INDIVIDUAL=20;
const key=c=>String(c?.uid||c?.key||c?.id||c?.name||'');
const value=c=>Number(c?.power)||0;
function evaluate(cards=[]){
 const safe=Array.isArray(cards)?cards.filter(x=>x&&x.name):[];
 const counts={},names=new Set(safe.map(x=>x.name));
 for(const c of safe)counts[c.school]=(counts[c.school]||0)+1;
 const schools=Object.entries(counts).map(([school,count])=>({school,count,bonus:SCHOOL_TIERS[Math.min(6,count)]||0})).filter(x=>x.bonus);
 const main=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]||['NONE',0];
 const links=PAIRS.filter(([a,b])=>a!==b&&names.has(a)&&names.has(b)).map(([a,b,label,bonus,type,ability])=>({a,b,label,bonus,type,ability}));
 const perCard={};const byName={};
 for(const c of safe){
  const school=(schools.find(x=>x.school===c.school)?.bonus)||0;
  const mine=links.filter(x=>x.a===c.name||x.b===c.name);
  const bonded=mine.reduce((s,x)=>s+x.bonus,0);
  const bonus=Math.min(MAX_INDIVIDUAL,school+bonded);
  const detail={id:key(c),name:c.name,base:value(c)+(Number(c.level)||0),bonus,schoolBonus:school,linkBonus:Math.min(MAX_INDIVIDUAL-school,bonded),effective:value(c)+(Number(c.level)||0)+bonus,links:mine};
  perCard[key(c)]=detail;byName[c.name]=detail;
 }
 const schoolBonus=Math.max(0,...schools.map(x=>x.bonus));
 const raw=links.reduce((s,x)=>s+x.bonus,0);
 const duoBonus=links.filter(x=>x.type==='duo').reduce((s,x)=>s+x.bonus,0);
 const rivalryBonus=links.filter(x=>x.type==='rivalry').reduce((s,x)=>s+x.bonus,0);
 const totalBonus=safe.reduce((s,c)=>s+(byName[c.name]?.bonus||0),0);
 return {main,schools,links,schoolBonus,linkBonus:Math.min(20,raw),rawLinkBonus:raw,duoBonus:Math.min(20,duoBonus),rivalryBonus:Math.min(20,rivalryBonus),total: safe.length?totalBonus/safe.length:0,teamBonus:safe.length?totalBonus/safe.length:0,perCard,byName};
}
function preview(current,card){
 const before=evaluate(current),after=evaluate([...(current||[]),card]);
 const mine=after.byName[card.name]||{bonus:0,effective:value(card),links:[]};
 const changes=(current||[]).filter(Boolean).map(c=>({name:c.name,before:before.byName[c.name]?.effective||value(c),after:after.byName[c.name]?.effective||value(c)})).filter(x=>x.after>x.before);
 return {card:mine,changes,links:mine.links,improved:changes.length>0,kind:mine.links.some(x=>x.type==='rivalry')?'rivalry':mine.links.length?'duo':mine.bonus?'school':'none'};
}
function boostedSquad(cards){
 const report=evaluate(cards);
 return (cards||[]).map(c=>{
  const bonus=report.byName[c.name]?.bonus||0;
  return {...c,basePower:value(c),bondBonus:bonus,power:value(c)+bonus,attack:(Number(c.attack)||value(c))+bonus,defense:(Number(c.defense)||value(c))+bonus,set:(Number(c.set)||value(c))+bonus};
 });
}
return {PAIRS,SCHOOL_TIERS,MAX_INDIVIDUAL,evaluate,preview,boostedSquad};
});
