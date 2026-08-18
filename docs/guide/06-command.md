# 命令与权限

## 玩家命令

```text
/pass
/liupass default <通行证>
```

## 管理命令

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

## 权限列表

| 权限 | 默认 | 说明 |
|---|---|---|
| liupass.use | true | 使用战令界面 |
| liupass.admin | op | 管理总权限 |
| liupass.admin.reload | op | 重载配置 |
| liupass.admin.give | op | 发放档位 |
| liupass.admin.take | op | 收回档位 |
| liupass.admin.setlevel | op | 设置等级 |
| liupass.admin.addxp | op | 给予经验 |
| liupass.admin.reset | op | 重置玩家 |
| liupass.admin.resetall | op | 重置全部玩家 |
| liupass.admin.forcetask | op | 强制完成任务 |
| liupass.admin.open | op | 查看他人战令 |
| liupass.admin.archive | op | 归档赛季 |
| liupass.bypass.purchase | op | 免购买激活 |
| liupass.free.<passId> | false | 指定通行证免费 |
| liupass.notify | true | 接收通知 |
