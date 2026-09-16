# Optional TypeScript properties

Do not explicitly add `| null` or `| undefined` to TypeScript types.

- For optional properties and arguments, use `name?: string`.
- For variables that may be absent, restructure initialization instead of
  declaring an explicit `| null` or `| undefined` union.
- Corresponding Zod schemas should still use `.nullish()` when runtime input may
  contain `null` or `undefined`.

```ts
// correct
apiKey?: string;
let availableModelIds = condition ? new Set<string>() : undefined;

// wrong
apiKey?: string | null;
let availableModelIds: Set<string> | undefined;
```
