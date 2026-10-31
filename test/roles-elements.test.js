import {test} from 'node:test';
import assert from 'node:assert/strict';
import {abilities,roles,elements,starters,wilds as allWilds,createBattle,elementMultiplier,legalTargets,performAction,enemyPlan,finishRound,roleLoadout,preparePet} from '../src/combat.js';
const wilds=allWilds.slice(0,3);
const battle=()=>createBattle(starters,wilds);
function roundEnd(b){b.phase='enemy';b.enemies.forEach(p=>p.acted=true);finishRound(b);}

test('each default team has a tank, fighter and support with a signature ability',()=>{
 for(const team of [starters,wilds]){
  assert.deepEqual(team.map(p=>p.role).sort(),['fighter','support','tank']);
  for(const p of team)assert.ok(p.moves.some(id=>roles[p.role].core.includes(id)));
 }
 assert.ok(starters.find(p=>p.role==='tank').hp>starters.find(p=>p.role==='fighter').hp);
});

test('all sixteen element matchups follow the documented cycle',()=>{
 const expected={Ember:{Ember:1,Grove:1.5,Tide:1,Astral:.75},Grove:{Ember:.75,Grove:1,Tide:1.5,Astral:1},Tide:{Ember:1,Grove:.75,Tide:1,Astral:1.5},Astral:{Ember:1.5,Grove:1,Tide:.75,Astral:1}};
 for(const from of Object.keys(elements))for(const to of Object.keys(elements))assert.equal(elementMultiplier(from,to),expected[from][to],`${from} attacks ${to}`);
});

test('actual direct attacks include the pet element, item, buff and resistance',()=>{
 const b=createBattle([{...starters[1],element:'Ember',moves:['bite','strike','rally']}],[{...wilds[1],element:'Grove',moves:['bite','strike','rally']}],{luna:'sunstone'});
 b.players[0].statuses.might=2;b.enemies[0].statuses.exposed=2;
 const e=performAction(b,'player','player-0','strike','enemy-0');
 assert.equal(b.enemies[0].hp,130-Math.round(32*1.5*1.2*1.35*1.25));
 assert.equal(e.effects[0].multiplier,1.5);assert.match(b.log.join(' '),/strong 1.5×/);
 const c=createBattle([{...starters[1],element:'Grove',moves:['bite','strike','rally']}],[{...wilds[0],element:'Ember'}]);
 const f=performAction(c,'player','player-0','strike','enemy-0');assert.equal(c.enemies[0].hp,85-24);assert.equal(f.effects[0].multiplier,.75);
});

test('area damage evaluates every target element separately',()=>{
 const b=createBattle([{...starters[1],element:'Ember',moves:['bite','nova','spark']}],wilds.map((p,i)=>({...p,element:['Grove','Astral','Ember'][i]})));
 b.players[0].energy=5;const e=performAction(b,'player','player-0','nova');
 assert.deepEqual(e.effects.filter(f=>f.type==='damage').map(f=>f.value),[33,17,22]);
 assert.deepEqual(e.effects.filter(f=>f.type==='damage').map(f=>f.multiplier),[1.5,.75,1]);
});

test('taunt grants a personal shield and forces enemies to attack the living tank',()=>{
 const b=battle();const e=performAction(b,'player','player-2','challenge');assert.deepEqual(e.targets,['player-2']);
 assert.equal(b.players[2].statuses.taunt,2);assert.equal(b.players[2].shield,18);
 assert.deepEqual(legalTargets(b,'enemy','bite','enemy-0').map(p=>p.cid),['player-2']);
 b.phase='enemy';b.enemies[0].energy=0;
 assert.equal(enemyPlan(b,b.enemies[0]).target,'player-2');
 const snapshot=JSON.stringify(b);assert.equal(performAction(b,'enemy','enemy-0','bite','player-0'),null);assert.equal(JSON.stringify(b),snapshot);
 assert.ok(performAction(b,'enemy','enemy-0','bite','player-2'));
});

test('enemy tanks taunt and player single-target attacks cannot bypass them',()=>{
 const b=battle();b.phase='enemy';assert.equal(enemyPlan(b,b.enemies[1]).move,'challenge');
 performAction(b,'enemy','enemy-1','challenge');b.phase='player';
 const hp=b.enemies[0].hp,energy=b.players[1].energy;
 assert.equal(performAction(b,'player','player-1','spark','enemy-0'),null);
 assert.equal(b.enemies[0].hp,hp);assert.equal(b.players[1].energy,energy);
 assert.deepEqual(legalTargets(b,'player','spark','player-1').map(p=>p.cid),['enemy-1']);
 assert.ok(performAction(b,'player','player-1','spark','enemy-1'));
});

test('area attacks, healing and buffs bypass hostile taunts',()=>{
 const b=battle();b.phase='enemy';performAction(b,'enemy','enemy-1','challenge');b.phase='player';
 b.players[1].moves.push('nova');b.players[1].energy=5;const e=performAction(b,'player','player-1','nova');assert.equal(e.targets.length,3);
 b.players[2].hp=40;assert.ok(performAction(b,'player','player-0','bloom','player-2'));assert.equal(b.players[2].hp,68);
});

test('defeated tanks and expired taunts immediately release targets',()=>{
 const b=battle();performAction(b,'player','player-2','challenge');b.players[2].hp=0;assert.equal(legalTargets(b,'enemy','bite','enemy-0').length,2);
 const c=battle();performAction(c,'player','player-2','challenge');roundEnd(c);assert.equal(c.players[2].statuses.taunt,1);roundEnd(c);assert.equal(c.players[2].statuses.taunt,undefined);assert.equal(legalTargets(c,'enemy','bite','enemy-0').length,3);
});

test('a second friendly taunt replaces the first, with one forced target',()=>{
 const b=battle();performAction(b,'player','player-2','challenge');b.players[0].moves.push('challenge');performAction(b,'player','player-0','challenge');
 assert.equal(b.players[2].statuses.taunt,undefined);assert.equal(b.players[0].statuses.taunt,2);assert.deepEqual(legalTargets(b,'enemy','bite','enemy-0').map(p=>p.cid),['player-0']);
});

test('self-healing and self-buffs never affect an attempted ally target',()=>{
 const b=battle();b.players[2].hp=40;b.players[0].hp=40;
 const e=performAction(b,'player','player-2','rekindle','player-0');assert.deepEqual(e.targets,['player-2']);assert.equal(b.players[2].hp,62);assert.equal(b.players[0].hp,40);
 const c=battle();c.players[1].moves.push('focus');performAction(c,'player','player-1','focus','player-0');assert.equal(c.players[1].statuses.might,2);assert.equal(c.players[0].statuses.might,undefined);
});

test('healing, shields, burn and thorns are independent of elemental advantage',()=>{
 const b=createBattle([{...starters[0],element:'Ember'}, {...starters[2],element:'Grove'}],[{...wilds[0],element:'Grove'}],{moss:'thorns'});
 b.players[1].hp=10;performAction(b,'player','player-0','bloom','player-1');assert.equal(b.players[1].hp,38);
 b.phase='enemy';performAction(b,'enemy','enemy-0','bite','player-0');assert.equal(b.enemies[0].hp,81);
 b.enemies[0].statuses.burn=1;const before=b.enemies[0].hp;roundEnd(b);assert.equal(b.enemies[0].hp,before-6);
});

test('roles keep a signature while allowing hybrids and relic-granted abilities',()=>{
 const hybrid=roleLoadout({...starters[0],id:'custom',role:'fighter',moves:['bite','spark','rekindle']});assert.deepEqual(hybrid.moves,['bite','spark','rekindle']);
 const support=roleLoadout({...starters[0],role:'support',moves:['bite','focus','nova']});assert.deepEqual(support.moves,['bite','bloom','nova']);
 const relic=preparePet({...starters[2],equippedSkills:['bite','challenge','rekindle','sanctuary']},'lyre');assert.ok(relic.moves.includes('challenge'));assert.ok(relic.moves.includes('sanctuary'));assert.equal(relic.role,'tank');
});
test('enemy support avoids casting a full-health heal',()=>{const b=battle();const plan=enemyPlan(b,b.enemies[2]);assert.notEqual(plan.move,'bloom');assert.ok(plan.move==='bite'||abilities[plan.move].kind!=='heal');});
