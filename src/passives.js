import {legendPassives,petSpecies,resolveRole} from './catalog.js';

export const ANIMAL_PASSIVES={
 deer:{id:'springShare',name:'Spring offering',icon:'❀',description:'Healing one ally shares 25% of the HP actually restored with the most wounded other living ally. Shared healing cannot trigger another passive.'},
 fox:{id:'prismatic',name:'Prismatic instinct',icon:'✧',description:'After triggering an elemental reaction, gain Courage (+35% damage) for 2 rounds. Once per skill.'},
 bear:{id:'obsidian',name:'Cooling obsidian',icon:'⬡',description:'The first time damage leaves you alive below 40% HP, gain a shield equal to 20% of maximum HP. Once per encounter.'},
 owl:{id:'keenSight',name:'Keen sight',icon:'◉',description:'Deal 15% more direct damage to exposed enemies, in addition to exposure’s normal bonus.'},
 tortoise:{id:'recycle',name:'Verdant recycle',icon:'♧',description:'At the start of your turn, convert up to 10% of your maximum HP in leftover shield into half as much healing for the most wounded living ally. Only consume shield that can restore HP.'},
 otter:{id:'sharingCurrent',name:'Sharing current',icon:'≋',description:'After using a single-ally healing skill, grant 2 rounds of regeneration to the most wounded other living ally.'},
 shark:{id:'predator',name:'Deepwater hunter',icon:'⚔',description:'Deal 20% more direct damage to enemies below 50% HP.'},
 lynx:{id:'pounce',name:'Opening pounce',icon:'ϟ',description:'Deal 15% more direct damage to enemies above 75% HP.'},
 stag:{id:'groveGuardian',name:'Grove guardian',icon:'♜',description:'When you taunt, give every other living ally a shield equal to 4% of your maximum HP.'},
 penguin:{id:'icebound',name:'Icebound shelter',icon:'❄',description:'At round end, if you still have a shield, restore 4% of your maximum HP. Cannot revive.'},
 ray:{id:'lanternWake',name:'Lantern wake',icon:'✦',description:'After casting a team buff without damage or healing, shield the living ally with the lowest HP percentage for 5% of their maximum HP.'},
 moth:{id:'pollen',name:'Cleansing pollen',icon:'❋',description:'Your active healing skills also remove burn from their living targets.'}
};
export function passiveOf(p){const legend=legendPassives[p.id];if(legend)return {id:p.id,...legend,legend:true};return ANIMAL_PASSIVES[petSpecies(p)]||ANIMAL_PASSIVES[{tank:'bear',fighter:'lynx',support:'deer'}[resolveRole(p)]];}
