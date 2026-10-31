import {abilities,items,isRecovery,isBarrier,isTaunt,abilityElement,elementMultiplier} from './catalog.js';
import {available,legalTargets,damageReduction,attackMultiplier} from './combat.js';
import {reactionFor} from './reactions.js';

// Plan a normal legal turn: save endangered allies, protect the team, then favor effective damage.
export function planAutoAction(b){
 if(!b||b.outcome||b.phase!=='player')return null;
 const allies=b.players.filter(p=>p.hp>0),foes=b.enemies.filter(p=>p.hp>0);if(!allies.length||!foes.length)return null;
 const taunter=allies.find(p=>p.statuses.taunt),options=[];
 for(const actor of allies){for(const move of actor.moves){if(!available(actor,move))continue;const a=abilities[move],legal=legalTargets(b,'player',move,actor.cid);const groups=['allEnemies','allAllies'].includes(a.target)?[legal]:legal.map(p=>[p]);
  for(const targets of groups){if(!targets.length)continue;let score=-(a.cooldown||0)*2;
   if(isRecovery(a)){
    let value=0,urgent=0,cleanse=0;for(const t of targets){const actual=Math.min(t.maxHp-t.hp,Math.round(a.power*actor.healingFactor*(a.itemOnly?actor.itemBonuses.abilityFactor:1)));value+=actual;if(actual&&t.hp/t.maxHp<.38)urgent=150;if(a.kind==='cleanse')cleanse+=['burn','weaken','exposed','stun'].filter(id=>t.statuses[id]).length*15+(t.statuses.stun?65:0);}
    if(!value&&!cleanse)continue;score+=value*.9+urgent+cleanse;
   }else if(isBarrier(a)){
    if(isTaunt(a)&&taunter)continue;let value=0;for(const t of targets)value+=Math.max(0,Math.round(a.power*actor.healingFactor*(a.itemOnly?actor.itemBonuses.abilityFactor:1))-t.shield);if(!value&&!isTaunt(a))continue;
    score+=value*.35;if(isTaunt(a))score+=actor.hp/actor.maxHp>.3?48:5;else if(targets.some(p=>p.cid===taunter?.cid||p.hp/p.maxHp<.4))score+=20;
   }else if(a.power){
    for(const t of targets){const n=Math.round(a.power*actor.attackFactor*(1-damageReduction(t))*elementMultiplier(abilityElement(actor,a),t.element)*attackMultiplier(actor)*(a.itemOnly?actor.itemBonuses.abilityFactor:1)*(t.statuses.exposed?1.25:1)),hpDamage=Math.min(t.hp,Math.max(0,n-t.shield));score+=hpDamage+Math.min(n,t.shield)*.35;if(hpDamage>=t.hp)score+=80;if(a.status&&!t.statuses[a.status]&&hpDamage<t.hp)score+=a.status==='burn'?10:8;if((t.itemBonuses?.thorns||t.id==='legend-cloudsage'||t.statuses.counter)&&hpDamage>0&&actor.hp<=18)score-=allies.length===1?180:30;}
    const counted=new Set();for(const t of targets){const reaction=reactionFor(t.elementalAura?.element,abilityElement(actor,a));if(!reaction||counted.has(reaction.id)&&(reaction.area||reaction.heal))continue;counted.add(reaction.id);if(reaction.heal){score+=Math.min(Math.max(...allies.map(p=>p.maxHp-p.hp)),Math.round(reaction.power*actor.healingFactor))*.9+8;}else{for(const target of reaction.area?foes:[t])score+=Math.min(target.hp,Math.max(0,Math.round(reaction.power*actor.attackFactor*attackMultiplier(actor)*(1-damageReduction(target)))-target.shield));if(reaction.status==='stun'&&!t.statuses.stun&&!t.acted)score+=25;else if(reaction.status&&!t.statuses[reaction.status])score+=8;}}
   }else if(a.status){const fresh=targets.filter(p=>!p.statuses[a.status]);if(!fresh.length)continue;score+=fresh.reduce((n,p)=>n+(!p.acted?9:3)+8,0);}
   if((a.extraStatuses||[]).some(s=>s.id==='counter')&&!actor.statuses.counter)score+=40;if(a.status==='stoneskin'&&!actor.statuses.stoneskin)score+=30;if(a.status==='vigor')score+=targets.filter(t=>!t.statuses.vigor).reduce((n,t)=>n+t.baseMaxHp*.2*.45+17,0);if(a.status==='stun')score+=targets.filter(t=>!t.statuses.stun&&!t.acted).length*25;
   if(a.status==='regen')score+=targets.filter(p=>!p.statuses.regen&&p.hp<p.maxHp).length*8;
   options.push({actor:actor.cid,move,target:targets[0].cid,score});
  }
 }}
 const best=options.sort((a,z)=>z.score-a.score)[0];return best?{actor:best.actor,move:best.move,target:best.target}:null;
}

// A single owner runs the loop. Stopping never starts a new action, claim, or encounter.
export class TrainingLoop{
 constructor({getBattle,act,claim,restart,onUpdate=()=>{},wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),plan=planAutoAction}){Object.assign(this,{getBattle,act,claim,restart,onUpdate,wait,plan});this.active=false;this.task=null;this.hasSession=false;this.status='';this.stats={wins:0,losses:0,xp:0,recruits:0};}
 get running(){return this.active||this.task!==null;}
 start(){if(this.task)return this.task;this.active=true;this.hasSession=true;this.error=false;this.stats={wins:0,losses:0,xp:0,recruits:0};this.handled=new WeakSet();this.status='Auto-training is starting…';this.task=Promise.resolve().then(()=>this.run());this.onUpdate();return this.task;}
 stop(){if(!this.active)return;this.active=false;this.status='Stopping after this turn…';this.onUpdate();}
 recordXp(amount){if(this.running&&Number.isFinite(amount))this.stats.xp+=Math.max(0,amount);}
 async run(){try{while(this.active){const b=this.getBattle();if(!b||b.context?.mode!=='training')throw new Error('Auto-battle is available in training only.');
   if(b.outcome){if(!this.handled.has(b)){this.handled.add(b);if(b.outcome==='won'){const reward=this.claim();if(reward){this.stats.wins++;if(reward.pet)this.stats.recruits++;}}else this.stats.losses++;}
    this.status=b.outcome==='won'?'Rewards collected. Preparing the next training encounter…':'Team recovering. Retrying training with earned XP kept…';this.onUpdate();await this.wait(700);if(!this.active)break;this.restart();continue;
   }
   if(b.round>80)throw new Error('This encounter is taking too long. Adjust your team or finish it manually.');
   const next=this.plan(b);if(!next)throw new Error('No legal automatic move. Manual controls are ready.');this.status='Casting '+abilities[next.move].name;await this.act(next);if(!this.active)break;await this.wait(70);
  }}catch(error){this.error=true;this.status='Auto-training paused: '+error.message;}finally{this.active=false;this.task=null;if(!this.error)this.status='Auto-training stopped. Manual controls are ready.';this.onUpdate();}}
}
