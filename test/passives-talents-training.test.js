import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starters,wilds,legends,abilities} from '../src/catalog.js';
import {ANIMAL_PASSIVES,passiveOf} from '../src/passives.js';
import {TALENT_LEVELS,talentChoices,activeTalents,chooseTalent} from '../src/talents.js';
import {defaultSave,restoreSave} from '../src/storage.js';
import {accountPet,accountPets,petStats,bankBattleXp} from '../src/progression.js';
import {createBattle,performAction,finishRound,preparePet} from '../src/combat.js';
import {TrainingLoop,planAutoAction} from '../src/autotraining.js';
import {trainingGoals} from '../src/training-goals.js';

const animals=[...starters,...wilds];
const animal=species=>structuredClone(animals.find(p=>p.species===species));
const foe=(id='foe')=>({...animal('fox'),id,level:100,element:'Tide'});
const end=b=>{b.phase='enemy';b.enemies.forEach(p=>p.acted=true);return finishRound(b);};
const cast=(b,move,target='enemy-0')=>performAction(b,'player','player-0',move,target);

test('all twelve ordinary animals have distinct passives and custom myth models cannot inherit Legend passives',()=>{
 assert.equal(Object.keys(ANIMAL_PASSIVES).length,12);assert.equal(new Set(animals.map(p=>passiveOf(p).id)).size,12);
 for(const p of legends)assert.equal(passiveOf(p).id,p.id);
 for(const p of [...animals,...legends]){const custom={...p,id:'custom'};assert.ok(passiveOf(custom));assert.ok(!passiveOf(custom).legend);}
});
test('deer shares effective single-target healing with another wounded ally without reviving',()=>{
 const b=createBattle([animal('deer'),animal('fox'),animal('bear')],[foe()]);b.players[1].hp=10;b.players[2].hp=25;cast(b,'bloom','player-1');assert.equal(b.players[1].hp,38);assert.equal(b.players[2].hp,32);
 const c=createBattle([animal('deer'),animal('fox'),animal('bear')],[foe()]);c.players[1].hp=90;c.players[2].hp=0;cast(c,'bloom','player-1');assert.equal(c.players[1].hp,95);assert.equal(c.players[2].hp,0);
});
test('otter shares regeneration with the most wounded other ally',()=>{
 const b=createBattle([animal('otter'),animal('fox'),animal('bear')],[foe()]);b.players[1].hp=40;b.players[2].hp=10;cast(b,'bloom','player-1');assert.equal(b.players[2].statuses.regen,2);assert.equal(b.players[1].statuses.regen,undefined);
});
test('tortoise recycles only available leftover shield and only once per turn',()=>{
 const b=createBattle([animal('tortoise'),animal('fox')],[foe()]);b.players[0].shield=20;b.players[1].hp=10;const event=cast(b,'bite');assert.equal(b.players[0].shield,7);assert.equal(b.players[1].hp,16);assert.equal(event.beforeEvents[0].label,'Verdant recycle');assert.equal(cast(b,'bite'),null);assert.equal(b.players[0].shield,7);
 const c=createBattle([animal('tortoise')],[foe()]);c.players[0].shield=20;cast(c,'bite');assert.equal(c.players[0].shield,20);
});
test('bear emergency shield triggers once per encounter and cannot prevent an already lethal hit',()=>{
 const b=createBattle([animal('bear')],[{...animal('fox'),id:'foe',element:'Ember'}]);b.players[0].hp=53;b.phase='enemy';performAction(b,'enemy','enemy-0','bite','player-0');assert.equal(b.players[0].hp,38);assert.equal(b.players[0].shield,26);assert.equal(b.players[0].passiveState.obsidian,true);
 b.enemies[0].acted=false;b.players[0].shield=0;performAction(b,'enemy','enemy-0','bite','player-0');assert.equal(b.players[0].shield,0);
 const c=createBattle([animal('bear')],[foe()]);c.players[0].hp=1;c.phase='enemy';performAction(c,'enemy','enemy-0','bite','player-0');assert.equal(c.players[0].hp,0);assert.equal(c.players[0].shield,0);assert.deepEqual(preparePet(animal('bear')).passiveState,{});
});
test('owl, shark, and lynx have distinct conditional damage bonuses',()=>{
 for(const [species,ratio,exposed,power]of [['owl',1,true,22],['shark',.4,false,18],['lynx',1,false,17]]){const b=createBattle([{...animal(species),element:'Tide'}],[{...foe(),level:1,hp:130}]);b.enemies[0].hp=Math.floor(b.enemies[0].maxHp*ratio);if(exposed)b.enemies[0].statuses.exposed=2;const before=b.enemies[0].hp;cast(b,'bite');assert.equal(before-b.enemies[0].hp,power);}
});
test('stag taunt shields teammates, ray buffs shield the weakest ally, and moth healing removes burn',()=>{
 const stag=createBattle([animal('stag'),animal('fox')],[foe()]);cast(stag,'challenge');assert.equal(stag.players[1].shield,6);assert.equal(stag.players[0].shield,18);
 const ray=createBattle([animal('ray'),animal('fox')],[foe()]);ray.players[1].hp=20;cast(ray,'rally');assert.equal(ray.players[1].shield,5);
 const moth=createBattle([animal('moth'),animal('fox')],[foe()]);moth.players[1].statuses={burn:3,weaken:2};moth.players[1].statusSources.burn='enemy-0';cast(moth,'bloom','player-1');assert.equal(moth.players[1].statuses.burn,undefined);assert.equal(moth.players[1].statusSources.burn,undefined);assert.equal(moth.players[1].statuses.weaken,2);
});
test('penguin heals at round end only while alive and shielded; fox gains Courage after a reaction',()=>{
 const b=createBattle([animal('penguin')],[foe()]);b.players[0].hp=50;b.players[0].shield=5;end(b);assert.equal(b.players[0].hp,55);b.players[0].shield=0;end(b);assert.equal(b.players[0].hp,55);
 const c=createBattle([animal('fox')],[foe()]);c.enemies[0].elementalAura={element:'Tide',remaining:2};const event=cast(c,'spark');assert.equal(event.afterEvents[0].reaction,'conduction');assert.equal(c.players[0].statuses.might,2);assert.ok(event.afterEvents[0].effects.some(e=>e.type==='passive'));
});
test('talents gate at 25/50/75, enforce role and element, allow free swaps, and survive saves',()=>{
 const s=defaultSave();assert.equal(chooseTalent(s,'luna',25,'ferocity'),false);s.account.level=25;assert.equal(chooseTalent(s,'luna',25,'ferocity'),true);assert.equal(chooseTalent(s,'moss',25,'ferocity'),false);assert.equal(chooseTalent(s,'luna',50,'conductor'),false);
 s.account.level=100;assert.ok(chooseTalent(s,'luna',50,'conductor'));assert.ok(chooseTalent(s,'luna',75,'momentum'));assert.ok(chooseTalent(s,'luna',25,'siphon'));assert.equal(activeTalents(accountPet(s,s.pets[1])).length,3);assert.ok(chooseTalent(s,'luna',25,null));assert.equal(activeTalents(accountPet(s,s.pets[1])).length,2);assert.deepEqual(restoreSave(s),s);
 for(const p of accountPets(s))for(const level of TALENT_LEVELS)assert.equal(talentChoices(p,level).length,2);
 const bad=structuredClone(s);bad.account.level=26;bad.pets[0].talents={25:'ferocity',50:'heartwood',75:'evergreen'};assert.deepEqual(restoreSave(bad).pets[0].talents,{});
});
test('stat talents affect battle health, power and healing and apply only to future battle snapshots',()=>{
 const s=defaultSave();s.account.level=25;const before=petStats(accountPet(s,s.pets[2])),b=createBattle(accountPets(s),[foe()]);chooseTalent(s,'ember',25,'deepRoots');assert.equal(petStats(accountPet(s,s.pets[2])).maxHp,Math.round(before.maxHp*1.15));assert.equal(b.players[2].maxHp,before.maxHp);
 chooseTalent(s,'ember',25,'guardianArts');assert.equal(petStats(accountPet(s,s.pets[2])).recovery,before.recovery*1.25);
 chooseTalent(s,'luna',25,'ferocity');assert.equal(petStats(accountPet(s,s.pets[1])).attack,petStats({...accountPet(s,s.pets[1]),talents:{}}).attack*1.12);
 chooseTalent(s,'moss',25,'restoration');assert.ok(preparePet(accountPet(s,s.pets[0])).healingFactor>preparePet({...accountPet(s,s.pets[0]),talents:{}}).healingFactor);
});
test('siphon uses actual HP damage, excludes shields and reactions, and never revives',()=>{
 const p={...animal('fox'),level:25,talents:{25:'siphon'}},b=createBattle([p],[foe()]);b.players[0].hp=10;const event=cast(b,'bite'),hit=event.effects.find(e=>e.type==='damage'&&e.cid==='enemy-0').value;assert.equal(b.players[0].hp,10+Math.round(hit*.12));
 const c=createBattle([p],[foe()]);c.players[0].hp=10;c.enemies[0].shield=10000;cast(c,'bite');assert.equal(c.players[0].hp,10);
 const d=createBattle([p],[legends[1]]);d.players[0].hp=1;cast(d,'bite');assert.equal(d.players[0].hp,0);
});
test('overflow creates capped non-stacking shields from overhealing and Wardweaver shields living heal targets',()=>{
 const p={...animal('deer'),level:75,talents:{25:'overflow',75:'wardweaver'}},b=createBattle([p,{...animal('fox'),level:75}],[foe()]);cast(b,'bloom','player-1');const expected=Math.max(Math.round(Math.min(b.players[1].maxHp*.15,28*b.players[0].healingFactor*.5)),Math.round(b.players[1].maxHp*.06));assert.equal(b.players[1].shield,expected);
 b.phase='player';b.players[0].acted=false;b.players[0].cooldowns.bloom=0;cast(b,'bloom','player-1');assert.equal(b.players[1].shield,expected);
 assert.notEqual(planAutoAction(createBattle([p,{...animal('fox'),level:75}],[foe()])),null);
});
test('Last stand works once, guardian aura protects another ally, and Evergreen extends regeneration',()=>{
 const p={...animal('bear'),level:75,talents:{75:'lastStand'}},b=createBattle([p],[foe()]);b.players[0].hp=2;b.phase='enemy';performAction(b,'enemy','enemy-0','bite','player-0');assert.equal(b.players[0].hp,1);assert.equal(b.players[0].shield,Math.round(b.players[0].maxHp*.2));b.players[0].shield=0;b.enemies[0].acted=false;performAction(b,'enemy','enemy-0','bite','player-0');assert.equal(b.players[0].hp,0);
 const c=createBattle([{...p,talents:{75:'guardianAura'}},animal('fox')],[foe()]);cast(c,'challenge');assert.equal(c.players[1].shield,Math.round(c.players[0].maxHp*.06));
 const d=createBattle([{...animal('deer'),level:75,talents:{75:'evergreen'},equippedSkills:['bite','lifebloom']}],[foe()]);cast(d,'lifebloom');assert.equal(d.players[0].statuses.regen,3);
});
test('momentum reduces cooldowns once for an area kill and keeps each XP award idempotent',()=>{
 const s=defaultSave();s.account.level=75;s.pets[1].talents={75:'momentum'};const p={...accountPet(s,s.pets[1]),moves:['bite','nova','spark'],equippedSkills:['bite','nova','spark']},b=createBattle([p],wilds.slice(0,2));b.enemies.forEach(p=>p.hp=1);const event=cast(b,'nova');assert.equal(b.players[0].cooldowns.nova,2);assert.equal(event.effects.filter(e=>e.type==='talent').length,1);bankBattleXp(s,b,event);assert.equal(b.accountXpEarned,76);assert.equal(bankBattleXp(s,b,event).length,0);
});
test('element talents increase burns, prevent burn, improve regeneration, and boost reactions',()=>{
 const p={...animal('bear'),level:50,talents:{50:'kindling'},equippedSkills:['bite','fireBreath']},b=createBattle([p],[foe()]);cast(b,'fireBreath');const before=b.enemies[0].hp;end(b);assert.equal(before-b.enemies[0].hp,Math.round(6*(1+.12*49)*1.4));
 const immune=createBattle([{...p,talents:{50:'ashenHeart'}}],[{...p,id:'foe'}]);immune.phase='enemy';performAction(immune,'enemy','enemy-0','fireBreath');assert.equal(immune.players[0].statuses.burn,undefined);
 const regen=createBattle([{...animal('fox'),element:'Grove',level:50,talents:{50:'renewal'}}],[foe()]);regen.players[0].hp=10;regen.players[0].statuses.regen=2;end(regen);assert.equal(regen.players[0].hp,10+Math.round(8*regen.players[0].healingFactor*1.5));
 function reaction(talents){const c=createBattle([{...animal('fox'),level:50,talents}],[foe()]);c.enemies[0].elementalAura={element:'Tide',remaining:2};return cast(c,'bite').afterEvents[0].effects.find(e=>e.type==='damage').value;}
 assert.ok(reaction({50:'conductor'})>reaction({})*1.2);
});

test('old saves get unlimited training defaults and goal settings are repaired and persisted',()=>{
 const s=defaultSave();delete s.trainingGoals;assert.deepEqual(restoreSave(s).trainingGoals,{battleLimit:0,targetLevel:0,item:'none'});assert.deepEqual(trainingGoals({battleLimit:2000,targetLevel:999,item:'__proto__'}),{battleLimit:999,targetLevel:100,item:'none'});s.trainingGoals={battleLimit:10,targetLevel:40,item:'lens'};assert.deepEqual(restoreSave(s).trainingGoals,s.trainingGoals);
});
test('battle-count goals include wins, losses and draws, claim rewards once, and never restart after the final fight',async()=>{
 const outcomes=['won','lost','draw'];let index=0,claims=0,restarts=0,b={context:{mode:'training'},outcome:outcomes[0]};const loop=new TrainingLoop({getBattle:()=>b,getGoals:()=>({battleLimit:3}),act:async()=>{},claim:()=>{claims++;return {pet:'new'};},restart:()=>{restarts++;b={context:{mode:'training'},outcome:outcomes[++index]};},wait:async()=>{}});await loop.start();assert.deepEqual([loop.stats.battles,loop.stats.wins,loop.stats.losses,loop.stats.draws],[3,1,1,1]);assert.equal(claims,1);assert.equal(restarts,2);assert.match(loop.status,/3 battles completed/);assert.equal(loop.error,false);
});
test('a level goal finishes the encounter before claiming and stopping, while an already reached goal does nothing',async()=>{
 let level=1,claims=0,acts=0,restarts=0;const b={context:{mode:'training'},round:1};const loop=new TrainingLoop({getBattle:()=>b,getGoals:()=>({targetLevel:2}),getAccountLevel:()=>level,plan:()=>({move:'bite'}),act:async()=>{acts++;level=2;b.outcome='won';},claim:()=>{claims++;return {};},restart:()=>restarts++,wait:async()=>{}});await loop.start();assert.deepEqual([acts,claims,restarts],[1,1,0]);assert.match(loop.status,/Account level 2 reached/);await loop.start();assert.deepEqual([acts,claims,restarts],[1,1,0]);assert.equal(loop.stats.battles,0);
});
test('specific item goals ignore owned items and stop on a new drop even after losing',async()=>{
 let b={context:{mode:'training'},outcome:'won',trainingLoot:{items:[]}},restarts=0,claims=0;const loop=new TrainingLoop({getBattle:()=>b,getGoals:()=>({item:'lens'}),act:async()=>{},claim:()=>{claims++;return {items:[]};},restart:()=>{restarts++;b={context:{mode:'training'},outcome:'lost',trainingLoot:{items:[{id:'lens',count:1}]}};},wait:async()=>{}});await loop.start();assert.equal(loop.stats.battles,2);assert.equal(loop.stats.items,1);assert.equal(loop.stats.drops.lens,1);assert.equal(restarts,1);assert.equal(claims,1);assert.match(loop.status,/Eclipse prism dropped/);
});
test('any-item goal stops after collecting the winning reward and a running session snapshots its goals',async()=>{
 let claims=0,restarts=0,b={context:{mode:'training'},outcome:'won'},goals={battleLimit:2,item:'none'};const loop=new TrainingLoop({getBattle:()=>b,getGoals:()=>goals,act:async()=>{},claim:()=>{claims++;goals.battleLimit=1;return {items:[]};},restart:()=>{restarts++;b={context:{mode:'training'},outcome:'won'};},wait:async()=>{}});await loop.start();assert.equal(loop.stats.battles,2);assert.equal(claims,2);assert.equal(restarts,1);
 const drop=new TrainingLoop({getBattle:()=>({context:{mode:'training'},outcome:'won'}),getGoals:()=>({item:'any'}),act:async()=>{},claim:()=>({items:[{id:'heartwood',count:1}]}),restart:()=>assert.fail('No restart after item goal'),wait:async()=>{}});await drop.start();assert.equal(drop.stats.items,1);assert.match(drop.status,/A new item dropped/);
});
