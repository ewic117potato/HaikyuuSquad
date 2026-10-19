'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {SPIKE_ROSTER,SPIKE_COACHES}=require('../public/roster-data');
const portraits=require('../server/anime-portraits');
const {normalize,key,findPortrait,rowsFromResponse,rowsFromJikan,safeImageUrl,REQUEST_QUERY,portraitFor,portraitInfoFor}=portraits;
assert.equal(normalize('Shouyou Hinata'),'shoyo hinata');
assert.equal(key('Tobio Kageyama'),key('Kageyama Tobio'));
assert.equal(key('Koutarou Bokuto'),key('Kotaro Bokuto'));
assert.equal(key('Yuu Nishinoya'),key('Yu Nishinoya'));
assert.equal(safeImageUrl('https://attacker.org/file/anilistcdn/img.png'),'');
assert.equal(safeImageUrl('http://s4.anilist.co/file/anilistcdn/character.png'),'');
assert.equal(safeImageUrl('https://cdn.myanimelist.net/images/characters/4/188740.jpg'),'https://cdn.myanimelist.net/images/characters/4/188740.jpg');
assert.equal(safeImageUrl('https://cdn.myanimelist.net/images/anime/999.jpg'),'');
assert.equal(safeImageUrl('https://attacker.net/images/characters/test.jpg'),'');
const img='https://s4.anilist.co/file/anilistcdn/character/large/test.jpg';
const malImg='https://cdn.myanimelist.net/images/characters/4/188740.jpg';
const rows=rowsFromResponse({data:{s0:{characters:{nodes:[{name:{full:'Shouyou Hinata',first:'Shouyou',last:'Hinata',alternative:[]},image:{large:img}}]}}}});
assert.equal(findPortrait('Shoyo Hinata',rows),img);
assert.equal(findPortrait('A Completely Different Character',rows),'');
assert.match(REQUEST_QUERY,/20464/);
assert.match(REQUEST_QUERY,/106625/);
const jrows=rowsFromJikan({data:[{character:{name:'Kageyama, Tobio',images:{jpg:{image_url:malImg}}}},{character:{name:'Random Other Show',images:{jpg:{image_url:'https://evil.test/o.jpg'}}}}]});
assert.equal(findPortrait('Tobio Kageyama',jrows),malImg);
assert.equal(jrows.length,1);
const allNames=[...new Set([...SPIKE_ROSTER,...SPIKE_COACHES].map(p=>p.name))];
assert.ok(allNames.length>90,'Expected curated main-school roster and pro players');
for(const [i,p] of SPIKE_ROSTER.entries()){
 const art=path.join(__dirname,'..','public','portraits',String(p.id).padStart(2,'0')+'.svg');
 assert.ok(fs.existsSync(art),`Missing backup art ${p.name} at index ${i}`);
}
for(let i=0;i<SPIKE_COACHES.length;i++){
 const staffArt=path.join(__dirname,'..','public','portraits','staff',String(SPIKE_COACHES[i].id.split('-').at(-1)).padStart(2,'0')+'.svg');
 assert.ok(fs.existsSync(staffArt),'Missing staff art '+SPIKE_COACHES[i].name);
}
assert.ok(fs.existsSync(path.join(__dirname,'..','public','portraits','staff-placeholder.svg')));
const game=fs.readFileSync(path.join(__dirname,'..','public','game-v3.js'),'utf8');
assert.match(game,/data-img-name/);
assert.match(game,/loadOnlinePortraits\(\)/);
assert.match(game,/remotePending=new Map/);
assert.match(game,/data-img-name="\$\{escapeHtml\(c\.name\)\}"/);
(async()=>{
 const calls=[];
 const mock=async(url,options)=>{
  calls.push(url);
  if(url.includes('graphql.anilist.co'))return {ok:true,json:async()=>({data:{s0:{characters:{nodes:[{name:{full:'Shouyou Hinata',first:'Shouyou',last:'Hinata'},image:{large:img}}]}}}})};
  if(url.includes('api.jikan.moe'))return {ok:true,json:async()=>({data:[{character:{name:'Kageyama, Tobio',images:{jpg:{image_url:malImg}}}}]})};
  throw Error('Unexpected request: '+url);
 };
 const hinata=await portraitInfoFor('Shoyo Hinata',mock);
 assert.equal(hinata.url,img);assert.equal(hinata.source,'AniList');
 assert.equal(await portraitFor('Tobio Kageyama',mock),malImg);
 assert.ok(calls.some(c=>c.includes('/anime/20583/characters')));
 assert.equal((await portraitInfoFor('Shoyo Hinata',mock)).url,img);
 console.log('✓ Online anime portrait resolver, cache, source validation, matching and all SVG backup assets passed');
 console.log('  Unique character/staff lookup names: '+allNames.length+' | SVG backups: '+SPIKE_ROSTER.length+' players + '+SPIKE_COACHES.length+' personalised staff fallbacks');
})().catch(e=>{console.error(e);process.exitCode=1;});
