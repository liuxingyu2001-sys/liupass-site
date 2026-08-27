# Developer API

## Import PassAPI

```java
import com.liupass.core.api.PassAPI;
```

## Query Methods

```java
int level = PassAPI.getLevel(uuid, "season1");
long xp = PassAPI.getXp(uuid, "season1");
int tier = PassAPI.getTier(uuid, "season1");
double multiplier = PassAPI.getXpMultiplier(uuid, "season1");
```

## Default Pass

```java
String defaultPass = PassAPI.getDefaultPassId(uuid);
PassAPI.setDefaultPass(uuid, "season1");
PassAPI.addXp(uuid, 500);
```

When no passId is given, XP goes to the player's default pass.

## Specify a Pass

```java
PassAPI.addXp(uuid, "season1", 500);
PassAPI.addTaskProgress(uuid, "season1", "my_task", 1);
PassAPI.forceCompleteTask(uuid, "season1", "my_task");
```
