# Liupass 战令插件 — 完整 API 文档

> 版本：1.0.0　|　平台：Leaf / Paper 1.21.x　|　语言：Java 17+
> 数据：MySQL（权威存储）+ Redis（缓存 / 跨服广播 / 分布式锁）

---

## 目录

1. [开发者 API（PassAPI）](#1-开发者-apipassapi)
2. [事件回调（EventSink）](#2-事件回调eventsink)
3. [PlaceholderAPI 占位符](#3-placeholderapi-占位符)
4. [命令](#4-命令)
5. [权限](#5-权限)
6. [主配置 config.yml](#6-主配置-configyml)
7. [数据模型 / 枚举](#7-数据模型--枚举)
8. [配置文件结构](#8-配置文件结构)
9. [构建与依赖](#9-构建与依赖)

---

## 1. 开发者 API（PassAPI）

静态门面类 `com.liupass.core.api.PassAPI`，供其他插件调用。所有方法线程安全。

> ⚠️ 查询方法（`getLevel` 等）**只读内存缓存、零 IO**，可在主线程调用；数据未加载时返回默认值并异步预热，下次调用返回真实值。
> 写入方法（`addXp` 等）为**异步执行**，不阻塞调用线程。

### 1.1 查询

```java
// 查询玩家某通行证的等级
int getLevel(UUID uuid, String passId);

// 查询玩家某通行证当前等级内的经验
long getXp(UUID uuid, String passId);

// 查询玩家已购最高档位（0=免费/普通，1=高级，2=豪华；free=false 时 0 也需要购买）
int getTier(UUID uuid, String passId);

// 查询玩家是否已购买某档位
boolean isPurchased(UUID uuid, String passId, int tier);

// 查询玩家当前实际经验倍率（已按已购档位叠加）
double getXpMultiplier(UUID uuid, String passId);
```

### 1.2 写入（异步）

```java
// 给予通行证经验（按已购档位叠加倍率结算，自动升级）
void addXp(UUID uuid, String passId, int amount);

// 增加任务进度（按任务 ID，用于 CUSTOM 任务或其他插件驱动）
void addTaskProgress(UUID uuid, String passId, String taskId, int amount);

// 强制完成某任务（经验自动入账 + 奖励进待领取）
void forceCompleteTask(UUID uuid, String passId, String taskId);
```

### 1.3 用法示例

```java
import com.liupass.core.api.PassAPI;
import org.bukkit.entity.Player;

Player p = ...;
String passId = "season1";

// 查询
int level = PassAPI.getLevel(p.getUniqueId(), passId);
boolean ownsDeluxe = PassAPI.isPurchased(p.getUniqueId(), passId, 2);

// 写入
PassAPI.addXp(p.getUniqueId(), passId, 500);
PassAPI.addTaskProgress(p.getUniqueId(), passId, "my_custom_task", 1);
PassAPI.forceCompleteTask(p.getUniqueId(), passId, "kill_zombie");

// 获取当前经验倍率
double multiplier = PassAPI.getXpMultiplier(p.getUniqueId(), passId);

// 默认通行证：不传 passId 时会给这个通行证加经验
String defaultPass = PassAPI.getDefaultPassId(p.getUniqueId());
PassAPI.setDefaultPass(p.getUniqueId(), "season1");
PassAPI.addXp(p.getUniqueId(), 500);
```

---

## 2. 事件回调（EventSink）

接口 `com.liupass.core.EventSink`，由平台层实现，用于游戏内通知。核心数据变化时触发：

| 回调 | 触发时机 |
|------|---------|
| `onTaskCompleted(UUID, PassConfig, TaskConfig)` | 任务完成（经验已入账，奖励已进待领取队列） |
| `onLevelUp(UUID, PassConfig, int newLevel, long xpLeft)` | 升级 |
| `onTierPurchased(UUID, PassConfig, int tierIndex, String currency, double amount)` | 档位购买成功 |

---

## 3. PlaceholderAPI 占位符

标识符：`liupass`（需要安装 PlaceholderAPI）

| 占位符 | 说明 |
|--------|------|
| `%liupass_level_<passId>%` | 等级 |
| `%liupass_xp_<passId>%` | 当前等级内经验 |
| `%liupass_tier_<passId>%` | 已购最高档位（0/1/2） |
| `%liupass_progress_<passId>%` | 当前等级进度 0.00~1.00 |
| `%liupass_next_<passId>%` | 升级还需经验 |
| `%liupass_pending_<passId>%` | 待领取奖励数 |

---

## 4. 命令

### 4.1 玩家命令

```
/pass                    打开战令主菜单
```

### 4.2 管理命令

```
/liupass reload                                          重载配置
/liupass admin give <玩家> <通行证> <0|1|2|all>              激活档位（不扣款；0 仅当第一档非免费时可用）
/liupass admin take <玩家> <通行证> <0|1|2|all>              收回档位
/liupass admin setlevel <玩家> <通行证> <等级>              设置等级
/liupass admin addxp <玩家> <通行证> <经验>                 给予经验
/liupass admin reset <玩家> <通行证>                       重置单个玩家进度
/liupass admin resetall <通行证>                           重置全部玩家（赛季结束）
/liupass admin forcetask <玩家> <通行证> <任务ID>           强制完成任务
/liupass admin open <玩家> <通行证>                        查看他人战令（只读）
/liupass admin archive <通行证>                            归档/清理赛季
/liupass admin debug <玩家> <通行证>                        数据诊断（MySQL/Redis/内存对比）
```

别名：`/lp`

---

## 5. 权限

| 权限 | 默认 | 说明 |
|------|------|------|
| `liupass.use` | true | 打开战令界面 |
| `liupass.admin` | op | 管理总权限（含以下全部） |
| `liupass.admin.reload` | op | 重载配置 |
| `liupass.admin.give` | op | 激活档位 |
| `liupass.admin.take` | op | 收回档位 |
| `liupass.admin.setlevel` | op | 设置等级 |
| `liupass.admin.addxp` | op | 给予经验 |
| `liupass.admin.reset` | op | 重置单个玩家 |
| `liupass.admin.resetall` | op | 重置全部玩家 |
| `liupass.admin.forcetask` | op | 强制完成任务 |
| `liupass.admin.open` | op | 查看他人战令 |
| `liupass.admin.archive` | op | 归档赛季 |
| `liupass.admin.debug` | op | 数据诊断 |
| `liupass.bypass.purchase` | op | 免购买直接激活任意档位 |
| `liupass.free.<passId>` | false | 指定通行证免费（支持通配 `liupass.free.*`） |
| `liupass.notify` | true | 接收升级/任务完成/购买通知 |

---

## 6. 主配置 config.yml

```yaml
database:
  type: mysql                # mysql 或 sqlite
  host: 127.0.0.1
  port: 3306
  name: minecraft
  user: root
  password: ""
  pool-size: 10
  table-prefix: "liupass"          # 表名 = {前缀}_player_data / {前缀}_purchases
  auto-create-database: true       # 自动建库（需 CREATE DATABASE 权限）
  auto-create-tables: true         # false=手动建表（SQL 见 README）

redis:
  enabled: true                # SQLite 单服可设 false，完全跳过 Redis
  host: 127.0.0.1
  port: 6379
  password: ""
  database: 0
  cache-ttl-seconds: 600           # 缓存 TTL

economy:
  money-name: "金币"               # Vault 金币显示别名
  points-name: "点券"              # PlayerPoints 点券显示别名

settings:
  shared-config-path: ""           # 设置后整个配置目录（含 config.yml）都从该目录读取
  playtime-tick-seconds: 30        # 在线时长任务累计间隔（秒）
  archive-check-interval-minutes: 5  # 赛季到期清理检查间隔（分钟）
```

---

## 7. 数据模型 / 枚举

### 7.1 RewardType（奖励类型）

| 值 | 说明 | 必需字段 |
|----|------|---------|
| `COMMAND` | 执行命令 | `command` |
| `ITEM` | 发放物品 | `material` |
| `CRAFTENGINE` | 直接发放 CraftEngine 模型物品 | `model` |
| `MONEY` | Vault 金币 | `amount` |
| `POINTS` | PlayerPoints 点券 | `amount` |

### 7.2 TaskType（任务类型）

| 值 | 说明 | target 字段 |
|----|------|------------|
| `MINE` | 挖掘方块 | `material`（方块材质） |
| `KILL` | 击杀生物 | `entity`（实体类型） |
| `CRAFT` | 合成物品 | `material`（空=任意） |
| `FISH` | 钓鱼 | `material`（空=任意） |
| `ENCHANT` | 附魔 | `material`（空=任意） |
| `BREW` | 酿造 | `material`（空=任意） |
| `EAT` | 吃东西 | `material`（食物材质） |
| `PLAY_TIME` | 在线时长 | 无（amount=分钟） |
| `LOGIN` | 登录次数 | 无（amount=次数） |
| `CUSTOM` | 自定义（仅 PassAPI 驱动） | 无 |

### 7.3 Period（任务周期）

| 值 | 说明 | 目录 |
|----|------|------|
| `NORMAL` | 赛季任务（一次性） | `tasks/<passId>/normal/` |
| `DAILY` | 每日任务（按自然日重置） | `tasks/<passId>/daily/` |
| `WEEKLY` | 每周任务（按自然周重置） | `tasks/<passId>/weekly/` |

---

## 8. 配置文件结构

```
plugins/Liupass/ 或 shared-config-path 指向的共享目录/
├── config.yml            # 主配置（见第 6 节；共享模式包含此文件）
├── messages.yml          # 中文消息文案
├── passes/
│   └── season1.yml       # 通行证定义（可多个文件）
├── tasks/
│   └── season1/
│       ├── normal/*.yml  # 赛季任务
│       ├── daily/*.yml   # 每日任务
│       └── weekly/*.yml  # 每周任务
└── rewards/
    └── common.yml        # 奖励注册表（任务/等级通过 ID 引用）
```

### 8.1 通行证（passes/season1.yml）

```yaml
pass-id: season1
name: "第一赛季"
icon-model: ""                     # CraftEngine 模型 ID（留空回退原生材质）
icon-material: NETHER_STAR
free: true                         # true=第一档免费；false=第一档改为可购买的普通通行证（默认 false）
start: ""                          # 留空=立即开始；支持 yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss
end: ""                            # 留空=永不过期；支持 yyyy-MM-dd（默认 23:59:59）或 yyyy-MM-dd HH:mm:ss
levels: 100
xp:
  base: 1000                       # 每级经验 = base + delta × 等级
  delta: 50
tiers:
  free: { levels-rewards: {"1-10": ["money_1000"]} }
  standard:
    price: { points: 5000 }        # 点券价格（省略=不支持点券）
    xp-multiplier: 1.2
    levels-rewards: {"1-10": ["points_100"]}
  deluxe:
    price: { money: 100000.0 }     # 金币价格（省略=不支持金币）
    xp-multiplier: 1.5
    levels-rewards: {"1-10": ["diamond_5"]}
```

**经验倍率叠加规则**：未购买任何付费档时倍率为 `1.0`；每购买一个付费档，叠加 `(xp-multiplier - 1)`。例如普通 `x1.2` + 豪华 `x1.5` = 总倍率 `1.7`。

等级奖励支持多行列表写法：

```yaml
levels-rewards:
  "1-10":
    - "money_1000"
    - "ce_demo_sword"
  "11-20": ["points_100", "diamond_5"]
```

**levels-rewards 键格式**（支持混合、重叠区间奖励累加）：

| 格式 | 示例 | 说明 |
|------|------|------|
| 单等级 | `"5"` | 5 级 |
| 区间 | `"1-10"` | 1~10 级（含两端） |
| 逗号列表 | `"11,13,15"` | 指定等级 |
| 混合 | `"1-5,7,10-12"` | 组合 |
| 重叠区间 | `"1-100"` + `"20-100"` | 20~100 级**累加**为 2 份 |

### 8.2 任务（tasks/daily/daily.yml）

```yaml
tasks:
  - id: daily_eat
    name: "吃掉 3 个金苹果"
    type: EAT
    material: GOLDEN_APPLE
    amount: 3
    xp: 200
    rewards: ["diamond_5"]          # 完成进待领取（任务 GUI 直接领取）
```

### 8.3 奖励（rewards/common.yml）

```yaml
rewards:
  money_1000:
    - type: MONEY
      amount: 1000.0
      name: "&61000金币"            # 可选：预览标题（ITEM 兼作物品名）
      description: "&7金币奖励"      # 可选：预览描述（字符串或列表）
      icon-model: "jiu:coins"       # 可选：GUI 图标（CE 模型）
      icon-material: DIAMOND        # 可选：GUI 图标（标准材质 或 CE 模型名）
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
    - type: CRAFTENGINE
      model: "default:demo_sword"
      amount: 1
```

> 奖励字段：`name` / `description` / `icon-model` / `icon-material` 均为**可选显示字段**，所有类型通用，仅影响 GUI 预览不影响发放。
> 图标优先级：`icon-model` → `icon-material` → CRAFTENGINE 的 `model` → ITEM 的 `material`。

### 8.4 文本格式（MiniMessage 富文本）

所有配置里的文本字段（`name` / `description` / `lore` / `messages.yml` 等）同时支持两种格式：

| 格式 | 示例 | 说明 |
|------|------|------|
| MiniMessage | `<gold>1000金币</gold>` | Adventure 富文本，支持全部标签 |
| 遗留 `&` 颜色 | `&61000金币` | 向后兼容旧配置 |

**MiniMessage 常用标签**：

```yaml
name: "<gold>1000金币</gold>"                          # 颜色
name: "<gradient:#ffcc00:#ff8800>稀有奖励</gradient>"   # 渐变
name: "<bold><red>限时</red></bold>"                    # 粗体
name: "<hover:show_text:'点击查看'><aqua>悬停我</aqua></hover>"  # 悬停提示
```

解析规则：文本含 `<` 时优先 MiniMessage 解析（失败回退 `&`），否则按遗留 `&` 颜色解析。

---

## 9. 构建与依赖

### 9.1 Maven 依赖（第三方）

| 坐标 | 版本 |
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

### 9.2 软依赖（可选）

| 插件 | 用途 |
|------|------|
| Vault | 金币购买 / MONEY 奖励 |
| PlayerPoints | 点券购买 / POINTS 奖励 |
| CraftEngine | CE 模型图标 / CRAFTENGINE 奖励 |
| PlaceholderAPI | 占位符 |

### 9.3 模块结构

```
liupass/
├── liupass-core/    # 纯 Java 数据层（无 Bukkit 依赖）：配置 / 数据 / 逻辑 / API
└── liupass-paper/   # Paper 实现：GUI / 监听器 / 命令 / 经济钩子 / 占位符
```
