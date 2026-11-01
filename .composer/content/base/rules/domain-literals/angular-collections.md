# Angular collections

For template collections used with `indexOf` or `includes`, use an explicit
domain-array annotation and call the method directly in the template.

Do not add a helper or component method solely to work around a narrowed
collection's membership argument type.

```ts
readonly activeTaskStatuses: TaskStatus[] = ['queued', 'running'];
```
