# Installation & Deployment

## Requirements

| Item | Requirement |
|---|---|
| Server | Paper / Leaf 1.21+ |
| Java | 17+ |
| Database | MySQL 5.7+ or SQLite 3.x |
| Redis | Required for multi-server sync, can be disabled on a single server |

## Install Steps

1. Put `Liupass-1.0.0.jar` into `plugins/`.
2. Start the server to generate the default configuration.
3. Edit `plugins/Liupass/config.yml`.
4. Edit `passes/`, `tasks/`, `rewards/`.
5. Restart the server or run `/liupass reload`.

## Directory Structure

```
plugins/Liupass/
├── config.yml
├── messages.yml
├── passes/
├── tasks/
└── rewards/
```

`passes/` holds battle pass definitions, `tasks/` holds task definitions, and `rewards/` holds the reward registry.
