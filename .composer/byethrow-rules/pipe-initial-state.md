# pipe initial state

Use the function's original `item` argument directly as the initial pipeline
state when no additional or derived values are needed. Do not destructure `item`
before the pipeline in this case.

```ts
return Result.pipe(
  Result.succeed(item),
  Result.andThen(v => doSomething(v))
);
```

When additional or derived values are needed, use an explicit object containing
the complete initial pipeline state.

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
