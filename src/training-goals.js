import {items} from './catalog.js';

export function trainingGoals(value={}){
 const integer=(n,max)=>Number.isInteger(n)?Math.max(0,Math.min(max,n)):0;
 return {battleLimit:integer(value?.battleLimit,999),targetLevel:integer(value?.targetLevel,100),item:value?.item==='any'||Object.hasOwn(items,value?.item)?value.item:'none'};
}
export function goalDescription(value){const goals=trainingGoals(value),parts=[];if(goals.battleLimit)parts.push(goals.battleLimit+' completed battle'+(goals.battleLimit===1?'':'s'));if(goals.targetLevel)parts.push('account level '+goals.targetLevel);if(goals.item!=='none')parts.push(goals.item==='any'?'any new item drop':items[goals.item].name+' drop');return parts.length?'Stop after reaching any goal: '+parts.join(' · '):'No stop goal · repeat until you press Stop';}
