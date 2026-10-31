import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starters,wilds,elements,roles,elementalLearnsets} from '../src/catalog.js';
import {defaultSave,restoreSave,equipItem} from '../src/storage.js';
import {accountPet,accountPets,grantAccountXp,defeatXp,xpToNext,petStats,learnedMoves,bankBattleXp} from '../src/progression.js';
import {makeEncounter,claimEncounter} from '../src/modes.js';
import {createBattle,performAction,finishRound,consumeStuns} from '../src/combat.js';
import {equippedMoves} from '../src/skills.js';
import {growthStage} from '../src/stages.js';
import {collectionPreferences,selectPets} from '../src/collection.js';
import {ELEMENT_REACTIONS,reactionFor} from '../src/reactions.js';
import {planAutoAction} from '../src/autotraining.js';

const typed=(element,id)=>({...starters[1],id,element,moves:['bite','nova','spark'],equippedSkills:['bite','nova','spark']});
function combo(first,second,enemies=[{...wilds[1],level:20}]){return createBattle([typed(first,'primer'),typed(second,'trigger')],enemies);}
function end(b){b.phase='enemy';b.enemies.forEach(p=>p.acted=true);return finishRound(b);}

test('collection sorts by element or role without changing acquisition order or team slots',()=>{
 const s=defaultSave();s.pets.push(...structuredClone(wilds));const original=s.pets.map(p=>p.id),team=[...s.teamIds];
 for(const [sort,key,order]of [['element','element',Object.keys(elements)],['role','role',Object.keys(roles)]]){const sorted=selectPets(s.pets,{sort});for(let i=1;i<sorted.length;i++)assert.ok(order.indexOf(sorted[i-1][key])<=order.indexOf(sorted[i][key]));}
 assert.deepEqual(s.pets.map(p=>p.id),original);assert.deepEqual(s.teamIds,team);
 assert.deepEqual(selectPets(s.pets,{sort:'collected'}).map(p=>p.id),original);
});

test('combined element/role filters, empty results and preferences survive save restoration',()=>{
 const s=defaultSave();s.collection={sort:'role',element:'Grove',role:'support'};assert.deepEqual(selectPets(s.pets,s.collection).map(p=>p.id),['moss']);
 assert.deepEqual(restoreSave(s).collection,s.collection);assert.equal(selectPets(s.pets,{element:'Tide',role:'tank'}).length,0);
 assert.deepEqual(collectionPreferences({sort:'invalid',role:'__proto__',element:null}),{sort:'collected',element:'all',role:'all'});
});

test('legacy saves keep their highest level and XP fraction and every companion catches up',()=>{
 const s=defaultSave();delete s.account;Object.assign(s.pets[0],{level:4,xp:0});Object.assign(s.pets[1],{level:27,xp:200});Object.assign(s.pets[2],{level:27,xp:400});equipItem(s,'moss','lens');s.tower.highestCleared=11;
 const loaded=restoreSave(s);assert.deepEqual(loaded.account,{level:27,xp:Math.floor(400/840*xpToNext(27))});
 assert.ok(accountPets(loaded).every(p=>p.level===27&&growthStage(p).name==='Exalted'));
 assert.ok(loaded.pets.every(p=>!Object.hasOwn(p,'level')&&!Object.hasOwn(p,'xp')));assert.deepEqual(loaded.equipment,s.equipment);assert.equal(loaded.tower.highestCleared,11);assert.deepEqual(restoreSave(loaded),loaded);
});

test('account XP raises stats, skill libraries, and appearance for deployed and benched pets',()=>{
 const s=defaultSave();s.teamIds=['luna'];const old=accountPets(s).map(p=>petStats(p));
 grantAccountXp(s,Array.from({length:9},(_,i)=>xpToNext(i+1)).reduce((a,b)=>a+b));assert.deepEqual(s.account,{level:10,xp:0});
 for(const [i,p]of accountPets(s).entries()){assert.ok(petStats(p).maxHp>old[i].maxHp);assert.equal(growthStage(p).name,'Ascendant');assert.ok(learnedMoves(p).includes(elementalLearnsets[p.element].at(-1)[0]));}
});

test('new recruits inherit the current account level and keep valid four-skill builds',()=>{
 const s=defaultSave();s.account.level=38;const context=makeEncounter(s,'training');claimEncounter(s,{context,outcome:'won'});
 const recruit=s.pets.at(-1),snapshot=accountPet(s,recruit);assert.equal(snapshot.level,38);assert.equal(growthStage(snapshot).name,'Exalted');assert.ok(learnedMoves(snapshot).length>7);assert.equal(equippedMoves(snapshot).length,4);assert.equal(recruit.level,undefined);
 assert.equal(makeEncounter(s,'training',1,'challenging').level,40);
});

test('higher-level kills award increasingly more account XP with difficulty and minion modifiers',()=>{
 assert.equal(defeatXp({level:1}),38);assert.ok(defeatXp({level:10})>defeatXp({level:5})*2);assert.ok(defeatXp({level:100})>defeatXp({level:20}));
 for(let level=2;level<=100;level++)assert.ok(defeatXp({level})>defeatXp({level:level-1}));
 assert.equal(defeatXp({level:25,xpFactor:.3},1.25),Math.round(38*25**1.25*.3*1.25));
 const s=defaultSave();s.account={level:99,xp:0};grantAccountXp(s,1e9);assert.deepEqual(s.account,{level:100,xp:0});assert.equal(grantAccountXp(s,100).amount,0);
});

for(const reaction of ELEMENT_REACTIONS)test(reaction.name+' triggers in either order and consumes the aura',()=>{
 for(const [first,second]of [reaction.elements,[...reaction.elements].reverse()]){
  const b=combo(first,second);b.players[0].hp=5;performAction(b,'player','player-0','bite','enemy-0');assert.deepEqual(b.enemies[0].elementalAura,{element:first,remaining:2});
  const event=performAction(b,'player','player-1','bite','enemy-0');assert.equal(event.afterEvents.length,1);assert.equal(event.afterEvents[0].reaction,reaction.id);assert.equal(b.enemies[0].elementalAura,undefined);
  if(reaction.status)assert.equal(b.enemies[0].statuses[reaction.status],reaction.duration);
  if(reaction.heal){assert.equal(b.players[0].hp,21);assert.equal(b.players[0].statuses.regen,2);}
 }
});

test('aura refreshes on matching hits, expires after two round ends, and never reacts with itself',()=>{
 const b=combo('Tide','Tide');performAction(b,'player','player-0','bite','enemy-0');const event=performAction(b,'player','player-1','bite','enemy-0');assert.equal(event.afterEvents.length,0);assert.equal(reactionFor('Tide','Tide'),null);end(b);assert.equal(b.enemies[0].elementalAura.remaining,1);end(b);assert.equal(b.enemies[0].elementalAura,undefined);
});

test('Conduction from an AoE triggers once, bypasses taunt and awards reaction kills once',()=>{
 const enemies=wilds.slice(0,3).map(p=>({...p,element:'Ember'})),b=combo('Tide','Astral',enemies);
 performAction(b,'player','player-0','nova');b.enemies.forEach(p=>p.hp=35);b.enemies[1].statuses.taunt=2;
 const event=performAction(b,'player','player-1','nova');assert.equal(event.afterEvents.length,1);assert.equal(event.afterEvents[0].targets.length,3);assert.equal(event.afterEvents[0].effects.filter(e=>e.type==='damage').length,3);assert.equal(b.outcome,'won');assert.equal(b.defeats.length,3);assert.ok(b.defeats.every(d=>d.killer==='player-1'));
 const s=defaultSave();bankBattleXp(s,b,event);assert.equal(b.accountXpEarned,114);assert.equal(s.account.level,2);assert.equal(s.account.xp,54);assert.equal(bankBattleXp(s,b,event).length,0);
});

test('Bloom from several primed enemies heals once and never revives a fallen ally',()=>{
 const b=createBattle([typed('Tide','primer'),typed('Grove','trigger'),{...starters[0],id:'fallen'}],wilds.slice(0,3).map(p=>({...p,level:20})));
 b.players[0].hp=3;b.players[2].hp=0;performAction(b,'player','player-0','nova');const event=performAction(b,'player','player-1','nova');assert.equal(event.afterEvents.length,1);assert.deepEqual(event.afterEvents[0].targets,['player-0']);assert.equal(b.players[0].hp,19);assert.equal(b.players[2].hp,0);
});

test('enemy skills can trigger reactions and Static bind skips exactly one action',()=>{
 const b=createBattle([{...wilds[1],level:20}],[typed('Grove','primer'),typed('Astral','trigger')]);b.phase='enemy';performAction(b,'enemy','enemy-0','bite','player-0');const e=performAction(b,'enemy','enemy-1','bite','player-0');assert.equal(e.afterEvents[0].reaction,'staticbind');b.phase='player';const skipped=consumeStuns(b,'player');assert.ok(skipped.effects.some(e=>e.type==='control'));assert.equal(b.players[0].statuses.stun,undefined);assert.equal(b.players[0].acted,true);
});

test('cleanse removes auras; healing and burn ticks cannot apply or trigger reactions',()=>{
 const p={...starters[0],moves:['bite','mend','bloom'],equippedSkills:['bite','mend','bloom']},b=createBattle([p],[typed('Tide','foe')]);b.phase='enemy';performAction(b,'enemy','enemy-0','bite','player-0');b.phase='player';performAction(b,'player','player-0','mend','player-0');assert.equal(b.players[0].elementalAura,undefined);assert.equal(b.enemies[0].elementalAura,undefined);
 b.enemies[0].statuses.burn=2;b.enemies[0].statusSources.burn='player-0';end(b);assert.equal(b.enemies[0].elementalAura,undefined);
});

test('auto training values a ready reaction while following normal targeting and cooldown rules',()=>{
 const b=combo('Tide','Astral',wilds.slice(0,3).map(p=>({...p,level:20})));b.players.forEach(p=>p.moves=['bite']);performAction(b,'player','player-0','bite','enemy-2');const next=planAutoAction(b);assert.equal(next.actor,'player-1');assert.equal(next.target,'enemy-2');assert.equal(performAction(b,'player',next.actor,next.move,next.target).afterEvents[0].reaction,'conduction');
});
