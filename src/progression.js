import {talentBonuses} from './talents.js';
import {MAX_PET_LEVEL,levelGrowth} from './rules.js';
import {itemStats,grantItemXp} from './relics.js';
import {growthStage} from './stages.js';
import {abilities,items,learnsets,elementalLearnsets,roleLoadout} from './catalog.js';
export const MAX_LEVEL=MAX_PET_LEVEL;
export function xpToNext(level){return level>=MAX_LEVEL?0:Math.round(60*Math.max(1,level)**1.6);}
export function progressionOf(p={}){const level=Number.isInteger(p?.level)?Math.max(1,Math.min(MAX_LEVEL,p.level)):1;const xp=level===MAX_LEVEL?0:Number.isInteger(p?.xp)&&p.xp>=0?Math.min(p.xp,xpToNext(level)-1):0;return {level,xp};}
export function accountProgress(state){return progressionOf(state.account);}
// Saved pets have no individual progression. These snapshots supply the shared level to stats, art, and combat.
export function accountPet(state,pet){return {...pet,...accountProgress(state)};}
export function accountPets(state){return state.pets.map(p=>accountPet(state,p));}
export function migrateAccount(raw,pets){
 if(raw.account&&typeof raw.account==='object')return progressionOf(raw.account);
 const best=pets.map(p=>{const level=Number.isInteger(p.level)?Math.max(1,Math.min(MAX_LEVEL,p.level)):1,need=60+30*(level-1),xp=Number.isInteger(p.xp)&&p.xp>0?Math.min(p.xp,need-1):0;return {level,xp,fraction:xp/need};}).sort((a,b)=>b.level-a.level||b.fraction-a.fraction)[0]||{level:1,fraction:0};
 return {level:best.level,xp:best.level===MAX_LEVEL?0:Math.floor(best.fraction*xpToNext(best.level))};
}
export function petStats(p,itemId=null){const {level}=progressionOf(p),growth=levelGrowth(level),item=itemStats(itemId),talent=talentBonuses(p);return {level,maxHp:Math.round((Math.round(p.hp*growth.health)+item.hp)*talent.hp),attack:growth.attack*talent.attack,recovery:growth.recovery*item.recovery*talent.recovery,defense:Math.min(.6,growth.defense+item.defense)};}
export function learnedMoves(p){const q=roleLoadout(p),{level}=progressionOf(q);return [...new Set([...q.moves.filter(id=>(abilities[id]?.minLevel||1)<=level),...learnsets[q.role].filter(([,lv])=>lv<=level).map(([id])=>id),...(elementalLearnsets[q.element]||[]).filter(([,lv])=>lv<=level).map(([id])=>id)])];}
export function grantXp(p,amount){if(!Number.isFinite(amount)||amount<=0)return {amount:0,before:progressionOf(p).level,after:progressionOf(p).level,unlocked:[]};const before=progressionOf(p);p.level=before.level;p.xp=before.xp;if(p.level===MAX_LEVEL)return {amount:0,before:MAX_LEVEL,after:MAX_LEVEL,unlocked:[]};p.xp+=Math.floor(amount);while(p.level<MAX_LEVEL&&p.xp>=xpToNext(p.level)){p.xp-=xpToNext(p.level);p.level++;}if(p.level===MAX_LEVEL)p.xp=0;const unlocked=[...(p.moves?learnsets[roleLoadout(p).role]:[]),...(elementalLearnsets[p.element]||[])].filter(([,lv])=>lv>before.level&&lv<=p.level).map(([id])=>id);return {amount:Math.floor(amount),before:before.level,after:p.level,unlocked};}
export function grantAccountXp(state,amount){state.account=accountProgress(state);const reward=grantXp(state.account,amount);reward.unlocked=[...new Set([...Object.values(learnsets),...Object.values(elementalLearnsets)].flat().filter(([,level])=>level>reward.before&&level<=reward.after).map(([id])=>id))];return reward;}
export function defeatXp(enemy,multiplier=1){return Math.max(0,Math.round(38*progressionOf(enemy).level**1.25*multiplier*(enemy?.xpFactor??1)));}
// One account award per credited enemy, regardless of party size. Gear retains finisher/shared XP.
export function bankBattleXp(state,battle,event){
 const changes=[];battle.xpProcessed??=[];battle.accountXpEarned??=0;
 for(const defeat of battle.defeats||[]){
  if(defeat.side!=='enemy'||battle.xpProcessed.includes(defeat.cid))continue;
  battle.xpProcessed.push(defeat.cid);const killer=battle.players.find(p=>p.cid===defeat.killer);if(!killer)continue;
  const enemy=[...battle.enemies,...(battle.fallenEnemies||[])].find(p=>p.cid===defeat.cid);if(!enemy)continue;
  const base=defeatXp(enemy,battle.xpMultiplier||1),reward=grantAccountXp(state,base);
  battle.accountXpEarned+=reward.amount;changes.push({kind:'account',name:'Account',...reward});
  if(reward.amount)event?.effects.push({cid:killer.cid,type:'xp',text:'+'+reward.amount+' account XP'});
  for(const member of battle.players){
   const relic=state.relics?.find(r=>r.id===member.relicId);
   if(relic){const itemGrowth=grantItemXp(relic,member.cid===killer.cid?base:Math.ceil(base/2));battle.itemXpEarned??={};battle.itemXpEarned[relic.id]=(battle.itemXpEarned[relic.id]||0)+itemGrowth.amount;if(itemGrowth.after>itemGrowth.before){event?.effects.push({cid:member.cid,type:'itemlevel',text:items[relic.type].name+' Lv.'+itemGrowth.after});battle.log.push(items[relic.type].name+' reached level '+itemGrowth.after+'. New stats apply next encounter.');}}
   if(reward.after>reward.before)event?.effects.push({cid:member.cid,type:'level',text:'Account level '+reward.after+'!'});
  }
  if(growthStage(reward.after).index>growthStage(reward.before).index)battle.log.push('All companions reached the '+growthStage(reward.after).name+' stage. Appearance updates next encounter.');
  if(reward.after>reward.before)battle.log.push('Account reached level '+reward.after+'. Every companion grows together; new skills are available in Stats & abilities. Growth takes effect next encounter.');
 }
 return changes;
}
