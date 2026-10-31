import {levelGrowth} from './rules.js';
import {petStats,progressionOf} from './progression.js';
import {abilities,statuses,items,roles,elements,elementMultiplier,starters,wilds,resolveRole,roleLoadout,isRecovery,isBarrier,isTaunt,abilityElement,basicMove,legendPassives} from './catalog.js';
import {itemStats} from './relics.js';
import {equippedMoves,enemyLoadout} from './skills.js';
import {bossProfile,summonTemplate} from './bosses.js';
export {abilities,statuses,items,roles,elements,elementMultiplier,starters,wilds,resolveRole,roleLoadout} from './catalog.js';
export function preparePet(p,relic=null,{enemy=false}={}){
 p=roleLoadout(p);const gear=itemStats(relic),stats=petStats(p,relic),growth=progressionOf(p),profile=p.boss&&bossProfile(p);
 return {...structuredClone(p),...growth,baseMaxHp:stats.maxHp,maxHp:stats.maxHp,hp:stats.maxHp,attackFactor:stats.attack*(p.encounterPower||1),healingFactor:stats.recovery*(p.encounterPower||1),defense:Math.min(.6,stats.defense+(p.encounterDefense||0)),item:gear.type,itemLevel:gear.level,itemBonuses:gear,relicId:typeof relic==='object'?relic?.id:null,moves:profile?[...profile.kit]:enemy&&!p.minion?enemyLoadout(p):equippedMoves(p,relic),shield:0,statuses:{},statusSources:{},cooldowns:{},acted:false,turnStarted:0,passiveStacks:0,...(profile?{bossPhase:1,summonWaves:0,nextSpecialRound:2}: {})};
}
export function createBattle(team,enemies,equipment={}){
 if(!Array.isArray(team)||!Array.isArray(enemies)||!team.length||!enemies.length||team.length>3||enemies.length>3||new Set(team.map(p=>p.id)).size!==team.length||new Set(enemies.map(p=>p.id)).size!==enemies.length)throw new Error('Choose one to three different pets per team.');
 return {players:team.map((p,i)=>({...preparePet(p,equipment[p.id]),cid:'player-'+i,side:'player'})),enemies:enemies.map((p,i)=>({...preparePet(p,null,{enemy:true}),cid:'enemy-'+i,side:'enemy'})),fallenEnemies:[],nextEnemyId:enemies.length,bossTrial:enemies.some(p=>p.boss&&bossProfile(p)),defeats:[],xpProcessed:[],xpEarned:{},itemXpEarned:{},round:1,phase:'player',outcome:null,log:['Teams enter the clearing. Each living pet acts once per round.']};
}
export function available(p,id){return p.hp>0&&!p.acted&&!p.statuses?.stun&&p.moves.includes(id)&&!!abilities[id]&&!(p.cooldowns[id]>0);}
export function damageReduction(p){return Math.min(.6,(p.defense||0)+(p.statuses?.stoneskin ? .25 : 0));}
export function hasReady(team){return team.some(p=>p.hp>0&&!p.acted&&!p.statuses.stun);}
const living=team=>team.filter(p=>p.hp>0);
function everyone(b){return [...b.players,...b.enemies,...(b.fallenEnemies||[])];}
function outcome(b){const p=living(b.players).length,boss=b.enemies.find(p=>p.boss),e=b.bossTrial&&boss?.hp<=0?0:living(b.enemies).length;if(!p||!e){b.outcome=!p&&!e?'draw':e?'lost':'won';b.phase='finished';if(!e&&b.bossTrial)for(const minion of b.enemies.filter(p=>p.minion))minion.hp=0;}}
export function attackMultiplier(p){return (p.itemBonuses?.damage||1)*(1+(p.passiveStacks||0)*.06)*(p.statuses.might?1.35:1)*(p.statuses.weaken ? .75 : 1);}
function directPower(actor,target,power,element=actor.element){return Math.round(power*actor.attackFactor*(1-damageReduction(target))*elementMultiplier(element,target.element)*attackMultiplier(actor)*(target.statuses.exposed?1.25:1));}
function damage(target,amount,effects,source=null,credit=source?.cid){
 const blocked=Math.min(target.shield,amount);target.shield-=blocked;const n=Math.min(target.hp,Math.max(0,amount-blocked));target.hp-=n;
 effects.push({cid:target.cid,type:'damage',value:n,killer:credit,defeated:n>0&&target.hp===0,text:`−${n}${blocked?' · '+blocked+' blocked':''}`});
 const thorns=target.itemBonuses?.thorns||0;
 if(source&&n>0&&thorns&&source.hp>0){const reflect=Math.min(source.hp,thorns);source.hp-=reflect;effects.push({cid:source.cid,type:'damage',value:reflect,killer:target.cid,defeated:reflect>0&&source.hp===0,text:'−'+reflect+' thorns'});}
 const counter=target.statuses.counter?18:target.id==='legend-cloudsage'?7:0;
 if(source&&amount>0&&source.hp>0&&target.hp>0&&counter){const index=effects.length;damage(source,directPower(target,source,counter,'Grove'),effects,null,target.cid);effects[index].counter=true;effects[index].retaliationFrom=target.cid;effects[index].text='↶ Counter '+effects[index].text;}
 return n;
}
function heal(p,amount,effects){if(p.hp<=0)return;const n=Math.min(p.maxHp-p.hp,amount);p.hp+=n;effects.push({cid:p.cid,type:'heal',value:n,text:'+'+n+' HP'});}
function applyStatus(p,id,duration,actor,effects){
 if(p.hp<=0)return;if(id==='vigor'&&!p.statuses.vigor){const max=Math.round(p.baseMaxHp*1.2),extra=max-p.maxHp;p.maxHp=max;p.hp=Math.min(max,p.hp+Math.max(0,extra));effects.push({cid:p.cid,type:'buff',text:'+'+extra+' max HP'});}
 p.statusSources[id]=actor.cid;p.statuses[id]=Math.max(p.statuses[id]||0,duration);effects.push({cid:p.cid,type:['burn','weaken','exposed','stun'].includes(id)?'debuff':'buff',text:statuses[id].name});
}
export function legalTargets(b,side,moveId,actorId){const a=abilities[moveId];if(!a)return [];const allies=side==='player'?b.players:b.enemies,enemies=side==='player'?b.enemies:b.players;if(a.target==='self')return living(allies).filter(p=>p.cid===actorId);if(a.target==='ally'||a.target==='allAllies')return living(allies);const foes=living(enemies);if(a.target==='allEnemies')return foes;const taunter=foes.find(p=>p.statuses.taunt);return taunter?[taunter]:foes;}
function logEffects(b,event){for(const e of event.effects)b.log.push(`${everyone(b).find(p=>p.cid===e.cid)?.name||'Spirit'}: ${e.text}.`);}
function summonWave(b,boss,events){
 if(boss.summonWaves>=2)return;const slots=3-living(b.enemies).length;if(slots<=0)return;
 b.fallenEnemies.push(...b.enemies.filter(p=>p.minion&&p.hp<=0));b.enemies=b.enemies.filter(p=>!p.minion||p.hp>0);boss.summonWaves++;
 const event={actor:boss.cid,kind:'wildwood',label:'Summon wave '+boss.summonWaves,targets:[],effects:[]};
 for(let i=0;i<Math.min(2,slots);i++){const minion={...preparePet(summonTemplate(boss,i,boss.summonWaves),null,{enemy:true}),cid:'enemy-'+b.nextEnemyId++,side:'enemy',acted:true,turnStarted:b.round};b.enemies.push(minion);event.targets.push(minion.cid);event.effects.push({cid:minion.cid,type:'summon',text:'Summoned · acts next round'});}
 b.log.push(`${boss.name} summons wave ${boss.summonWaves}. New minions cannot act until the next round.`);events.push(event);
}
function startTurn(b,actor){
 if(actor.hp<=0||actor.turnStarted===b.round)return [];actor.turnStarted=b.round;const events=[],allies=actor.side==='player'?b.players:b.enemies,foes=actor.side==='player'?b.enemies:b.players;
 if(actor.boss&&bossProfile(actor)){
  if(actor.hp<=actor.maxHp*.5&&actor.bossPhase===1){actor.bossPhase=2;actor.attackFactor*=1.15;actor.defense=Math.min(.6,actor.defense+.04);actor.shield+=Math.round(14*actor.healingFactor);events.push({actor:actor.cid,kind:'buff',label:'Phase II · Awakened',targets:[actor.cid],effects:[{cid:actor.cid,type:'buff',text:'Phase II · +15% attack · shield'}]});b.log.push(actor.name+' enters Phase II!');}
  if(actor.summonWaves===0||actor.bossPhase===2&&actor.summonWaves<2)summonWave(b,actor,events);
 }
 const passive=legendPassives[actor.id];
 if(actor.id==='legend-neruvia'){const target=living(allies).sort((a,z)=>a.hp/a.maxHp-z.hp/z.maxHp)[0];if(target&&target.hp<target.maxHp){const event={actor:actor.cid,kind:'heal',label:passive.name,targets:[target.cid],effects:[]};heal(target,Math.round(12*actor.healingFactor),event.effects);events.push(event);}}
 if(actor.id==='legend-stormroc'){const event={actor:actor.cid,kind:'thunderstorm',label:passive.name,targets:[],effects:[]};for(const target of living(foes)){if(actor.hp<=0)break;event.targets.push(target.cid);damage(target,directPower(actor,target,7,'Astral'),event.effects,actor);}events.push(event);}
 for(const event of events){b.log.push(`${actor.name} · ${event.label}.`);logEffects(b,event);recordDefeats(b,event);}outcome(b);return events;
}
export function performAction(b,side,actorId,moveId,targetId){
 if(b.outcome||b.phase!==side)return null;const allies=side==='player'?b.players:b.enemies,actor=allies.find(p=>p.cid===actorId),a=abilities[moveId];if(!actor||!a||!available(actor,moveId))return null;
 let legal=legalTargets(b,side,moveId,actorId),targets=['self','allEnemies','allAllies'].includes(a.target)?legal:legal.filter(p=>p.cid===targetId);if(!targets.length)return null;
 const event={actor:actor.cid,move:moveId,kind:a.visual||a.kind,targets:[],effects:[],beforeEvents:[]};actor.acted=true;event.beforeEvents=startTurn(b,actor);
 if(!b.outcome&&actor.hp>0){
  legal=legalTargets(b,side,moveId,actorId);targets=['self','allEnemies','allAllies'].includes(a.target)?legal:legal.filter(p=>p.cid===targetId);if(!targets.length)targets=legal.slice(0,1);event.targets=targets.map(p=>p.cid);actor.cooldowns[moveId]=a.cooldown;
  const powerFactor=a.itemOnly?actor.itemBonuses.abilityFactor:1;
  if(isTaunt(a))for(const ally of allies){delete ally.statuses.taunt;delete ally.statusSources.taunt;}
  for(const t of targets){
   if(isRecovery(a)){heal(t,Math.round(a.power*actor.healingFactor*powerFactor),event.effects);if(a.kind==='cleanse'){for(const id of ['burn','weaken','exposed','stun']){delete t.statuses[id];delete t.statusSources[id];}event.effects.push({cid:t.cid,type:'buff',text:'Cleansed'});}}
   else if(isBarrier(a)){const power=Math.round(a.power*actor.healingFactor*powerFactor);t.shield=Math.max(t.shield,power);event.effects.push({cid:t.cid,type:'shield',text:'◈ '+power+' shield'});}
   else if(a.power){const matchup=elementMultiplier(abilityElement(actor,a),t.element),index=event.effects.length;damage(t,directPower(actor,t,a.power*powerFactor,abilityElement(actor,a)),event.effects,actor);event.effects[index].multiplier=matchup;if(matchup!==1)event.effects[index].text+=matchup>1?' · strong 1.5×':' · resisted 0.75×';}
   if(a.status)applyStatus(t,a.status,a.duration,actor,event.effects);for(const effect of a.extraStatuses||[])applyStatus(t,effect.id,effect.duration,actor,event.effects);
  }
  for(const effect of a.selfStatuses||[])applyStatus(actor,effect.id,effect.duration,actor,event.effects);
  if(actor.boss&&moveId===bossProfile(actor)?.special)actor.nextSpecialRound=b.round+3;
  b.log.push(`${actor.name} → ${a.name} → ${targets.map(t=>t.name).join(', ')}.`);logEffects(b,event);recordDefeats(b,event);outcome(b);
 }
 if(!b.outcome&&side==='player'&&!hasReady(b.players)){const skips=consumeStuns(b,'player');event.effects.push(...skips.effects);event.beforeEvents.push(...skips.beforeEvents);if(living(b.players).every(p=>p.acted))b.phase='enemy';}return event;
}
export function consumeStuns(b,side){
 const event={kind:'stunskip',actor:null,targets:[],effects:[],beforeEvents:[]};if(b.outcome)return event;const team=side==='player'?b.players:b.enemies;if(hasReady(team))return event;
 for(const p of team){if(b.outcome)break;if(p.hp<=0||p.acted||!p.statuses.stun)continue;p.acted=true;event.beforeEvents.push(...startTurn(b,p));delete p.statuses.stun;delete p.statusSources.stun;event.effects.push({cid:p.cid,type:'control',text:'ϟ Stunned · action skipped'});b.log.push(`${p.name} is stunned and skips this action.`);}
 if(!b.outcome&&side==='player'&&living(team).every(p=>p.acted))b.phase='enemy';return event;
}
export function enemyPlan(b,actor){
 if(!actor||actor.hp<=0||actor.acted||actor.statuses.stun||b.outcome)return null;const ready=actor.moves.filter(id=>available(actor,id)),allies=living(b.enemies),wounded=[...allies].sort((a,z)=>a.hp/a.maxHp-z.hp/z.maxHp)[0];let move;
 if(actor.boss&&b.round>=actor.nextSpecialRound&&ready.includes(bossProfile(actor).special))move=bossProfile(actor).special;
 if(!move&&allies.some(p=>p.statuses.stun))move=ready.find(id=>abilities[id].kind==='cleanse');
 if(!move&&actor.role==='tank'&&!allies.some(p=>p.statuses.taunt))move=ready.includes('cloudChallenge')?'cloudChallenge':ready.filter(id=>isTaunt(abilities[id])).sort((a,z)=>(abilities[z].power||0)-(abilities[a].power||0))[0];
 if(!move&&actor.legend&&ready.includes('oceanChorus')&&allies.some(p=>p.maxHp-p.hp>=15))move='oceanChorus';
 if(!move&&wounded.hp<wounded.maxHp-12)move=ready.filter(id=>['ally','allAllies'].includes(abilities[id].target)&&isRecovery(abilities[id])).sort((a,z)=>(abilities[z].power||0)-(abilities[a].power||0))[0];
 if(!move&&actor.legend){if(ready.includes('stoneSkin')&&!actor.statuses.stoneskin)move='stoneSkin';else if(ready.includes('thunderStrike'))move='thunderStrike';else if(ready.includes('dragonBreath')&&living(b.players).length>1)move='dragonBreath';else if(ready.includes('dragonFury')&&!actor.statuses.might)move='dragonFury';else if(ready.includes('royalTide')&&allies.some(p=>!p.statuses.vigor))move='royalTide';}
 if(!move&&actor.hp<actor.maxHp*.65&&ready.includes('rekindle'))move='rekindle';
 if(!move){const useful=ready.filter(id=>id!==basicMove(actor)&&!abilities[id].bossOnly&&!(isRecovery(abilities[id])&&wounded.hp===wounded.maxHp)&&!(abilities[id].status&&['self','allAllies'].includes(abilities[id].target)&&allies.every(p=>p.statuses[abilities[id].status]))&&!(isTaunt(abilities[id])&&allies.some(p=>p.statuses.taunt)));move=useful.sort((a,z)=>(abilities[z].power||10)-(abilities[a].power||10))[0];}
 move||=basicMove(actor);const a=abilities[move],legal=legalTargets(b,'enemy',move,actor.cid),target=a.target==='ally'?legal.sort((p,q)=>(p.statuses.stun?-1:p.hp/p.maxHp)-(q.statuses.stun?-1:q.hp/q.maxHp))[0]:a.target==='self'?actor:legal.sort((p,q)=>(p.hp+p.shield)/elementMultiplier(abilityElement(actor,a),p.element)-(q.hp+q.shield)/elementMultiplier(abilityElement(actor,a),q.element))[0];return {actor:actor.cid,move,target:target?.cid};
}
export function finishRound(b){
 if(b.outcome||b.phase!=='enemy'||living(b.enemies).some(p=>!p.acted))return null;const event={kind:'round',actor:null,targets:[],effects:[],beforeEvents:[]};
 for(const p of [...b.players,...b.enemies]){if(p.hp<=0)continue;
  if(p.statuses.burn){const caster=everyone(b).find(q=>q.cid===p.statusSources?.burn),burn=Math.round(6*levelGrowth(caster?.level).attack);damage(p,burn,event.effects,null,p.statusSources?.burn);const foes=p.side==='player'?b.enemies:b.players;for(const dragon of living(foes).filter(p=>p.id==='legend-pyrragon'&&p.passiveStacks<10)){dragon.passiveStacks++;event.effects.push({cid:dragon.cid,type:'passive',text:'♨ Ember '+dragon.passiveStacks+' · +'+dragon.passiveStacks*6+'% attack'});}}
  if(p.hp>0&&(p.statuses.regen||p.itemBonuses.regen))heal(p,(p.statuses.regen?Math.round(8*p.healingFactor):0)+p.itemBonuses.regen,event.effects);
  for(const id in p.statuses){if(id==='stun')continue;p.statuses[id]--;if(p.statuses[id]<=0){delete p.statuses[id];delete p.statusSources[id];if(id==='vigor'){p.maxHp=p.baseMaxHp;p.hp=Math.min(p.hp,p.maxHp);}}}
  for(const id in p.cooldowns)p.cooldowns[id]=Math.max(0,p.cooldowns[id]-1);p.acted=false;
 }
 logEffects(b,event);recordDefeats(b,event);outcome(b);if(!b.outcome){b.round++;b.phase='player';b.log.push(`Round ${b.round}: your team acts.`);if(!hasReady(b.players)){const skips=consumeStuns(b,'player');event.effects.push(...skips.effects);event.beforeEvents.push(...skips.beforeEvents);}}return event;
}
function recordDefeats(b,event){for(const effect of event.effects){if(!effect.defeated||b.defeats.some(d=>d.cid===effect.cid))continue;const p=everyone(b).find(p=>p.cid===effect.cid);b.defeats.push({cid:p.cid,side:p.side,killer:effect.killer});b.log.push(`${p.name} was defeated.`);}}
