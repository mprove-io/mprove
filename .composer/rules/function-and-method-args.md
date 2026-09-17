# Function and method args

Functions and methods must use a single object argument named `item` with an
inline type. Destructure `item` inside the function body when individual
properties are needed outside a `Result.pipe` pipeline.

Example:

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}
```
