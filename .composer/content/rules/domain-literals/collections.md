# Collections

Separate collections must serve a distinct purpose: a subset, display order, or
UI metadata. Complete value lists must reuse the canonical tuple.

Keep one-off collections inline; use whole-array `satisfies DomainType[]` unless
the context already checks membership. Do not extract a collection solely for
type checking. Keep collections named when reused or required by templates.

Use `satisfies DomainType[]` for named literal arrays to preserve inferred
subset types. Use explicit domain-array types for collections initialized from
other values, or when needed for `includes` or Angular template membership
checks. Do not widen to `string[]` or use a cast.

```ts
export const activeTaskStatuses = ['queued', 'running'] satisfies TaskStatus[];
```
