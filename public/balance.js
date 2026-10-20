/* HAIKYUU LEGENDS V8 — fame-aware player balance shared by browser and game server.
   Ratings are subjective game values, not canonical statistics from the series.
   Ordinary school drafts never distribute Timeskip or Pro cards: those are earned in the shop/quests.
*/
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SpikeBalance=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
// Exceptional athletes. 90+ is intentionally restricted to proven standouts.
const OVERRIDES=Object.freeze({
 // Canonical identity is unknown: gameplay ratings for unnamed supporting roster slots.
 'Itachiyama Reserve #2':84,
 'Itachiyama Reserve #4':81,
 'Itachiyama Reserve #5':83,
 'Itachiyama Reserve #6':79,
 'Itachiyama Reserve #8':80,
 'Itachiyama Reserve #9':78,

 'Hayato Ikejiri':78,
 'Hikaru Komaki':77,
 'Motoki Teradomari':88,
 'Kazuma Numai':82,
 'Tamahiko Teshiro':76,
 'So Inuoka':80,
 'Liam Tokura':77,
 'Kazuyoshi Bessho':80,
 'Izuru Nozawa':82,
 'Keiichiro Kanbayashi':81,
 'Aikichi Suwa':84,
 'Tsukasa Iizuna':92,
 'Taichi Kawanishi':81,
 'Yusho Sagae':73,
 'Kai Akakura':75,
 'Shuichi Anahori':76,
 'Wataru Onaga':80,
 'Yamato Sarukui':83,
 'Haruki Komi':82,
 'Ren Omimi':84,
 'Hitoshi Ginjima':83,
 'Michinari Akagi':85,
 'Nozomu Mami':83,
 'Keisuke Unnan':85,
 'Michiru Usuri':89,
 'Nobuyuki Kai':82,
 'Wakatoshi Ushijima':99,'Tobio Kageyama':96,'Kiyoomi Sakusa':97,
 'Kotaro Bokuto':96,'Wakatsu Kiryu':97,'Korai Hoshiumi':97,
 'Atsumu Miya':96,'Toru Oikawa':95,'Aran Ojiro':94,
 'Nicollas Romero':96,'Motoya Komori':93,'Yu Nishinoya':90,
 'Tetsuro Kuroo':92,'Sachiro Hirugami':92,'Tatsuki Washio':86,
 'Shoyo Hinata':92,'Kenma Kozume':89,'Keiji Akaashi':91,
 'Osamu Miya':91,'Rintaro Suna':90,'Hajime Iwaizumi':90,
 'Satori Tendo':90,'Asahi Azumane':89,'Morisuke Yaku':91,
 'Reon Ohira':87,'Tsutomu Goshiki':85,'Daichi Sawamura':83,
 'Ryunosuke Tanaka':84,'Kei Tsukishima':86,'Koshi Sugawara':81,
 'Tadashi Yamaguchi':76,'Shinsuke Kita':83,'Eita Semi':85,
 'Kenjiro Shirabu':83,'Takanobu Aone':93,'Kanji Koganegawa':83,
 'Lev Haiba':82,'Takeru Nakashima':85,'Gao Hakuba':86,
 'Hayato Yamagata':84,'Akinori Konoha':84,'Shohei Fukunaga':83,
 'Taketora Yamamoto':85,'Chikara Ennoshita':75,'Hisashi Kinoshita':72,
 'Kazuhito Narita':72,'Yuki Shibayama':75,'Shigeru Yahaba':79,
 'Shinji Watari':82,'Yutaro Kindaichi':82,'Akira Kunimi':78,
 'Kenji Futakuchi':85,'Yasushi Kamasaki':82,'Kakeru Futamata':79,
 'Yuji Terushima':84,'Suguru Daisho':85,'Naoyasu Kuguri':79,
 'Tatsuto Sokolov':85,'Shugo Meian':86,'Shion Inunaki':83,
 'Oliver Barnes':82,'Adriah Tomas':83,'Alexandre Joffe':82,
 'Toshiro Heiwajima':83,'Fukuro Hirugami':85,'Keigo Nishiura':80,
 'Terutsugu Inubousaki':80,'Nagito Sarukui':82
});
const STAGES=Object.freeze(['High School','Nationals','Timeskip','Professional']);
// Normal school rolls give the single High School version only. Nationals and adult versions are quest/pack rewards.
const STAGE_CHANCES=Object.freeze([100,0,0,0]);
const PRO_OVERRIDES=Object.freeze({
 'Wakatoshi Ushijima':105,'Tobio Kageyama':104,'Kiyoomi Sakusa':105,
 'Atsumu Miya':104,'Shoyo Hinata':103,'Kotaro Bokuto':103,
 'Korai Hoshiumi':104,'Wakatsu Kiryu':103,'Nicollas Romero':103,
 'Tatsuki Washio':99,'Rintaro Suna':98,'Motoya Komori':99,'Aran Ojiro':99
});
const NATIONALS_OVERRIDES=Object.freeze({
 'Shoyo Hinata':95,'Tobio Kageyama':99,'Kotaro Bokuto':98,
 'Atsumu Miya':98,'Kiyoomi Sakusa':98,'Korai Hoshiumi':99,
 'Kenma Kozume':93,'Tetsuro Kuroo':95,'Kei Tsukishima':91,
 'Yu Nishinoya':94,'Wakatsu Kiryu':99
});
const TIMESKIP_OVERRIDES=Object.freeze({
 'Shoyo Hinata':100,'Tobio Kageyama':102,'Kotaro Bokuto':101,
 'Atsumu Miya':101,'Korai Hoshiumi':101,'Wakatoshi Ushijima':102,
 'Kei Tsukishima':94
});
const ALLOWED_OVER_90=new Set(Object.entries(OVERRIDES).filter(([,v])=>v>=90).map(([n])=>n));
function versionForRoll(random=Math.random){let n=Math.min(.999999999,Math.max(0,Number(random())||0))*100;for(let i=0;i<STAGE_CHANCES.length;i++){n-=STAGE_CHANCES[i];if(n<0)return i;}return 0;}
function schoolBaseline(base,index){
 const stated=OVERRIDES[base.name];
 if(stated!==undefined)return stated;
 // Known professionals without a dedicated rank still aren't automatically 98 OVR.
 if(base.proOnly)return 75+(index*7+3)%10;
 if(base.secret)return 78+(index*5+2)%9;
 if(index<60)return 67+(index*7+3)%13;
 return 60+(index*7+5)%17;
}
function ratingFor(base,index,stage){
 const s=Math.max(0,Math.min(3,Number(stage)|0));
 const start=schoolBaseline(base,index);
 const star=start>=90;
 if(s===3){
  if(PRO_OVERRIDES[base.name]!==undefined)return PRO_OVERRIDES[base.name];
  return Math.max(78,Math.min(start>=85?101:94,start+(star?5:start>=85?4:3)));
 }
 if(s===2)return TIMESKIP_OVERRIDES[base.name]??Math.min(103,start+(star?4:start>=85?3:2));
 if(s===1&&NATIONALS_OVERRIDES[base.name]!=null)return NATIONALS_OVERRIDES[base.name];
 const increase=s===0?0:(star?1:0);
 const cap=star?100:start>=85?94:start>=78?89:84;
 return Math.max(60,Math.min(cap,start+increase));
}
// School scouting is meant to be fun, not a premium-packs lottery.
// A school Kageyama remains exceptional but is no longer near-impossible.
// Sakusa is not forced by Itachiyama's formerly three-person pool.
function weightFor(base,index){
 if(base.name==='Tobio Kageyama'&&base.school==='KARASUNO')return 16;
 if(base.name==='Kiyoomi Sakusa'&&base.school==='ITACHIYAMA')return 3;
 const n=ratingFor(base,index,0);
 if(n>=99)return 5;
 if(n>=97)return 6;
 if(n>=94)return 9;
 if(n>=90)return 10;
 if(n>=85)return 11;
 if(n>=78)return 13;
 return 12;
}
function rarityFor(power){return power>=100?5:power>=97?4:power>=92?3:power>=85?2:power>=75?1:0;}
function buildCard(base,index,stage){const power=ratingFor(base,index,stage),pos=base.pos,legacyId=Number.isInteger(base.id)?base.id:index;
 return {key:`${legacyId}-${stage}`,idx:legacyId,stage,variant:STAGES[stage],name:base.name,school:base.school,
 position:pos,power,rarity:rarityFor(power),attack:Math.min(115,Math.max(60,power+(pos==='OH'||pos==='OP'?4:-3))),
 defense:Math.min(115,Math.max(60,power+(pos==='L'||pos==='MB'?4:-3))),set:Math.min(115,Math.max(60,power+(pos==='S'?4:-5))),
 portrait:`portraits/${String(legacyId).padStart(2,'0')}.svg`,ability:base.ability||'Team Specialist',proOnly:!!base.proOnly};
}
return {OVERRIDES,PRO_OVERRIDES,NATIONALS_OVERRIDES,TIMESKIP_OVERRIDES,STAGES,STAGE_CHANCES,ALLOWED_OVER_90,schoolBaseline,versionForRoll,ratingFor,weightFor,rarityFor,buildCard};
});
