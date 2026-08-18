# Liupass 服主使用说明

> 本文档面向服务器管理员/服主，介绍 Liupass 战令插件的安装、配置、日常维护与常见问题。

---

## 1. 插件简介

Liupass 是一个我的世界 Paper/Leaf 战令（Battle Pass）插件，支持：

- 多个赛季/通行证
- 三档位独立购买（普通 / 高级 / 豪华，第一档可配置为免费）
- 自定义任务与奖励
- 每日 / 每周 / 赛季任务
- MySQL / SQLite 数据存储
- Redis 跨服同步（可选）

---

## 2. 环境要求

| 项目 | 要求 |
|---|---|
| 服务端 | Paper / Leaf 1.21+ |
| Java | 17+ |
| 数据库 | MySQL 5.7+ / 8.x 或 SQLite 3.x |
| Redis | 多服同步时需要；单服用 SQLite 可关闭 |

可选前置插件：

| 插件 | 作用 |
|---|---|
| Vault | 金币购买 / 金币奖励 |
| PlayerPoints | 点券购买 / 点券奖励 |
| CraftEngine | GUI 自定义模型显示 |
| CustomFishing | 自定义钓鱼任务进度 |
| PlaceholderAPI | 占位符变量 |

---

## 3. 安装步骤

1. 将 `Liupass-*.jar` 放入 `plugins/` 目录。
2. 启动服务器，插件会自动生成默认配置。
3. 编辑 `plugins/Liupass/config.yml`，选择数据库类型。
4. 编辑 `passes/`、`tasks/`、`rewards/` 下的配置。
5. 重启服务器或执行 `/liupass reload`。

---

## 4. 配置目录结构

```
plugins/Liupass/
├── config.yml        # 主配置
├── messages.yml      # 消息文案
├── passes/           # 通行证配置
├── tasks/            # 任务配置
└── rewards/          # 奖励注册表
```

如果配置了 `shared-config-path`，以上所有文件都会从共享目录读取。

---

## 5. 数据存储配置

### 5.1 单服务器（推荐 SQLite）

```yaml
database:
  type: sqlite

redis:
  enabled: false
```

SQLite 数据文件默认位置：

```text
plugins/Liupass/data.db
```

### 5.2 多服务器（MySQL + Redis）

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

多服同步要求：

- 所有服务器连接同一个 MySQL
- 所有服务器连接同一个 Redis
- 所有服务器 `table-prefix` 一致
- 所有服务器使用同一份 `passes/tasks/rewards` 配置

---

## 6. 通行证配置

示例：

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

### 6.1 时间格式

| 写法 | 说明 |
|---|---|
| 留空 | 立即开始 / 永不过期 |
| `2026-08-16` | 开始日 00:00:00 |
| `2026-08-31` | 结束日 23:59:59 |
| `2026-08-16 12:00:00` | 精确时间 |

### 6.2 `free` 配置

- `free: true`：第一档为免费档，所有玩家默认拥有
- `free: false`：第一档变为可购买的“普通通行证”

### 6.3 经验倍率叠加

多个已购档位的经验倍率采用加法叠加：

```text
普通 x1.2 + 豪华 x1.5 = 总倍率 1.7
```

```text
实际获得经验 = 原始经验 × 总倍率
```

### 6.4 等级奖励键格式

支持单行和多行写法：

```yaml
levels-rewards:
  "1-10":
    - "money_1000"
    - "ce_demo_sword"
  "11-20": ["points_100", "diamond_5"]
```

| 格式 | 示例 |
|---|---|
| 单等级 | `"5"` |
| 区间 | `"1-10"` |
| 列表 | `"11,13,15"` |
| 混合 | `"1-5,7,10-12"` |

---

## 7. 任务配置

```yaml
tasks:
  - id: kill_zombie
    name: "击杀 100 只僵尸"
    type: KILL
    entity: ZOMBIE
    material: diamond_sword   # 可选：仅图标显示
    amount: 100
    xp: 2000
    rewards:
      - money_1000
      - diamond_5
```

### 7.1 任务类型

| 类型 | 说明 |
|---|---|
| KILL | 击杀生物 |
| MINE | 挖掘方块 |
| CRAFT | 合成物品 |
| FISH | 钓鱼（支持 CustomFishing） |
| ENCHANT | 附魔 |
| BREW | 酿造 |
| EAT | 吃东西 |
| PLAY_TIME | 在线时长 |
| LOGIN | 登录次数 |
| CUSTOM | 由 PassAPI 或其他插件驱动 |

### 7.2 任务周期

| 周期 | 目录 |
|---|---|
| 赛季任务 | `tasks/normal/` |
| 每日任务 | `tasks/daily/` |
| 每周任务 | `tasks/weekly/` |

---

## 8. 奖励配置

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
```

### 奖励类型

| 类型 | 说明 |
|---|---|
| COMMAND | 执行后台命令 |
| ITEM | 发放物品 |
| CRAFTENGINE | 发放 CraftEngine 自定义物品 |
| MONEY | Vault 金币 |
| POINTS | PlayerPoints 点券 |

---

## 9. 玩家命令

```text
/pass
/liupass default <通行证>
```

- `/pass`：打开战令主菜单
- `/liupass default <通行证>`：设置自己的默认通行证

### 默认通行证规则

- 外部插件调用 `PassAPI.addXp(玩家, 经验)` 时，不指定通行证，经验会加到该玩家的默认通行证。
- 默认通行证未设置时，自动选择**开始时间最早**的通行证。

---

## 10. 管理命令

```text
/liupass reload
/liupass admin give <玩家> <通行证> <0|1|2|all>
/liupass admin take <玩家> <通行证> <0|1|2|all>
/liupass admin setlevel <玩家> <通行证> <等级>
/liupass admin addxp <玩家> <通行证> <经验>
/liupass admin reset <玩家> <通行证>
/liupass admin resetall <通行证>
/liupass admin forcetask <玩家> <通行证> <任务ID>
/liupass admin open <玩家> <通行证>
/liupass admin archive <通行证>
/liupass admin debug <玩家> <通行证>
```

---

## 11. 权限

| 权限 | 默认 | 说明 |
|---|---|---|
| `liupass.use` | true | 使用战令界面 |
| `liupass.admin` | op | 管理总权限 |
| `liupass.admin.reload` | op | 重载配置 |
| `liupass.admin.give` | op | 发放档位 |
| `liupass.admin.take` | op | 收回档位 |
| `liupass.admin.setlevel` | op | 设置等级 |
| `liupass.admin.addxp` | op | 给予经验 |
| `liupass.admin.reset` | op | 重置玩家 |
| `liupass.admin.resetall` | op | 重置全部玩家 |
| `liupass.admin.forcetask` | op | 强制完成任务 |
| `liupass.admin.open` | op | 查看他人战令 |
| `liupass.admin.archive` | op | 归档赛季 |
| `liupass.bypass.purchase` | op | 免购买激活 |
| `liupass.free.<passId>` | false | 指定通行证免费 |
| `liupass.notify` | true | 接收通知 |

---

## 12. 开发 API

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

## 13. 常见问题

### Q1: 启动报“authors are of wrong type”
请确保 `plugin.yml` 中 `authors` 是列表：

```yaml
authors: [liuxingyu2001]
```

### Q2: 配置了日期但提示时间格式错误
请使用以下格式之一：

```yaml
start: "2026-08-16"
end: "2026-08-31 23:59:59"
```

### Q3: 单服 SQLite 不需要 Redis
配置：

```yaml
database:
  type: sqlite

redis:
  enabled: false
```

### Q4: 玩家经验没有按倍率增加
检查玩家是否已购买对应付费档，倍率是加法叠加，不是取最高。

### Q5: 任务不计数
- 检查任务 ID 是否重复（同一周期内不能重复）
- 检查任务类型和 `entity` / `material` 是否正确
- 如果是 FISH 任务且服务器使用 CustomFishing，请确认 CustomFishing 已安装

---

## 14. 备份建议

- MySQL：定期备份 `liupass_player_data` 和 `liupass_purchases` 表
- SQLite：定期备份 `plugins/Liupass/data.db`
- 配置：建议备份整个 `plugins/Liupass/` 目录
