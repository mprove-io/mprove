# Domain literal type checking

Use explicit domain type annotations for named variables, collections, objects,
parameters, and return types. Do not widen domain types to `string`.

Use `satisfies` for inline expressions without a typed context. Check the whole
object against an existing contract when available; otherwise check individual
domain literals. Already-typed contexts need no redundant checks.

Import types with `import type`. Do not use `as` assertions to bypass checking.

```ts
// correct
let command: AiStreamCommand = 'set-title';

JSON.stringify({
  command: 'set-title' satisfies AiStreamCommand
});

// wrong: JSON.stringify does not check the domain type
JSON.stringify({
  command: 'set-title'
});
```
