import {elements} from './catalog.js';

export const ELEMENT_REACTIONS=[
 {id:'steam',name:'Steam burst',icon:'♨',elements:['Ember','Tide'],power:14,status:'weaken',duration:2,description:'14 bonus damage and weaken the target for 2 rounds.'},
 {id:'wildfire',name:'Wildfire',icon:'♨',elements:['Ember','Grove'],power:10,status:'burn',duration:3,description:'10 bonus damage and burn the target for 3 rounds.'},
 {id:'overload',name:'Overload',icon:'✹',elements:['Ember','Astral'],power:12,status:'exposed',duration:2,description:'12 bonus damage and expose the target for 2 rounds.'},
 {id:'bloom',name:'Bloom',icon:'❀',elements:['Grove','Tide'],power:16,heal:true,description:'Heal your living ally with the lowest health percentage for 16 HP and grant 2 rounds of regeneration. Once per skill.'},
 {id:'conduction',name:'Conduction',icon:'ϟ',elements:['Tide','Astral'],power:16,area:true,description:'Chain lightning hits every living enemy for 16 bonus damage, bypassing taunt. Once per skill.'},
 {id:'staticbind',name:'Static bind',icon:'⌁',elements:['Grove','Astral'],power:10,status:'stun',duration:1,description:'10 bonus damage and stun the target, skipping its next action.'}
];
export function reactionFor(first,second){return first!==second?ELEMENT_REACTIONS.find(r=>r.elements.includes(first)&&r.elements.includes(second))||null:null;}
// Only active damaging skills call this. Reactions consume the aura; they never apply another one.
export function touchElement(target,element){
 if(!Object.hasOwn(elements,element))return null;
 const previous=target.elementalAura,reaction=previous&&reactionFor(previous.element,element);
 if(reaction){delete target.elementalAura;return reaction;}
 if(target.hp>0)target.elementalAura={element,remaining:2};
 return null;
}
