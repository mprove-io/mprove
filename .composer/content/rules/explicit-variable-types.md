# Explicit variable types

Always declare an explicit type for a variable assigned from a function or
method call. Before returning a value, assign it to an explicitly typed variable
and return that variable. Do not rely on return-type inference at invocation or
return sites.

Exception: Byethrow Result flows follow the exceptions under "Result type
inference".

Exception: when a function, method, or callback with an explicit return type
returns a promise chain, its `.then(...)` callbacks may return expressions
directly without intermediate variables or their own return annotations. The
outer return contract checks the returned promise's value type. This applies to
expression-bodied callbacks and direct returns from block-bodied callbacks,
including chains returning `Result.ResultAsync<Success, Error>`.

```ts
async function loadMemberName(item: { memberId: string }): Promise<string> {
  let { memberId } = item;

  return loadMember({ memberId: memberId }).then(member => member.name);
}
```

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
