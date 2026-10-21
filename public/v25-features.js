/* V25: deterministic UI safeguards and cinematic pacing. No changes to gacha odds. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  if(root)root.SpikeV25=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function threshold(value,defaultValue=91){
    if(value===0||value==='0'||value==='off')return 0;
    const n=Number(value);
    return Number.isFinite(n)?clamp(Math.round(n),60,110):defaultValue;
  }
  function eligibleCards(cards,needed){
    if(!Array.isArray(cards))return [];
    if(!Array.isArray(needed))return cards.filter(Boolean);
    return cards.filter(x=>x&&needed.includes(x.position));
  }
  // Reroll/new-school/restart warns if any eligible card at or above threshold
  // could be lost. Picking a card warns only when it discards a STRONGER star.
  function protectedCards({cards,needed,action,selectedKey,warnAt}){
    const t=threshold(warnAt),valid=eligibleCards(cards,needed);
    if(!t)return [];
    if(action==='pick'){
      const chosen=valid.find(x=>x.key===selectedKey);
      if(!chosen)return [];
      return valid.filter(x=>x.key!==chosen.key&&x.power>=t&&x.power>chosen.power).sort((a,b)=>b.power-a.power);
    }
    if(!['reroll','school','restart'].includes(action))return [];
    return valid.filter(x=>x.power>=t).sort((a,b)=>b.power-a.power);
  }
  function tier(power){if(power>=105)return 'APEX';if(power>=100)return 'MYTHIC';if(power>=95)return 'LEGENDARY';if(power>=90)return 'ELITE';return 'STANDARD';}
  function replayDuration(beats,speed=1,cinema=true){
    if(!cinema)return 750;
    const steps=Math.max(2,Math.min(12,Math.round(Number(beats)||4)));
    const s=[1,2,4].includes(Number(speed))?Number(speed):1;
    // Enough time to watch the whole serve -> pass -> set -> attack sequence.
    return Math.round(clamp(750+steps*700/Math.pow(s,.72),1200,9800));
  }
  function autoInterval(speed=1,cinema=true,base=1050){
    if(!cinema)return Math.max(250,Math.round(base/(Number(speed)||1)));
    return replayDuration(4,speed,true)+350;
  }
  return {threshold,protectedCards,tier,replayDuration,autoInterval};
});
