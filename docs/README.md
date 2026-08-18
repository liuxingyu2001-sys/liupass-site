# Liupass 战令 / 通行证插件

我的世界 Paper 服务器战令（Battle Pass）插件，支持**多服务端跨服同步**，三档位独立购买，自定义任务与奖励。

> 📖 服主完整使用说明请查看 [USER_GUIDE.md](USER_GUIDE.md)

## 功能特性

- ✅ 多通行证（赛季），每通行证独立配置档位/任务/奖励/起止时间
- ✅ **三档位独立购买**：普通 / 高级 / 豪华；第一档可通过 `free: true` 配置为免费档，互不影响
- ✅ 购买货币：PlayerPoints 点券 + Vault 金币（软依赖，可只启用其一）
- ✅ 付费档经验倍率：多个已购档位叠加（如高级 x1.2 + 豪华 x1.5 = 总倍率 x1.7）
- ✅ 任务系统：KILL / MINE / CRAFT / FISH / ENCHANT / BREW / EAT / PLAY_TIME / LOGIN / CUSTOM
- ✅ 任务周期：赛季任务（一次性）/ 每日任务（按日重置）/ 每周任务（按周重置）
- ✅ 任务经验**自动入账**，任务奖励 + 等级奖励**手动领取**（待领取队列）
- ✅ 奖励类型：COMMAND / ITEM / CRAFTENGINE（CE 模型物品）/ MONEY / POINTS，全部通过奖励 ID 引用复用
- ✅ 数据持久化：MySQL 或 SQLite（二选一）+ Redis 缓存与 Pub/Sub 跨服实时同步
- ✅ 脏标记批量回写（30s）+ 版本号乐观锁 + Redis 分布式锁
- ✅ 赛季到期自动清理玩家数据，需重新购买
- ✅ 完整权限体系 + 管理指令 + Tab 补全
- ✅ CraftEngine 图标模型（软依赖，缺失回退原生材质）
- ✅ PlaceholderAPI 变量 + 对外 PassAPI
- ✅ 配置热重载（`/liupass reload`）

## 环境要求

| 依赖 | 必须 | 说明 |
|---|---|---|
| Paper / Leaf 1.21+ | ✅ | 按服务器实测环境（Leaf 1.21.11）编译，Java 17+ |
| MySQL 5.7+ / 8.x | ✅ | 玩家数据持久化（与 SQLite 二选一） |
| SQLite 3.x | ✅ | 轻量单服持久化（与 MySQL 二选一） |
| Redis 5+ | ✅ | 缓存 + 跨服 Pub/Sub 同步 |
| Vault | 可选 | 金币购买 / MONEY 奖励 |
| PlayerPoints 3.x | 可选 | 点券购买 / POINTS 奖励（官方 API `org.black_ixx.playerpoints.PlayerPointsAPI`） |
| CraftEngine | 可选 | GUI 图标模型显示（`net.momirealms.craftengine.bukkit.api.CraftEngineItems`） |
| PlaceholderAPI | 可选 | 占位符变量 |

## 构建

```bash
mvn -q package
# 产物：liupass-paper/target/Liupass-*.jar
```

## 依赖管理

插件 jar 只包含自身代码（~144KB）。第三方库通过 **plugin.yml 的 `libraries:` 声明**，由服务器（Paper/Leaf 的 LibraryLoader）在插件加载阶段自动下载并隔离加载，无需自建下载器，也不会阻塞服务器主线程：

| 依赖 | 版本 | 用途 |
|---|---|---|
| mysql-connector-j | 8.0.33 | MySQL JDBC 驱动 |
| protobuf-java | 3.21.9 | MySQL 驱动传递依赖 |
| jedis | 4.3.1 | Redis 客户端 |
| commons-pool2 / json | 2.11.1 / 20220320 | jedis 传递依赖 |
| HikariCP | 5.1.0 | 数据库连接池 |
| gson / snakeyaml | 2.10.1 / 2.2 | JSON / YAML 解析 |
| slf4j-api / slf4j-jdk14 | 1.7.36 | 日志桥接 |

## 安装

1. 将 `Liupass-*.jar` 放入 `plugins/`，启动一次生成默认配置（详细步骤见 [USER_GUIDE.md](USER_GUIDE.md)）
2. 服务器自动通过 `libraries:` 声明加载第三方库（需联网一次，之后缓存）
3. 编辑 `plugins/Liupass/config.yml` 配置 MySQL 与 Redis 连接
4. 若使用共享配置目录，`shared-config-path` 指向的目录会统一管理 `config.yml` / `messages.yml` / `passes/` / `tasks/` / `rewards/`（首次启动会自动复制默认配置）
5. 重启服务器（或 `/liupass reload`）

## 配置结构

```
plugins/Liupass/ 或 shared-config-path 指向的共享目录/
├── config.yml        # 数据库(MySQL/SQLite) / Redis / 调度参数 / 货币别名 / settings
├── messages.yml      # 中文文案
├── passes/           # 通行证：每通行证一个文件
├── tasks/            # 任务：tasks/<通行证ID>/<normal|daily|weekly>/*.yml
└── rewards/          # 奖励注册表：可多个文件，任务/等级通过 ID 引用
```

> `settings.shared-config-path` 配置后，**整个配置目录**（包括 `config.yml`）都会从共享目录读取，适合多服共用同一套战令配置。

### 通行证（passes/season1.yml）

```yaml
pass-id: season1
name: "第一赛季"
icon-model: ""                 # CraftEngine 模型 ID，留空回退原生材质
icon-material: NETHER_STAR
free: true                     # true=第一档为免费档；false=第一档改为可购买的普通通行证（默认 false）
start: "2026-08-16"             # 留空=不限；可只写日期，默认当天 00:00:00
end: "2026-08-31"               # 留空=永不过期；可只写日期，结束日期默认到当天 23:59:59
levels: 100
xp:
  base: 1000                   # 每级经验 = base + delta × 等级
  delta: 50
tiers:
  free:
    levels-rewards:
      "1-10": ["money_1000"]   # 键支持："5" 单级 / "1-10" 区间 / "11,13,15" 逗号列表 / "1-5,7" 混合
  standard:
    price:
      points: 5000             # 点券价格（省略=不支持点券购买）
    xp-multiplier: 1.2
    levels-rewards:
      "1-10": ["points_100"]
      "11,13,15,17,19": ["points_100"]
  deluxe:
    price:
      money: 100000.0          # 金币价格
    xp-multiplier: 1.5
    levels-rewards:
      "1-10": ["diamond_5"]
```

> 经验倍率说明：未购买任何付费档时倍率为 `1.0`；每购买一个付费档，就把该档位 `(xp-multiplier - 1)` 累加进去。例如同时购买普通 `x1.2` 和豪华 `x1.5`，最终倍率为 `1 + 0.2 + 0.5 = 1.7`。

### 任务（tasks/season1/normal/pve.yml）

```yaml
tasks:
  - id: kill_zombie
    name: "击杀 10 只僵尸"
    type: KILL                 # KILL/MINE/CRAFT/FISH/ENCHANT/BREW/EAT/PLAY_TIME/LOGIN/CUSTOM
    entity: ZOMBIE             # KILL 用 entity；MINE 用 material；EAT 用 material
    material: diamond_sword    # 可选：仅作为任务图标显示材质（KILL 等非 MINE 类型也能用）
    amount: 10
    xp: 1000                   # 完成自动获得经验（×档位倍率）
    rewards: ["money_1000"]    # 完成进入待领取队列
```

### 奖励（rewards/common.yml）

```yaml
rewards:
  money_1000:
    - type: MONEY
      amount: 1000.0
      name: "&61000金币券"          # 可选：GUI 预览标题（所有类型通用）
      description: "&7直接发放到余额" # 可选：GUI 预览描述（单行字符串或多行列表）
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
      name: "&b战令奖励钻石"         # ITEM 类型：同时用作物品显示名
      lore: ["&7第一赛季专属"]
      enchants: [{type: SHARPNESS, level: 5}]
  # 方式1：CE 模型仅显示，实际仍用指令发放
  boss_sword:
    - type: COMMAND
      command: "give %player% netherite_sword 1"
      icon-model: "default:demo_sword"
  # 方式2：直接发放 CE 物品
  ce_sword:
    - type: CRAFTENGINE
      model: "default:demo_sword"
      amount: 1
```

> 奖励类型：`COMMAND` / `ITEM` / `CRAFTENGINE`（直接发放 CE 物品，未装 CE 时跳过并警告）/ `MONEY` / `POINTS`
> **`icon-model`**（可选，任何类型通用）：仅用于 GUI 等级格子显示 CE 模型，不影响实际发放
> **`name`**（可选，所有类型通用）：GUI 预览标题；ITEM 类型同时用作物品显示名
> **`description`**（可选，所有类型通用）：GUI 预览描述，支持单行字符串或多行列表
> 等级格子图标优先级：`icon-model` → CRAFTENGINE 的 `model` → ITEM 的 `material`
> **多个奖励 / 重复奖励**：同一等级或任务的奖励列表可写多个 ID（可重复），GUI 预览自动合并显示数量（如 2×money_1000 → "金币 2000"），实际发放逐条执行

### 文本格式（MiniMessage 富文本）

所有文本字段（`name`/`description`/`lore`/`messages.yml` 等）同时支持 **MiniMessage** 和遗留 `&` 颜色：

```yaml
name: "<gold>1000金币</gold>"                          # 颜色
name: "<gradient:#ffcc00:#ff8800>稀有奖励</gradient>"   # 渐变
name: "<bold><red>限时</red></bold>"                    # 粗体
name: "&61000金币"                                      # 遗留 & 颜色（兼容）
```

规则：含 `<` 优先 MiniMessage 解析（失败回退 `&`），否则按 `&` 颜色解析。支持 `<hover>`、`<click>`、`<rainbow>` 等全部 Adventure MiniMessage 标签。

## 权限

| 权限 | 默认 | 说明 |
|---|---|---|
| `liupass.use` | true | 打开战令界面 |
| `liupass.admin` | op | 管理总权限（含以下全部） |
| `liupass.admin.reload` | op | 重载配置 |
| `liupass.admin.give` | op | 发放档位 |
| `liupass.admin.take` | op | 收回档位 |
| `liupass.admin.setlevel` | op | 设置等级 |
| `liupass.admin.addxp` | op | 给予经验 |
| `liupass.admin.reset` | op | 重置单个玩家 |
| `liupass.admin.resetall` | op | 重置全部玩家 |
| `liupass.admin.forcetask` | op | 强制完成任务 |
| `liupass.admin.open` | op | 查看他人战令（只读） |
| `liupass.admin.archive` | op | 立即清理赛季数据 |
| `liupass.bypass.purchase` | op | 免购买直接激活 |
| `liupass.free.<passId>` | false | 指定通行证免费（支持 `liupass.free.*`） |
| `liupass.notify` | true | 接收升级/任务通知 |

## 指令

```
/pass                                   打开战令界面
/liupass reload                         重载配置
/liupass admin give <玩家> <通行证> <0|1|2|all>
/liupass admin take <玩家> <通行证> <0|1|2|all>
/liupass admin setlevel <玩家> <通行证> <等级>
/liupass admin addxp <玩家> <通行证> <经验>
/liupass admin reset <玩家> <通行证>
/liupass admin resetall <通行证>
/liupass admin forcetask <玩家> <通行证> <任务ID>
/liupass admin open <玩家> <通行证>
/liupass admin archive <通行证>
```

## 对外 API（PassAPI）

```java
import com.liupass.core.api.PassAPI;

// 等级查询
int level = PassAPI.getLevel(player.getUniqueId(), "season1");
long xp = PassAPI.getXp(uuid, "season1");
int tier = PassAPI.getTier(uuid, "season1");        // 已购最高档位
boolean owned = PassAPI.isPurchased(uuid, "season1", 2);

// 经验给予（异步，不会阻塞调用线程）
PassAPI.addXp(uuid, "season1", 500);

// 任务进度驱动（CUSTOM 任务或其他插件联动）
PassAPI.addTaskProgress(uuid, "season1", "my_task", 1);
PassAPI.forceCompleteTask(uuid, "season1", "my_task");

// 获取玩家当前实际经验倍率（已按已购档位叠加）
double multiplier = PassAPI.getXpMultiplier(uuid, "season1");

// 默认通行证：外部插件不传 passId 时，加经验会进入该通行证
String defaultPass = PassAPI.getDefaultPassId(uuid);
PassAPI.setDefaultPass(uuid, "season1");
PassAPI.addXp(uuid, 500);
```

## 占位符（PlaceholderAPI）

```
%liupass_level_<passId>%     等级
%liupass_xp_<passId>%        当前等级经验
%liupass_tier_<passId>%      已购最高档位
%liupass_progress_<passId>%  当前等级进度 0.0~1.0
%liupass_next_<passId>%      升级还需经验
%liupass_pending_<passId>%   待领取奖励数
```

## 数据说明

- 玩家数据表：`liupass_player_data`（uuid+pass_id 复合主键，version 乐观锁）
- 购买流水表：`liupass_purchases`
- Redis：缓存 `liupass:data:{uuid}:{passId}`（TTL 可配）、Pub/Sub 通道 `liupass:sync`、分布式锁 `liupass:lock:{uuid}`
- 赛季结束：直接删除该通行证全部玩家数据与购买流水，玩家需重新购买

### 自建数据库 / 自定义表名

数据库名在 `config.yml` 的 `database.name` 任意指定；表名由 `database.table-prefix` 派生（默认 `liupass` → `liupass_player_data` / `liupass_purchases`，可改成自己的前缀避免冲突）。

### 自定义货币显示名（别名）

GUI 与消息里的"金币""点券"可用 `config.yml` 自定义（比如改成"游戏币""钻石"等）：

```yaml
economy:
  money-name: "金币"      # Vault 金币的显示名
  points-name: "点券"     # PlayerPoints 点券的显示名
```

改后 `/liupass reload` 生效。

**自动建库 + 自动建表**（默认开启）：插件首次启动自动创建数据库（`CREATE DATABASE IF NOT EXISTS`，需账号有建库权限）和两张数据表，无需手动操作。
**手动建库**：若账号无建库权限，先手动执行 `CREATE DATABASE IF NOT EXISTS minecraft DEFAULT CHARACTER SET utf8mb4;`（库名按 config.yml 改），插件随后自动建表。
**手动建表**：设 `database.auto-create-tables: false` 后自行执行以下 SQL（把 `liupass_` 换成你的前缀）：

```sql
CREATE DATABASE IF NOT EXISTS minecraft DEFAULT CHARACTER SET utf8mb4;
USE minecraft;

CREATE TABLE IF NOT EXISTS liupass_player_data (
  uuid CHAR(36) NOT NULL,
  pass_id VARCHAR(64) NOT NULL,
  level INT NOT NULL DEFAULT 0,
  xp BIGINT NOT NULL DEFAULT 0,
  tier_flags VARCHAR(32) NOT NULL DEFAULT '[0,0,0]',
  claimed VARCHAR(2048) NOT NULL DEFAULT '{}',
  pending TEXT NOT NULL,
  tasks MEDIUMTEXT NOT NULL,
  version INT NOT NULL DEFAULT 0,
  last_updated BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (uuid, pass_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS liupass_purchases (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL,
  pass_id VARCHAR(64) NOT NULL,
  tier INT NOT NULL,
  currency VARCHAR(16) NOT NULL,
  amount DOUBLE NOT NULL,
  purchased_at BIGINT NOT NULL,
  KEY idx_uuid_pass (uuid, pass_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> 多服务端跨服同步的前提：**所有服连接同一个 MySQL 库 + 同一个 Redis**，表名配置必须一致。
> MariaDB 与 MySQL 协议兼容，直接可用；远程连接需给数据库账号开对应 host 权限并放行端口。

## 常见问题

- **启动报"配置加载失败"**：按错误提示检查 `rewards/` 引用、任务/通行证 ID 重复等
- **跨服不同步**：检查 Redis 连接；确认所有服使用同一 MySQL/Redis
- **点券/金币购买不可用**：确认对应经济插件已安装且为软依赖加载顺序（无需前置）
- **CraftEngine 图标不显示**：确认模型 ID 正确且 CraftEngine 已安装（缺失时自动回退原生材质）
