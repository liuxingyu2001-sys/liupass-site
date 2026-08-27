# FAQ

## The task list is empty

The task list opens the first period that has tasks by default. If it is still empty, check that tasks are placed in the correct directory:

```text
tasks/normal/
tasks/daily/
tasks/weekly/
```

## Does a single-server SQLite setup need Redis?

No, configure:

```yaml
redis:
  enabled: false
```

## The XP multiplier has no effect

Check that the player purchased the corresponding tier. Multipliers stack additively, not by taking the highest.
