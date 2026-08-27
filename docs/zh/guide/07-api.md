# 开发 API

## 引入 PassAPI

```java
import com.liupass.core.api.PassAPI;
```

## 查询方法

```java
int level = PassAPI.getLevel(uuid, "season1");
long xp = PassAPI.getXp(uuid, "season1");
int tier = PassAPI.getTier(uuid, "season1");
double multiplier = PassAPI.getXpMultiplier(uuid, "season1");
```

## 默认通行证

```java
String defaultPass = PassAPI.getDefaultPassId(uuid);
PassAPI.setDefaultPass(uuid, "season1");
PassAPI.addXp(uuid, 500);
```

不指定 passId 时，经验会进入玩家默认通行证。

## 指定通行证

```java
PassAPI.addXp(uuid, "season1", 500);
PassAPI.addTaskProgress(uuid, "season1", "my_task", 1);
PassAPI.forceCompleteTask(uuid, "season1", "my_task");
```
