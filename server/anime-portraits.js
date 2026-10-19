'use strict';
const fs=require('node:fs');
const path=require('node:path');
const overrideFile=path.join(__dirname,'..','portrait-overrides.json');
let customImages={};
try{customImages=JSON.parse(fs.readFileSync(overrideFile,'utf8'));}catch{}

/**
 * Haikyuu portrait resolver.
 *
 * External profile images are displayed by reference, NOT copied into the game.
 * 1) Curated lists of Haikyuu characters from AniList and MyAnimeList/Jikan
 * 2) Exact-name AniList lookup with explicit Haikyuu media verification
 * 3) Wiki page thumbnail fallback in server.js (not always anime artwork)
 *
 * Source art belongs to its owners. Some obscure/manga-only characters have no
 * published anime portrait. The game must never falsely label a fallback SVG
 * as official anime artwork.
 */
const ANIME_IDS=[20464,20992,106625,113538,111790];
const MAL_ANIME_IDS=[20583,28891,32935,38883,40776];
const REQUEST_QUERY=`query SpikeLegendsImages { ${ANIME_IDS.map((id,i)=>`s${i}: Media(id:${id},type:ANIME){characters(page:1,perPage:50){nodes{name{full first last alternative}image{large}}}}`).join(' ')} }`;
const CACHE_OK_MS=24*60*60*1000;
const CACHE_FAIL_MS=10*60*1000;
const LOOKUP_LIMIT=6;
let anilistRows=[];
let jikanRows=[];
let anilistUntil=0;
let jikanUntil=0;
let anilistFlight=null;
let jikanFlight=null;
let lastError='';
const individualCache=new Map();
const detailCache=new Map();
let activeLookups=0;
const waiters=[];

function normalize(value){
 return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/ou/g,'o').replace(/uu/g,'u')
  .replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
}
function key(name){return normalize(name).split(' ').filter(Boolean).sort().join(' ');}
function safeImageUrl(url){
 try{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.username||u.password)return '';
  if((u.hostname==='anilist.co'||u.hostname.endsWith('.anilist.co'))&&u.pathname.startsWith('/file/anilistcdn/'))return u.href;
  if(u.hostname==='cdn.myanimelist.net'&&u.pathname.startsWith('/images/characters/'))return u.href;
  if((u.hostname==='wikia.nocookie.net'||u.hostname.endsWith('.wikia.nocookie.net'))&&u.pathname.startsWith('/'))return u.href;
  return '';
 }catch{return '';}
}
function nameForms(char){
 const n=char?.name||{};
 return [n.full,[n.first,n.last].filter(Boolean).join(' '),[n.last,n.first].filter(Boolean).join(' '),...(n.alternative||[])];
}
function rowsFromResponse(payload){
 const arr=[];
 for(const section of Object.values(payload?.data||{})){
  for(const char of section?.characters?.nodes||[]){
   const url=safeImageUrl(char?.image?.large);if(!url)continue;
   arr.push({url,source:'AniList',names:[...new Set(nameForms(char).map(key).filter(Boolean))]});
  }
 }
 return arr;
}
function rowsFromJikan(payload){
 const rows=[];
 for(const record of payload?.data||[]){
  const char=record?.character||record;
  const url=safeImageUrl(char?.images?.jpg?.image_url||char?.images?.webp?.image_url||'');
  if(!url)continue;
  rows.push({url,source:'MyAnimeList / Jikan',names:[...new Set([char.name,...(char.nicknames||[])].map(key).filter(Boolean))]});
 }
 return rows;
}
function findPortrait(name,rows){const term=key(name);return rows.find(x=>x.names.includes(term))?.url||'';}
function findRecord(name,rows){const term=key(name);return rows.find(x=>x.names.includes(term))||null;}
function mkFetch(timeout=7000){return AbortSignal.timeout(timeout);}
async function retrieveAniList(fetchImpl=globalThis.fetch){
 if(Date.now()<anilistUntil)return anilistRows;
 if(anilistFlight)return anilistFlight;
 anilistFlight=(async()=>{
  try{
   const response=await fetchImpl('https://graphql.anilist.co',{
    method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({query:REQUEST_QUERY}),signal:mkFetch(8500)
   });
   if(!response.ok)throw new Error('AniList HTTP '+response.status);
   const data=await response.json();
   if(data.errors?.length&&!Object.keys(data?.data||{}).length)throw new Error('AniList GraphQL errors');
   const list=rowsFromResponse(data);
   if(!list.length)throw new Error('AniList returned no matching series portraits');
   anilistRows=list;anilistUntil=Date.now()+CACHE_OK_MS;
  }catch(e){lastError=e.message||'AniList unavailable';anilistUntil=Date.now()+CACHE_FAIL_MS;}
  finally{anilistFlight=null;}
  return anilistRows;
 })();
 return anilistFlight;
}
async function retrieveJikan(fetchImpl=globalThis.fetch){
 if(Date.now()<jikanUntil)return jikanRows;
 if(jikanFlight)return jikanFlight;
 jikanFlight=(async()=>{
  let results=[];
  // Space requests to respect Jikan's public API rate limits.
  for(const [i,animeId] of MAL_ANIME_IDS.entries()){
   if(i>0)await new Promise(r=>setTimeout(r,420));
   if(i>=2&&results.length===0)break; // Do not keep hammering an unavailable API
   try{
    const response=await fetchImpl(`https://api.jikan.moe/v4/anime/${animeId}/characters`,{
     method:'GET',headers:{Accept:'application/json'},signal:mkFetch(3200)
    });
    if(!response.ok){lastError='Jikan HTTP '+response.status;continue;}
    results.push(...rowsFromJikan(await response.json()));
   }catch(e){lastError=e.message||'Jikan unavailable';}
  }
  if(results.length){jikanRows=results;jikanUntil=Date.now()+CACHE_OK_MS;}
  else jikanUntil=Date.now()+CACHE_FAIL_MS;
  jikanFlight=null;
  return jikanRows;
 })();
 return jikanFlight;
}
async function slot(){
 if(activeLookups>=LOOKUP_LIMIT)await new Promise(res=>waiters.push(res));
 activeLookups++;
 return ()=>{activeLookups--;waiters.shift()?.();};
}
async function individualPortraitInfo(name,fetchImpl=globalThis.fetch){
 const k=key(name),recent=individualCache.get(k);
 if(recent&&recent.until>Date.now())return recent.result;
 const release=await slot();
 let result={url:'',source:'none'};
 try{
  // Search surname first because AniList usually indexes Japanese surname-first.
  // Only return an *exact* normalised name match with confirmed Haikyuu media.
  const pieces=normalize(name).split(' ');
  const query=`query($search:String){Page(page:1,perPage:20){characters(search:$search){name{full first last alternative} image{large} media(perPage:12){nodes{title{romaji english native}}}}}}`;
  const choices=[pieces[pieces.length-1],pieces[0]].filter((x,i,a)=>x&&a.indexOf(x)===i);
  for(const search of choices){
   const res=await fetchImpl('https://graphql.anilist.co',{
    method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({query,variables:{search}}),signal:mkFetch(5500)
   });
   if(!res.ok)continue;
   const payload=await res.json();
   for(const char of payload?.data?.Page?.characters||[]){
    if(!nameForms(char).map(key).includes(k))continue;
    const isHaikyuu=(char.media?.nodes||[]).some(x=>/haikyuu|haikyū/i.test([x.title?.romaji,x.title?.english,x.title?.native].join(' ')));
    if(!isHaikyuu)continue;
    const url=safeImageUrl(char?.image?.large);
    if(url){result={url,source:'AniList'};break;}
   }
   if(result.url)break;
  }
 }catch(e){lastError=e.message||'Portrait lookup unavailable';}
 finally{release();}
 individualCache.set(k,{result,until:Date.now()+(result.url?CACHE_OK_MS:CACHE_FAIL_MS)});
 return result;
}
async function individualPortrait(name,fetchImpl=globalThis.fetch){return (await individualPortraitInfo(name,fetchImpl)).url;}
async function portraitInfoFor(name,fetchImpl=globalThis.fetch){
 const id=key(name);
 if(!id)return {url:'',source:'none'};
 // Manually verified per-character portrait URLs take precedence over lookups.
 // HTTPS is required; no auto-downloading and no broken placeholder URLs.
 const override=safeImageUrl(customImages[name]||'');
 if(override)return {url:override,source:'Verified portrait mapping',alternates:[]};
 const recent=detailCache.get(id);
 if(recent&&recent.until>Date.now())return recent.value;
 // Try the two indexed Haikyuu-only lists before resorting to searches.
 // They run in parallel but are cached for the lifetime of most sessions.
 const [a,j]=await Promise.all([retrieveAniList(fetchImpl),retrieveJikan(fetchImpl)]);
 const matches=[findRecord(name,a),findRecord(name,j)].filter(Boolean);
 const found=matches[0];
 const value=found?{url:found.url,source:found.source,alternates:[...new Set(matches.slice(1).map(r=>r.url).filter(u=>u!==found.url))]}:await individualPortraitInfo(name,fetchImpl);
 detailCache.set(id,{value,until:Date.now()+(value.url?CACHE_OK_MS:CACHE_FAIL_MS)});
 return value;
}
async function portraitFor(name,fetchImpl=globalThis.fetch){return (await portraitInfoFor(name,fetchImpl)).url;}
function getStatus(){return {anilistRecords:anilistRows.length,jikanRecords:jikanRows.length,cachedNames:detailCache.size,verifiedNames:[...detailCache.values()].filter(x=>x.value.url).length,error:lastError};}
module.exports={portraitFor,portraitInfoFor,normalize,key,findPortrait,rowsFromResponse,rowsFromJikan,safeImageUrl,REQUEST_QUERY,individualPortrait,getStatus};
