import {abilities,basicMove,roleLoadout,items} from './catalog.js';
import {learnedMoves} from './progression.js';
import {itemStats} from './relics.js';
export const SKILL_LIMIT=4;
export function skillLibrary(p,relic=null){return [...new Set([...learnedMoves(p),...(itemStats(relic).ability?[itemStats(relic).ability]:[])])].filter(id=>abilities[id]&&!abilities[id].bossOnly);}
export function equippedMoves(p,relic=null){const q=roleLoadout(p),basic=basicMove(q),library=skillLibrary(q,relic),chosen=Array.isArray(p.equippedSkills)?p.equippedSkills:[...q.moves,...library];return [basic,...new Set(chosen.filter(id=>id!==basic&&library.includes(id)))].slice(0,SKILL_LIMIT);}
export function setSkillLoadout(p,moves,relic=null){if(!Array.isArray(moves)||!moves.length||moves.length>SKILL_LIMIT||moves[0]!==basicMove(p)||new Set(moves).size!==moves.length||moves.some(id=>!skillLibrary(p,relic).includes(id)))return false;p.equippedSkills=[...moves];return true;}
export function enemyLoadout(p){const learned=skillLibrary(p),basic=basicMove(p);if(p.legend)return equippedMoves(p);
 const specialty=learned.filter(id=>id!==basic).sort((a,b)=>{const score=id=>{const s=abilities[id];return (s.minLevel||1)*3+(p.role==='tank'&&s.status==='taunt'?60:p.role==='support'&&['heal','teamheal','lifebloom','cleanse'].includes(s.kind)?45:0);};return score(b)-score(a);});return [basic,...specialty.slice(0,3)];}
