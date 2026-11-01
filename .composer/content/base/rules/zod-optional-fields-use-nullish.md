# Zod optional fields — use `.nullish()`

For optional fields in zod schemas, use `.nullish()` (not `.optional()`).
`.nullish()` accepts both `null` and `undefined`, matching the looseness of
interface definitions and runtime data from upstream systems.

Exception: files whose names match `*-config.ts` may use `.optional()`.

```ts
// correct
status: zFileStatus.nullish(),

// wrong
status: zFileStatus.optional(),
```
