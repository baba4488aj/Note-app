import {TOWER_LEVEL_STEP} from './rules.js';
import {equippedMoves} from './skills.js';
import {addRelic,resolveTrainingLoot} from './relics.js';
import {starters,wilds,legends,items} from './catalog.js';
import {progressionOf,accountProgress,accountPet,MAX_LEVEL} from './progression.js';
export const TOWER_FLOORS=20;
export const trainingTiers={gentle:{name:'Gentle',offset:-1,hp:.7,damage:.8,xp:.8,count:2},balanced:{name:'Balanced',offset:0,hp:.9,damage:.95,xp:1,count:3},challenging:{name:'Challenging',offset:2,hp:1,damage:1,xp:1.25,count:3}};
export function teamLevel(pets){return Math.max(1,Math.round(pets.reduce((sum,p)=>sum+progressionOf(p).level,0)/Math.max(1,pets.length)));}
export function legendAtFloor(floor){return legends.find(p=>p.bossFloor===floor);}
export function towerFloorInfo(floor){const legend=legendAtFloor(floor);return {floor,level:Math.min(MAX_LEVEL,Math.max(1,floor*TOWER_LEVEL_STEP)),boss:!!legend,legendId:legend?.id||null,theme:legend?legend.title:['Moonlit canopy','Sunken observatory','Ember hollow','Verdant citadel'][(floor-1)%4]};}
export function trainingRoster(state){return [...starters,...wilds,...legends.filter(p=>(state.tower?.legendClears||[]).includes(p.bossFloor)||state.pets.some(q=>q.id===p.id))];}
export function makeEncounter(state,mode='training',floor=1,tier='gentle'){
 if(!['training','tower'].includes(mode))throw new Error('Unknown battle mode.');
 const seed=state.trainingWins||0;
 if(mode==='tower'){
  if(!Number.isInteger(floor)||floor<1||floor>TOWER_FLOORS||floor>(state.tower?.highestCleared||0)+1)throw new Error('That tower floor is locked.');
  const info=towerFloorInfo(floor),legend=legendAtFloor(floor),order=['tank','fighter','support'];
  const enemies=order.map((role,i)=>{const pool=wilds.filter(p=>p.role===role),p=structuredClone(legend?.role===role?legend:pool[(Math.floor((floor-1)/3**i)+i)%pool.length]),boss=!!legend&&p.id===legend.id;return {...p,level:info.level,xp:0,boss,hp:Math.round(p.hp*(boss?2.8:1)),encounterPower:boss?1.2:1,encounterDefense:boss?.08:0};});
  return {mode,floor,...info,enemies:legend?enemies.filter(p=>p.boss):enemies,xpMultiplier:1.15,label:'Tower · Floor '+floor+(legend?' · Legend trial':''),featuredId:legend?.id||enemies[1].id};
 }
 if(!Object.hasOwn(trainingTiers,tier))tier='gentle';const settings=trainingTiers[tier],level=Math.min(MAX_LEVEL,Math.max(1,accountProgress(state).level+settings.offset));
 const roster=trainingRoster(state),target=trainingTargetPet(state),roleOrder=['fighter','tank','support'];
 const enemies=Array.from({length:settings.count},(_,i)=>{let p=target;if(i){const role=roleOrder[(roleOrder.indexOf(target.role)+i)%roleOrder.length],pool=roster.filter(p=>p.role===role&&p.id!==target.id);p=pool[(Math.floor(seed/3)+i)%pool.length];}p=structuredClone(p);return {...p,hp:Math.round(p.hp*settings.hp),level,xp:0,encounterPower:settings.damage};});
 return {mode,tier,enemies,level,xpMultiplier:settings.xp,label:'Training · '+settings.name,featuredId:target.id};
}
export function hasLegendReward(state,context){return context?.mode==='tower'&&!!legendAtFloor(context.floor)&&!(state.tower?.legendClears||[]).includes(context.floor);}
export function claimEncounter(state,battle){
 if(!battle||battle.outcome!=='won'||battle.claimed||!battle.context)return null;const context=battle.context;if(!['training','tower'].includes(context.mode))return null;
 if(context.mode==='tower'&&(!Number.isInteger(context.floor)||context.floor<1||context.floor>TOWER_FLOORS||context.floor>state.tower.highestCleared+1))return null;
 battle.claimed=true;const result={items:[],pet:null,firstClear:false,firstLegendClear:false,legend:null};let earnLoot=true;
 if(context.mode==='tower'){
  result.firstClear=context.floor>state.tower.highestCleared;result.firstLegendClear=hasLegendReward(state,context);earnLoot=result.firstClear||result.firstLegendClear;
  if(result.firstClear)state.tower.highestCleared=context.floor;
  if(result.firstLegendClear){state.tower.legendClears??=[];state.tower.legendClears.push(context.floor);state.tower.legendClears.sort((a,b)=>a-b);}
 }else state.trainingWins=(state.trainingWins||0)+1;
 if(context.mode==='training'){result.items=resolveTrainingLoot(state,battle)?.items||[];}else if(earnLoot){const ids=Object.keys(items),index=context.mode==='tower'?context.floor-1:state.trainingWins-1,id=ids[index%ids.length],count=context.boss?2:1;const made=addRelic(state,id,count);if(made.length)result.items.push({id,count:made.length});}
 const legend=context.mode==='tower'?legendAtFloor(context.floor):null,pet=legend||[...starters,...wilds,...legends].find(p=>p.id===context.featuredId);
 if((earnLoot||legend)&&pet&&!state.pets.some(q=>q.id===pet.id)){const recruit=structuredClone(pet);recruit.equippedSkills=equippedMoves(accountPet(state,recruit));state.pets.push(recruit);result.pet=pet.name;if(legend)result.legend=pet.name;}
 state.encounter=(state.encounter||0)+1;return result;
}
export function trainingTargetPet(state){const roster=trainingRoster(state),choice=state.trainingTarget||'discover';if(choice==='rotation')return roster[(state.trainingWins||0)%roster.length];const chosen=roster.find(p=>p.id===choice);return chosen||roster.find(p=>!state.pets.some(q=>q.id===p.id))||roster[(state.trainingWins||0)%roster.length];}
