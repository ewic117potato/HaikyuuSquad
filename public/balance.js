/* HAIKYUU LEGENDS V8 — fame-aware player balance shared by browser and game server.
   Ratings are subjective game values, not canonical statistics from the series.
   Ordinary school drafts never distribute Timeskip or Pro cards: those are earned in the shop/quests.
*/
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SpikeBalance=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
// Exceptional athletes. 90+ is intentionally restricted to proven standouts.
const OVERRIDES=Object.freeze({
 'Wakatoshi Ushijima':99,'Tobio Kageyama':96,'Kiyoomi Sakusa':97,
 'Kotaro Bokuto':96,'Wakatsu Kiryu':97,'Korai Hoshiumi':96,
 'Atsumu Miya':95,'Toru Oikawa':94,'Aran Ojiro':93,
 'Nicollas Romero':96,'Motoya Komori':91,'Yu Nishinoya':90,
 'Tetsuro Kuroo':90,'Sachiro Hirugami':92,'Tatsuki Washio':90,
 'Shoyo Hinata':88,'Kenma Kozume':89,'Keiji Akaashi':87,
 'Osamu Miya':87,'Rintaro Suna':88,'Hajime Iwaizumi':89,
 'Satori Tendo':89,'Asahi Azumane':87,'Morisuke Yaku':89,
 'Reon Ohira':85,'Tsutomu Goshiki':84,'Daichi Sawamura':82,
 'Ryunosuke Tanaka':83,'Kei Tsukishima':85,'Koshi Sugawara':79,
 'Tadashi Yamaguchi':72,'Shinsuke Kita':85,'Eita Semi':82,
 'Kenjiro Shirabu':81,'Takanobu Aone':87,'Kanji Koganegawa':76,
 'Lev Haiba':80,'Takeru Nakashima':85,'Gao Hakuba':86,
 'Hayato Yamagata':80,'Akinori Konoha':82,'Shohei Fukunaga':80,
 'Taketora Yamamoto':83,'Chikara Ennoshita':75,'Hisashi Kinoshita':68,
 'Kazuhito Narita':69,'Yuki Shibayama':68,'Shigeru Yahaba':76,
 'Shinji Watari':79,'Yutaro Kindaichi':81,'Akira Kunimi':79,
 'Kenji Futakuchi':82,'Yasushi Kamasaki':80,'Kakeru Futamata':79,
 'Yuji Terushima':82,'Suguru Daisho':80,'Naoyasu Kuguri':79,
 'Tatsuto Sokolov':85,'Shugo Meian':86,'Shion Inunaki':83,
 'Oliver Barnes':82,'Adriah Tomas':83,'Alexandre Joffe':82,
 'Toshiro Heiwajima':83,'Fukuro Hirugami':85,'Keigo Nishiura':80,
 'Terutsugu Inubousaki':80,'Nagito Sarukui':82
});
const STAGES=Object.freeze(['High School','Nationals','Timeskip','Professional']);
// Ordinary school cards + occasional Nationals. Timeskip/Pro are SHOP + QUEST rewards.
const STAGE_CHANCES=Object.freeze([97,3,0,0]);
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
 let increase=s===0?0:s===1?(star?1:0):s===2?(star?3:start>=85?2:1):(star?5:start>=85?4:2);
 // Weak bench characters never become world-class merely from a different label.
 const cap=star?100:start>=85?94:start>=78?89:84;
 return Math.max(60,Math.min(cap,start+increase));
}
function weightFor(base,index){const n=ratingFor(base,index,0);return n>=97?.35:n>=94?.75:n>=90?1.5:n>=85?4:n>=78?8:15;}
function rarityFor(power){return power>=100?5:power>=97?4:power>=92?3:power>=85?2:power>=75?1:0;}
function buildCard(base,index,stage){const power=ratingFor(base,index,stage),pos=base.pos;
 return {key:`${index}-${stage}`,idx:index,stage,variant:STAGES[stage],name:base.name,school:base.school,
 position:pos,power,rarity:rarityFor(power),attack:Math.min(100,Math.max(60,power+(pos==='OH'||pos==='OP'?4:-3))),
 defense:Math.min(100,Math.max(60,power+(pos==='L'||pos==='MB'?4:-3))),set:Math.min(100,Math.max(60,power+(pos==='S'?4:-5))),
 portrait:`portraits/${String(index).padStart(2,'0')}.svg`,ability:base.ability||'Team Specialist',proOnly:!!base.proOnly};
}
return {OVERRIDES,STAGES,STAGE_CHANCES,ALLOWED_OVER_90,schoolBaseline,versionForRoll,ratingFor,weightFor,rarityFor,buildCard};
});
