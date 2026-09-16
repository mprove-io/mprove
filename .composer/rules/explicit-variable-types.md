# Explicit variable types

Always declare an explicit type for a variable assigned from a function or
method call. Before returning a value, assign it to an explicitly typed variable
and return that variable. Do not rely on return-type inference at invocation or
return sites.

Exception: `PackerOutput` flows do not require explicit variable or callback
return types. A `retry` callback may directly return `db.drizzle.transaction`,
and its transaction callback may directly return `db.packer.write`, without
intermediate variables.

```ts
await retry(
  async () =>
    await this.db.drizzle.transaction(
      async tx =>
        await this.db.packer.write({
          tx: tx,
          update: { providers: [provider] }
        })
    ),
  getRetryOption(this.cs, this.logger)
);
```

Exception: callbacks passed to collection methods such as `map`, `filter`,
`find`, `findIndex`, `some`, and `sort` may return expressions directly without
an explicit callback return type or an intermediate variable.

Exception: callbacks passed to ts-pattern `with` may return expressions directly
without an explicit callback return type or an intermediate variable.

```ts
let modelIndex: number = provider.models.findIndex(
  item => item.modelId === modelId
);
```

Exception: byethrow `Result` pipelines should preserve their compositional
style.

Within `Result.pipe`:

- Callbacks passed to `Result.map`, `Result.mapError`, `Result.andThen`,
  `Result.andThrough`, `Result.bind`, `Result.inspect`, and
  `Result.inspectError` may return expressions directly without explicit
  callback return types or intermediate variables.
- Variables assigned directly from `Result.pipe` or `Result.unwrap` may rely on
  inferred types when the enclosing function or method has an explicit return
  type.
- Return a `ResultAsync` helper directly instead of wrapping it in redundant
  `async`/`await`.
- Continue using explicit parameter and return types on standalone
  Result-producing functions.

Use the combinator matching the operation:

- `map` transforms a successful value without introducing an anticipated error.
- `mapError` transforms an anticipated error.
- `andThen` replaces the successful value with another Result-producing
  computation.
- `andThrough` runs a validation or side effect and preserves the successful
  value.
- `bind` retains a successful computation under a semantic property name when
  later steps need it. Do not bind `void` results or final projections.

Use `Result` failures for anticipated domain errors. Unexpected infrastructure
errors may throw unless they are intentionally converted using `Result.try` or
`Result.fn`.

For local object projections, prefer a named handwritten type over `Pick`. Use
explicit mapping when the runtime object must contain only the projected fields.

```ts
// correct
type ResponseModelPart = {
  modelId: string;
  name: string;
};

let responseModelParts: ResponseModelPart[] = models.map(model => ({
  modelId: model.modelId,
  name: model.name
}));

// wrong
type ResponseModelPart = Pick<LlmModel, 'modelId' | 'name'>;
```

```ts
// correct
let modelParts: LlmModelPart[] = await this.llmModelService.getModelParts({
  providerType: providerType
});

let devModels: DevModel[] = models.map(model => toDevModel(model));

return devModels;

// wrong
let modelParts = await this.llmModelService.getModelParts({
  providerType: providerType
});

return models.map(model => toDevModel(model));
```
