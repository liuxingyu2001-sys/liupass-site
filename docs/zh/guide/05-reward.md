# 奖励配置

奖励文件放在：

```text
rewards/common.yml
```

## 奖励示例

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

## 奖励类型

| 类型 | 说明 |
|---|---|
| COMMAND | 执行后台命令 |
| ITEM | 发放物品 |
| CRAFTENGINE | 发放 CraftEngine 自定义物品 |
| ITEMEDIT | 发放 ItemEdit 自定义物品 |
| MONEY | Vault 金币 |
| POINTS | PlayerPoints 点券 |

> **CE / IE 物品自动预览**：CRAFTENGINE / ITEMEDIT 奖励未写 `name` / `lore` / `description` 时，GUI 会自动读取物品库中该物品的真实名称与 Lore 展示（需已安装对应插件）。

## 通用显示字段

| 字段 | 说明 |
|---|---|
| name | 预览标题，ITEM 类型兼作物品名 |
| description | 预览描述，支持字符串或列表 |
| icon-model | CE 模型图标 |
| icon-material | 图标材质 |
| lore | ITEM 类型的物品说明 |
| enchants | ITEM 类型的附魔列表 |
