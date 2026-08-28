# Liupass Plugin — Full API Documentation

> Version: 1.0.0　|　Platform: Leaf / Paper 1.21.x　|　Language: Java 17+
> Data: MySQL (authoritative storage) + Redis (cache / cross-server broadcast / distributed locks)

---

## Table of Contents

1. [Developer API (PassAPI)](#1-developer-apipassapi)
2. [Event Callbacks (EventSink)](#2-event-callbackseventsink)
3. [PlaceholderAPI Placeholders](#3-placeholderapi-placeholders)
4. [Commands](#4-commands)
5. [Permissions](#5-permissions)
6. [Main Configuration config.yml](#6-main-configuration-configyml)
7. [Data Models / Enums](#7-data-models--enums)
8. [Config File Structure](#8-config-file-structure)
9. [Build & Dependencies](#9-build--dependencies)

---

## 1. Developer API (PassAPI)

Static facade class `com.liupass.core.api.PassAPI` for other plugins. All methods are thread-safe.

> ⚠️ Query methods (`getLevel` etc.) **only read the in-memory cache with zero IO** and may be called on the main thread; if data is not loaded they return default values and warm up asynchronously, with the next call returning real values.
> Write methods (`addXp` etc.) run **asynchronously** and do not block the calling thread.

### 1.1 Queries

```java
// level of a player in a pass
int getLevel(UUID uuid, String passId);

// XP within the current level of a pass
long getXp(UUID uuid, String passId);

// highest owned tier (0=free/standard, 1=deluxe, 2=premium; when free=false, 0 also needs to be purchased)
int getTier(UUID uuid, String passId);

// whether a player owns a tier
boolean isPurchased(UUID uuid, String passId, int tier);

// current effective XP multiplier (stacked by owned tiers)
double getXpMultiplier(UUID uuid, String passId);
```

### 1.2 Writes (async)

```java
// give pass XP (settled with the stacked multiplier of owned tiers, auto level-up)
void addXp(UUID uuid, String passId, int amount);

// add task progress (by task ID, for CUSTOM tasks or other plugin-driven progress)
void addTaskProgress(UUID uuid, String passId, String taskId, int amount);

// force-complete a task (XP credited + rewards enter the claim queue)
void forceCompleteTask(UUID uuid, String passId, String taskId);
```

### 1.3 Usage Example

```java
import com.liupass.core.api.PassAPI;
import org.bukkit.entity.Player;

Player p = ...;
String passId = "season1";

// queries
int level = PassAPI.getLevel(p.getUniqueId(), passId);
boolean ownsDeluxe = PassAPI.isPurchased(p.getUniqueId(), passId, 2);

// writes
PassAPI.addXp(p.getUniqueId(), passId, 500);
PassAPI.addTaskProgress(p.getUniqueId(), passId, "my_custom_task", 1);
PassAPI.forceCompleteTask(p.getUniqueId(), passId, "kill_zombie");

// current XP multiplier
double multiplier = PassAPI.getXpMultiplier(p.getUniqueId(), passId);

// default pass: when passId is omitted, XP goes into this pass
String defaultPass = PassAPI.getDefaultPassId(p.getUniqueId());
PassAPI.setDefaultPass(p.getUniqueId(), "season1");
PassAPI.addXp(p.getUniqueId(), 500);
```

---

## 2. Event Callbacks (EventSink)

Interface `com.liupass.core.EventSink`, implemented by the platform layer for in-game notifications. Triggered on core data changes:

| Callback | Trigger |
|------|---------|
| `onTaskCompleted(UUID, PassConfig, TaskConfig)` | task completed (XP credited, rewards in the claim queue) |
| `onLevelUp(UUID, PassConfig, int newLevel, long xpLeft)` | level up |
| `onTierPurchased(UUID, PassConfig, int tierIndex, String currency, double amount)` | tier purchased |

---

## 3. PlaceholderAPI Placeholders

Identifier: `liupass` (requires PlaceholderAPI)

| Placeholder | Description |
|--------|------|
| `%liupass_level_<passId>%` | level |
| `%liupass_xp_<passId>%` | XP within the current level |
| `%liupass_tier_<passId>%` | highest owned tier (0/1/2) |
| `%liupass_progress_<passId>%` | current level progress 0.00~1.00 |
| `%liupass_next_<passId>%` | XP still needed for the next level |
| `%liupass_pending_<passId>%` | number of unclaimed rewards |

---

## 4. Commands

### 4.1 Player Commands

```
/pass                    open the pass main menu
```

### 4.2 Admin Commands

```
/liupass reload                                          reload configuration
/liupass admin give <player> <pass> <0|1|2|all>              activate a tier (no charge; 0 only usable when the first tier is not free)
/liupass admin take <player> <pass> <0|1|2|all>              revoke a tier
/liupass admin setlevel <player> <pass> <level>              set level
/liupass admin addxp <player> <pass> <xp>                     give XP
/liupass admin reset <player> <pass>                         reset a single player's progress
/liupass admin resetall <pass>                               reset all players (season end)
/liupass admin forcetask <player> <pass> <taskId>             force-complete a task
/liupass admin open <player> <pass>                          view another player's pass (read-only)
/liupass admin archive <pass>                                archive/clean a season
/liupass admin debug <player> <pass>                         data diagnostics (MySQL/Redis/memory comparison)
```

Alias: `/lp`

---

## 5. Permissions

| Permission | Default | Description |
|------|------|------|
| `liupass.use` | true | open the pass GUI |
| `liupass.admin` | op | admin master permission (includes all below) |
| `liupass.admin.reload` | op | reload configuration |
| `liupass.admin.give` | op | activate a tier |
| `liupass.admin.take` | op | revoke a tier |
| `liupass.admin.setlevel` | op | set level |
| `liupass.admin.addxp` | op | give XP |
| `liupass.admin.reset` | op | reset a single player |
| `liupass.admin.resetall` | op | reset all players |
| `liupass.admin.forcetask` | op | force-complete a task |
| `liupass.admin.open` | op | view another player's pass |
| `liupass.admin.archive` | op | archive a season |
| `liupass.admin.debug` | op | data diagnostics |
| `liupass.bypass.purchase` | op | activate any tier without purchasing |
| `liupass.free.<passId>` | false | make a pass free (supports wildcard `liupass.free.*`) |
| `liupass.notify` | true | receive level-up/task/purchase notifications |

---

## 6. Main Configuration config.yml

```yaml
database:
  type: mysql                # mysql or sqlite
  host: 127.0.0.1
  port: 3306
  name: minecraft
  user: root
  password: ""
  pool-size: 10
  table-prefix: "liupass"          # table names = {prefix}_player_data / {prefix}_purchases
  auto-create-database: true       # auto-create database (requires CREATE DATABASE permission)
  auto-create-tables: true         # false=create tables manually (SQL in README)

redis:
  enabled: true                # set false on single-server SQLite to skip Redis entirely
  host: 127.0.0.1
  port: 6379
  password: ""
  database: 0
  cache-ttl-seconds: 600           # cache TTL

economy:
  money-name: "金币"               # Vault economy display alias
  points-name: "点券"              # PlayerPoints display alias

settings:
  shared-config-path: ""           # when set, the whole config directory (incl. config.yml) is read from there
  playtime-tick-seconds: 30        # online-time task accumulation interval (seconds)
  archive-check-interval-minutes: 5  # expired-season cleanup check interval (minutes)
```

---

## 7. Data Models / Enums

### 7.1 RewardType

| Value | Description | Required Fields |
|----|------|---------|
| `COMMAND` | run a command | `command` |
| `ITEM` | give an item | `material` |
| `CE` | grant a CraftEngine model item directly | `model` |
| `IE` | grant an ItemEdit custom item directly | `model` |
| `MONEY` | Vault economy | `amount` |
| `POINTS` | PlayerPoints | `amount` |

### 7.2 TaskType

| Value | Description | target Field |
|----|------|------------|
| `MINE` | mine blocks | `material` (block material) |
| `KILL` | kill mobs | `entity` (single or list; any match counts) |
| `CRAFT` | craft items | `material` (empty=any) |
| `FISH` | fishing | `material` (caught item material, empty=any) |
| `ENCHANT` | enchanting | `material` (enchanted item material or enchantment key, empty=any) |
| `BREW` | brewing | `material` (ingredient/result material or base potion type, empty=any) |
| `EAT` | eating | `material` (food material) |
| `PLAY_TIME` | online time | none (amount=minutes) |
| `LOGIN` | login count | none (amount=count) |
| `CUSTOM` | custom (PassAPI-driven only) | none |

For `FISH`, `material` matches the caught item material from the vanilla fishing event, e.g. `COD`; for `ENCHANT`, it matches the enchanted item material or added enchantment key, e.g. `DIAMOND_SWORD`, `minecraft:sharpness`; for `BREW`, it matches the ingredient material, result item material, or base potion type, e.g. `NETHER_WART`, `POTION`, `AWKWARD`. Matching is case-insensitive and supports `minecraft:` namespaces and hyphenated names. Omitting `material` matches any target. Brewing events have no native player field; the plugin credits the player who last interacted with the brewing stand, and hopper/automatic brewing without a player is not counted.

### 7.3 Period

| Value | Description | Directory |
|----|------|------|
| `NORMAL` | season task (one-time) | `tasks/normal/*.yml` |
| `DAILY` | daily task (resets by calendar day) | `tasks/daily/*.yml` |
| `WEEKLY` | weekly task (resets by calendar week) | `tasks/weekly/*.yml` |

---

## 8. Config File Structure

```
plugins/Liupass/ or the shared directory pointed to by shared-config-path/
├── config.yml            # main config (see section 6; shared mode includes this file)
├── messages.yml          # message texts
├── passes/
│   └── season1.yml       # pass definitions (multiple files allowed)
├── tasks/
│   ├── normal/*.yml      # season tasks (shared by all passes)
│   ├── daily/*.yml       # daily tasks (shared by all passes)
│   └── weekly/*.yml      # weekly tasks (shared by all passes)
└── rewards/
    └── common.yml        # reward registry (referenced by ID from tasks/levels)
```

### 8.1 Pass (passes/season1.yml)

```yaml
pass-id: season1
name: "第一赛季"
icon-model: ""                     # CraftEngine model ID (empty falls back to vanilla material)
icon-material: NETHER_STAR
free: true                         # true=first tier free; false=first tier becomes a purchasable standard pass (default false)
start: ""                          # empty=starts immediately; supports yyyy-MM-dd or yyyy-MM-dd HH:mm:ss
end: ""                            # empty=never expires; supports yyyy-MM-dd (default 23:59:59) or yyyy-MM-dd HH:mm:ss
levels: 100
xp:
  base: 1000                       # XP per level = base + delta × level
  delta: 50
tiers:
  free: { levels-rewards: {"1-10": ["money_1000"]} }
  standard:
    price: { points: 5000 }        # points price (omit = not purchasable with points)
    xp-multiplier: 1.2
    levels-rewards: {"1-10": ["points_100"]}
  deluxe:
    price: { money: 100000.0 }     # economy price (omit = not purchasable with economy)
    xp-multiplier: 1.5
    levels-rewards: {"1-10": ["diamond_5"]}
```

**XP multiplier stacking rule**: without any paid tier the multiplier is `1.0`; each purchased paid tier adds `(xp-multiplier - 1)`. For example, Standard `x1.2` + Deluxe `x1.5` = total multiplier `1.7`.

Level rewards support multi-line lists:

```yaml
levels-rewards:
  "1-10":
    - "money_1000"
    - "ce_demo_sword"
  "11-20": ["points_100", "diamond_5"]
```

**levels-rewards key formats** (mixed and overlapping ranges accumulate):

| Format | Example | Description |
|------|------|------|
| single level | `"5"` | level 5 |
| range | `"1-10"` | levels 1~10 (inclusive) |
| comma list | `"11,13,15"` | specific levels |
| mixed | `"1-5,7,10-12"` | combination |
| overlapping ranges | `"1-100"` + `"20-100"` | levels 20~100 **accumulate** as 2 copies |

### 8.2 Task (tasks/daily/daily.yml)

```yaml
tasks:
  - id: daily_eat
    name: "吃掉 3 个金苹果"
    type: EAT
    material: GOLDEN_APPLE
    amount: 3
    xp: 200
    rewards: ["diamond_5"]          # enters the claim queue on completion (claimed in the task GUI)
```

### 8.3 Reward (rewards/common.yml)

```yaml
rewards:
  money_1000:
    - type: MONEY
      amount: 1000.0
      name: "&61000金币"            # optional: preview title (ITEM also uses it as item name)
      description: "&7金币奖励"      # optional: preview description (string or list)
      icon-model: "jiu:coins"       # optional: GUI icon (CE model)
      icon-material: DIAMOND        # optional: GUI icon (vanilla material or CE model name)
  give_diamond:
    - type: COMMAND
      command: "give %player% diamond 1"
  diamond_5:
    - type: ITEM
      material: DIAMOND
      amount: 5
      name: "&b战令奖励钻石"
      lore: ["&7第一赛季专属"]
      enchants: [{type: SHARPNESS, level: 5}]
  ce_sword:
    - type: CE
      model: "default:demo_sword"
      amount: 1
  ie_item:
    - type: IE
      model: "jiu"
      amount: 1
```

> Reward fields: `name` / `description` / `icon-model` / `icon-material` are all **optional display fields** common to all types; they only affect the GUI preview, not granting.
> Icon priority: `icon-model` → `icon-material` → CE / IE `model` → ITEM `material`.
> If a CE / IE reward has no custom `name` / `lore` / `description`, the GUI automatically shows the item's real name and lore from its item library.

### 8.4 Text Format (MiniMessage Rich Text)

All text fields in the config (`name` / `description` / `lore` / `messages.yml` etc.) support both formats:

| Format | Example | Description |
|------|------|------|
| MiniMessage | `<gold>1000金币</gold>` | Adventure rich text, all tags supported |
| Legacy `&` colors | `&61000金币` | backwards compatible with old configs |

**Common MiniMessage tags**:

```yaml
name: "<gold>1000金币</gold>"                          # color
name: "<gradient:#ffcc00:#ff8800>稀有奖励</gradient>"   # gradient
name: "<bold><red>限时</red></bold>"                    # bold
name: "<hover:show_text:'点击查看'><aqua>悬停我</aqua></hover>"  # hover
```

Parsing rule: if the text contains `<`, MiniMessage is tried first (falls back to `&` on failure), otherwise legacy `&` colors are used.

---

## 9. Build & Dependencies

### 9.1 Maven Dependencies (third-party)

| Coordinates | Version |
|------|------|
| `com.google.code.gson:gson` | 2.10.1 |
| `org.yaml:snakeyaml` | 2.2 |
| `org.slf4j:slf4j-api` | 1.7.36 |
| `org.slf4j:slf4j-jdk14` | 1.7.36 |
| `com.zaxxer:HikariCP` | 5.1.0 |
| `com.mysql:mysql-connector-j` | 8.0.33 |
| `com.google.protobuf:protobuf-java` | 3.21.9 |
| `redis.clients:jedis` | 4.3.1 |
| `org.apache.commons:commons-pool2` | 2.11.1 |
| `org.json:json` | 20220320 |

### 9.2 Soft Dependencies (optional)

| Plugin | Purpose |
|------|------|
| Vault | economy purchases / MONEY rewards |
| PlayerPoints | points purchases / POINTS rewards |
| CraftEngine | CE model icons / CE rewards |
| ItemEdit | IE rewards (skipped with a warning when missing) |
| PlaceholderAPI | placeholders |

### 9.3 Module Structure

```
liupass/
├── liupass-core/    # pure Java data layer (no Bukkit dependency): config / data / logic / API
└── liupass-paper/   # Paper implementation: GUI / listeners / commands / economy hooks / placeholders
```
