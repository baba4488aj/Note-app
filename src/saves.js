import {abilities,legendFor} from './catalog.js';
import {GAME_VERSION} from './rules.js';
export const SAVE_FORMAT='lumenwild-save';
export const SAVE_SCHEMA=1;
export function newerVersion(value,current=GAME_VERSION){const a=String(value||'0').split('.').map(Number),b=current.split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0);}return false;}
export function saveEnvelope(state,date=new Date()){return {format:SAVE_FORMAT,schemaVersion:SAVE_SCHEMA,gameVersion:GAME_VERSION,savedAt:date.toISOString(),state:structuredClone(state)};}
export function readSaveData(input){
 const raw=typeof input==='string'?JSON.parse(input):input;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Choose a Lumenwild JSON save.');
 if(raw.format&&raw.format!==SAVE_FORMAT)throw new Error('This file is not a Lumenwild save.');
 if((raw.schemaVersion||raw.saveVersion||1)>SAVE_SCHEMA||newerVersion(raw.gameVersion))throw new Error('This save needs a newer version of Lumenwild. Update the game before loading it.');
 const data=raw.format===SAVE_FORMAT?raw.state:raw;
 if(!data||!Array.isArray(data.pets)||!data.pets.length||data.pets.length>10000||data.pets.some(p=>!p||typeof p.id!=='string'||p.id.length>=100||typeof p.name!=='string'||!p.name.trim()||p.name.length>40||typeof p.color!=='string'||!/^#[\da-f]{6}$/i.test(p.color)||!Number.isFinite(p.hp)||p.hp<70||p.hp>160||!['Astral','Grove','Tide','Ember'].includes(p.element)||!Array.isArray(p.moves)||!legendFor(p)&&(p.moves.length!==3||new Set(p.moves).size!==3||!p.moves.includes('bite')||p.moves.some(id=>!Object.hasOwn(abilities,id)||abilities[id].itemOnly||abilities[id].legendOnly||abilities[id].bossOnly||abilities[id].minLevel>1))))throw new Error('This save has invalid pet data. Your current progress was kept.');
 return data;
}
export function createDesktopSaveWriter(config,{fetcher=fetch,onStatus=()=>{}}={}){
 let queue=Promise.resolve();
 return {write(state){const body=JSON.stringify(saveEnvelope(state));onStatus('Saving to desktop…');queue=queue.catch(()=>{}).then(async()=>{const response=await fetcher('/api/save',{method:'POST',headers:{'Content-Type':'application/json','X-Lumenwild-Token':config.token},body});if(!response.ok)throw new Error('Desktop save failed. Export a backup before closing the game.');onStatus('Saved to desktop');}).catch(error=>{onStatus('Save failed · export a backup');throw error;});queue.catch(()=>{});return queue;},flush(){return queue;}};
}
