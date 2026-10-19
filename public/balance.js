/* Shared card balancing for browser and Render. Ratings are game-design interpretations,
 * not official Haikyuu rankings. Keeping this shared avoids different scores online. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SpikeBalance=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const OVERRIDES={
 'Wakatoshi Ushijima':99,'Tobio Kageyama':96,'Kiyoomi Sakusa':97,'Kotaro Bokuto':96,
 'Atsumu Miya':96,'Toru Oikawa':95,'Korai Hoshiumi':96,'Aran Ojiro':93,
 'Tetsuro Kuroo':93,'Kenma Kozume':91,'Shoyo Hinata':90,'Kei Tsukishima':87,
 'Yu Nishinoya':94,'Morisuke Yaku':93,'Motoya Komori':94,'Keiji Akaashi':92,
 'Osamu Miya':91,'Rintaro Suna':91,'Hajime Iwaizumi':91,'Satori Tendo':92,
 'Asahi Azumane':91,'Ryunosuke Tanaka':86,'Daichi Sawamura':85,'Koshi Sugawara':83,
 'Tadashi Yamaguchi':76,'Tsutomu Goshiki':86,'Shinsuke Kita':88,'Eita Semi':85,
 'Kenjiro Shirabu':85,'Sachiro Hirugami':94,'Takanobu Aone':91,'Kanji Koganegawa':79,
 'Lev Haiba':85,'Takeru Nakashima':88,'Gao Hakuba':91,'Wakatsu Kiryu':97,
 'Reon Ohira':89,'Hayato Yamagata':84,'Akinori Konoha':86,'Shohei Fukunaga':84,
 'Taketora Yamamoto':86,'Chikara Ennoshita':77,'Hisashi Kinoshita':71,
 'Kazuhito Narita':70,'Yuki Shibayama':71,'Shigeru Yahaba':78,
 'Shinji Watari':81,'Yutaro Kindaichi':85,'Akira Kunimi':83
};
const STAGES=['High School','Nationals','Timeskip','Professional'];
const STAGE_CHANCES=[95,3,1,1]; // 95% regular school, combined 5% rare versions
function versionForRoll(random=Math.random){let n=random()*100;for(let i=0;i<STAGE_CHANCES.length;i++){n-=STAGE_CHANCES[i];if(n<0)return i;}return 3;}
function ratingFor(base,index,stage){
 const known=OVERRIDES[base.name];
 const baseline=known!==undefined?known:(base.proOnly?93+index%8:Math.min(89,60+(index*11+7)%29));
 const bonus=[0,2,5,8][Math.max(0,Math.min(3,stage|0))];
 return Math.max(60,Math.min(100,baseline+bonus));
}
function weightFor(base,index){const n=ratingFor(base,index,0);return n>=97?1:n>=92?2:n>=85?5:n>=75?9:16;}
function rarityFor(power){return power>=100?5:power>=97?4:power>=92?3:power>=85?2:power>=75?1:0;}
function buildCard(base,index,stage){const power=ratingFor(base,index,stage),pos=base.pos;return {
 key:`${index}-${stage}`,idx:index,stage,variant:STAGES[stage],name:base.name,school:base.school,
 position:pos,power,rarity:rarityFor(power),attack:Math.min(100,Math.max(60,power+(pos==='OH'||pos==='OP'?4:-3))),
 defense:Math.min(100,Math.max(60,power+(pos==='L'||pos==='MB'?4:-3))),
 set:Math.min(100,Math.max(60,power+(pos==='S'?4:-5))),
 portrait:`portraits/${String(index).padStart(2,'0')}.svg`,ability:base.ability||'Team Specialist',proOnly:!!base.proOnly
};}
return {OVERRIDES,STAGES,STAGE_CHANCES,versionForRoll,ratingFor,weightFor,rarityFor,buildCard};
});
