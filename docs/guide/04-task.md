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

## 任务字段说明

| 字段 | 说明 |
|---|---|
| id | 任务唯一 ID |
| name | 任务名称 |
| type | 任务类型 |
| entity | KILL 类型的实体 |
| material | MINE/EAT 等类型的目标，也作为图标 |
| icon-model | 可选，CE 模型图标 |
| icon-material | 可选，图标材质 |
| amount | 需要完成的数量 |
| xp | 完成后自动获得的通行证经验 |
| rewards | 完成后进入待领取队列的奖励 ID |

## 任务类型

| 类型 | 说明 |
|---|---|
| KILL | 击杀生物 |
| MINE | 挖掘方块 |
| CRAFT | 合成物品 |
| FISH | 钓鱼 |
| ENCHANT | 附魔 |
| BREW | 酿造 |
| EAT | 吃东西 |
| PLAY_TIME | 在线时长，amount 为分钟 |
| LOGIN | 登录次数 |
| CUSTOM | 由 PassAPI 或其他插件驱动 |

## 任务周期

| 目录 | 说明 |
|---|---|
| normal | 赛季任务，一次性 |
| daily | 每日任务，按自然日重置 |
| weekly | 每周任务，按自然周重置 |
