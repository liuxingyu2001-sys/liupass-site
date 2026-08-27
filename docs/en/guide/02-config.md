# Main Configuration config.yml

## Database

```yaml
database:
  # mysql or sqlite
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

Single-server SQLite mode:

```yaml
database:
  type: sqlite
```

The SQLite data file is stored at:

```text
plugins/Liupass/data.db
```

## Redis

```yaml
redis:
  enabled: true
  host: 127.0.0.1
  port: 6379
  password: ""
  database: 0
  cache-ttl-seconds: 600
```

For a single server with SQLite you can disable it:

```yaml
redis:
  enabled: false
```

## Economy Display Names

```yaml
economy:
  money-name: "金币"
  points-name: "点券"
```

## Scheduler Settings

```yaml
settings:
  shared-config-path: ""
  playtime-tick-seconds: 30
  archive-check-interval-minutes: 5
```

- `shared-config-path`: shared config directory for multiple servers; when set, the whole config directory is read from there.
- `playtime-tick-seconds`: interval at which online-time tasks accumulate.
- `archive-check-interval-minutes`: interval for checking expired seasons to clean up.
