# Membership checks

For value-based presence checks, use `.includes(value)` instead of
`.indexOf(value) > -1`.

For value-based absence checks, use `.indexOf(value) < 0` rather than negating
`.includes(value)`.

Use value-based checks when the argument type is accepted; for broader inputs or
property comparisons, use callback-based checks.

For callback-based presence checks, use `.some(callback)` instead of
`.findIndex(callback) > -1`.

For callback-based absence checks, use `.findIndex(callback) < 0` rather than
negating `.some(callback)`.

Compare membership indices directly with `0` or `-1`. Keep a named index only
when the index itself is needed, such as for array access, insertion, or
ordering.

In compound conditions, name the membership boolean with a descriptive `is...`
variable, even if used only once. Store the boolean, not a separate numeric
index.

```ts
let isActiveTask = (['queued', 'running'] satisfies TaskStatus[]).some(
  status => status === task.status
);

if (task.canRun && isActiveTask) {
  // Handle active tasks.
}

if (tasks.findIndex(task => task.id === taskId) < 0) {
  // Handle the missing task.
}

if (taskIds.includes(taskId)) {
  // Handle the existing task.
}

if (taskIds.indexOf(taskId) < 0) {
  // Handle the missing task.
}
```
