import {resolveRole} from './catalog.js';

export const TALENT_LEVELS=[25,50,75];
export const ROLE_TALENTS={
 tank:{25:[{id:'deepRoots',name:'Deep roots',description:'+15% maximum HP.',hp:1.15},{id:'guardianArts',name:'Guardian arts',description:'+25% healing and shield power.',recovery:1.25}],75:[{id:'lastStand',name:'Last stand',description:'Once per encounter, survive a lethal direct hit at 1 HP and gain a 20% max-HP shield.'},{id:'guardianAura',name:'Guardian aura',description:'At the start of your turn, shield the most wounded other living ally for 6% of your maximum HP.'}]},
 fighter:{25:[{id:'ferocity',name:'Ferocity',description:'+12% ability damage.',attack:1.12},{id:'siphon',name:'Siphoning strikes',description:'Restore HP equal to 12% of the HP damage dealt by your active attacks. Does not revive or trigger from passives, reactions, or counters.'}],75:[{id:'executioner',name:'Executioner',description:'+25% direct damage against foes below 35% HP.'},{id:'momentum',name:'Battle momentum',description:'Once per round, a credited kill reduces all your current skill cooldowns by 1.'}]},
 support:{25:[{id:'restoration',name:'Restoration',description:'+15% healing and shield power.',recovery:1.15},{id:'overflow',name:'Overflowing grace',description:'Active healing converts 50% of unused healing into a shield, capped at 15% of the target’s max HP. Shields do not stack.'}],75:[{id:'evergreen',name:'Evergreen',description:'Regeneration you apply lasts 1 extra round.'},{id:'wardweaver',name:'Wardweaver',description:'Your active healing skills also shield each living target for 6% of their maximum HP. Shields do not stack.'}]}
};
export const ELEMENT_TALENTS={
 Ember:[{id:'kindling',name:'Endless kindling',description:'Burns you apply deal 40% more damage.'},{id:'ashenHeart',name:'Ashen heart',description:'+8% maximum HP and immunity to burn.',hp:1.08}],
 Grove:[{id:'renewal',name:'Renewal',description:'Regeneration you receive restores 50% more HP.'},{id:'heartwood',name:'Heartwood',description:'+10% maximum HP.',hp:1.1}],
 Tide:[{id:'healingTide',name:'Healing tide',description:'+20% healing and shield power.',recovery:1.2},{id:'surgingTide',name:'Surging tide',description:'+20% elemental reaction damage and healing.',reaction:1.2}],
 Astral:[{id:'charged',name:'Charged arts',description:'+15% direct Astral damage.'},{id:'conductor',name:'Conductor',description:'+25% elemental reaction damage and healing.',reaction:1.25}]
};
export function talentChoices(p,level){return level===50?ELEMENT_TALENTS[p.element]||[]:ROLE_TALENTS[resolveRole(p)]?.[level]||[];}
export function normalizedTalents(p,level=p.level||1){const result={};for(const milestone of TALENT_LEVELS)if(level>=milestone&&talentChoices(p,milestone).some(t=>t.id===p.talents?.[milestone]))result[milestone]=p.talents[milestone];return result;}
export function activeTalents(p){const chosen=normalizedTalents(p);return TALENT_LEVELS.flatMap(level=>talentChoices(p,level).filter(t=>t.id===chosen[level]));}
export function hasTalent(p,id){return activeTalents(p).some(t=>t.id===id);}
export function talentBonuses(p){return activeTalents(p).reduce((bonus,t)=>({hp:bonus.hp*(t.hp||1),attack:bonus.attack*(t.attack||1),recovery:bonus.recovery*(t.recovery||1),reaction:bonus.reaction*(t.reaction||1)}),{hp:1,attack:1,recovery:1,reaction:1});}
export function chooseTalent(state,petId,milestone,id){const p=state.pets.find(p=>p.id===petId),level=state.account?.level||1;if(!p||!TALENT_LEVELS.includes(milestone)||level<milestone||id!==null&&!talentChoices(p,milestone).some(t=>t.id===id))return false;p.talents=normalizedTalents(p,level);if(id===null)delete p.talents[milestone];else p.talents[milestone]=id;return true;}
