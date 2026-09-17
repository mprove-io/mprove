# pipe should start with result succeed

Every `Result.pipe` must start with `Result.succeed`.

- When the pipeline needs only the function's original `item` argument, start
  with `Result.succeed(item)`.
- When the pipeline needs additional or derived values, start with
  `Result.succeed({ ... })` and explicitly include the complete state passed
  through the pipeline so the full object is visible at the entry point.
- Name the argument passed to each subsequent pipeline step `v`.

```ts
return Result.pipe(
  Result.succeed(item),
  Result.andThen(v => doSomething(v))
);
```

```ts
return Result.pipe(
  Result.succeed({
    orgId: orgId,
    projectId: projectId,
    model: model
  }),
  Result.andThen(v => doSomething(v))
);
```
