'use strict';
const assert=require('node:assert/strict');
const {normalize,key,findPortrait,rowsFromResponse,safeImageUrl,REQUEST_QUERY,portraitFor}=require('../server/anime-portraits');
assert.equal(normalize('Shouyou Hinata'),'shoyo hinata');
assert.equal(key('Tobio Kageyama'),key('Kageyama Tobio'));
assert.equal(key('Koutarou Bokuto'),key('Kotaro Bokuto'));
assert.equal(key('Yuu Nishinoya'),key('Yu Nishinoya'));
assert.equal(safeImageUrl('https://attacker.org/file/anilistcdn/img.png'),'');
assert.equal(safeImageUrl('http://s4.anilist.co/file/anilistcdn/character.png'),'');
assert.equal(safeImageUrl('https://s4.anilist.co/file/anilistcdn/character/large/test.jpg'),'https://s4.anilist.co/file/anilistcdn/character/large/test.jpg');
const img='https://s4.anilist.co/file/anilistcdn/character/large/test.jpg';
const rows=rowsFromResponse({data:{s0:{characters:{nodes:[{name:{full:'Shouyou Hinata',first:'Shouyou',last:'Hinata',alternative:[]},image:{large:img}}]}}}});
assert.equal(findPortrait('Shoyo Hinata',rows),img);
assert.equal(findPortrait('A Completely Different Character',rows),'');
assert.match(REQUEST_QUERY,/20464/);
assert.match(REQUEST_QUERY,/106625/);
(async()=>{
 const mock=async (_url,options)=>{
  assert.equal(options.method,'POST');
  return {ok:true,json:async()=>({data:{s0:{characters:{nodes:[{name:{full:'Shouyou Hinata',first:'Shouyou',last:'Hinata'},image:{large:img}}]}}}})};
 };
 assert.equal(await portraitFor('Shoyo Hinata',mock),img);
 console.log('Anime portrait resolver tests passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
