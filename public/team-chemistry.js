/* V14 squad links: shared between browser and multiplayer server.
   All figures are in-game effective OVR bonuses, not canon ratings. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SpikeChemistry=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const PAIRS=Object.freeze([
 ['Shoyo Hinata','Tobio Kageyama','Freak Quick',3,'duo'],
 ['Kotaro Bokuto','Keiji Akaashi','Ace and Setter',3,'duo'],
 ['Tetsuro Kuroo','Kenma Kozume','Childhood Connection',2,'duo'],
 ['Atsumu Miya','Osamu Miya','Miya Twins',3,'duo'],
 ['Toru Oikawa','Hajime Iwaizumi','Perfect Partnership',3,'duo'],
 ['Wakatoshi Ushijima','Satori Tendo','Shiratorizawa Power',2,'duo'],
 ['Daichi Sawamura','Koshi Sugawara','Captain’s Trust',2,'duo'],
 ['Kiyoomi Sakusa','Motoya Komori','Cousin Connection',2,'duo'],
 ['Korai Hoshiumi','Sachiro Hirugami','Seagull Fortress',2,'duo'],
 ['Wakatsu Kiryu','Michiru Usuri','Mujinazaka Ace',2,'duo'],
 ['Shoyo Hinata','Kenma Kozume','Garbage Dump Rivalry',3,'rivalry'],
 ['Tobio Kageyama','Toru Oikawa','Rival Setters',3,'rivalry'],
 ['Shoyo Hinata','Korai Hoshiumi','Little Giants',3,'rivalry'],
 ['Kotaro Bokuto','Tetsuro Kuroo','Friendly Rivals',2,'rivalry'],
 ['Wakatoshi Ushijima','Toru Oikawa','Miyagi Rivals',3,'rivalry'],
 ['Shoyo Hinata','Wakatoshi Ushijima','Challenging the Ace',2,'rivalry'],
 ['Kei Tsukishima','Tetsuro Kuroo','Blocking Lessons',2,'rivalry'],
 ['Shoyo Hinata','Kotaro Bokuto','Ace Mentorship',2,'rivalry']
]);
const SCHOOL_TIERS=Object.freeze({2:1,3:2,4:3,5:4,6:5});
function evaluate(cards=[]){
 const safe=Array.isArray(cards)?cards.filter(Boolean):[];
 const counts={},names=new Set();
 for(const c of safe){if(!c.name)continue;names.add(c.name);counts[c.school]=(counts[c.school]||0)+1;}
 const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 const main=sorted[0]||['NONE',0];
 const schools=Object.entries(counts).map(([school,count])=>({school,count,bonus:SCHOOL_TIERS[Math.min(6,count)]||0})).filter(x=>x.bonus>0);
 const schoolBonus=Math.max(0,...schools.map(x=>x.bonus));
 const links=PAIRS.filter(([a,b])=>names.has(a)&&names.has(b)).map(([a,b,label,bonus,type])=>({a,b,label,bonus,type}));
 const garbage=(counts.KARASUNO||0)>=2&&(counts.NEKOMA||0)>=2;
 if(garbage)links.push({a:'KARASUNO',b:'NEKOMA',label:'Garbage Dump Showdown',bonus:2,type:'rivalry'});
 const raw=links.reduce((acc,link)=>acc+link.bonus,0);
 const linkBonus=Math.min(12,raw);
 const duoBonus=Math.min(12,links.filter(x=>x.type==='duo').reduce((a,c)=>a+c.bonus,0));
 const rivalryBonus=Math.min(12,links.filter(x=>x.type==='rivalry').reduce((a,c)=>a+c.bonus,0));
 return {main,schools,schoolBonus,links,rawLinkBonus:raw,linkBonus,duoBonus,rivalryBonus,total:schoolBonus+linkBonus};
}
return {PAIRS,SCHOOL_TIERS,evaluate};
});
