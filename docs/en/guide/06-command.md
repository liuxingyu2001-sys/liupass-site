# Commands & Permissions

## Player Commands

```text
/pass
/liupass default <pass>
```

## Admin Commands

```text
/liupass reload
/liupass admin give <player> <pass> <0|1|2|all>
/liupass admin take <player> <pass> <0|1|2|all>
/liupass admin setlevel <player> <pass> <level>
/liupass admin addxp <player> <pass> <xp>
/liupass admin reset <player> <pass>
/liupass admin resetall <pass>
/liupass admin forcetask <player> <pass> <taskId>
/liupass admin open <player> <pass>
/liupass admin archive <pass>
/liupass admin debug <player> <pass>
```

## Permissions

| Permission | Default | Description |
|---|---|---|
| liupass.use | true | use the pass GUI |
| liupass.admin | op | admin master permission |
| liupass.admin.reload | op | reload configuration |
| liupass.admin.give | op | grant a tier |
| liupass.admin.take | op | revoke a tier |
| liupass.admin.setlevel | op | set level |
| liupass.admin.addxp | op | give XP |
| liupass.admin.reset | op | reset a player |
| liupass.admin.resetall | op | reset all players |
| liupass.admin.forcetask | op | force-complete a task |
| liupass.admin.open | op | view another player's pass |
| liupass.admin.archive | op | archive a season |
| liupass.bypass.purchase | op | activate without purchasing |
| liupass.free.<passId> | false | make a pass free |
| liupass.notify | true | receive notifications |
