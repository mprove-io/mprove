# Result callback return types

Callbacks passed to `Result.bind` and `Result.andThen` must declare an explicit
`Result.Result<Success, Error>` return type.

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

```ts
Result.map(
  (v): SomeType => ({
    modelId: v.modelId,
    name: v.name
  })
);
```

Callbacks passed to `Result.andThrough` do not require an explicit return type.
