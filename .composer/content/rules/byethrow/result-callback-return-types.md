# Result callback return types

Do not annotate return types on inline callbacks passed to Result combinators as
`Result.pipe` steps, including `Result.bind`, `Result.andThen`, `Result.map`,
and `Result.andThrough`. Infer step outputs from the returned expressions.
Parameter annotations follow "Pipe step argument types".

Do not introduce types solely to annotate pipe steps. Keep explicit return
contracts on enclosing functions and methods where otherwise required; final
projection contracts follow "Function return types".

```ts
Result.bind('manifest', v =>
  loadManifest({
    manifestPath: v.manifestPath
  })
);
```

```ts
Result.andThen(v => doSomething({ projectId: v.projectId }));
```

Synchronous in-place mutation callbacks follow "Byethrow function selection".

```ts
Result.map(v => {
  v.role.gvs.push({ givenId: v.givenId, values: v.values });
  return v;
});
```

Keep a one-off final projection inline in the `Result.map` callback. Do not
extract it into a named function used only by that final projection.

When the callback only constructs the output object, return the object directly
with an expression body. Do not introduce a redundant typed `payload` variable
followed by `return payload`. Intermediate operations follow "Pipe step
granularity".

```ts
Result.map(v => ({
  modelId: v.modelId,
  name: v.name
}));
```
