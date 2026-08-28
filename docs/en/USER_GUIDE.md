# Liupass Server Owner Guide

> This document is for server administrators / owners and covers installation, configuration, daily maintenance, and common issues for the Liupass battle pass plugin.

---

## 1. Plugin Overview

Liupass is a Minecraft Paper/Leaf battle pass plugin supporting:

- Multiple seasons / passes
- Three independently purchasable tiers (Standard / Deluxe / Premium, first tier can be free)
- Custom tasks and rewards
- Daily / weekly / season tasks
- MySQL / SQLite data storage
- Redis cross-server sync (optional)

---

## 2. Requirements

| Item | Requirement |
|---|---|
| Server | Paper / Leaf 1.21+ |
| Java | 17+ |
| Database | MySQL 5.7+ / 8.x or SQLite 3.x |
| Redis | Needed for multi-server sync; can be disabled on single-server SQLite |

Optional dependency plugins:

| Plugin | Purpose |
|---|---|
| Vault | economy purchases / economy rewards |
| PlayerPoints | points purchases / points rewards |
| CraftEngine | custom GUI models / CE item rewards |
| ItemEdit | IE custom item rewards |
| PlaceholderAPI | placeholder variables |

---

## 3. Install Steps

1. Put `Liupass-*.jar` into the `plugins/` directory.
2. Start the server; the plugin generates default configs automatically.
3. Edit `plugins/Liupass/config.yml` to choose the database type.
4. Edit the configs under `passes/`, `tasks/`, `rewards/`.
5. Restart the server or run `/liupass reload`.

---

## 4. Config Directory Layout

```
plugins/Liupass/
├── config.yml        # main config
├── messages.yml      # message texts
├── passes/           # pass configs
├── tasks/            # task configs
└── rewards/          # reward registry
```

If `shared-config-path` is set, all of the above are read from the shared directory.

---

## 5. Data Storage Configuration

### 5.1 Single Server (SQLite recommended)

```yaml
database:
  type: sqlite

redis:
  enabled: false
```

Default SQLite data file location:

```text
plugins/Liupass/data.db
```

### 5.2 Multiple Servers (MySQL + Redis)

```yaml
database:
  type: mysql
  host: 127.0.0.1
  port: 3306
  name: minecraft
  user: root
  password: ""
  table-prefix: "liupass"

redis:
  enabled: true
  host: 127.0.0.1
  port: 6379
  password: ""
  database: 0
```

Multi-server sync requirements:

- All servers connect to the same MySQL
- All servers connect to the same Redis
- All servers use the same `table-prefix`
- All servers use the same `passes/tasks/rewards` configs

---

## 6. Pass Configuration

Example:

```yaml
pass-id: season1
name: "第一赛季"
icon-model: ""
icon-material: NETHER_STAR
free: true
start: "2026-08-16"
end: "2026-08-31"
levels: 100
xp:
  base: 1000
  delta: 50
tiers:
  free:
    levels-rewards:
      "1-10": ["money_1000"]
  standard:
    price:
      points: 5000
    xp-multiplier: 1.2
    levels-rewards:
      "1-10": ["points_100"]
  deluxe:
    price:
      money: 100000.0
    xp-multiplier: 1.5
    levels-rewards:
      "1-10": ["diamond_5"]
```

### 6.1 Time Format

| Value | Meaning |
|---|---|
| empty | starts immediately / never expires |
| `2026-08-16` | start day 00:00:00 |
| `2026-08-31` | end day 23:59:59 |
| `2026-08-16 12:00:00` | exact time |

### 6.2 `free` Configuration

- `free: true`: the first tier is free and owned by all players by default
- `free: false`: the first tier becomes a purchasable "standard pass"

### 6.3 XP Multiplier Stacking

XP multipliers of purchased tiers stack additively:

```text
Standard x1.2 + Deluxe x1.5 = total multiplier 1.7
```

```text
Actual XP gained = original XP × total multiplier
```

### 6.4 Level Reward Key Format

Supports single-line and multi-line forms:

```yaml
levels-rewards:
  "1-10":
    - "money_1000"
    - "ce_demo_sword"
  "11-20": ["points_100", "diamond_5"]
```

| Format | Example |
|---|---|
| single level | `"5"` |
| range | `"1-10"` |
| list | `"11,13,15"` |
| mixed | `"1-5,7,10-12"` |

---

## 7. Task Configuration

```yaml
tasks:
  - id: kill_zombie
    name: "击杀 100 只僵尸"
    type: KILL
    entity: ZOMBIE
    material: diamond_sword   # optional: icon only
    amount: 100
    xp: 2000
    rewards:
      - money_1000
      - diamond_5
```

### 7.1 Task Types

| Type | Description |
|---|---|
| KILL | kill mobs, `entity` accepts a single value or a list; any match counts |
| MINE | mine blocks, target uses `material` |
| CRAFT | craft items, empty `material` matches anything |
| FISH | fishing, `material` matches the caught item material (e.g. `COD`) |
| ENCHANT | enchanting, `material` matches the enchanted item material or enchantment key (e.g. `DIAMOND_SWORD`, `minecraft:sharpness`) |
| BREW | brewing, `material` matches ingredient/result material or base potion type (e.g. `NETHER_WART`, `POTION`, `AWKWARD`) |
| EAT | eating, target uses `material` |
| PLAY_TIME | online time, `amount` is in minutes |
| LOGIN | login count, `amount` is the count |
| CUSTOM | driven by PassAPI or other plugins |

`material` and KILL's `entity` matching is case-insensitive and supports `minecraft:cod` and `nether-wart` style names. In KILL tasks `material` is icon-only, not a kill target; use `entity` to filter by mob. In FISH / ENCHANT / BREW tasks `material` participates in event matching; use `icon-material` for a separate icon. Brewing events have no player field; the plugin credits the player who last interacted with the brewing stand, and hopper/automatic brewing without a player is not counted.

### 7.2 Task Periods

| Period | Directory |
|---|---|
| season tasks | `tasks/normal/` |
| daily tasks | `tasks/daily/` |
| weekly tasks | `tasks/weekly/` |

---

## 8. Reward Configuration

```yaml
rewards:
  money_1000:
    - type: MONEY
      amount: 1000.0
      name: "&61000金币"
      description: "&7直接发放到余额"
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
      name: "&b战令奖励钻石"
      lore: ["&7第一赛季专属"]
  ce_sword:
    - type: CRAFTENGINE
      model: "default:demo_sword"
      amount: 1
  ie_item:
    - type: ITEMEDIT
      model: "jiu"
      amount: 1
```

### Reward Types

| Type | Description |
|---|---|
| COMMAND | run a console command |
| ITEM | give an item |
| CRAFTENGINE | give a CraftEngine custom item |
| ITEMEDIT | give an ItemEdit custom item |
| MONEY | Vault economy |
| POINTS | PlayerPoints |

> **Auto preview for CE / IE items**: if a CRAFTENGINE / ITEMEDIT reward has no custom `name` / `lore` / `description`, the GUI automatically shows the item's real name and lore from its item library (the corresponding plugin must be installed).

---

## 9. Player Commands

```text
/pass
/liupass default <pass>
```

- `/pass`: open the pass main menu
- `/liupass default <pass>`: set your own default pass

### Default Pass Rules

- When an external plugin calls `PassAPI.addXp(player, xp)` without a pass, XP goes to the player's default pass.
- If no default pass is set, the pass with the **earliest start time** is chosen automatically.

---

## 10. Admin Commands

```text
/liupass reload
/liupass admin give <player> <pass> <0|1|2|all>
/liupass admin take <player> <pass> <0|1|2|all>
/liupass admin setlevel <player> <pass> <level>
/liupass admin addxp <player> <pass> <xp>
/liupass admin reset <player> <pass>
/liupass admin resetall <pass>
/liupass admin forcetask <player> <pass> <taskId>
/liupass admin open <player> <pass>
/liupass admin archive <pass>
/liupass admin debug <player> <pass>
```

---

## 11. Permissions

| Permission | Default | Description |
|---|---|---|
| `liupass.use` | true | use the pass GUI |
| `liupass.admin` | op | admin master permission |
| `liupass.admin.reload` | op | reload configuration |
| `liupass.admin.give` | op | grant a tier |
| `liupass.admin.take` | op | revoke a tier |
| `liupass.admin.setlevel` | op | set level |
| `liupass.admin.addxp` | op | give XP |
| `liupass.admin.reset` | op | reset a player |
| `liupass.admin.resetall` | op | reset all players |
| `liupass.admin.forcetask` | op | force-complete a task |
| `liupass.admin.open` | op | view another player's pass |
| `liupass.admin.archive` | op | archive a season |
| `liupass.bypass.purchase` | op | activate without purchasing |
| `liupass.free.<passId>` | false | make a pass free |
| `liupass.notify` | true | receive notifications |

---

## 12. Developer API

```java
import com.liupass.core.api.PassAPI;

int level = PassAPI.getLevel(uuid, "season1");
long xp = PassAPI.getXp(uuid, "season1");
int tier = PassAPI.getTier(uuid, "season1");
double multiplier = PassAPI.getXpMultiplier(uuid, "season1");

PassAPI.addXp(uuid, "season1", 500);
PassAPI.addTaskProgress(uuid, "season1", "my_task", 1);
PassAPI.forceCompleteTask(uuid, "season1", "my_task");
```

---

## 13. FAQ

### Q1: Startup error "authors are of wrong type"
Make sure `authors` in `plugin.yml` is a list:

```yaml
authors: [liuxingyu2001]
```

### Q2: Date configured but time format error
Use one of the following formats:

```yaml
start: "2026-08-16"
end: "2026-08-31 23:59:59"
```

### Q3: Single-server SQLite does not need Redis
Configure:

```yaml
database:
  type: sqlite

redis:
  enabled: false
```

### Q4: Player XP is not increasing by the multiplier
Check that the player purchased the corresponding tier; multipliers stack additively, not by taking the highest.

### Q5: Tasks are not counting
- Check that task IDs are not duplicated (no duplicates within the same period)
- Check that the task type and `entity` / `material` are correct

---

## 14. Backup Recommendations

- MySQL: back up the `liupass_player_data` and `liupass_purchases` tables regularly
- SQLite: back up `plugins/Liupass/data.db` regularly
- Config: it is recommended to back up the whole `plugins/Liupass/` directory
