# Result callback return types

Callbacks passed to `Result.bind` and `Result.andThen` must declare an explicit
`Result.Result<Success, Error>` or `Result.ResultAsync<Success, Error>` return
type, matching whether the callback returns a synchronous Result or a promise.

```ts
Result.bind(
  'manifest',
  (v): Result.Result<Manifest, ComposerError> =>
    loadManifest({
      manifestPath: v.manifestPath
    })
);
```

```ts
Result.andThen(
  (v): Result.Result<Something, DoSomethingError> => doSomething(v)
);
```

Callbacks passed to `Result.map` must declare an explicit success-value return
type.

Keep a one-off final projection inline in the `Result.map` callback. Do not
extract it into a named function used only by that final projection.

When the callback only constructs the output object, return the object directly
with an expression body and an explicit callback return type. Do not introduce a
redundant typed `payload` variable followed by `return payload`. Intermediate
operations follow "Pipe step granularity".

```ts
Result.map(
  (v): SomeType => ({
    modelId: v.modelId,
    name: v.name
  })
);
```

Callbacks passed to `Result.andThrough` do not require an explicit return type.
