# Zod optional fields — use `.nullish()`

For optional fields in zod schemas, use `.nullish()` (not `.optional()`).
`.nullish()` accepts both `null` and `undefined`, matching the looseness of
interface definitions and runtime data from upstream systems.

```ts
// correct
status: zFileStatus.nullish(),

// wrong
status: zFileStatus.optional(),
```
