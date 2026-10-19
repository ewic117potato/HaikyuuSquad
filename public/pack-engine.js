/* V6 Premium Pack engine. Chances are per OPENED PACK, not per preview card.
   Shared testable module: Standard 98.9%, Elite 1%, Apex 0.1%.
   This game's economy is a prototype; browser state is not cheat-resistant. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SpikePacks=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const ODDS=Object.freeze({standard:98.9,elite:1,apex:0.1});
// Only notable characters with a documented adult storyline are included in Timeskip packs.
// Ordinary school reserves are never arbitrarily turned into 98-OVR pros.
const TIMESKIP_NAMES=new Set([
 'Shoyo Hinata','Tobio Kageyama','Wakatoshi Ushijima','Kotaro Bokuto',
 'Kiyoomi Sakusa','Atsumu Miya','Osamu Miya','Korai Hoshiumi','Wakatsu Kiryu',
 'Kenma Kozume','Tetsuro Kuroo','Kei Tsukishima','Toru Oikawa',
 'Yu Nishinoya','Keiji Akaashi','Morisuke Yaku','Aran Ojiro',
 'Rintaro Suna','Motoya Komori','Tatsuki Washio','Gao Hakuba',
 'Tsutomu Goshiki','Kanji Koganegawa','Takanobu Aone','Shinsuke Kita',
 'Hajime Iwaizumi','Ryunosuke Tanaka','Daichi Sawamura','Asahi Azumane'
]);
const APEX_NAMES=new Set(['Wakatoshi Ushijima','Tobio Kageyama','Kiyoomi Sakusa','Kotaro Bokuto','Atsumu Miya','Shoyo Hinata','Korai Hoshiumi','Wakatsu Kiryu']);
function rollTier(rng=Math.random){const x=Math.max(0,Math.min(.999999999999,Number(rng())||0));return x<0.001?'apex':x<0.011?'elite':'standard';}
function eliteCandidate(c){return c.stage>=1&&c.power>=91;}
function apexCandidate(c){return c.stage>=1&&APEX_NAMES.has(c.name);}
function upgradeCard(base,tier){if(!base||!['elite','apex'].includes(tier))throw Error('Invalid premium card');
 const apex=tier==='apex',b=apex?6:3,skill=apex?12:6;
 return {...base,key:`${base.key}:${tier}`,rarity:apex?5:4,
  packTier:tier,power:Math.min(100,base.power+b),
  attack:Math.min(100,base.attack+skill),defense:Math.min(100,base.defense+skill),set:Math.min(100,base.set+skill),
  variant:`${base.variant} · ${apex?'APEX':'ELITE'}`,ability:`${apex?'APEX AWAKENING':'ELITE FORM'} · ${base.ability}`};
}
function weightedChoose(items,rng=Math.random){if(!items?.length)throw Error('Empty pack pool');
 // Even among normal cards, higher rating = harder to pull.
 const weights=items.map(c=>{const score=c.packTier==='apex'?100:c.packTier==='elite'?98:c.power;return score>=100?.10:score>=98?.25:score>=95?.65:score>=90?1.8:score>=85?5:16;});
 const sum=weights.reduce((a,b)=>a+b,0);let x=Math.min(.999999999999,Math.max(0,Number(rng())||0))*sum;
 for(let i=0;i<items.length;i++){x-=weights[i];if(x<0)return items[i];}return items.at(-1);
}
function drawPack(catalog,stage,rng=Math.random){if(![2,3].includes(stage))throw Error('Only Timeskip and Professional packs are sold');
 const tier=rollTier(rng);
 let choices=catalog.filter(c=>c.stage===stage&&(c.packTier||'standard')===tier&&(stage===3?c.proOnly===true:!c.proOnly&&TIMESKIP_NAMES.has(c.name)));
 if(!choices.length)throw Error('No '+tier+' stage '+stage+' cards in this pack');
 return {tier,card:weightedChoose(choices,rng),odds:ODDS};
}
return {ODDS,APEX_NAMES,TIMESKIP_NAMES,rollTier,eliteCandidate,apexCandidate,upgradeCard,weightedChoose,drawPack};
});
