# Battle Pass Configuration

Pass files are placed in:

```text
passes/season1.yml
```

## Full Example

```yaml
pass-id: season1          # unique pass ID
name: "第一赛季"           # display name
icon-model: ""            # CraftEngine model ID, may be empty
icon-material: NETHER_STAR # icon material
free: true                # true=first tier is free, false=first tier is purchasable
start: "2026-08-16"       # start time, date-only allowed
end: "2026-08-31"         # end time, date-only allowed, defaults to 23:59:59 that day
levels: 100               # max level
xp:
  base: 1000              # base XP per level
  delta: 50               # XP increase per level
tiers:
  free:
    levels-rewards:
      "1-10": ["money_1000"]
  standard:
    price:
      points: 5000        # points price
    xp-multiplier: 1.2
    levels-rewards:
      "1-10": ["points_100"]
  deluxe:
    price:
      money: 100000.0     # economy price
    xp-multiplier: 1.5
    levels-rewards:
      "1-10": ["diamond_5"]
```

## Time Format

| Value | Meaning |
|---|---|
| empty | starts immediately / never expires |
| `2026-08-16` | start day 00:00:00 |
| `2026-08-31` | end day 23:59:59 |
| `2026-08-16 12:00:00` | exact time |

## Level Reward Key Format

| Format | Example |
|---|---|
| single level | `"5"` |
| range | `"1-10"` |
| list | `"11,13,15"` |
| mixed | `"1-5,7,10-12"` |

## Level Rewards Multi-line Syntax

Level rewards support both single-line and multi-line lists:

```yaml
levels-rewards:
  "1-10":
    - "money_1000"
    - "ce_demo_sword"
  "11-20": ["points_100", "diamond_5"]
```

## XP Multiplier Stacking

XP multipliers of purchased tiers stack additively:

```text
Standard x1.2 + Deluxe x1.5 = total multiplier 1.7
```
