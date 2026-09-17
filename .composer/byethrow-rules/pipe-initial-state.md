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

When the initial pipeline state differs from `item`, pass it as an explicit
object rather than passing an individual property or derived value directly.

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
