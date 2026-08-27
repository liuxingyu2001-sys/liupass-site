# Liupass Battle Pass Plugin

A Minecraft Paper server battle pass plugin with **multi-server cross-server sync**, three independently purchasable tiers, and custom tasks and rewards.

> For the complete server-owner guide see [USER_GUIDE.md](USER_GUIDE.md)

## Features

- ✅ Multiple passes (seasons), each with independent tiers / tasks / rewards / start-end time
- ✅ **Three independently purchasable tiers**: Standard / Deluxe / Premium; the first tier can be made free with `free: true`
- ✅ Purchase currencies: PlayerPoints + Vault economy (soft dependencies, either one is enough)
- ✅ Paid-tier XP multiplier: purchased tiers stack (e.g. Standard x1.2 + Deluxe x1.5 = total x1.7)
- ✅ Task types: KILL / MINE / CRAFT / FISH / ENCHANT / BREW / EAT / PLAY_TIME / LOGIN / CUSTOM
- ✅ Task periods: season tasks (one-time) / daily tasks (reset daily) / weekly tasks (reset weekly)
- ✅ Task XP is **credited automatically**; task and level rewards are **claimed manually** (claim queue)
- ✅ Reward types: COMMAND / ITEM / CRAFTENGINE (CE model items) / MONEY / POINTS, all referenced by reward ID
- ✅ Persistence: MySQL or SQLite (either one) + Redis cache and Pub/Sub cross-server sync
- ✅ Dirty-flag batch write-back (30s) + version optimistic locking + Redis distributed locks
- ✅ Automatic player-data cleanup when a season expires; players must purchase again
- ✅ Full permission system + admin commands + Tab completion
- ✅ CraftEngine icon models (soft dependency, falls back to vanilla material)
- ✅ PlaceholderAPI placeholders + public PassAPI
- ✅ Hot config reload (`/liupass reload`)

## Requirements

| Dependency | Required | Notes |
|---|---|---|
| Paper / Leaf 1.21+ | ✅ | Compiled against a tested Leaf 1.21.11 environment, Java 17+ |
| MySQL 5.7+ / 8.x | ✅ | Player data persistence (alternative to SQLite) |
| SQLite 3.x | ✅ | Lightweight single-server persistence (alternative to MySQL) |
| Redis 5+ | (required for network servers) | Cache + cross-server Pub/Sub sync |
| Vault | optional | Economy purchases / MONEY rewards |
| PlayerPoints 3.x | optional | Points purchases / POINTS rewards |
| CraftEngine | optional | GUI icon models |
| PlaceholderAPI | optional | Placeholder variables |

## Installation

1. Put `Liupass-*.jar` into `plugins/` and start once to generate default configs (details in [USER_GUIDE.md](USER_GUIDE.md))
2. The server auto-loads third-party libraries via the `libraries:` declaration (one-time network access, then cached)
3. Edit `plugins/Liupass/config.yml` to configure MySQL and Redis connections
4. If using a shared config directory, the directory pointed to by `shared-config-path` manages `config.yml` / `messages.yml` / `passes/` / `tasks/` / `rewards/` (default configs are copied on first start)
5. Restart the server (or `/liupass reload`)

## Configuration Layout

```
plugins/Liupass/ or the shared directory pointed to by shared-config-path/
├── config.yml        # database (MySQL/SQLite) / Redis / scheduler / currency aliases / settings
├── messages.yml      # message texts
├── passes/           # passes: one file per pass
├── tasks/            # tasks: tasks/<normal|daily|weekly>/*.yml (shared by all passes)
└── rewards/          # reward registry: multiple files allowed, referenced by ID from tasks/levels
```

> Once `settings.shared-config-path` is set, the **whole config directory** (including `config.yml`) is read from the shared directory — suitable for multiple servers sharing one battle-pass setup.

### Pass (passes/season1.yml)

```yaml
pass-id: season1
name: "第一赛季"
icon-model: ""                 # CraftEngine model ID; empty falls back to vanilla material
icon-material: NETHER_STAR
free: true                     # true=first tier is free; false=first tier becomes a purchasable standard pass (default false)
start: "2026-08-16"             # empty=no limit; date-only means 00:00:00 that day
end: "2026-08-31"               # empty=never expires; date-only end defaults to 23:59:59 that day
levels: 100
xp:
  base: 1000                   # XP per level = base + delta × level
  delta: 50
tiers:
  free:
    levels-rewards:
      "1-10": ["money_1000"]   # keys support: "5" single / "1-10" range / "11,13,15" list / "1-5,7" mixed
  standard:
    price:
      points: 5000             # points price (omit = not purchasable with points)
    xp-multiplier: 1.2
    levels-rewards:
      "1-10": ["points_100"]
      "11,13,15,17,19": ["points_100"]
  deluxe:
    price:
      money: 100000.0          # economy price
    xp-multiplier: 1.5
    levels-rewards:
      "1-10": ["diamond_5"]
```

> XP multiplier: without any paid tier the multiplier is `1.0`; each purchased paid tier adds its `(xp-multiplier - 1)`. For example, owning Standard `x1.2` and Deluxe `x1.5` gives `1 + 0.2 + 0.5 = 1.7`.

Level rewards also support multi-line lists:

```yaml
tiers:
  standard:
    levels-rewards:
      "1-10":
        - "money_1000"
        - "ce_demo_sword"
      "11-20": ["points_100", "diamond_5"]
```

### Task (tasks/normal/pve.yml)

```yaml
tasks:
  - id: kill_zombie
    name: "击杀 10 只僵尸"
    type: KILL                 # KILL/MINE/CRAFT/FISH/ENCHANT/BREW/EAT/PLAY_TIME/LOGIN/CUSTOM
    entity: ZOMBIE             # KILL uses entity (single or list); MINE uses material; EAT uses material
    material: diamond_sword    # optional: icon material only (also usable for non-MINE types)
    amount: 10
    xp: 1000                   # auto-granted XP on completion (× tier multiplier)
    rewards: ["money_1000"]    # added to the claim queue on completion
```

Both `entity` (KILL) and `material` support multi-target lists; any match counts once, e.g. "kill hostile mobs":

```yaml
- id: kill_hostile
  name: "击杀敌对生物"
  type: KILL
  entity:
    - ZOMBIE
    - SKELETON
    - CREEPER
    - SPIDER
  amount: 50
  xp: 2000
```

The `material` target semantics per task type; omit it to match any target:

- `FISH`: caught item material, e.g. `COD`.
- `ENCHANT`: enchanted item material or added enchantment key, e.g. `DIAMOND_SWORD`, `minecraft:sharpness`.
- `BREW`: brew ingredient, result item material, or base potion type, e.g. `NETHER_WART`, `POTION`, `AWKWARD`.
- `CRAFT` / `EAT`: crafted or eaten item material; `MINE` uses the mined block material.

Matching is case-insensitive and supports `minecraft:` namespaces and hyphenated names. Brewing events have no native "who brewed" field: the plugin attributes the brew to the player who last interacted with the brewing stand; hopper/automatic brewing without a player is not credited.

### Reward (rewards/common.yml)

```yaml
rewards:
  money_1000:
    - type: MONEY
      amount: 1000.0
      name: "&61000金币券"          # optional: GUI preview title (all types)
      description: "&7直接发放到余额" # optional: GUI preview description (string or list)
  points_100:
    - type: POINTS
      amount: 100
  give_diamond:
    - type: COMMAND
      command: "give %player% diamond 1"
  diamond_5:
    - type: ITEM
      material: DIAMOND
      amount: 5
      name: "&b战令奖励钻石"         # ITEM type: also used as item display name
      lore: ["&7第一赛季专属"]
      enchants: [{type: SHARPNESS, level: 5}]
  # Method 1: CE model for display only, actually granted by command
  boss_sword:
    - type: COMMAND
      command: "give %player% netherite_sword 1"
      icon-model: "default:demo_sword"
  # Method 2: grant the CE item directly
  ce_sword:
    - type: CRAFTENGINE
      model: "default:demo_sword"
      amount: 1
```

> Reward types: `COMMAND` / `ITEM` / `CRAFTENGINE` (grants CE item directly; skipped with a warning when CE is missing) / `MONEY` / `POINTS`
> **`icon-model`** (optional, any type): GUI icon CE model only, does not affect granting
> **`name`** (optional, all types): GUI preview title; ITEM type also uses it as item display name
> **`description`** (optional, all types): GUI preview description, string or multi-line list
> Level-cell icon priority: `icon-model` → CRAFTENGINE `model` → ITEM `material`
> **Multiple / duplicate rewards**: a level or task reward list may repeat IDs; the GUI preview merges counts (e.g. 2×money_1000 → "金币 2000"), and each entry is granted individually.

### Text Format (MiniMessage Rich Text)

All text fields (`name`/`description`/`lore`/`messages.yml` etc.) support both **MiniMessage** and legacy `&` colors:

```yaml
name: "<gold>1000金币</gold>"                          # color
name: "<gradient:#ffcc00:#ff8800>稀有奖励</gradient>"   # gradient
name: "<bold><red>限时</red></bold>"                    # bold
name: "&61000金币"                                      # legacy & color (compatible)
```

Rule: if the text contains `<`, MiniMessage is tried first (falls back to `&` on failure), otherwise legacy `&` colors are used. All Adventure MiniMessage tags such as `<hover>`, `<click>`, `<rainbow>` are supported.

## Permissions

| Permission | Default | Description |
|---|---|---|
| `liupass.use` | true | open the pass GUI |
| `liupass.admin` | op | admin master permission (includes all below) |
| `liupass.admin.reload` | op | reload configuration |
| `liupass.admin.give` | op | grant a tier |
| `liupass.admin.take` | op | revoke a tier |
| `liupass.admin.setlevel` | op | set level |
| `liupass.admin.addxp` | op | give XP |
| `liupass.admin.reset` | op | reset a single player |
| `liupass.admin.resetall` | op | reset all players |
| `liupass.admin.forcetask` | op | force-complete a task |
| `liupass.admin.open` | op | view another player's pass (read-only) |
| `liupass.admin.archive` | op | clean up season data immediately |
| `liupass.bypass.purchase` | op | activate without purchasing |
| `liupass.free.<passId>` | false | make a pass free (supports `liupass.free.*`) |
| `liupass.notify` | true | receive level-up/task notifications |

## Commands

```
/pass                                   open the pass GUI
/liupass reload                         reload configuration
/liupass admin give <player> <pass> <0|1|2|all>
/liupass admin take <player> <pass> <0|1|2|all>
/liupass admin setlevel <player> <pass> <level>
/liupass admin addxp <player> <pass> <xp>
/liupass admin reset <player> <pass>
/liupass admin resetall <pass>
/liupass admin forcetask <player> <pass> <taskId>
/liupass admin open <player> <pass>
/liupass admin archive <pass>
```

## Public API (PassAPI)

```java
import com.liupass.core.api.PassAPI;

// level query
int level = PassAPI.getLevel(player.getUniqueId(), "season1");
long xp = PassAPI.getXp(uuid, "season1");
int tier = PassAPI.getTier(uuid, "season1");        // highest owned tier
boolean owned = PassAPI.isPurchased(uuid, "season1", 2);

// give XP (async, does not block the calling thread)
PassAPI.addXp(uuid, "season1", 500);

// drive task progress (CUSTOM tasks or other plugin integration)
PassAPI.addTaskProgress(uuid, "season1", "my_task", 1);
PassAPI.forceCompleteTask(uuid, "season1", "my_task");

// current effective XP multiplier (stacked by owned tiers)
double multiplier = PassAPI.getXpMultiplier(uuid, "season1");

// default pass: when other plugins omit passId, XP goes into this pass
String defaultPass = PassAPI.getDefaultPassId(uuid);
PassAPI.setDefaultPass(uuid, "season1");
PassAPI.addXp(uuid, 500);
```
