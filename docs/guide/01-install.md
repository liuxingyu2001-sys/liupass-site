# 安装与部署

## 环境要求

| 项目 | 要求 |
|---|---|
| 服务端 | Paper / Leaf 1.21+ |
| Java | 17+ |
| 数据库 | MySQL 5.7+ 或 SQLite 3.x |
| Redis | 多服同步时需要，单服可关闭 |

## 安装步骤

1. 将 `Liupass-1.0.0.jar` 放入 `plugins/`。
2. 启动服务器，生成默认配置。
3. 编辑 `plugins/Liupass/config.yml`。
4. 编辑 `passes/`、`tasks/`、`rewards/`。
5. 重启服务器或执行 `/liupass reload`。

## 目录结构

```
plugins/Liupass/
├── config.yml
├── messages.yml
├── passes/
├── tasks/
└── rewards/
```

`passes/` 存放通行证配置，`tasks/` 存放任务配置，`rewards/` 存放奖励注册表。
