'use strict';
const fs=require('fs'),path=require('path');
const {SPIKE_ROSTER,SPIKE_COACHES,SPIKE_NATIONALS_SCHOOLS}=require('../public/roster-data.js');
const B=require('../public/balance.js'),P=require('../public/pack-engine.js');
const base=SPIKE_ROSTER.flatMap((x,i)=>{
 const stages=x.proOnly?[3]:[0,...(SPIKE_NATIONALS_SCHOOLS.includes(x.school)?[1]:[]),...(P.TIMESKIP_NAMES.has(x.name)?[2]:[])];
 return stages.map(v=>B.buildCard(x,i,v));
});
const specs=[
 ['legend-bokuto-thunder','Kotaro Bokuto','BOKUTO · THUNDER ACE',104,'FUKURODANI'],
 ['legend-hinata-sky','Shoyo Hinata','HINATA · SKY BREAKER',103,'KARASUNO'],
 ['legend-kenma-oracle','Kenma Kozume','KENMA · COURT ORACLE',100,'NEKOMA'],
 ['legend-kageyama-king','Tobio Kageyama','KAGEYAMA · COURT KING',105,'KARASUNO'],
 ['legend-ushijima-power','Wakatoshi Ushijima','USHIJIMA · LEFT ARM',105,'SHIRATORIZAWA']
];
const legends=specs.map(([key,name,title,power,school])=>({...base.find(c=>c.name===name&&c.stage===0),key,name,title,power,school,stage:4,variant:'Quest Legend',rarity:5,ability:title,questOnly:true}));
const raw=base.concat(base.filter(P.eliteCandidate).map(c=>P.upgradeCard(c,'elite')),base.filter(P.apexCandidate).map(c=>P.upgradeCard(c,'apex')),legends);
const schoolFaces=new Map(base.filter(x=>x.stage===0).map(x=>[x.name,x.portrait]));
const cards=raw.map(x=>({...x,portrait:schoolFaces.get(x.name)||x.portrait,file:'cards/players/'+x.key.replace(/[^a-zA-Z0-9_-]/g,'_')+'.webp'}));
const staff=SPIKE_COACHES.flatMap(x=>Array.from({length:6},(_,tier)=>{const value=Math.min(10,Math.max(1,Math.round(x.value*[.35,.55,.85,1.12,1.45,1.9][tier])));const type=[16,17,18,19,20,21,27,28,29].includes(Number(x.id.split('-').at(-1)))?'Manager':'Coach';const key=`${x.id}-tier-${tier}`;return {key,name:x.name,school:x.school,stage:5,tier,variant:['Common','Rare','Epic','Legendary','Mythic','Secret'][tier]+' '+type,power:null,bonus:value,buff:x.buff,type,portrait:'portraits/staff/'+String(Number(x.id.split('-').at(-1))).padStart(2,'0')+'.svg',file:'cards/staff/'+key+'.webp'};}));
const obj={version:14,generatedAt:'2026-10-19',cards,staff};
fs.mkdirSync(path.join(__dirname,'../public/cards'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'../public/cards/catalog.json'),JSON.stringify(obj,null,2));
fs.writeFileSync(path.join(__dirname,'../public/cards/catalog.js'),'const HAIKYUU_CARD_ART='+JSON.stringify(obj)+';\n');
console.log('Exported',cards.length,'player cards /',staff.length,'staff cards. Total',cards.length+staff.length);
