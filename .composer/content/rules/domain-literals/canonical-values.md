# Canonical values

Define each finite domain union from one canonical `as const` tuple. Reuse it
for the type, schema when needed, and complete value lists. Export it when
callers need the values; do not duplicate the complete set.

Use `as const` only for canonical tuples or when downstream types require exact
literals. For the latter, use `as const satisfies` with an existing contract.
`as const` alone does not validate domain membership.

```ts
export const taskStatusValues = ['queued', 'running', 'done'] as const;

export type TaskStatus = (typeof taskStatusValues)[number];
```
