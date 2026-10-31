export const abilities = {
 dragonClaw:{name:'Wyrm claw',icon:'⚔',kind:'attack',element:'Ember',target:'enemy',power:18,cooldown:0,basic:true,legendOnly:true,description:'18 Ember damage with a dragon claw. Always available.'},
 dragonBreath:{name:'Dragonfire breath',icon:'♨',kind:'fire',visual:'dragonbreath',element:'Ember',target:'allEnemies',power:28,status:'burn',duration:3,cooldown:2,legendOnly:true,description:'28 Ember damage to every enemy and burn for 3 rounds.'},
 dragonFury:{name:'Rising fury',icon:'ϟ',kind:'attack',visual:'dragonfury',element:'Ember',target:'enemy',power:32,selfStatuses:[{id:'might',duration:2}],cooldown:2,legendOnly:true,description:'32 Ember damage, then give yourself +35% direct damage for 2 rounds.'},
 sageStaff:{name:'Cloudstaff strike',icon:'♜',kind:'attack',element:'Grove',target:'enemy',power:16,cooldown:0,basic:true,legendOnly:true,description:'16 Grove damage from a golden staff. Always available.'},
 cloudChallenge:{name:'Heaven’s challenge',icon:'♜',kind:'taunt',visual:'cloudcounter',element:'Grove',target:'self',power:22,status:'taunt',duration:2,extraStatuses:[{id:'counter',duration:2}],cooldown:3,legendOnly:true,description:'Gain 22 shield, taunt, and counter direct attacks for 2 rounds. Counters have 18 base power.'},
 stoneSkin:{name:'Stoneborn mantle',icon:'⬡',kind:'shield',visual:'stoneskin',element:'Grove',target:'self',power:36,status:'stoneskin',duration:3,cooldown:3,legendOnly:true,description:'Gain 36 shield and +25 percentage points of damage reduction for 3 rounds.'},
 rocTalons:{name:'Storm talons',icon:'⚔',kind:'attack',visual:'stormtalons',element:'Astral',target:'allEnemies',power:11,cooldown:0,basic:true,legendOnly:true,description:'11 Astral damage to every enemy with sweeping claws. Always available.'},
 thunderStrike:{name:'Thunder verdict',icon:'ϟ',kind:'lightning',visual:'thunderstun',element:'Astral',target:'enemy',power:30,status:'stun',duration:1,cooldown:3,legendOnly:true,description:'30 Astral lightning damage and stun one enemy, skipping their next action unless cleansed.'},
 pearlPulse:{name:'Pearl pulse',icon:'≋',kind:'wave',element:'Tide',target:'enemy',power:14,cooldown:0,basic:true,legendOnly:true,description:'14 Tide damage in a shimmering pulse. Always available.'},
 oceanChorus:{name:'Ocean’s chorus',icon:'❋',kind:'teamheal',visual:'oceanchorus',element:'Tide',target:'allAllies',power:42,cooldown:3,legendOnly:true,description:'Restore 42 HP to every living ally.'},
 deepwellGrace:{name:'Deepwell grace',icon:'❀',kind:'lifebloom',visual:'deepwell',element:'Tide',target:'ally',power:18,status:'regen',duration:4,cooldown:1,legendOnly:true,description:'Heal one ally for 18 HP and grant regeneration for 4 rounds.'},
 royalTide:{name:'Sovereign tide',icon:'♛',kind:'vitality',visual:'royaltide',element:'Tide',target:'allAllies',status:'vigor',duration:3,extraStatuses:[{id:'might',duration:3}],cooldown:4,legendOnly:true,description:'Give your team +20% maximum HP and +35% direct damage for 3 rounds. Refreshing does not stack or restore extra HP.'},
 emberClaw:{name:'Flame claw',icon:'♨',element:'Ember',kind:'fire',target:'enemy',power:24,cooldown:1,description:'24 Ember damage in a searing swipe.'},
 fireBreath:{name:'Fire breath',icon:'♨',element:'Ember',kind:'fire',visual:'firebreath',target:'allEnemies',power:22,status:'burn',duration:2,minLevel:3,cooldown:2,description:'Breathe fire across every enemy for 22 Ember damage and 2 rounds of burn.'},
 heatShield:{name:'Furnace heart',icon:'♜',element:'Ember',kind:'shield',visual:'flameguard',target:'self',power:32,status:'might',duration:2,minLevel:6,cooldown:3,description:'Shield yourself for 32 and gain +35% direct damage for 2 rounds.'},
 volcanicRoar:{name:'Volcanic roar',icon:'♨',element:'Ember',kind:'inferno',target:'allEnemies',power:38,status:'burn',duration:3,minLevel:10,cooldown:4,description:'38 Ember damage to all enemies and 3 rounds of burn.'},
 waterLance:{name:'Water lance',icon:'≋',element:'Tide',kind:'wave',target:'enemy',power:24,cooldown:1,description:'24 Tide damage with a pressurized spear of water.'},
 tidalCrash:{name:'Tidal crash',icon:'≋',element:'Tide',kind:'wave',visual:'tidal',target:'allEnemies',power:22,status:'weaken',duration:2,minLevel:3,cooldown:2,description:'A sweeping wave deals 22 Tide damage and weakens all enemies for 2 rounds.'},
 healingCurrent:{name:'Healing current',icon:'❋',element:'Tide',kind:'teamheal',visual:'waterheal',target:'allAllies',power:22,status:'regen',duration:2,minLevel:6,cooldown:3,description:'Heal all living allies for 22 HP and grant 2 rounds of regeneration.'},
 maelstrom:{name:'Maelstrom',icon:'≋',element:'Tide',kind:'wave',visual:'maelstrom',target:'allEnemies',power:36,status:'exposed',duration:2,minLevel:10,cooldown:4,description:'36 Tide damage and 2 rounds of exposure to every enemy.'},
 staticSpark:{name:'Static spark',icon:'ϟ',element:'Astral',kind:'lightning',target:'enemy',power:22,cooldown:1,description:'22 Astral lightning damage to one enemy.'},
 chainLightning:{name:'Chain lightning',icon:'ϟ',element:'Astral',kind:'lightning',visual:'chainlightning',target:'allEnemies',power:24,status:'exposed',duration:2,minLevel:3,cooldown:2,description:'Lightning arcs through all enemies for 24 Astral damage and 2 rounds of exposure.'},
 overcharge:{name:'Overcharge',icon:'ϟ',element:'Astral',kind:'buff',visual:'electriccharge',target:'allAllies',status:'might',duration:2,minLevel:6,cooldown:3,description:'Charge your team with +35% direct damage for 2 rounds.'},
 thunderstorm:{name:'Thunderstorm',icon:'ϟ',element:'Astral',kind:'lightning',visual:'thunderstorm',target:'allEnemies',power:40,status:'weaken',duration:2,minLevel:10,cooldown:4,description:'40 Astral lightning damage and 2 rounds of weakness to every enemy.'},
 vineWhip:{name:'Vine whip',icon:'❋',element:'Grove',kind:'vine',target:'enemy',power:22,cooldown:1,description:'22 Grove damage from a lashing thorned vine.'},
 thornVolley:{name:'Thorn volley',icon:'❋',element:'Grove',kind:'vine',visual:'thorns',target:'allEnemies',power:20,status:'weaken',duration:2,minLevel:3,cooldown:2,description:'Thorns deal 20 Grove damage and weaken every enemy for 2 rounds.'},
 wildwood:{name:'Wildwood shelter',icon:'❀',element:'Grove',kind:'bastion',visual:'wildwood',target:'allAllies',power:26,status:'regen',duration:2,minLevel:6,cooldown:3,description:'Give each ally a 26-point shield and 2 rounds of regeneration.'},
 ancientRoots:{name:'Ancient roots',icon:'❋',element:'Grove',kind:'vine',visual:'rootstorm',target:'allEnemies',power:34,status:'weaken',duration:3,minLevel:10,cooldown:4,description:'34 Grove damage and 3 rounds of weakness to all enemies.'},
 bulwark:{name:'Ironbark roar',icon:'♜',kind:'bulwark',target:'self',power:38,status:'taunt',duration:2,cooldown:3,minLevel:3,description:'Shield yourself for 38 and taunt for 2 rounds.'},
 bastion:{name:'Crystal bastion',icon:'⬡',kind:'bastion',target:'allAllies',power:32,cooldown:3,minLevel:5,description:'Give every living ally a 32-point shield.'},
 quake:{name:'Titan tremor',icon:'≋',kind:'quake',target:'allEnemies',power:24,status:'weaken',duration:2,cooldown:3,minLevel:8,description:'24 damage to all enemies. Weaken their damage for 2 rounds.'},
 ironheart:{name:'Guardian of dawn',icon:'♜',kind:'bulwark',target:'self',power:65,status:'taunt',duration:3,cooldown:4,minLevel:12,description:'A 65-point personal shield and a 3-round taunt.'},
 comet:{name:'Comet fang',icon:'☄',kind:'comet',target:'enemy',power:42,status:'exposed',duration:2,cooldown:2,minLevel:3,description:'42 damage. Expose the target for 2 rounds.'},
 tempest:{name:'Prismatic tempest',icon:'✺',kind:'tempest',target:'allEnemies',power:30,cooldown:3,minLevel:5,description:'30 damage to every enemy in a storm of shards.'},
 inferno:{name:'Phoenix descent',icon:'♨',kind:'inferno',target:'enemy',power:58,status:'burn',duration:3,cooldown:3,minLevel:8,description:'58 damage and burn for 3 rounds.'},
 supernova:{name:'Celestial rupture',icon:'✹',kind:'supernova',target:'allEnemies',power:40,cooldown:4,minLevel:12,description:'40 damage to every enemy. A constellation comes undone.'},
 springtide:{name:'Aurora rain',icon:'❋',kind:'teamheal',target:'allAllies',power:20,cooldown:3,minLevel:3,description:'Restore 20 HP to every living ally.'},
 purify:{name:'Renewal tide',icon:'≋',kind:'cleanse',target:'allAllies',power:24,cooldown:3,minLevel:5,description:'Heal every ally for 24 HP and remove harmful statuses.'},
 lifebloom:{name:'Eden bloom',icon:'❀',kind:'lifebloom',target:'allAllies',power:26,status:'regen',duration:2,cooldown:3,minLevel:8,description:'Heal all allies for 26 HP and grant 2 rounds of regeneration.'},
 rebirth:{name:'Worldtree blessing',icon:'✿',kind:'lifebloom',target:'allAllies',power:38,status:'regen',duration:3,cooldown:4,minLevel:12,description:'Heal all living allies for 38 HP and grant 3 rounds of regeneration. Does not revive.'},
 undertow:{name:'Riptide lance',icon:'≋',element:'Tide',kind:'wave',target:'enemy',power:28,status:'weaken',duration:2,cooldown:2,description:'28 damage and weaken the enemy for 2 rounds.'},
 cinder:{name:'Cinder dash',icon:'ϟ',element:'Ember',kind:'inferno',target:'enemy',power:30,cooldown:1,description:'30 damage in a blazing pounce.'},
 stardew:{name:'Stardew lantern',icon:'❀',kind:'lifebloom',target:'ally',power:22,status:'regen',duration:2,cooldown:2,description:'Heal one ally for 22 HP and grant regeneration for 2 rounds.'},
 challenge:{name:'Guardian call',icon:'♜',kind:'taunt',target:'self',power:18,status:'taunt',duration:2,cooldown:2,description:'Shield yourself for 18. Taunt: force single-target enemy attacks onto you for 2 rounds.'},
 strike:{name:'Wild cleave',icon:'⚔',kind:'attack',target:'enemy',power:32,cooldown:1,description:'32 damage to one enemy. A fighter’s heavy strike.'},
 rekindle:{name:'Inner light',icon:'♥',kind:'heal',target:'self',power:22,cooldown:2,description:'Restore 22 HP to yourself. Cannot target teammates.'},
 focus:{name:'Battle focus',icon:'↑',kind:'buff',target:'self',status:'might',duration:2,cooldown:2,description:'Give yourself +35% direct damage for 2 rounds.'},
 bite:{name:'Wild bite',icon:'ϟ',kind:'attack',target:'enemy',power:15,cooldown:0,description:'15 damage to one enemy. Always available.'},
 spark:{name:'Arc bolt',icon:'ϟ',element:'Astral',kind:'lightning',target:'enemy',power:26,cooldown:1,description:'26 Astral lightning damage to one enemy.'},
 bloom:{name:'Second spring',icon:'❋',kind:'heal',target:'ally',power:28,cooldown:2,description:'Restore 28 HP to a chosen ally.'},
 ward:{name:'Moon veil',icon:'◈',kind:'shield',target:'ally',power:28,cooldown:2,description:'Give a chosen ally a 28-point shield.'},
 flare:{name:'Ember kiss',icon:'♨',element:'Ember',kind:'fire',target:'enemy',power:12,cooldown:2,status:'burn',duration:3,description:'12 damage. Burn: 6 base damage scaled by caster level, for 3 rounds.'},
 nova:{name:'Supernova',icon:'✺',kind:'nova',target:'allEnemies',power:22,cooldown:3,description:'22 damage to every living enemy.'},
 rally:{name:'Wild courage',icon:'↑',kind:'buff',target:'allAllies',status:'might',duration:2,cooldown:3,description:'Your whole team gains +35% damage for 2 rounds.'},
 hex:{name:'Withering whisper',icon:'☾',kind:'debuff',target:'enemy',power:8,status:'weaken',duration:2,cooldown:2,description:'8 damage. Weaken: enemy deals 25% less damage for 2 rounds.'},
 mend:{name:'Cleansing rain',icon:'≋',kind:'cleanse',target:'ally',power:16,cooldown:2,description:'Heal an ally for 16 HP and remove burn, weakness, exposure, and stun.'},
 eclipse:{name:'Lunar fracture',icon:'◐',kind:'eclipse',target:'allEnemies',power:10,status:'exposed',duration:2,cooldown:3,itemOnly:true,description:'10 damage to all enemies. Exposed: take 25% more damage for 2 rounds.'},
 sanctuary:{name:'Verdant chorus',icon:'❀',kind:'regen',target:'allAllies',status:'regen',duration:3,cooldown:3,itemOnly:true,description:'Your team regenerates 8 HP at round end for 3 rounds.'}
};
export const legendPassives={
 'legend-pyrragon':{name:'Everlasting ember',icon:'♨',description:'Whenever a burning enemy takes its round-end burn tick, gain +6% attack for this encounter. Stacks up to 10 times (+60%).'},
 'legend-cloudsage':{name:'Reflex of the sage',icon:'↶',description:'Counter every direct hit with 7 base Grove damage, even through shields. Heaven’s challenge upgrades this to 18 instead. Retaliations cannot chain.'},
 'legend-neruvia':{name:'Gentle undertow',icon:'❋',description:'At the start of your action, heal the living ally with the lowest health percentage for 12 base HP. Triggers once per turn, including a stunned turn.'},
 'legend-stormroc':{name:'Storm herald',icon:'ϟ',description:'At the start of your action, strike every living enemy with 7 base Astral lightning damage. Triggers once per turn, including a stunned turn.'}
};
Object.assign(abilities,{
 bossInferno:{name:'Crimson cataclysm',icon:'♨',kind:'inferno',visual:'dragonbreath',target:'allEnemies',element:'Ember',power:38,status:'burn',duration:3,cooldown:3,bossOnly:true,description:'A charged inferno burns the entire opposing team for 38 base damage.'},
 bossMountain:{name:'Heaven-falling mountain',icon:'⬡',kind:'quake',target:'allEnemies',element:'Grove',power:32,status:'weaken',duration:2,selfStatuses:[{id:'stoneskin',duration:2}],cooldown:3,bossOnly:true,description:'32 Grove damage to all enemies, weaken them, and gain rock skin.'},
 bossTempest:{name:'Judgment of the sky',icon:'ϟ',kind:'lightning',visual:'thunderstorm',target:'allEnemies',element:'Astral',power:34,status:'exposed',duration:2,cooldown:3,bossOnly:true,description:'A charged thunderstorm deals 34 Astral damage to all enemies and exposes them.'},
 bossAbyss:{name:'Abyssal reckoning',icon:'≋',kind:'wave',visual:'maelstrom',target:'allEnemies',element:'Tide',power:34,status:'weaken',duration:2,cooldown:3,bossOnly:true,description:'A crushing wave deals 34 Tide damage to all enemies and weakens them.'},
 cinderBrand:{name:'Censer’s brand',icon:'♨',kind:'fire',element:'Ember',target:'enemy',power:20,status:'burn',duration:4,cooldown:2,itemOnly:true,description:'20 Ember damage and four rounds of burn.'},
 staticGuard:{name:'Stormglass aegis',icon:'ϟ',kind:'bastion',visual:'electriccharge',target:'allAllies',power:20,status:'might',duration:2,cooldown:3,itemOnly:true,description:'Shield each ally for 20 and grant Courage for two rounds.'}
});
// Cooldowns count the interval between uses: a 3-turn skill used on turn 1 returns on turn 4.
for(const a of Object.values(abilities)){
 if(a.basic||a===abilities.bite)a.cooldown=0;
 else if((a.power||0)>=38||a.target==='allAllies'&&a.kind==='cleanse')a.cooldown=Math.max(3,a.cooldown);
 else a.cooldown=Math.max(2,a.cooldown);
}
export const statuses={counter:{name:'Counter stance',icon:'↶',description:'When hit by a direct attack, retaliate once with 18 base Grove damage. Does not trigger retaliation chains.'},stoneskin:{name:'Rock skin',icon:'⬡',description:'+25 percentage points of direct damage reduction.'},stun:{name:'Stunned',icon:'ϟ',description:'Skip the next action unless cleansed first.'},vigor:{name:'Vitality +20%',icon:'♥',description:'+20% maximum HP. Restores the added capacity once; refreshes do not stack.'},taunt:{name:'Taunting',icon:'♜',description:'Living enemies must target this pet with single-target hostile abilities. Area attacks bypass taunts.'},burn:{name:'Burn',icon:'♨',description:'6 base damage at round end, scaled by the original caster’s level.'},might:{name:'Courage',icon:'↑',description:'+35% damage.'},weaken:{name:'Weakened',icon:'↓',description:'Deal 25% less damage.'},exposed:{name:'Exposed',icon:'◐',description:'Take 25% more damage.'},regen:{name:'Regeneration',icon:'❀',description:'Restore 8 HP at round end.'}};
export const items={
 heartwood:{name:'Heartwood seed',icon:'♥',rarity:'UNCOMMON',description:'+25 maximum HP.',hp:25},
 sunstone:{name:'Sunstone fang',icon:'ϟ',rarity:'RARE',description:'Deal 20% more direct damage.',damage:1.2},
 thorns:{name:'Bramble crown',icon:'♜',rarity:'UNCOMMON',description:'Reflect 4 damage when direct damage reduces your HP.',thorns:4},
 bell:{name:'Dewdrop bell',icon:'♧',rarity:'UNCOMMON',description:'Restore 4 HP at the end of every round.',regen:4},
 lens:{name:'Eclipse prism',icon:'◐',rarity:'EPIC',description:'Grants Lunar fracture: damage and expose the entire enemy team.',ability:'eclipse'},
 lyre:{name:'Bloomweave lyre',icon:'❀',rarity:'EPIC',description:'Grants Verdant chorus: regeneration for your entire team.',ability:'sanctuary'},
 censer:{name:'Cinder censer',icon:'♨',rarity:'RARE',description:'+6% damage; unlocks Censer’s brand in the skill library.',damage:1.06,ability:'cinderBrand',dropOnly:true},
 pearl:{name:'Moonwell pearl',icon:'❋',rarity:'RARE',description:'+12% healing and shield power, +12 HP.',recovery:1.12,hp:12,dropOnly:true},
 carapace:{name:'Ironreef shell',icon:'⬡',rarity:'UNCOMMON',description:'+5 percentage points defense and +18 HP.',defense:.05,hp:18,dropOnly:true},
 coil:{name:'Stormglass coil',icon:'ϟ',rarity:'EPIC',description:'+6% damage; unlocks Stormglass aegis in the skill library.',damage:1.06,ability:'staticGuard',dropOnly:true},
 beads:{name:'Sage’s prayer beads',icon:'◌',rarity:'RARE',description:'+8% healing and shield power, +3 percentage points defense.',recovery:1.08,defense:.03,dropOnly:true},
 feather:{name:'Phoenix down',icon:'♧',rarity:'RARE',description:'+15 HP and restore 2 HP at round end.',hp:15,regen:2,dropOnly:true}
};
export const roles = {
 tank:{name:'Tank',icon:'♜',hp:130,description:'Draw attacks away from allies with a taunt. Stay standing with shields or self-healing.',core:['challenge'],options:['challenge','ward','rekindle','focus','hex'],defaults:['challenge','rekindle']},
 fighter:{name:'Fighter',icon:'⚔',hp:95,description:'Pressure enemies with heavy strikes and elemental attacks. Add a self-buff or a recovery move.',core:['strike','spark','flare','nova','undertow','cinder'],options:['strike','spark','flare','nova','undertow','cinder','focus','rekindle','ward'],defaults:['strike','focus']},
 support:{name:'Support',icon:'❋',hp:110,description:'Keep teammates alive with healing or cleansing. Add shields, buffs, or a weakening curse.',core:['bloom','mend','stardew'],options:['bloom','mend','rally','ward','hex','rekindle'],defaults:['bloom','rally']}
};
export const elements = {
 Ember:{icon:'♨',color:'#f1b184',beats:'Grove'},
 Grove:{icon:'❋',color:'#a9d898',beats:'Tide'},
 Tide:{icon:'≋',color:'#94d7e2',beats:'Astral'},
 Astral:{icon:'ϟ',color:'#b8b9fa',beats:'Ember',theme:'Lightning'}
};
export function elementMultiplier(attacker,defender){
 if(!Object.hasOwn(elements,attacker)||!Object.hasOwn(elements,defender)||attacker===defender)return 1;
 if(elements[attacker].beats===defender)return 1.5;
 if(elements[defender].beats===attacker)return .75;
 return 1;
}
export const species={deer:'Deer',fox:'Fox',bear:'Bear',owl:'Owl',tortoise:'Tortoise',otter:'Otter',shark:'Shark',lynx:'Lynx',stag:'Stag',penguin:'Penguin',ray:'Manta ray',moth:'Moth',dragon:'Dragon',monkey:'Stone monkey',thunderbird:'Thunderbird',leviathan:'Leviathan'};
export const learnsets={tank:[['bulwark',3],['bastion',5],['quake',8],['ironheart',12]],fighter:[['comet',3],['tempest',5],['inferno',8],['supernova',12]],support:[['springtide',3],['purify',5],['lifebloom',8],['rebirth',12]]};
export const starters=[
 {id:'moss',name:'Mossling',species:'deer',role:'support',element:'Grove',color:'#a9d898',shape:'sprout',hp:110,moves:['bite','bloom','ward'],lore:'A woodland fawn whose flower-crowned antlers hold the forest’s oldest remedies.'},
 {id:'luna',name:'Lunelle',species:'fox',role:'fighter',element:'Astral',color:'#c3b1f4',shape:'rabbit',hp:95,moves:['bite','spark','rally'],lore:'A moon fox with a comet caught in her tail. Brave enough to share its light.'},
 {id:'ember',name:'Cindlet',species:'bear',role:'tank',element:'Ember',color:'#f1b184',shape:'horns',hp:130,moves:['bite','challenge','rekindle'],lore:'A little volcanic bear in cooling obsidian armor. The warmest place is behind him.'}
];
export const wilds=[
 {id:'wisp',name:'Glimmer',species:'owl',role:'fighter',element:'Astral',color:'#94d7e2',shape:'rabbit',hp:85,moves:['bite','spark','focus'],lore:'A stargazing owl whose wings chart constellations no one else can see.'},
 {id:'bramble',name:'Bramble',species:'tortoise',role:'tank',element:'Grove',color:'#b4c18a',shape:'horns',hp:130,moves:['bite','challenge','ward'],lore:'An ancient garden tortoise. Every scratch on his shell has grown into a leaf.'},
 {id:'dusk',name:'Duskit',species:'otter',role:'support',element:'Tide',color:'#bda2cf',shape:'sprout',hp:110,moves:['bite','bloom','hex'],lore:'A river otter who gathers moonlit pebbles and washes bad dreams downstream.'},
 {id:'jetfin',name:'Jetfin',species:'shark',role:'fighter',element:'Tide',color:'#83becf',shape:'rabbit',hp:98,moves:['bite','undertow','focus'],lore:'A reef shark with an ocean in miniature beneath his fins. Fast, curious, and terribly proud.'},
 {id:'saffron',name:'Saffron',species:'lynx',role:'fighter',element:'Ember',color:'#e6ad73',shape:'rabbit',hp:95,moves:['bite','cinder','rekindle'],lore:'A desert lynx with ember ear-tufts and paws that barely touch the sand.'},
 {id:'fernox',name:'Fernox',species:'stag',role:'tank',element:'Grove',color:'#92b886',shape:'horns',hp:140,moves:['bite','challenge','rekindle'],lore:'A young elk carrying a whole grove between his antlers. He never leaves a friend behind.'},
 {id:'tundlet',name:'Tundlet',species:'penguin',role:'tank',element:'Tide',color:'#9bc9dc',shape:'horns',hp:128,moves:['bite','challenge','ward'],lore:'A glacier penguin wearing a cloak of sea glass. Small wings, enormous courage.'},
 {id:'moondrift',name:'Moondrift',species:'ray',role:'support',element:'Astral',color:'#b7a9e0',shape:'sprout',hp:105,moves:['bite','stardew','rally'],lore:'A sky manta that swims between stars, trailing healing lanterns in its wake.'},
 {id:'nectar',name:'Nectarwing',species:'moth',role:'support',element:'Grove',color:'#d8ba95',shape:'sprout',hp:108,moves:['bite','bloom','mend'],lore:'A velvet moth dusted with dawn pollen. Every wingbeat makes something bloom.'}
];
export const legends=[
 {id:'legend-pyrragon',name:'Pyrragon',title:'The Crimson Wing',legend:true,bossFloor:5,species:'dragon',role:'fighter',element:'Ember',color:'#df9d78',shape:'horns',hp:110,basic:'dragonClaw',moves:['dragonClaw','dragonBreath','dragonFury'],lore:'A young dragon carrying the first sunrise in its lungs. Its courage burns brighter with every battle.'},
 {id:'legend-cloudsage',name:'Cloudsage',title:'The Stoneborn Sage',legend:true,bossFloor:10,species:'monkey',role:'tank',element:'Grove',color:'#d4b77a',shape:'horns',hp:145,basic:'sageStaff',moves:['sageStaff','cloudChallenge','stoneSkin'],lore:'A mischievous stone monkey inspired by Sun Wukong, carrying a cloud-wrought staff and an unbreakable promise to protect its friends.'},
 {id:'legend-stormroc',name:'Stormroc',title:'The Thunder Crown',legend:true,bossFloor:15,species:'thunderbird',role:'fighter',element:'Astral',color:'#aaa9e7',shape:'rabbit',hp:108,basic:'rocTalons',moves:['rocTalons','thunderStrike','focus'],lore:'A thunderbird that nests inside storm clouds. One beat of its wings turns silence into lightning.'},
 {id:'legend-neruvia',name:'Neruvia',title:'The Gentle Deep',legend:true,bossFloor:20,species:'leviathan',role:'support',element:'Tide',color:'#87c3cb',shape:'sprout',hp:120,basic:'pearlPulse',moves:['pearlPulse','oceanChorus','deepwellGrace','royalTide'],lore:'A pearl-crowned leviathan from the oldest ocean. Its song carries the strength and memory of every tide.'}
];
export function legendFor(p){return legends.find(legend=>legend.id===(typeof p==='string'?p:p?.id));}
export function basicMove(p){return legendFor(p)?.basic||'bite';}
export function petSpecies(p){return Object.hasOwn(species,p.species)?p.species:[...starters,...wilds,...legends].find(q=>q.id===p.id)?.species||({sprout:'deer',rabbit:'fox',horns:'bear'}[p.shape])||'fox';}
export function resolveRole(p){
 if(Object.hasOwn(roles,p.role))return p.role;
 const known=[...starters,...wilds,...legends].find(known=>known.id===p.id);
 if(known)return known.role;
 if(p.moves.some(id=>['bloom','mend'].includes(id)))return 'support';
 if(p.moves.includes('challenge')||p.moves.includes('ward')&&!p.moves.some(id=>roles.fighter.core.includes(id)))return 'tank';
 return 'fighter';
}
export function roleLoadout(p){
 const legend=legendFor(p);if(legend)return {...p,legend:true,bossFloor:legend.bossFloor,title:legend.title,species:legend.species,role:legend.role,element:legend.element,basic:legend.basic,moves:[...legend.moves]};
 const role=resolveRole(p),moves=[...p.moves];
 if(!moves.some(id=>roles[role].core.includes(id)))moves[1]=roles[role].core[0];
 return {...p,role,moves};
}
export const isRecovery=a=>['heal','cleanse','teamheal','lifebloom'].includes(a.kind);
export const isBarrier=a=>['shield','taunt','bulwark','bastion'].includes(a.kind);
export const isTaunt=a=>['taunt','bulwark'].includes(a.kind);

export const elementalLearnsets={Ember:[['emberClaw',1],['fireBreath',3],['heatShield',6],['volcanicRoar',10]],Tide:[['waterLance',1],['tidalCrash',3],['healingCurrent',6],['maelstrom',10]],Astral:[['staticSpark',1],['chainLightning',3],['overcharge',6],['thunderstorm',10]],Grove:[['vineWhip',1],['thornVolley',3],['wildwood',6],['ancientRoots',10]]};
export function abilityElement(p,a){return Object.hasOwn(elements,a.element)?a.element:p.element;}
