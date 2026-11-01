# Fire and forget promises

When deliberately starting asynchronous work without waiting for it, prefix the
promise-producing expression with `void` at the call site. Apply this inside
callbacks too, including timer callbacks and Result pipeline steps.

When subsequent work depends on completion, await or return the promise instead.
Do not add `void` merely to silence an accidentally unawaited operation.

`void` documents intentional promise disposal; it does not handle rejection.
Preserve existing background rejection handling and the behavior-preservation
requirements under "Pipe step granularity" when clarifying existing calls.

```ts
Result.andThrough(v => {
  void this.finishRefreshCachedColumn({ projectId: v.projectId });
  return Result.succeed();
});
```
