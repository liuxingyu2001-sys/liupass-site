# 通行证配置

通行证文件放在：

```text
passes/season1.yml
```

## 完整示例

```yaml
pass-id: season1          # 通行证唯一 ID
name: "第一赛季"           # 显示名称
icon-model: ""            # CraftEngine 模型 ID，可留空
icon-material: NETHER_STAR # 图标材质
free: true                # true=第一档免费，false=第一档可购买
start: "2026-08-16"       # 开始时间，可只写日期
end: "2026-08-31"         # 结束时间，可只写日期，默认到当天 23:59:59
levels: 100               # 最大等级
xp:
  base: 1000              # 每级基础经验
  delta: 50               # 每级递增经验
tiers:
  free:
    levels-rewards:
      "1-10": ["money_1000"]
  standard:
    price:
      points: 5000        # 点券价格
    xp-multiplier: 1.2
    levels-rewards:
      "1-10": ["points_100"]
  deluxe:
    price:
      money: 100000.0     # 金币价格
    xp-multiplier: 1.5
    levels-rewards:
      "1-10": ["diamond_5"]
```

## 时间格式

| 写法 | 含义 |
|---|---|
| 留空 | 立即开始 / 永不过期 |
| `2026-08-16` | 开始日 00:00:00 |
| `2026-08-31` | 结束日 23:59:59 |
| `2026-08-16 12:00:00` | 精确时间 |

## 等级奖励键格式

| 格式 | 示例 |
|---|---|
| 单等级 | `"5"` |
| 区间 | `"1-10"` |
| 列表 | `"11,13,15"` |
| 混合 | `"1-5,7,10-12"` |

## 等级奖励多行写法

等级奖励支持单行和多行列表：

```yaml
levels-rewards:
  "1-10":
    - "money_1000"
    - "ce_demo_sword"
  "11-20": ["points_100", "diamond_5"]
```

## 经验倍率叠加

多个已购档位采用加法叠加：

```text
普通 x1.2 + 豪华 x1.5 = 总倍率 1.7
```
