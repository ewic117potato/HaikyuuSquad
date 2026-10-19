from pathlib import Path
p=Path('/mnt/data/HaikyuuLegends_V9')
roster=p/'public/roster-data.js'; t=roster.read_text()
assert 'const SPIKE_ROSTER = [' in t
# Preserve the original IDs to keep the original owned-card save keys stable.
t=t.replace('const SPIKE_ROSTER = [','const SPIKE_ALL_ROSTER = [',1)
assert 'const SPIKE_COACHES = ' in t
featured='''// V9: SCHOOL ROLLS ONLY contain boys' high-school teams actually featured in Haikyuu.
// No women's roster, middle schools, tiny fictional filler schools or professional teams.
const SPIKE_SCHOOL_TEAMS = Object.freeze([
 'KARASUNO','NEKOMA','AOBA JOHSAI','DATE TECH','SHIRATORIZAWA',
 'FUKURODANI','INARIZAKI','KAMOMEDAI','ITACHIYAMA','MUJINAZAKA'
]);
const SPIKE_PRO_TEAMS = Object.freeze([
 'MSBY BLACK JACKALS','SCHWEIDEN ADLERS','JAPAN NATIONAL',
 'TACHIBANA RED FALCONS','EJP RAIJIN','AZUMA GREEN ROCKETS'
]);
// Nationals versions are tied to schools that competed at Nationals. Seijoh, Date Tech
// and Shiratorizawa still have their ordinary high-school cards only.
const SPIKE_NATIONALS_SCHOOLS = Object.freeze([
 'KARASUNO','NEKOMA','FUKURODANI','INARIZAKI','KAMOMEDAI','ITACHIYAMA','MUJINAZAKA'
]);
const _seenSchoolNames = new Set();
const SPIKE_ROSTER=SPIKE_ALL_ROSTER.filter(player=>{
 if(player.proOnly)return SPIKE_PRO_TEAMS.includes(player.school);
 if(!SPIKE_SCHOOL_TEAMS.includes(player.school))return false;
 const entry=player.school+'::'+player.name;
 if(_seenSchoolNames.has(entry))return false;
 _seenSchoolNames.add(entry);
 return true;
});
'''
t=t.replace('const SPIKE_COACHES = ',featured+'const SPIKE_COACHES_ALL = ',1)
# Change staff push target and filter preserving original IDs.
t=t.replace('SPIKE_COACHES.push(', 'SPIKE_COACHES_ALL.push(',1)
anchor='const SPIKE_COLORS = '
assert anchor in t
t=t.replace(anchor,'''const SPIKE_COACHES=SPIKE_COACHES_ALL.filter(person=>
 SPIKE_SCHOOL_TEAMS.includes(person.school)||SPIKE_PRO_TEAMS.includes(person.school)
).filter((person,index,all)=>all.findIndex(x=>x.name===person.name&&x.school===person.school)===index);
'''+anchor,1)
t=t.replace('module.exports = {SPIKE_ROSTER,SPIKE_COACHES,SPIKE_COLORS}', 'module.exports = {SPIKE_ROSTER,SPIKE_COACHES,SPIKE_COLORS,SPIKE_SCHOOL_TEAMS,SPIKE_PRO_TEAMS,SPIKE_NATIONALS_SCHOOLS}',1)
roster.write_text(t)

balance=p/'public/balance.js';t=balance.read_text()
t=t.replace('const power=ratingFor(base,index,stage),pos=base.pos;', 'const power=ratingFor(base,index,stage),pos=base.pos,legacyId=Number.isInteger(base.id)?base.id:index;',1)
t=t.replace('key:`${index}-${stage}`,idx:index,stage,', 'key:`${legacyId}-${stage}`,idx:legacyId,stage,',1)
t=t.replace('portrait:`portraits/${String(index).padStart(2,\'0\')}.svg`', 'portrait:`portraits/${String(legacyId).padStart(2,\'0\')}.svg`',1)
# Ban unearned non-pro pro variants by constraining the catalogue rather than balance alone.
balance.write_text(t)

packs=p/'public/pack-engine.js';t=packs.read_text()
needle="const APEX_NAMES=new Set(['Wakatoshi Ushijima'"
assert needle in t
hint='''// Only notable characters with a documented adult storyline are included in Timeskip packs.
// Ordinary school reserves are never arbitrarily turned into 98-OVR pros.
const TIMESKIP_NAMES=new Set([
 'Shoyo Hinata','Tobio Kageyama','Wakatoshi Ushijima','Kotaro Bokuto',
 'Kiyoomi Sakusa','Atsumu Miya','Osamu Miya','Korai Hoshiumi','Wakatsu Kiryu',
 'Kenma Kozume','Tetsuro Kuroo','Kei Tsukishima','Toru Oikawa',
 'Yu Nishinoya','Keiji Akaashi','Morisuke Yaku','Aran Ojiro',
 'Rintaro Suna','Motoya Komori','Tatsuki Washio','Gao Hakuba',
 'Tsutomu Goshiki','Kanji Koganegawa','Takanobu Aone','Shinsuke Kita',
 'Hajime Iwaizumi','Ryunosuke Tanaka','Daichi Sawamura','Asahi Azumane'
]);
'''
t=t.replace(needle,hint+needle,1)
t=t.replace("(stage===3?c.proOnly===true:!c.proOnly)","(stage===3?c.proOnly===true:!c.proOnly&&TIMESKIP_NAMES.has(c.name))",1)
t=t.replace('return {ODDS,APEX_NAMES,rollTier,','return {ODDS,APEX_NAMES,TIMESKIP_NAMES,rollTier,',1)
packs.write_text(t)

game=p/'public/game-v3.js';t=game.read_text()
t=t.replace('const BASE_CATALOG=SPIKE_ROSTER.flatMap((x,i)=>[0,1,2,3].filter(v=>!x.proOnly||v===3).map(v=>generatedCard(i,v)));',
'''// Strict card families: High School (+ Nationals for actual qualifiers) in school
// scouting; adult Timeskip and Professional only in their own packs/quests.
const BASE_CATALOG=SPIKE_ROSTER.flatMap((x,i)=>{
 const variants=x.proOnly?[3]:[0,
  ...(SPIKE_NATIONALS_SCHOOLS.includes(x.school)?[1]:[]),
  ...(SpikePacks.TIMESKIP_NAMES.has(x.name)?[2]:[])];
 return variants.map(v=>generatedCard(i,v));
});''',1)
assert 'const BASE_CATALOG=SPIKE_ROSTER.flatMap' in t
t=t.replace('cardFromIndex:(i,v)=>BY_KEY[`${i}-${v}`]',
'''cardFromIndex:(i,v)=>{
 const original=SPIKE_ROSTER[i];
 const stage=v===1&&SPIKE_NATIONALS_SCHOOLS.includes(original.school)?1:0;
 return BY_KEY[`${original.id}-${stage}`];
}''',1)
assert 'BY_KEY[`${original.id}-${stage}`]' in t
# Prevent new return of non-playable school from stale active drafts after a roster update; old legacy items stay in saved state.
# Fix old pending drafts containing invalid schools or old indexes while keeping already picked players intact.
needle='state.v3=Object.assign(DEFAULT().v3,state.v3);'
assert needle in t
t=t.replace(needle,needle+'''
// V9 migration: a pending school offer from a retired school cannot be used.
if(state.v3.offer?.school&&!SPIKE_SCHOOL_TEAMS.includes(state.v3.offer.school))state.v3.offer=null;
// If a previously unfinished draft included now-retired school players, reset that
// draft instead of leaving the user unable to fill the remaining positions.
const validLegacySchoolKeys=new Set(SPIKE_ROSTER.filter(x=>!x.proOnly).map(x=>String(x.id)));
if(state.v3.run?.picks?.length){
 const items=Array.isArray(state.items)?state.items:[];
 const hasRetired=state.v3.run.picks.some(uid=>{const item=items.find(x=>x.uid===uid);return item&&!validLegacySchoolKeys.has(String(item.key).split('-')[0]);});
 if(hasRetired){state.v3.run=null;state.v3.offer=null;}
}
''',1)
# Update career mode only supported schools, with increasing challenge.
t=t.replace("const CAREER_SCHOOLS=['TOKONAMI','WAKUNAN','DATE TECH','AOBA JOHSAI','NEKOMA','INARIZAKI','SHIRATORIZAWA'];",
 "const CAREER_SCHOOLS=['DATE TECH','AOBA JOHSAI','NEKOMA','FUKURODANI','KAMOMEDAI','INARIZAKI','SHIRATORIZAWA','MUJINAZAKA','ITACHIYAMA','KARASUNO'];",1)
t=t.replace('const CAREER_OVR=[65,71,77,83,89,94,98];','const CAREER_OVR=[66,72,77,81,85,89,91,94,96,98];',1)
# Rename interface to avoid users thinking pro is in school rolls
# V9 correct to 97/3 and 0/0; packs only.
t=t.replace('SEASON 08 · ASTRAL COURT','SEASON 09 · SCHOOL SHOWDOWN')
t=t.replace('97% SCHOOL CARDS','97% HIGH SCHOOL CARDS')
t=t.replace('School drafts feature 97% High School and 3% Nationals cards. Timeskip and Pro characters are exclusive to packs and earned quest rewards.',
'''School rolls pull only from ten real high-school teams: 97% normal school cards and 3% Nationals for eligible schools. No random filler schools, Timeskip or Pro cards in school drafts.''')
# Change filter in collection school selector legacy? SCHOOLS limited already
# Fix small chance qualified nationals pack quest route unchanged.
game.write_text(t)

server=p/'server.js';t=server.read_text();t=t.replace("version:'astral-court-v8'","version:'school-showdown-v9'",1)
server.write_text(t)
index=p/'public/index.html';t=index.read_text().replace('ASTRAL COURT · V8','SCHOOL SHOWDOWN · V9').replace('The Road to Nationals','School Showdown')
index.write_text(t)
print('Patched roster, balance, game catalogue, shop pool, server, UI.')
