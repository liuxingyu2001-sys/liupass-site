# Reward Configuration

Reward files are placed in:

```text
rewards/common.yml
```

## Reward Example

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
      lore:
        - "&7第一赛季专属"
  ce_sword:
    - type: CRAFTENGINE
      model: "default:demo_sword"
      amount: 1
  ie_item:
    - type: ITEMEDIT
      model: "jiu"
      amount: 1
```

## Reward Types

| Type | Description |
|---|---|
| COMMAND | run a console command |
| ITEM | give an item |
| CRAFTENGINE | give a CraftEngine custom item |
| ITEMEDIT | give an ItemEdit custom item |
| MONEY | Vault economy |
| POINTS | PlayerPoints |

> **Auto preview for CE / IE items**: if a CRAFTENGINE / ITEMEDIT reward has no custom `name` / `lore` / `description`, the GUI automatically shows the item's real name and lore from its item library (the corresponding plugin must be installed).

## Common Display Fields

| Field | Description |
|---|---|
| name | preview title; for ITEM also the item name |
| description | preview description, string or list |
| icon-model | CE model icon |
| icon-material | icon material |
| lore | item lore for ITEM type |
| enchants | enchant list for ITEM type |
