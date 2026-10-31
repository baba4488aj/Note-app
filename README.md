# Lumenwild · Windows game & automatic updates

An original browser pet collection and team battle game. The browser game uses native JavaScript, CSS, and original animated SVG artwork. The Windows app bundles Electron and its updater; players do not need Node.js or a separate browser.

## Easiest way to play

Open **Lumenwild.html** in Chrome or Edge. This single file works offline and needs no server. Keep the same browser and file location to retain local saves. The game reports when browser storage is unavailable.

Regenerate the file with `npm run bundle`.

## Windows game

Download the installer from [the latest GitHub release](https://github.com/baba4488aj/Note-app/releases/latest) and run it on 64-bit Windows 10 or newer. The installer adds Lumenwild to the Start menu and desktop. It includes its runtime: no Node.js installation, command-file launcher, or external browser is required.

The native game keeps the original desktop save location, **`%APPDATA%\Lumenwild\save.json`**, and its previous-save backup. If you used the older command-file launcher, close it before starting the installed game. Its existing save is loaded automatically. Browser progress can be moved with **Saves → Export save backup**, then **Saves → Import save backup** in the installed game. To export an older browser save, first replace its HTML with the updated file at the same filename/location (or use the same localhost URL).

### Automatic updates

The installed game checks for a newer stable release shortly after launch and every four hours. Updates download in the background. **Saves → Game updates** shows progress and offers **Restart & update** once ready. Otherwise the update installs when you exit, without reopening the game. Downloads never restart a battle automatically.

Before exit or installation, the game stops auto-training, finishes the current turn, and flushes the latest save. Before an update, it creates `save.before-update-VERSION.json`; the three newest pre-update backups are retained. Updates and uninstalling leave user progress in the separate save folder. An offline check or an unpublished release feed leaves the installed game playable.

The release feed is **`baba4488aj/Note-app` on GitHub Releases**, configured in `desktop/release-config.json`. Public stable releases include the installer, its `.blockmap`, and `latest.yml`. Electron Updater handles version selection, download checksums, and NSIS installation. Prereleases and downgrades are disabled.

The public update feed is live on [GitHub Releases](https://github.com/baba4488aj/Note-app/releases/latest). The Windows build and the initial release tests passed on GitHub Actions, and the published installer and update metadata were downloaded and checksum-verified. Code signing is not configured; the current Windows installer is unsigned.

### Publish releases

The workflow at `.github/workflows/desktop-release.yml` builds on Windows and stages a draft release. It uploads the complete installer/update set before publishing that draft as the latest release. Existing published version files are never replaced.

The game source, workflow, and first release are published. For each future release, increase the version and push its matching tag. You can also start **Actions → Windows game release → Run workflow** after committing a new version. The workflow will not replace an existing published version; it stages all update assets before publishing.

For later updates, start from a clean checkout:

```
npm version patch
git push origin main --follow-tags
```

The version lifecycle synchronizes the game and desktop save-compatibility versions before npm creates the commit/tag. The pushed tag triggers the release workflow. Once its release is published, installed copies discover and download it automatically while retaining saves.

To build locally, use Node.js 24, run `npm ci`, then:

```
npm run desktop:dev
npm run desktop:dist -- --win --x64 --publish never
```

The build writes the setup executable, blockmap, and manifest into `release/`. Windows is the recommended build host. Cross-building on Linux additionally needs Wine and a display server for NSIS generation. The separate `npm run desktop:bundle` command still generates the older Node/Edge launcher ZIP for compatibility; that launcher does not apply native automatic updates.

## Develop

Install Node.js 20 or newer and run:

```
npm run dev
```

Open http://localhost:5173. No `npm install` is needed. Set `PORT` to choose another port. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

```
npm test
npm run check
npm run bundle
```

The generated HTML also works on ordinary static hosting.

## Build a team

Choose one to three owned pets in the Sanctuary. Tanks draw attacks with taunts and protect themselves; fighters deal damage; supports heal, cleanse, and buff. Pets can also use hybrid utility and relic-granted abilities.

Open **Stats & abilities** to inspect stats, growth previews, passives, unlocked skills, equipment, and the four-slot build editor. Every pet brings **one always-ready basic attack and up to three chosen skills**. New levels expand the library; they do not replace selected skills automatically. Each Legend's innate passive works outside these four slots.

Select skills in the editor to save immediately. Selecting a skill already assigned to another slot swaps the selections. Locked skills, duplicate skills, boss-exclusive arts, and skills from unworn relics cannot be equipped. Equipping a relic makes its skill selectable; removing it removes that skill from the loadout. Loadout or equipment changes abandon an existing encounter, keeping already earned XP.

## Cooldown combat

There is **no energy resource**. Every living pet acts once per round, in the order you choose, followed by the enemy team. Pick a pet, skill, and target, then press **Cast**. Skills normally have two- to four-turn cooldowns; stronger attacks, healing, and team effects take longer to recharge. Basics have no cooldown.

Cooldowns decrease at round end. A three-turn skill used on turn 1 returns on turn 4. Cooldowns continue advancing through stunned turns. Each encounter starts with full HP and ready skills.

Single-target hostile skills must target a living taunting enemy. Area attacks and friendly effects bypass taunts. Fallen guardians and expired taunts release targets. A friendly taunt replaces the previous friendly taunt.

| Effect | Rule |
| --- | --- |
| Courage | +35% direct damage |
| Weakened | Deal 25% less direct damage |
| Exposed | Take 25% more direct damage |
| Burn | 6 base damage scaled by the original caster’s level; shields absorb it first |
| Regeneration | 8 HP at round end, scaled by the recipient's recovery |
| Shield | Absorbs damage until consumed |
| Counter stance | Retaliate with 18 base Grove power after a direct hit, even through shields; no retaliation chains |
| Rock skin | +25 percentage points of direct damage reduction; total reduction caps at 60% |
| Stunned | Skip the next action unless cleansed first |
| Vitality | +20% actual maximum HP, filling the added capacity once; refreshes do not stack or repeatedly heal |

Statuses count down at round end, including the round applied, except stun, which lasts until the affected action is lost or it is cleansed. A ready healer can cleanse a stunned teammate before their action is lost. When only stunned pets remain ready, they skip automatically. Start-of-turn Legend passives also fire once on skipped stunned actions. Cleansing removes burn, weakness, exposure, stun, and elemental auras. Nothing revives fallen pets during an encounter.

Vitality expiration restores normal maximum HP and clamps current HP without dealing damage. Damage combines level power, equipment, defense, type, buffs, and passives. Burn uses the original caster’s level growth, independently of gear, buffs, defense, and type multipliers. At level 100 it deals 77 HP per tick. Thorns remain determined by the item level. Counters use normal attack scaling, Grove matchups, and the attacker's armor; they cannot trigger another counter or thorns.

**Element cycle:** Ember → Grove → Tide → Astral → Ember. Forward attacks deal 1.5× damage; reverse attacks deal 0.75×. Same and opposite elements are neutral. Astral is lightning. Typed skills use their listed element; untyped attacks use the caster's element. Area attacks evaluate each target separately. Healing and shields ignore elemental matchups.

## Element combinations

Active damaging skills, including basics, leave an elemental aura lasting two round ends, including the application round. A different element hitting that target triggers one of six reactions in either order and consumes its aura. Same-element hits refresh the aura. Healing, shields, passives, counters, burn ticks, and reactions do not apply auras. Cleanses remove auras. Enemy teams use the same rules.

| Elements | Reaction | Base effect |
| --- | --- | --- |
| Ember + Tide | Steam burst | 14 bonus damage and 2-round weakness |
| Ember + Grove | Wildfire | 10 bonus damage and 3-round burn |
| Ember + Astral | Overload | 12 bonus damage and 2-round exposure |
| Grove + Tide | Bloom | Heal the living ally with the lowest HP percentage for 16 and grant 2-round regeneration |
| Tide + Astral | Conduction | 16 bonus lightning damage to every living enemy, bypassing taunt |
| Grove + Astral | Static bind | 10 bonus damage and skip the target's next action |

Power scales with the triggering pet's level and gear. Bonus damage respects armor, shields, and buffs, ignores type multipliers, and cannot cause retaliation. Bloom and Conduction each trigger once per skill even when an area attack consumes several matching auras. Reactions cannot recursively trigger more reactions. Auras, reaction previews, named effects, and animated bursts make combinations visible in battle. Auto-training values available reactions when choosing moves.

## Account level and visual growth

One **account level (1–100)** controls every companion's stats, appearance, and skill library, including benched, newly recruited, and custom pets. Pets no longer store independent levels or XP. The account XP bar appears on every screen. Collection controls sort by element, role, name, or acquisition order and filter by element and role together; these preferences are saved.

Existing saves migrate to the highest valid pet level already reached. The most advanced XP fraction at that level is preserved on the new curve. For example, a level-20 pet halfway to 21 becomes account level 20 halfway to 21; every other companion immediately catches up. Teams, builds, gear, item levels, collection, and tower clears are retained.

Each credited enemy defeat awards `round(38 × enemyLevel^1.25 × difficultyMultiplier × xpFactor)` account XP **once**, regardless of party size or who lands the final hit. Higher-level opponents provide more XP: level 1 gives 38 base XP, level 10 gives 676, and level 100 gives 12,017. Reduced minion XP and training/tower multipliers still apply. Burn, thorns, counters, passive lightning, and reaction kills preserve source credit. XP survives losses and abandoned encounters.

Next-level XP is `round(60 × accountLevel^1.6)`. Excess carries over; the account caps at 100. Each level above 1 adds **14% of base HP, 12% of base attack power, and 10% recovery**. Base defense grows smoothly as `0.6 × (1 − exp(−(level − 1) / 40))`, reaching about 55% at level 100; total defense including equipment and rock skin caps at 60%. Equipment adds its own bonuses. Current encounters keep their original level and item snapshots; new stats, appearance, and skill choices apply in the **next encounter**, without refreshing cooldowns or reviving fallen pets.

| Visual stage | Levels | Appearance |
| --- | --- | --- |
| Young | 1–4 | Simple coloring and a small role charm |
| Awakened | 5–9 | Role equipment and an elemental crest |
| Ascendant | 10–14 | Ornate markings, elemental details, and a runic ground ring |
| Exalted | 15–100 | Full regalia, crown, and luminous aura |

Every ordinary, custom, and Legend species uses these four stages. Dossiers preview all stages. Role skills unlock at 3, 5, 8, and 12; element skills unlock at 1, 3, 6, and 10. Unlocked skills remain available in the library for future builds.

## Ordinary passives and talent choices

Every ordinary pet and custom pet has an innate animal passive, shown in its dossier, sanctuary card, Pet studio preview, and battle badges. Passives use no skill slots. Custom pets with mythological animal models receive an ordinary role-based passive; actual Legends retain their exclusive passives.

| Animal | Passive | Effect |
| --- | --- | --- |
| Deer | Spring offering | Healing one ally shares 25% of the HP actually restored with the most wounded other living ally. Shared healing cannot trigger another passive. |
| Fox | Prismatic instinct | After triggering an elemental reaction, gain Courage (+35% damage) for 2 rounds. Once per skill. |
| Bear | Cooling obsidian | The first time damage leaves you alive below 40% HP, gain a shield equal to 20% of maximum HP. Once per encounter. |
| Owl | Keen sight | Deal 15% more direct damage to exposed enemies, in addition to exposure’s normal bonus. |
| Tortoise | Verdant recycle | At the start of your turn, convert up to 10% of your maximum HP in leftover shield into half as much healing for the most wounded living ally. Only consume shield that can restore HP. |
| Otter | Sharing current | After using a single-ally healing skill, grant 2 rounds of regeneration to the most wounded other living ally. |
| Shark | Deepwater hunter | Deal 20% more direct damage to enemies below 50% HP. |
| Lynx | Opening pounce | Deal 15% more direct damage to enemies above 75% HP. |
| Stag | Grove guardian | When you taunt, give every other living ally a shield equal to 4% of your maximum HP. |
| Penguin | Icebound shelter | At round end, if you still have a shield, restore 4% of your maximum HP. Cannot revive. |
| Manta ray | Lantern wake | After casting a team buff without damage or healing, shield the living ally with the lowest HP percentage for 5% of their maximum HP. |
| Moth | Cleansing pollen | Your active healing skills also remove burn from their living targets. |

Open **Stats & abilities → A path of their own** to choose one talent for each pet at account levels **25, 50, and 75**. Level 25 is a role choice, 50 an element choice, and 75 a role mastery. Choices are independent per pet, never consume a skill slot, and can be swapped or reset for free. Changes save immediately and apply in the next encounter. New recruits at a high account level can immediately choose every unlocked tier. Locked, wrong-role, and wrong-element selections are rejected or repaired during save migration.

| Role | Level 25 choices | Level 75 choices |
| --- | --- | --- |
| Tank | Deep roots: +15% maximum HP. / Guardian arts: +25% healing and shield power. | Last stand: Once per encounter, survive a lethal direct hit at 1 HP and gain a 20% max-HP shield. / Guardian aura: At the start of your turn, shield the most wounded other living ally for 6% of your maximum HP. |
| Fighter | Ferocity: +12% ability damage. / Siphoning strikes: Restore HP equal to 12% of the HP damage dealt by your active attacks. Does not revive or trigger from passives, reactions, or counters. | Executioner: +25% direct damage against foes below 35% HP. / Battle momentum: Once per round, a credited kill reduces all your current skill cooldowns by 1. |
| Support | Restoration: +15% healing and shield power. / Overflowing grace: Active healing converts 50% of unused healing into a shield, capped at 15% of the target’s max HP. Shields do not stack. | Evergreen: Regeneration you apply lasts 1 extra round. / Wardweaver: Your active healing skills also shield each living target for 6% of their maximum HP. Shields do not stack. |

| Element | Level 50 choices |
| --- | --- |
| Ember | Endless kindling: Burns you apply deal 40% more damage. / Ashen heart: +8% maximum HP and immunity to burn. |
| Grove | Renewal: Regeneration you receive restores 50% more HP. / Heartwood: +10% maximum HP. |
| Tide | Healing tide: +20% healing and shield power. / Surging tide: +20% elemental reaction damage and healing. |
| Astral | Charged arts: +15% direct Astral damage. / Conductor: +25% elemental reaction damage and healing. |

Overhealing and mastery shields replace smaller shields rather than stacking. Siphoning strikes use actual HP damage from active attacks, excluding shield absorption, overkill, passive strikes, counters, and reactions. Last stand protects against one lethal direct hit; burn and reflected damage can still defeat the pet. Battle momentum uses normal kill credit, including reaction and burn kills, once per round while the pet is alive. Normal enemies and minions use their animal passives; unchosen talent tiers grant no bonus.

## Legend pets and innate passives

| Legend | Role / element | Innate passive |
| --- | --- | --- |
| Pyrragon | Dragon fighter / Ember | **Everlasting ember:** +6% attack per opposing enemy burn tick, up to ten stacks (+60%) for this encounter |
| Cloudsage | Sun Wukong-inspired monkey tank / Grove | **Reflex of the sage:** automatically counter direct hits with 7 base Grove power; Heaven's challenge upgrades this to 18 instead of adding a second counter |
| Stormroc | Thunderbird fighter / Astral | **Storm herald:** strike every living enemy for 7 base lightning power at the start of its action |
| Neruvia | Leviathan support / Tide | **Gentle undertow:** heal the living ally with the lowest health percentage for 12 base HP at the start of its action |

Turn-start passives trigger once per pet turn, after a valid action is committed, including a skipped stunned turn. Changing selection or attempting an invalid skill cannot retrigger them. They scale with level and relevant equipment. Pyrragon's stacks reset between encounters. Dead pets cannot heal, counter, or trigger passives.

Signature active kits remain available: Pyrragon's claw, burning team breath, and self-buffing strike; Cloudsage's staff, taunt/counter stance, and rock skin; Stormroc's free area claws and stunning lightning; Neruvia's water pulse, team heal, targeted regeneration, and maximum-HP/attack team buff.

## Two adventure modes

### Training glade

Repeatable encounters scale to account level. Gentle uses two weaker enemies and 80% XP; Balanced uses three and normal XP; Challenging uses three at two levels above the account, capped at 100, and 125% XP. The featured pet is guaranteed on a claimed victory if unowned and always joins at the current account level.

**Discover missing companions** guarantees a missing eligible species until the collection is complete. **Rotate the full roster** cycles all eligible pets, or choose a specific recruitment focus. All twelve ordinary pets, including missing starters, are recruitable here. Legends enter the training roster only after their trial is cleared or they are already owned; training cannot bypass locked trials. Owned pets are never duplicated or reset.

**Auto-training** uses normal combat, equipped skills, passives, cooldowns, item XP, random drops, and reward claims. It repeats encounters and recovers after defeats while the page stays open. Stop finishes the current turn, including the enemy response, then returns manual control. Only one worker can run; reload always leaves it stopped. There is no offline farming. Encounters exceeding 80 rounds pause for manual adjustment. Tower battles remain manual.

**Auto-training goals** are available on the training card and during training encounters. Set a completed-battle limit (0 = unlimited), an account-level target (0 = disabled), and/or an item target (none, any new drop, or a specific relic). The first reached goal finishes the current encounter, claims victory rewards once, records loot from wins/losses/draws, and stops before restarting. A level target already reached stops before any action. Previously owned items do not satisfy drop goals. Wins, losses, draws, XP, recruits, and item drops appear in the session counters with a clear stop reason. Settings persist, while session counters and the running worker reset on reload. Goals are fixed when a session starts; manual Stop retains its current-turn behavior.

### Astral spire and real boss trials

Twenty sequential floors: every opponent on floor N is exactly **level 5 × N**, from level 5 on floor 1 to level 100 on floor 20. Bosses remain on floors 5, 10, 15, and 20, at levels 25, 50, 75, and 100 respectively. Summoned minions use the same level as their floor. Ordinary floors have a tank, fighter, and support. First clears unlock the next floor; training and defeats never advance the tower. Tower XP uses a 1.15 multiplier.

| Floor / enemy level | Legend trial | Charged boss-only art |
| --- | --- | --- |
| 5 / Lv.25 | Pyrragon · The Sunken Furnace | Crimson cataclysm: heavy team fire damage and burn |
| 10 / Lv.50 | Cloudsage · The Skybound Monastery | Heaven-falling mountain: team damage and weakness, plus personal rock skin |
| 15 / Lv.75 | Stormroc · The Shattered Aerie | Judgment of the sky: team lightning damage and exposure |
| 20 / Lv.100 | Neruvia · The Pearl Abyss | Abyssal reckoning: team water damage and weakness |

Trials open against a single Legend with **2.8× base HP, 20% extra damage/recovery power, and eight extra percentage points of defense**. Bosses also have their normal innate passive. The warning panel announces the charged special from round 2; after use, the next special is scheduled three rounds later. Boss-exclusive arts occupy one of the boss's four slots and cannot be equipped by players.

The first boss action summons up to two themed minions. Summons occupy vacant enemy slots, with at most three living enemies total, and cannot act until the next round. At half HP, the next boss turn enters **Phase II**, granting +15% attack, four extra defense points, a shield, and one reinforcement wave when space is available. There are at most two waves per trial. Minions have reduced HP, power, and XP, fresh defeat identities, and cannot create endless XP loops. Defeating the Legend disperses its summons without awarding XP for their withdrawal.

Claim first victory rewards for guaranteed recruitment of that Legend with its normal base stats at the **current account level** and double relic loot. Older saves keep their cleared floors and can replay the new trials to earn missing Legend rewards. The separate trial ledger prevents duplicate loot and recruits. Subsequent cleared-floor replays grant XP only.

## Items: individual copies, levels, and drops

Each pet wears one relic copy. Copies cannot be shared at the same time. The satchel's copy selector shows the level, XP, and wearer of each individual copy. Unequipping and transferring an item preserves its growth.

The finishing pet’s equipped item earns full base kill XP; other deployed items earn half, rounded up, including items worn by fallen pets. Items keep earning XP at account level 100. Benched and unworn copies earn none. Item level caps at **20**, with next-level XP `40 + 20 × (level − 1)`.

HP, damage, recovery, defense, thorns, and regeneration bonuses grow by 10% of their base value per item level. Ability-granting relics additionally gain 2 HP and 4% skill power per level above 1. Growth saves immediately; the current battle keeps its item snapshot until the next encounter.

The original six starter copies remain: Heartwood seed, Sunstone fang, Bramble crown, Dewdrop bell, Eclipse prism, and Bloomweave lyre. Six additional types start undiscovered:

| New relic | Level-1 effect |
| --- | --- |
| Cinder censer | +6% damage; unlocks Censer's brand, a burning attack |
| Moonwell pearl | +12% healing/shield power and +12 HP |
| Ironreef shell | +5 percentage points defense and +18 HP |
| Stormglass coil | +6% damage; unlocks Stormglass aegis, team shields and Courage |
| Sage's prayer beads | +8% healing/shield power and +3 percentage points defense |
| Phoenix down | +15 HP and 2 HP recovery per round |

Every **completed** training encounter rolls once for a relic: **35% Gentle / 50% Balanced / 65% Challenging**, including defeats and draws. An abandoned unfinished encounter does not roll. Drops are saved immediately, independently of companion reward claims; auto-training cannot claim them twice. The weighted pool includes all twelve types, with uncommon relics more frequent than rare and epic relics. A new copy always starts at level 1. Tower first-clear loot remains guaranteed.

## Animals, creation, and presentation

Ordinary species: deer, fox, bear, owl, tortoise, otter, shark, lynx, stag, penguin, manta ray, and moth. Each has its own silhouette and idle motion, with role equipment and elemental details developing through growth. Recruiting a Legend unlocks its animal model in Pet studio; the innate passive and Legend-only arts stay exclusive to the actual Legend.

Custom pets choose a name, role, element, color, and animal model, plus two starting special abilities. At least one special must fit the role. Wild bite and the element's starting skill complete the default four-skill loadout. Custom pets immediately use the account level and its unlocked skills.

Spells combine projectiles, lightning arcs, fire cones, glyphs, particles, impact pulses, and floating XP/status text. Passives and boss summons animate before the active skill; elemental reactions animate afterward. Full and Quick speeds are available. Reduced-motion preferences retain readable feedback with shortened transitions. Sound is not included.

## Saves and implementation

The **Saves** screen exports versioned JSON backups, imports older saves, and can undo the most recent import. Invalid or newer-version files are rejected before replacing progress. The native renderer is sandboxed, with Node disabled and a narrow preload API for updates; save writes remain in the main process’s local service. Desktop writes are serialized and use temporary files with automatic previous-save backups; a corrupt current file can recover from the valid backup.

Local saves preserve pets, species, base stats, account level and XP, collection sorting/filtering, selected skills, per-pet talent choices, training goals, team, individual relic copies and growth, equipment assignments, training focus, tower/trial progress, and animation speed. Older counted inventories become separate level-1 copies with equipment assignments retained. Invalid selections and duplicate item assignments are repaired. The storage key stays `lumenwild-v2`; no reset is required. In-progress encounters and auto-training state are not restored after reload.

| Module | Responsibility |
| --- | --- |
| `src/catalog.js` | Species, skills, passives, effects, learnsets, items |
| `src/rules.js` | Level cap, floor level step, stat scaling, game version |
| `src/stages.js` | Four visual growth stages |
| `src/skills.js` | Unlocked libraries, four-slot validation, enemy builds |
| `src/relics.js` | Individual copies, level scaling, XP, random drop rolls |
| `src/progression.js` | Account growth, legacy level migration, pet snapshots, defeat XP |
| `src/passives.js` | Animal passives and exclusive Legend lookup |
| `src/talents.js` | Milestone choices, validation, stat modifiers |
| `src/training-goals.js` | Saved stop settings and goal descriptions |
| `src/collection.js` | Saved sorting and combined element/role filters |
| `src/reactions.js` | Six elemental combinations and aura rules |
| `src/bosses.js` | Boss arts, lair rules, themed minion templates |
| `src/modes.js` | Encounter generation, tower progression, claims |
| `src/combat.js` | Actions, passives, cooldowns, phases, summons, kill credit |
| `src/autotraining.js` | Tactical planning and cancellable training loop |
| `src/storage.js` | Migration, validation, inventory and equipment |
| `src/saves.js` | Versioned backups, import validation, desktop write queue |
| `desktop/server.cjs` | Local desktop save service and legacy launcher |
| `desktop/electron-main.cjs` / `desktop/preload.cjs` | Native window, restricted IPC, single instance, graceful exit |
| `desktop/update-service.cjs` / `desktop/save-lifecycle.cjs` | Automatic update state, save-before-install, pre-update backups |
| `electron-builder.cjs` | Windows installer, application identity, update feed |
| `.github/workflows/desktop-release.yml` | Windows build and staged release publication |
| `scripts/desktop.js` | Portable Windows launcher ZIP packaging |
| `src/art.js` / `src/effects.js` | Animal artwork and combat animation |
| `src/app.js` | Sanctuary, builds, dossiers, adventure and battle UI |
| `scripts/standalone.js` | Dependency-free single-file packaging |
