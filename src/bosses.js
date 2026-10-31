import {wilds,legendFor,basicMove} from './catalog.js';
export const BOSS_PROFILES={
 'legend-pyrragon':{special:'bossInferno',kit:['dragonClaw','dragonBreath','dragonFury','bossInferno'],minions:[['saffron','Ashfang whelp'],['nectar','Cinderwing imp']],lair:'The Sunken Furnace',rule:'Burns feed its attack. Cleanse the flames and strike back with Astral lightning.'},
 'legend-cloudsage':{special:'bossMountain',kit:['sageStaff','cloudChallenge','stoneSkin','bossMountain'],minions:[['bramble','Stoneguard sprite'],['fernox','Cloudstaff disciple']],lair:'The Skybound Monastery',rule:'Every direct hit draws a counter. Defeat its guardians and time your shields.'},
 'legend-stormroc':{special:'bossTempest',kit:['rocTalons','thunderStrike','focus','bossTempest'],minions:[['wisp','Thunder fledgling'],['moondrift','Stormcloud spirit']],lair:'The Shattered Aerie',rule:'Start-of-turn lightning pressures your whole team. Save a cleanse for stuns.'},
 'legend-neruvia':{special:'bossAbyss',kit:['pearlPulse','oceanChorus','royalTide','bossAbyss'],minions:[['jetfin','Abyssal hunter'],['dusk','Pearlkeeper spirit']],lair:'The Pearl Abyss',rule:'Healing sustains the deep. Focus damage between recovery turns.'}
};
export function bossProfile(p){return BOSS_PROFILES[typeof p==='string'?p:p?.id]||null;}
export function summonTemplate(boss,index,wave){const profile=bossProfile(boss),[id,name]=profile.minions[index%profile.minions.length],base=wilds.find(p=>p.id===id);return {...structuredClone(base),id:`summon-${boss.id}-${wave}-${index}`,name,element:boss.element,level:boss.level,xp:0,hp:Math.round(base.hp*.48),encounterPower:.65,minion:true,xpFactor:.3,ownerBoss:boss.id};}
