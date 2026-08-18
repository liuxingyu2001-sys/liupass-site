# 常见问题

## 启动报 authors are of wrong type

检查 `plugin.yml`：

```yaml
authors: [liuxingyu2001]
```

## 任务列表空白

任务列表会默认打开第一个有任务的周期。如果仍然空白，检查任务是否放在了正确的目录：

```text
tasks/<通行证ID>/normal/
tasks/<通行证ID>/daily/
tasks/<通行证ID>/weekly/
```

## SQLite 单服需要 Redis 吗

不需要，配置：

```yaml
redis:
  enabled: false
```

## 经验倍率没有生效

检查玩家是否购买了对应档位。倍率为加法叠加，不是取最高。
