# Item destructuring

Destructure `item` inside a named function or method when individual properties
are needed outside a `Result.pipe` pipeline. Do not destructure inputs solely to
construct pipeline initial state; follow "Pipe state" instead.

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}
```
