# Item destructuring

Destructure `item` inside a named function or method when individual properties
are needed outside a `Result.pipe` pipeline.

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}
```
