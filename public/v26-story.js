/* V26 narrative: school-to-Nationals progression, dialogue and battle objectives.
   Keeps all earlier school battles and Spring High bracket unchanged. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SpikeV26Story=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const ARC=[
 ['A NEW BEGINNING','The qualifiers are open. Six unlikely athletes must earn the right to play on the national stage.','The court does not care about your reputation. Show us your volleyball.'],
 ['RISING CHALLENGERS','Every point is harder earned. Teams begin to study your favourite combinations.','A good team can win once. A great team can adapt.'],
 ['TOKYO TRAINING CAMP','Nekoma and Fukurodani expose every defensive weakness in your rotation.','A single bad receive can decide an entire set.'],
 ['MIYAGI GRAND PRIX','Miyagi’s great setters refuse to yield the spotlight.','Make your best play. Then make it again under pressure.'],
 ['THE INTERHIGH ROAD','The arena fills with louder crowds and tougher opponents.','Strength without control is just noise.'],
 ['CLASH OF SETTERS','Setters dictate the tempo and rivalries become personal.','Can your attackers keep up with the speed of this set?'],
 ['THE IRON WALL','A disciplined blocking line makes every spike look impossible.','You can strike as hard as you want. We will still be here.'],
 ['ACE SHOWDOWN','The greatest hitters threaten to overwhelm your backcourt.','If the game is close, give the ball to the ace.'],
 ['ROAD TO SPRING HIGH','Only the most complete squads survive the last qualifier.','One more victory is all that stands between you and Nationals.'],
 ['NATIONAL DEBUT','The national tournament begins under an unfamiliar stadium roof.','There are no easy schools left on this side of the bracket.'],
 ['THE LAST THIRTY-TWO','Opponents now know your strongest combinations.','Your signature attack does not surprise us anymore.'],
 ['THE LAST SIXTEEN','Every rotation is analysed. Every substitution matters.','You cannot rely on one star forever.'],
 ['UNBREAKABLE DEFENCES','The defenders turn certain kills into impossible rallies.','Attack again. We will keep receiving.'],
 ['POWERHOUSE ATTACKS','Bigger hitters, faster swings and fewer open angles.','Let us see whether your blocks can withstand this.'],
 ['ELITE NATIONALS','The line between a good athlete and a great one disappears.','At this level, one decision changes everything.'],
 ['LEGENDARY RIVALS','Old rivals briefly become allies, determined to beat the strongest team.','We do not have to agree. We just have to win.'],
 ['ALL-STAR CIRCUIT','The nation’s most celebrated names take the court together.','We will show you why every one of us was selected.'],
 ['PROFESSIONAL TRIALS','The pace of the game approaches the professional standard.','Read the play before the ball leaves the setter’s hands.'],
 ['THE ULTIMATE SIX','Six masters, one court and no second chances.','The final obstacle is not talent. It is trust.'],
 ['NATIONAL LEGENDS','There is only one title left to earn: a place among the legends.','Do not play to avoid losing. Play to make history.']
 ];
 const GOALS=['Score at least one ace','Land a successful block','Win a point with a spike','Win with a quick attack','Complete a full tactical rally'];
 const FEATURE_PLAN={
  'Float serve pressure':{serve:'float',receive:'spread'},
  'Deep-court coverage':{receive:'libero',defense:'dig'},
  'Fast middle attacks':{set:'quick'},
  'Read blocking':{defense:'commit'},
  'Setter duels':{set:'dump',serve:'target'},
  'Power spikes':{attack:'power',serve:'jump'},
  'Defensive endurance':{defense:'dig',receive:'spread'},
  'Triple blocks':{defense:'commit'},
  'Cross-court angles':{attack:'cross'},
  'Twin Quick combinations':{set:'quick'},
  'Precise jump serves':{serve:'jump'},
  'Final-point pressure':{attack:'power',defense:'commit'}
 };
 function stage(stage){const index=Math.max(0,Math.min(19,Number(stage?.chapter)||0)),details=ARC[index];return {title:details[0],intro:details[1],dialogue:details[2],goal:GOALS[(stage.number-1)%GOALS.length],tactics:FEATURE_PLAN[stage.feature]||{},boss:!!stage.boss};}
 function objectiveDone(events,number){const goal=(Number(number)-1)%GOALS.length;return (events||[]).some(e=>e.winner===0&&(goal===0?/ACE/.test(e.action):goal===1?/BLOCK/.test(e.action):goal===2?/SPIKE|SHOT/.test(e.action):goal===3?/QUICK/.test(e.action):Array.isArray(e.beats)&&e.beats.length>=4));}
 return {ARC,GOALS,stage,objectiveDone};
});
