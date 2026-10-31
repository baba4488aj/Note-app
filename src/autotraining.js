import {abilities,items,isRecovery,isBarrier,isTaunt,abilityElement,elementMultiplier} from './catalog.js';
import {available,legalTargets,damageReduction,attackMultiplier,directPower} from './combat.js';
import {hasTalent,talentBonuses} from './talents.js';
import {trainingGoals} from './training-goals.js';
import {reactionFor} from './reactions.js';

// Plan a normal legal turn: save endangered allies, protect the team, then favor effective damage.
export function planAutoAction(b){
 if(!b||b.outcome||b.phase!=='player')return null;
 const allies=b.players.filter(p=>p.hp>0),foes=b.enemies.filter(p=>p.hp>0);if(!allies.length||!foes.length)return null;
 const taunter=allies.find(p=>p.statuses.taunt),options=[];
 for(const actor of allies){for(const move of actor.moves){if(!available(actor,move))continue;const a=abilities[move],legal=legalTargets(b,'player',move,actor.cid);const groups=['allEnemies','allAllies'].includes(a.target)?[legal]:legal.map(p=>[p]);
  for(const targets of groups){if(!targets.length)continue;let score=-(a.cooldown||0)*2;
   if(isRecovery(a)){
    let value=0,urgent=0,cleanse=0,barriers=0;for(const t of targets){const actual=Math.min(t.maxHp-t.hp,Math.round(a.power*actor.healingFactor*(a.itemOnly?actor.itemBonuses.abilityFactor:1)));value+=actual;const power=Math.round(a.power*actor.healingFactor*(a.itemOnly?actor.itemBonuses.abilityFactor:1)),overflow=hasTalent(actor,'overflow')?Math.min(t.maxHp*.15,(power-actual)*.5):0,ward=hasTalent(actor,'wardweaver')?t.maxHp*.06:0;barriers+=Math.max(0,Math.round(Math.max(overflow,ward))-t.shield);if(actual&&t.hp/t.maxHp<.38)urgent=150;if(a.kind==='cleanse')cleanse+=['burn','weaken','exposed','stun'].filter(id=>t.statuses[id]).length*15+(t.statuses.stun?65:0);}
    if(!value&&!cleanse&&!barriers)continue;score+=value*.9+urgent+cleanse+barriers*.45;
   }else if(isBarrier(a)){
    if(isTaunt(a)&&taunter)continue;let value=0;for(const t of targets)value+=Math.max(0,Math.round(a.power*actor.healingFactor*(a.itemOnly?actor.itemBonuses.abilityFactor:1))-t.shield);if(!value&&!isTaunt(a))continue;
    score+=value*.35;if(isTaunt(a))score+=actor.hp/actor.maxHp>.3?48:5;else if(targets.some(p=>p.cid===taunter?.cid||p.hp/p.maxHp<.4))score+=20;
   }else if(a.power){
    for(const t of targets){const n=directPower(actor,t,a.power*(a.itemOnly?actor.itemBonuses.abilityFactor:1),abilityElement(actor,a)),hpDamage=Math.min(t.hp,Math.max(0,n-t.shield));score+=hpDamage+Math.min(n,t.shield)*.35;if(hpDamage>=t.hp)score+=80;if(a.status&&!t.statuses[a.status]&&hpDamage<t.hp)score+=a.status==='burn'?10:8;if((t.itemBonuses?.thorns||t.id==='legend-cloudsage'||t.statuses.counter)&&hpDamage>0&&actor.hp<=18)score-=allies.length===1?180:30;}
    const counted=new Set();for(const t of targets){const reaction=reactionFor(t.elementalAura?.element,abilityElement(actor,a));if(!reaction||counted.has(reaction.id)&&(reaction.area||reaction.heal))continue;counted.add(reaction.id);if(reaction.heal){score+=Math.min(Math.max(...allies.map(p=>p.maxHp-p.hp)),Math.round(reaction.power*actor.healingFactor*talentBonuses(actor).reaction))*.9+8;}else{for(const target of reaction.area?foes:[t])score+=Math.min(target.hp,Math.max(0,directPower(actor,target,reaction.power*talentBonuses(actor).reaction,null)-target.shield));if(reaction.status==='stun'&&!t.statuses.stun&&!t.acted)score+=25;else if(reaction.status&&!t.statuses[reaction.status])score+=8;}}
   }else if(a.status){const fresh=targets.filter(p=>!p.statuses[a.status]);if(!fresh.length)continue;score+=fresh.reduce((n,p)=>n+(!p.acted?9:3)+8,0);}
   if((a.extraStatuses||[]).some(s=>s.id==='counter')&&!actor.statuses.counter)score+=40;if(a.status==='stoneskin'&&!actor.statuses.stoneskin)score+=30;if(a.status==='vigor')score+=targets.filter(t=>!t.statuses.vigor).reduce((n,t)=>n+t.baseMaxHp*.2*.45+17,0);if(a.status==='stun')score+=targets.filter(t=>!t.statuses.stun&&!t.acted).length*25;
   if(a.status==='regen')score+=targets.filter(p=>!p.statuses.regen&&p.hp<p.maxHp).length*8;
   options.push({actor:actor.cid,move,target:targets[0].cid,score});
  }
 }}
 const best=options.sort((a,z)=>z.score-a.score)[0];return best?{actor:best.actor,move:best.move,target:best.target}:null;
}

// One owner runs the loop. Goals finish an encounter; manual Stop finishes only the current turn.
export class TrainingLoop{
 constructor({getBattle,act,claim,restart,getGoals=()=>({}),getAccountLevel=()=>1,onUpdate=()=>{},wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),plan=planAutoAction}){
  Object.assign(this,{getBattle,act,claim,restart,getGoals,getAccountLevel,onUpdate,wait,plan});this.active=false;this.task=null;this.hasSession=false;this.status='';this.goals=trainingGoals();this.stats=this.freshStats();
 }
 freshStats(){return {battles:0,wins:0,losses:0,draws:0,xp:0,recruits:0,items:0,drops:{}};}
 get running(){return this.active||this.task!==null;}
 start(){if(this.task)return this.task;this.active=true;this.hasSession=true;this.error=false;this.completionReason='';this.stats=this.freshStats();this.goals=trainingGoals(this.getGoals());this.handled=new WeakSet();this.status='Auto-training is starting…';this.task=Promise.resolve().then(()=>this.run());this.onUpdate();return this.task;}
 stop(){if(!this.active)return;this.active=false;this.status='Stopping after this turn…';this.onUpdate();}
 recordXp(amount){if(this.running&&Number.isFinite(amount))this.stats.xp+=Math.max(0,amount);}
 goalReason(){
  if(this.goals.targetLevel&&this.getAccountLevel()>=this.goals.targetLevel)return 'Account level '+this.goals.targetLevel+' reached';
  if(this.goals.battleLimit&&this.stats.battles>=this.goals.battleLimit)return this.stats.battles+' battle'+(this.stats.battles===1?'':'s')+' completed';
  if(this.goals.item==='any'&&this.stats.items)return 'A new item dropped';
  if(this.goals.item!=='none'&&this.goals.item!=='any'&&this.stats.drops[this.goals.item])return items[this.goals.item].name+' dropped';
  return '';
 }
 finishGoal(reason){this.completionReason=reason;this.active=false;this.status='Goal reached: '+reason+'. Auto-training stopped.';this.onUpdate();}
 async run(){try{
  if(this.active){const b=this.getBattle();if(!b||b.context?.mode!=='training')throw new Error('Auto-battle is available in training only.');const reason=this.goalReason();if(reason)this.finishGoal(reason);}
  while(this.active){
   const b=this.getBattle();if(!b||b.context?.mode!=='training')throw new Error('Auto-battle is available in training only.');
   if(b.outcome){
    if(!this.handled.has(b)){
     this.handled.add(b);this.stats.battles++;let reward;
     if(b.outcome==='won'){reward=this.claim();if(reward){this.stats.wins++;if(reward.pet)this.stats.recruits++;}}
     else if(b.outcome==='draw')this.stats.draws++;else this.stats.losses++;
     for(const drop of b.trainingLoot?.items||reward?.items||[]){if(!Object.hasOwn(items,drop.id)||!Number.isInteger(drop.count)||drop.count<=0)continue;this.stats.items+=drop.count;this.stats.drops[drop.id]=(this.stats.drops[drop.id]||0)+drop.count;}
    }
    const reason=this.goalReason();if(reason){this.finishGoal(reason);break;}
    this.status=b.outcome==='won'?'Rewards collected. Preparing the next training encounter…':'Team recovering. Retrying training with earned XP kept…';this.onUpdate();if(!this.active)break;await this.wait(700);if(!this.active)break;this.restart();continue;
   }
   if(b.round>80)throw new Error('This encounter is taking too long. Adjust your team or finish it manually.');
   const next=this.plan(b);if(!next)throw new Error('No legal automatic move. Manual controls are ready.');this.status='Casting '+abilities[next.move].name;await this.act(next);if(!this.active)break;await this.wait(70);
  }
 }catch(error){this.error=true;this.status='Auto-training paused: '+error.message;}
 finally{this.active=false;this.task=null;if(!this.error&&!this.completionReason)this.status='Auto-training stopped. Manual controls are ready.';this.onUpdate();}}
}
