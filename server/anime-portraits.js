'use strict';
/**
 * Live anime character portraits from the public AniList GraphQL API.
 * No artwork is copied or packaged with the game: browsers request image URLs
 * hosted by AniList. Use only in accordance with the image provider's terms
 * and the rights holders' permissions.
 */
const ANIME_IDS=[20464,20992,106625,113538,111790];
const REQUEST_QUERY=`query SpikeLegendsImages { ${ANIME_IDS.map((id,i)=>`s${i}: Media(id:${id},type:ANIME){characters(page:1,perPage:50){nodes{name{full first last alternative}image{large}}}}`).join(' ')} }`;
const CACHE_OK_MS=12*60*60*1000;
const CACHE_FAIL_MS=10*60*1000;
let cacheUntil=0;
let records=[];
let inflight=null;
let lastError='';
function normalize(value){
 return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/ō/g,'o').replace(/ū/g,'u').replace(/ou/g,'o').replace(/uu/g,'u')
  .replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
}
function key(name){return normalize(name).split(' ').sort().join(' ');}
function safeImageUrl(url){
 try{const u=new URL(url);return u.protocol==='https:'&&(/(^|\.)anilist\.co$/i.test(u.hostname))&&u.pathname.startsWith('/file/anilistcdn/')?u.href:'';}catch{return '';}
}
function rowsFromResponse(payload){
 const arr=[];
 for(const section of Object.values(payload?.data||{})){
  for(const char of section?.characters?.nodes||[]){
   const url=safeImageUrl(char?.image?.large);if(!url)continue;
   const forms=[char?.name?.full,[char?.name?.first,char?.name?.last].filter(Boolean).join(' '),[char?.name?.last,char?.name?.first].filter(Boolean).join(' '),...(char?.name?.alternative||[])];
   arr.push({url,names:[...new Set(forms.map(key).filter(Boolean))]});
  }
 }
 return arr;
}
function findPortrait(name,rows){const term=key(name);return rows.find(x=>x.names.includes(term))?.url||'';}
async function retrieve(fetchImpl=globalThis.fetch){
 if(Date.now()<cacheUntil)return records;
 if(inflight)return inflight;
 inflight=(async()=>{
  try{
   const response=await fetchImpl('https://graphql.anilist.co',{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({query:REQUEST_QUERY}),signal:AbortSignal.timeout(6500)
   });
   if(!response.ok)throw new Error(`AniList returned ${response.status}`);
   const data=await response.json();
   if(data.errors?.length)throw new Error('AniList query errors');
   const rows=rowsFromResponse(data);
   if(!rows.length)throw new Error('AniList returned no character portraits');
   records=rows;cacheUntil=Date.now()+CACHE_OK_MS;lastError='';
  }catch(e){
   lastError=e.message||'Unknown error';
   cacheUntil=Date.now()+CACHE_FAIL_MS;
  }finally{inflight=null;}
  return records;
 })();
 return inflight;
}
async function portraitFor(name,fetchImpl=globalThis.fetch){
 const rows=await retrieve(fetchImpl);
 return findPortrait(name,rows);
}
module.exports={portraitFor,normalize,key,findPortrait,rowsFromResponse,safeImageUrl,REQUEST_QUERY,getStatus:()=>({items:records.length,error:lastError})};
