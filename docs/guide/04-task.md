# 任务配置

任务文件放在：

```text
tasks/normal/*.yml
tasks/daily/*.yml
tasks/weekly/*.yml
```

## 任务示例

```yaml
tasks:
  - id: kill_zombie
    name: "击杀 100 只僵尸"
    type: KILL
    entity: ZOMBIE
    material: diamond_sword   # 可选，仅图标显示
    amount: 100
    xp: 2000
    rewards:
      - money_1000
      - diamond_5
```

## 多目标列表

`entity`（KILL）和 `material`（FISH / ENCHANT / BREW / MINE / CRAFT / EAT）都支持写多个目标，命中任意一个即累计一次进度。例如“击杀敌对生物”：

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

目标匹配不区分大小写，并兼容 `minecraft:zombie` 这类命名空间写法。

## 任务字段说明

| 字段 | 说明 |
|---|---|
| id | 任务唯一 ID |
| name | 任务名称 |
| type | 任务类型 |
| entity | KILL 类型的实体（支持单个或列表，命中任一即累计） |
| material | 目标材质（支持单个或列表）；FISH=钓获物品材质，ENCHANT=被附魔物品材质或附魔键，BREW=酿造原料/成品材质或基础药水类型，CRAFT/EAT=物品材质，MINE=方块材质；KILL 中仅作为图标显示 |
| icon-model | 可选，CE 模型图标 |
| icon-material | 可选，图标材质 |
| amount | 需要完成的数量 |
| xp | 完成后自动获得的通行证经验 |
| rewards | 完成后进入待领取队列的奖励 ID |

> KILL 任务中 `material` 只作为 GUI 图标显示，不是击杀目标；需要按生物过滤时请写 `entity`。FISH / ENCHANT / BREW 的 `material` 会参与事件目标匹配，需要单独指定图标时使用 `icon-material`。

## 任务类型

| 类型 | 说明 |
|---|---|
| KILL | 击杀生物，`entity` 支持多个 |
| MINE | 挖掘方块，目标为方块材质 |
| CRAFT | 合成物品，`material` 为空表示任意 |
| FISH | 钓鱼，`material` 匹配钓获物品材质（如 `COD`） |
| ENCHANT | 附魔，`material` 匹配被附魔物品材质或附魔键（如 `DIAMOND_SWORD`、`minecraft:sharpness`） |
| BREW | 酿造，`material` 匹配酿造原料/成品材质或基础药水类型（如 `NETHER_WART`、`POTION`、`AWKWARD`） |
| EAT | 吃东西，目标为食物材质 |
| PLAY_TIME | 在线时长，amount 为分钟 |
| LOGIN | 登录次数 |
| CUSTOM | 由 PassAPI 或其他插件驱动 |

## 任务周期

| 目录 | 说明 |
|---|---|
| normal | 赛季任务，一次性 |
| daily | 每日任务，按自然日重置 |
| weekly | 每周任务，按自然周重置 |
