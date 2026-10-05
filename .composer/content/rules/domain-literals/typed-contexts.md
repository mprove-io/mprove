# Typed contexts

Do not add `satisfies` where the context already checks domain membership.
Drizzle's `eq` and `inArray` check values against a column's
`$type<DomainType>()`.

Prefer typing the underlying column or contract when it represents a domain.
Keep explicit checks where the context is `string`, `any`, or otherwise
unchecked.

```ts
// tasksTable.status has .$type<TaskStatus>().
inArray(tasksTable.status, ['queued', 'running']);
```
