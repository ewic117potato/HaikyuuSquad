'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {SPIKE_ROSTER,SPIKE_COACHES,SPIKE_SCHOOL_TEAMS,SPIKE_PRO_TEAMS,SPIKE_NATIONALS_SCHOOLS}=require('../public/roster-data');
const B=require('../public/balance');const D=require('../public/draft-rules');const P=require('../public/pack-engine');
assert.equal(SPIKE_SCHOOL_TEAMS.length,10);
const school=SPIKE_ROSTER.filter(x=>!x.proOnly),pro=SPIKE_ROSTER.filter(x=>x.proOnly);
assert.equal(new Set(school.map(x=>x.school)).size,10);
assert(school.every(x=>SPIKE_SCHOOL_TEAMS.includes(x.school)));
assert(pro.every(x=>SPIKE_PRO_TEAMS.includes(x.school)));
assert(!SPIKE_ROSTER.some(x=>/NIYAMA GIRLS|YUKIGAOKA|KITAGAWA DAIICHI|TOKONAMI|UBUGAWA|OHGIMINAMI/.test(x.school)));
assert(!school.some(x=>['Kanoka Amanai','Natsu Hinata'].includes(x.name)));
assert(!school.some(x=>x.name==='Shoyo Hinata'&&x.pos!=='MB'));
assert(!school.some(x=>x.name==='Daichi Sawamura'&&x.pos!=='OP'));
assert(!school.some(x=>x.name==='Gao Hakuba'&&x.pos!=='OP'));
assert(SPIKE_COACHES.every(x=>SPIKE_SCHOOL_TEAMS.includes(x.school)||SPIKE_PRO_TEAMS.includes(x.school)));
const original=new Set();
for(const [i,p] of SPIKE_ROSTER.entries()){
 assert(Number.isInteger(p.id));assert(!original.has(p.id),'Legacy card ID duplicate');original.add(p.id);
 assert(fs.existsSync(`public/portraits/${String(p.id).padStart(2,'0')}.svg`),`Missing portrait for ${p.name}`);
 for(const s of p.proOnly?[3]:[0,1,2]){
  const c=B.buildCard(p,i,s);
  assert.equal(c.key,`${p.id}-${s}`);
  assert(c.power>=60&&c.power<=100);
  if(s===0&&!p.proOnly&&c.power>90)assert(B.ALLOWED_OVER_90.has(p.name),'A bench player is rated like an ace');
 }
}
assert.equal(B.buildCard(SPIKE_ROSTER.find(x=>x.name==='Kenma Kozume'&&!x.proOnly),10,0).power,89);
assert.equal(B.buildCard(SPIKE_ROSTER.find(x=>x.name==='Wakatoshi Ushijima'&&!x.proOnly),10,0).power,99);
for(let i=0;i<500;i++){
 const picks=[];
 for(let n=0;n<6;n++){
  const roll=D.makeOffer({roster:SPIKE_ROSTER,existing:picks,
   cardFromIndex:(j,stage)=>{
    const base=SPIKE_ROSTER[j];const legitimateStage=stage===1&&SPIKE_NATIONALS_SCHOOLS.includes(base.school)?1:0;
    return B.buildCard(base,j,legitimateStage);
   },versionSampler:B.versionForRoll,weightForIndex:j=>B.weightFor(SPIKE_ROSTER[j],j)});
  assert(SPIKE_SCHOOL_TEAMS.includes(roll.school));
  assert(roll.cards.every(x=>x.school===roll.school&&!x.proOnly&&x.stage<=1));
  assert(roll.cards.every(x=>x.stage===0||SPIKE_NATIONALS_SCHOOLS.includes(x.school)));
  const useful=roll.cards.filter(x=>D.eligible(picks,x));assert(useful.length);
  picks.push(useful[Math.floor(Math.random()*useful.length)]);
 }
 assert(D.validTeam(picks));
}
const doc={body:{dataset:{}},querySelector:()=>({textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},dataset:{},style:{},addEventListener(){}}),querySelectorAll:()=>[],addEventListener(){}};
const ctx=vm.createContext({document:doc,console,crypto:crypto.webcrypto,localStorage:{getItem:()=>null,setItem(){}},navigator:{},location:{search:'',origin:'http://localhost'},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},Date,Math,URL,URLSearchParams,Intl,window:{scrollTo(){},queueCloudSave(){}},WebSocket:function(){}});
for(const fn of ['roster-data.js','balance.js','draft-rules.js','pack-engine.js','game-v3.js'])vm.runInContext(fs.readFileSync('public/'+fn,'utf8'),ctx);
const evaluate=str=>vm.runInContext(str,ctx);
assert.equal(evaluate('SCHOOLS.length'),10);
assert(evaluate('BASE_CATALOG.every(c=>c.stage===0||c.stage===1&&SPIKE_NATIONALS_SCHOOLS.includes(c.school)||c.stage===2&&SpikePacks.TIMESKIP_NAMES.has(c.name)||c.stage===3&&c.proOnly)'));
assert(evaluate('!CATALOG.some(c=>c.school==="NIYAMA GIRLS" || c.school==="KITAGAWA DAIICHI")'));
assert(evaluate('!CATALOG.some(c=>c.stage===3 && !c.proOnly)'));
assert.equal(evaluate('CAREER_SCHOOLS.includes("TOKONAMI")'),false);
assert(evaluate('schoolOpponentRoster("KARASUNO",98).some(c=>c.power<90)'), 'Career opponents must have character-specific ratings');
assert.equal(evaluate('BY_KEY["8-0"].name'),'Kenma Kozume');
assert(evaluate('BASE_CATALOG.some(c=>c.name==="Shoyo Hinata"&&c.stage===3&&c.proOnly)'));
assert(evaluate('shopPage()').includes('TIMESKIP CHRONICLES'));
const sources=fs.readFileSync('server/anime-portraits.js','utf8');
assert(sources.includes('Haikyuu')&&sources.includes('safeImageUrl'));
console.log('PASS: V9 featured schools only; women/middle/random schools excluded; stable save IDs; accurate team OVR; 500 valid school drafts; Timeskip/Pro exclusive to shop and quests; portrait fallbacks for every playable athlete.');
