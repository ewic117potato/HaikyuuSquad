/* V26 Nationals Road: separate 100-stage ordered progression; original six-round
   Nationals remains available. All rewards are one-time and saved by game-v3. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SpikeV26Progress=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const CHAPTER_NAMES=['Opening Qualifiers','Rising Challengers','Tokyo Training Camp','Miyagi Grand Prix','Interhigh Road','Clash of Setters','The Iron Wall','Ace Showdown','Road to Spring High','National Debut','Nationals: Top 32','Nationals: Top 16','Unbreakable Defences','Powerhouse Attacks','Elite Nationals','Legendary Rivals','The All-Star Circuit','Professional Trials','Ultimate Six','National Legends'];
 const OPPONENTS=['TSUBAKIHARA','JOHZENJI','DATE TECH','NEKOMA','AOBA JOHSAI','SHIRATORIZAWA','FUKURODANI','INARIZAKI','KAMOMEDAI','MUJINAZAKA','ITACHIYAMA','SARUKAWA TECH','NOHEBI','KARASUNO','INUBUSHI HIGASHI','ICHIBAYASHI'];
 const MECHANICS=['Float serve pressure','Deep-court coverage','Fast middle attacks','Read blocking','Setter duels','Power spikes','Defensive endurance','Triple blocks','Cross-court angles','Twin Quick combinations','Precise jump serves','Final-point pressure'];
 const STAGES=Object.freeze(Array.from({length:100},(_,index)=>{
  const number=index+1,chapter=Math.floor(index/5);
  const boss=number%5===0;
  return Object.freeze({number,chapter,school:OPPONENTS[(index*7+chapter*3+(boss?4:0))%OPPONENTS.length],feature:MECHANICS[(index+chapter)%MECHANICS.length],power:Math.round(Math.min(125,70+chapter*2.0+(index%5)*1.9+(boss?4:0))),boss});
 }));
 function chapter(index){const i=Math.max(0,Math.min(19,Number(index)||0));return {index:i,name:CHAPTER_NAMES[i],stages:STAGES.slice(i*5,i*5+5)};}
 const milestones=Object.freeze({5:90,10:92,20:94,30:96,50:98,75:99,100:100});
 function reward(stage){const num=Number(stage);if(!Number.isInteger(num)||num<1||num>100)throw Error('Invalid Nationals Road stage');return {coins:300+num*75+(num%5===0?1500:0),tickets:num%5===0?20:2,rerolls:num%5===0?10:0,minPower:milestones[num]||0,proTokens:num===100?1:0};}
 function canPlay(cleared,number){return Number.isInteger(number)&&number>=1&&number<=100&&number===Math.max(0,Math.min(100,Number(cleared)||0))+1;}
 return {STAGES,CHAPTER_NAMES,chapter,reward,canPlay,milestones};
});
