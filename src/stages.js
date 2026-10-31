import {MAX_PET_LEVEL} from './rules.js';
export const GROWTH_STAGES=[
 {index:1,id:'young',name:'Young',minLevel:1,maxLevel:4,description:'Simple markings and a small role charm.'},
 {index:2,id:'awakened',name:'Awakened',minLevel:5,maxLevel:9,description:'Role equipment and an elemental crest emerge.'},
 {index:3,id:'ascendant',name:'Ascendant',minLevel:10,maxLevel:14,description:'Ornate markings, stronger crests, and flowing elemental details.'},
 {index:4,id:'exalted',name:'Exalted',minLevel:15,maxLevel:MAX_PET_LEVEL,description:'A complete regalia with a luminous aura and runic ornaments.'}
];
export function growthStage(p){const value=typeof p==='number'?p:p?.level,level=Number.isFinite(value)?Math.max(1,Math.min(MAX_PET_LEVEL,Math.floor(value))):1;return [...GROWTH_STAGES].reverse().find(stage=>level>=stage.minLevel);}
