# Task Configuration

Task files are placed in:

```text
tasks/normal/*.yml
tasks/daily/*.yml
tasks/weekly/*.yml
```

## Task Example

```yaml
tasks:
  - id: kill_zombie
    name: "击杀 100 只僵尸"
    type: KILL
    entity: ZOMBIE
    material: diamond_sword   # optional, icon only
    amount: 100
    xp: 2000
    rewards:
      - money_1000
      - diamond_5
```

## Multi-target Lists

Both `entity` (KILL) and `material` (FISH / ENCHANT / BREW / MINE / CRAFT / EAT) accept multiple targets; progress counts when any target matches. For example, "kill hostile mobs":

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

Matching is case-insensitive and supports `minecraft:` namespaces such as `minecraft:zombie`.

## Task Fields

| Field | Description |
|---|---|
| id | unique task ID |
| name | task name |
| type | task type |
| entity | entity for KILL (single or list; any match counts) |
| material | target material (single or list); FISH=catch material, ENCHANT=enchanted item material or enchantment key, BREW=brew ingredient/result material or base potion type, CRAFT/EAT=item material, MINE=block material; in KILL it is icon-only |
| icon-model | optional, CE model icon |
| icon-material | optional, icon material |
| amount | amount required to complete |
| xp | pass XP granted automatically on completion |
| rewards | reward IDs added to the claim queue on completion |

> In KILL tasks, `material` is only the GUI icon and not a kill target; use `entity` to filter by mob. In FISH / ENCHANT / BREW tasks, `material` participates in event matching; use `icon-material` when you want a separate icon.

## Task Types

| Type | Description |
|---|---|
| KILL | kill mobs, `entity` supports multiple |
| MINE | mine blocks, target is block material |
| CRAFT | craft items, empty `material` matches anything |
| FISH | fishing, `material` matches the caught item material (e.g. `COD`) |
| ENCHANT | enchanting, `material` matches the enchanted item material or enchantment key (e.g. `DIAMOND_SWORD`, `minecraft:sharpness`) |
| BREW | brewing, `material` matches ingredient/result material or base potion type (e.g. `NETHER_WART`, `POTION`, `AWKWARD`) |
| EAT | eating, target is food material |
| PLAY_TIME | online time, `amount` is in minutes |
| LOGIN | login count |
| CUSTOM | driven by PassAPI or other plugins |

## Task Periods

| Directory | Description |
|---|---|
| normal | season tasks, one-time |
| daily | daily tasks, reset by calendar day |
| weekly | weekly tasks, reset by calendar week |
