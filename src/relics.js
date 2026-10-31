import {items,abilities} from './catalog.js';
export const ITEM_MAX_LEVEL=20;
export const TRAINING_DROP_CHANCE={gentle:.35,balanced:.5,challenging:.65};
export function itemXpToNext(level){return level>=ITEM_MAX_LEVEL?0:40+20*(Math.max(1,level)-1);}
export function itemProgress(p={}){const level=Number.isInteger(p.level)?Math.max(1,Math.min(ITEM_MAX_LEVEL,p.level)):1;return {level,xp:level===ITEM_MAX_LEVEL?0:Math.max(0,Math.min(itemXpToNext(level)-1,Number.isInteger(p.xp)?p.xp:0))};}
export function itemStats(ref){
 const type=typeof ref==='string'?ref:ref?.type,base=Object.hasOwn(items,type)?items[type]:null;if(!base)return {type:null,level:1,hp:0,damage:1,recovery:1,defense:0,regen:0,thorns:0,abilityFactor:1};
 const {level}=itemProgress(typeof ref==='object'?ref:{}),n=level-1,scale=1+.1*n;
 return {...base,type,level,hp:Math.round((base.hp||0)*scale)+(base.ability?2*n:0),damage:1+((base.damage||1)-1)*scale,recovery:1+((base.recovery||1)-1)*scale,defense:(base.defense||0)*scale,regen:Math.round((base.regen||0)*scale),thorns:Math.round((base.thorns||0)*scale),abilityFactor:1+.04*n};
}
export function describeItem(ref){const s=itemStats(ref),parts=[];if(!s.type)return 'No relic equipped.';if(s.hp)parts.push('+'+s.hp+' HP');if(s.damage>1)parts.push('+'+Math.round((s.damage-1)*100)+'% damage');if(s.recovery>1)parts.push('+'+Math.round((s.recovery-1)*100)+'% healing/shields');if(s.defense)parts.push('+'+Math.round(s.defense*100)+'% defense');if(s.regen)parts.push('+'+s.regen+' HP/round');if(s.thorns)parts.push(s.thorns+' thorns');if(s.ability)parts.push('Unlocks '+abilities[s.ability].name+' · skill power ×'+s.abilityFactor.toFixed(2));return parts.join(' · ');}
export function equippedRelic(state,petId){return state.relics?.find(r=>r.id===state.equipment[petId])||null;}
export function battleEquipment(state){return Object.fromEntries(state.pets.map(p=>[p.id,equippedRelic(state,p.id)]).filter(([,r])=>r));}
export function addRelic(state,type,count=1){
 if(!Object.hasOwn(items,type))return [];state.relics??=[];state.inventory??={};state.relicSerial=Number.isInteger(state.relicSerial)?state.relicSerial:0;const made=[];
 for(let i=0;i<count&&state.relics.filter(r=>r.type===type).length<999;i++){let id;do{id='relic-'+(++state.relicSerial);}while(state.relics.some(r=>r.id===id));const relic={id,type,level:1,xp:0};state.relics.push(relic);made.push(relic);}
 state.inventory[type]=state.relics.filter(r=>r.type===type).length;return made;
}
export function grantItemXp(relic,amount){const before=itemProgress(relic);Object.assign(relic,before);if(!Number.isFinite(amount)||amount<=0||before.level===ITEM_MAX_LEVEL)return {amount:0,before:before.level,after:before.level};relic.xp+=Math.floor(amount);while(relic.level<ITEM_MAX_LEVEL&&relic.xp>=itemXpToNext(relic.level)){relic.xp-=itemXpToNext(relic.level);relic.level++;}if(relic.level===ITEM_MAX_LEVEL)relic.xp=0;return {amount:Math.floor(amount),before:before.level,after:relic.level};}
export function resolveTrainingLoot(state,battle,rng=Math.random){
 if(!battle?.outcome||battle.context?.mode!=='training')return null;if(battle.trainingLoot)return battle.trainingLoot;
 const chance=TRAINING_DROP_CHANCE[battle.context.tier]??.35,result={chance,items:[]};battle.trainingLoot=result;
 if(rng()<chance){const pool=Object.entries(items).flatMap(([id,item])=>Array(({UNCOMMON:5,RARE:3,EPIC:1})[item.rarity]||1).fill(id)),id=pool[Math.min(pool.length-1,Math.max(0,Math.floor(rng()*pool.length)))];const copies=addRelic(state,id);if(copies.length)result.items.push({id,count:1,relicId:copies[0].id});}
 return result;
}
