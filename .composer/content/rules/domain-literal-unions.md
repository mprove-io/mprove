# Domain literal unions

Define each finite domain string union from one canonical `as const` tuple. Use
that tuple for its type, schema when needed, and complete value lists. Export it
when callers need the values; do not duplicate the complete set elsewhere.

Separate collections must have a distinct purpose, such as a subset, display
order, or UI metadata. Give them explicit domain type annotations.

Use `as const` only for canonical tuples or when downstream types require exact
literal values. In the latter case, use `as const satisfies` to check an
existing contract. `as const` alone does not validate domain membership.

```ts
export const taskStatusValues = ['queued', 'running', 'done'] as const;

export type TaskStatus = (typeof taskStatusValues)[number];

export const activeTaskStatuses: TaskStatus[] = ['queued', 'running'];
```
