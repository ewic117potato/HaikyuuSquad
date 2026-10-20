'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const G=require('../public/gauntlet-engine.js');
assert.equal(G.STAGES.length,57);assert.equal(G.CHAPTERS.length,7);
assert.deepEqual(G.CHAPTERS.map(x=>x.length),[9,8,8,8,8,8,8]);
for(let i=0;i<57;i++){
 const stage=G.STAGES[i],chapter=G.chapterForStage(i),r=G.firstClearReward(stage);
 assert.equal(stage.index,i);assert.equal(stage.chapter,chapter.index);assert(i>=chapter.start&&i<=chapter.finish);
 assert(r.tickets>=4&&r.rerolls>=2);assert(stage.power>=60&&stage.power<=115);
 if(stage.boss){assert.equal(r.tickets,20);assert.equal(r.rerolls,10);}
}
assert.equal(G.STAGES[0].school,'DATE TECH');assert.equal(G.STAGES[8].school,'KARASUNO');
assert.equal(G.STAGES[56].school,'KARASUNO');assert.equal(G.earnedChapters(57),7);
assert.equal(G.firstClearReward(G.STAGES[56]).proTokens,1);
assert.equal(G.opponentPower(G.STAGES[56]),G.STAGES[56].power);
const storage={},elements=new Map();
function el(k){if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){},toggle(){}},style:{},dataset:{},addEventListener(){},focus(){},setSelectionRange(){},appendChild(){}});return elements.get(k);}
const now=new Date();const fake={
 document:{querySelector:el,querySelectorAll:()=>[],body:{dataset:{},appendChild(){}},addEventListener(){},getElementById:el},
 console,crypto:crypto.webcrypto,Date,Math,URL,URLSearchParams,Intl,
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>{storage[k]=v;}},
 window:{scrollTo(){},queueCloudSave(){}},navigator:{},location:{search:'',origin:'http://localhost'},
 setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},WebSocket:function(){}
};
const ctx=vm.createContext(fake);
for(const name of ['roster-data.js','balance.js','draft-rules.js','team-chemistry.js','pack-engine.js','nationals-engine.js','gauntlet-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+name,'utf8'),ctx,{filename:name});
const evalJS=src=>vm.runInContext(src,ctx);
assert.equal(evalJS('CAREER_SCHOOLS.length'),57);
assert.equal(evalJS('state.career'),0);
assert(evalJS('careerPage().includes("57 / 57")')===false);
assert(evalJS('careerPage().includes("20 school rolls")'));
assert(evalJS('careerPage().includes("boss")'));
assert(evalJS('questsPage().includes("20 ROLLS PER BIG DAILY QUEST")'));
assert(evalJS('home().includes("57 STAGES")'));
assert(evalJS('DAILY.filter(x=>x[5].tickets===20).length')>=10);
assert(evalJS('WEEKLY.filter(x=>x[5].tickets>=30).length')>=12);
assert(evalJS('QUESTLINE.filter(x=>x[4].tickets>=20).length')>=20);
assert(evalJS('DAILY.some(x=>x[3]==="careerWins")'));
assert(evalJS('WEEKLY.some(x=>x[3]==="bossWins")'));
const t0=evalJS('state.tickets');const rr0=evalJS('state.v3.rerolls');
evalJS('state.v3.quests.picks=8');evalJS("claimQuest('daily|d18-scout8')");
assert.equal(evalJS('state.tickets'),t0+20);assert.equal(evalJS('state.v3.rerolls'),rr0+5);
evalJS("claimQuest('daily|d18-scout8')");assert.equal(evalJS('state.tickets'),t0+20);
evalJS('state.v3.weekly.careerWins=12');evalJS("claimQuest('weekly|w18-circuit12')");
assert.equal(evalJS('state.tickets'),t0+60);assert.equal(evalJS('state.v3.rerolls'),rr0+25);
evalJS('state.career=1');evalJS("claimQuest('milestone|m18-first-school')");
assert.equal(evalJS('state.tickets'),t0+80);
evalJS("claimQuest('milestone|m18-first-school')");assert.equal(evalJS('state.tickets'),t0+80);
// One-time first clear: both progression and rewards carry across refreshes.
const brolls=evalJS('state.tickets'),bre=evalJS('state.v3.rerolls');
const bmoney=evalJS('state.coins');
assert(evalJS('awardCareerFirstClear(CAREER_STAGES[8])'));
assert.equal(evalJS('state.tickets'),brolls+20);assert.equal(evalJS('state.v3.rerolls'),bre+10);
assert(evalJS('state.coins')>bmoney);
assert.equal(evalJS('state.v3.careerCardsClaimed[8]'),true);
assert.equal(evalJS('awardCareerFirstClear(CAREER_STAGES[8])'),null);
assert.equal(evalJS('state.tickets'),brolls+20);
assert.equal(JSON.parse(storage['spike-legends-save-v1']).v3.careerCardsClaimed['8'],true);
// Opponents really become stronger at later stages, not just a label.
const easy=evalJS('schoolOpponentRoster("KARASUNO",70).reduce((s,p)=>s+p.power,0)');
const hard=evalJS('schoolOpponentRoster("KARASUNO",110).reduce((s,p)=>s+p.power,0)');
assert(hard>easy+100,`power scaling was ineffective: ${easy}, ${hard}`);
// Escalating and retro-compatibility: current chapter remains visible after old saves.
evalJS('state.career=9;careerChapter=1');
assert(evalJS('careerPage().includes("Tokyo Invitational")'));
assert(evalJS('careerPage().includes("Kenma")'));
assert.equal(evalJS('Gauntlet.chapterForStage(9).index'),1);
const html=fs.readFileSync('public/index.html','utf8');
assert(html.includes('<script src="tactical-engine.js"></script>')&&html.includes('<script src="gauntlet-engine.js"></script>'));
assert(html.includes('v18-gauntlet.css'));
console.log('PASS V18: 57 stage Gauntlet, 7 chapters, 20-roll bosses, stronger AI, repeatable 20-roll daily quests, weekly quests, milestones, save migration and one-time claims.');
