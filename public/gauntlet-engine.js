/* V18 School Gauntlet: persistent 57-stage PvE campaign. Pure data and reward rules.
   Initial nine stage indexes deliberately preserved for existing users. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SpikeGauntlet=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const CHAPTER_NAMES=['Opening School Circuit','Tokyo Invitational','Miyagi Grand Prix','Interhigh Road','Spring High Showdown','Elite Nationals','Ultimate School Gauntlet'];
const RAW=[
  {school:'DATE TECH',power:66,title:'Iron Wall Fundamentals'},
  {school:'AOBA JOHSAI',power:72,title:'The Grand Setter'},
  {school:'NEKOMA',power:77,title:'Cats on Defence'},
  {school:'FUKURODANI',power:81,title:'The Ace Awakens'},
  {school:'KAMOMEDAI',power:85,title:'Seagull Block'},
  {school:'INARIZAKI',power:89,title:'Foxes on the Court'},
  {school:'SHIRATORIZAWA',power:91,title:'Left-Handed Cannon'},
  {school:'MUJINAZAKA',power:94,title:'Top-Five Ace'},
  {school:'KARASUNO',power:98,title:'Battle of the Crows'},
  {school:'NEKOMA',power:80,title:'Red Court Warm-Up'},
  {school:'NOHEBI',power:82,title:'Snake Eyes'},
  {school:'FUKURODANI',power:84,title:'Owl Formation'},
  {school:'JOHZENJI',power:86,title:'Party Volleyball'},
  {school:'NEKOMA',power:88,title:'Kenma’s Calculation'},
  {school:'FUKURODANI',power:90,title:'Bokuto’s Cross'},
  {school:'KARASUNO',power:92,title:'Crows in the Capital'},
  {school:'NEKOMA',power:97,title:'Garbage Dump Showdown'},
  {school:'DATE TECH',power:84,title:'Opening Iron Wall'},
  {school:'AOBA JOHSAI',power:86,title:'The Setter Test'},
  {school:'TOKONAMI',power:88,title:'An Honest Fight'},
  {school:'SHIRATORIZAWA',power:90,title:'The Academy Standard'},
  {school:'KARASUNO',power:92,title:'Freak Quick Trial'},
  {school:'DATE TECH',power:94,title:'Aone’s Double Block'},
  {school:'AOBA JOHSAI',power:96,title:'Oikawa’s Final Serve'},
  {school:'SHIRATORIZAWA',power:101,title:'The King of Miyagi'},
  {school:'TSUBAKIHARA',power:88,title:'Airport Arrival'},
  {school:'INARIZAKI',power:90,title:'Fox Formation'},
  {school:'KAMOMEDAI',power:92,title:'Sky High Defence'},
  {school:'ITACHIYAMA',power:94,title:'The Unseen Power'},
  {school:'MUJINAZAKA',power:96,title:'Kiryū’s Assault'},
  {school:'FUKURODANI',power:98,title:'Bokuto’s Storm'},
  {school:'INARIZAKI',power:100,title:'The Miya Twin Attack'},
  {school:'KARASUNO',power:105,title:'National Contenders'},
  {school:'NEKOMA',power:92,title:'A Rematch at Nationals'},
  {school:'SHIRATORIZAWA',power:94,title:'Break the Cannon'},
  {school:'DATE TECH',power:96,title:'The Steel Fortress'},
  {school:'AOBA JOHSAI',power:98,title:'The Ultimate Setter'},
  {school:'KAMOMEDAI',power:100,title:'Little Giant Rival'},
  {school:'MUJINAZAKA',power:102,title:'Triple Attack'},
  {school:'ITACHIYAMA',power:104,title:'Sakusa’s Spin'},
  {school:'INARIZAKI',power:109,title:'The Final Foxes'},
  {school:'FUKURODANI',power:96,title:'An Ace Among Aces'},
  {school:'SHIRATORIZAWA',power:98,title:'One-Handed Dominance'},
  {school:'KARASUNO',power:100,title:'The Crow’s Final Flight'},
  {school:'NEKOMA',power:102,title:'Court of Strategy'},
  {school:'MUJINAZAKA',power:104,title:'World-Class Power'},
  {school:'KAMOMEDAI',power:106,title:'Fortress in the Sky'},
  {school:'ITACHIYAMA',power:108,title:'The Seeded Champions'},
  {school:'FUKURODANI',power:113,title:'National Crown'},
  {school:'DATE TECH',power:100,title:'Unbreakable Iron Wall'},
  {school:'AOBA JOHSAI',power:102,title:'Perfect Serves'},
  {school:'NEKOMA',power:104,title:'Unshakeable Floor'},
  {school:'INARIZAKI',power:106,title:'Synchronized Foxes'},
  {school:'KAMOMEDAI',power:108,title:'The Highest Block'},
  {school:'ITACHIYAMA',power:110,title:'The 100-Point Wall'},
  {school:'SHIRATORIZAWA',power:112,title:'Ushijima Unleashed'},
  {school:'KARASUNO',power:115,title:'Legend of the Spring High'}
];
const STAGES=Object.freeze(RAW.map((stage,index)=>Object.freeze({...stage,index,chapter:index<9?0:1+Math.floor((index-9)/8),boss:index===8||(index>8&&(index-9)%8===7)})));
const CHAPTERS=Object.freeze(CHAPTER_NAMES.map((name,index)=>Object.freeze({name,index,start:index===0?0:9+(index-1)*8,length:index===0?9:8,finish:index===0?8:9+index*8-1})));
const REWARDS=Object.freeze({firstClearBossRolls:20,firstClearBossRerolls:10});
function firstClearReward(stage){
 if(!stage||!Number.isInteger(stage.index)||!STAGES[stage.index])return null;
 const boss=Boolean(stage.boss);
 return {tickets:boss?20:Math.min(10,4+Math.floor(stage.index/10)),rerolls:boss?10:Math.min(5,2+Math.floor(stage.index/16)),coins:boss?1800+stage.chapter*900:450+stage.chapter*160,gems:boss?30+stage.chapter*10:0,
 tokens:boss&&stage.chapter>=3?1:0,proTokens:boss&&stage.chapter===6?1:0};
}
function opponentPower(stage){return Math.min(115,Math.max(60,Number(stage?.power)||70));}
function chapterForStage(index){return CHAPTERS[Math.max(0,Math.min(6,index<=8?0:1+Math.floor((index-9)/8)))];}
function earnedChapters(clears){return CHAPTERS.filter(x=>clears>x.finish).length;}
return {STAGES,CHAPTERS,REWARDS,firstClearReward,opponentPower,chapterForStage,earnedChapters};
});
