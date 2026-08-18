# 主配置 config.yml

## 数据库配置

```yaml
database:
  # mysql 或 sqlite
  type: mysql
  host: 127.0.0.1
  port: 3306
  name: minecraft
  user: root
  password: ""
  pool-size: 10
  table-prefix: "liupass"
  auto-create-database: true
  auto-create-tables: true
```

SQLite 单服模式：

```yaml
database:
  type: sqlite
```

SQLite 数据文件默认保存到：

```text
plugins/Liupass/data.db
```

## Redis 配置

```yaml
redis:
  enabled: true
  host: 127.0.0.1
  port: 6379
  password: ""
  database: 0
  cache-ttl-seconds: 600
```

单服 SQLite 可关闭：

```yaml
redis:
  enabled: false
```

## 经济显示名

```yaml
economy:
  money-name: "金币"
  points-name: "点券"
```

## 调度设置

```yaml
settings:
  shared-config-path: ""
  playtime-tick-seconds: 30
  archive-check-interval-minutes: 5
```

- `shared-config-path`：多服共享配置目录，设置后整个配置目录都从该目录读取。
- `playtime-tick-seconds`：在线时长任务累计间隔。
- `archive-check-interval-minutes`：赛季到期清理检查间隔。
