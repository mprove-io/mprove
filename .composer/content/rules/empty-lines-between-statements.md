# Empty lines between statements

Add an empty line between code statements. Do not add empty lines within a
single multiline statement.

This includes top-level declarations and statements, such as types, constants,
classes, functions, and schema equality assertions. Consecutive imports do not
require empty lines; separate the import group from other top-level statements.

Exception: keep consecutive, similar operations that form one logical update
together without empty lines, such as assigning related properties on the same
object. Separate the group from surrounding statements with empty lines.

```ts
tile.compiledQuery = newMconfig.compiledQuery;
tile.sql = newMconfig.compiledQuery.sql.split('\n');
tile.malloyQueryStable = newMconfig.malloyQueryStable;
tile.malloyQueryExtra = newMconfig.malloyQueryExtra;
tile.appliedGivens = newMconfig.appliedGivens;
tile.filtersFractions = filtersFractions;
```

Exception: in callbacks passed to byethrow `Result` combinators, an empty line
before `return` may be omitted when the callback body contains exactly one
preceding statement.

```ts
Result.andThrough(async v => {
  await ensureDir(v.orgDir);
  return Result.succeed();
});
```

```ts
// correct
let modelParts: LlmModelPart[] = await this.llmModelService.getModelParts({
  providerType: providerType
});

let devModels: DevModel[] = models.map(model => toDevModel(model));

return devModels;

// wrong
let modelParts: LlmModelPart[] = await this.llmModelService.getModelParts({
  providerType: providerType
});
let devModels: DevModel[] = models.map(model => toDevModel(model));
return devModels;
```
