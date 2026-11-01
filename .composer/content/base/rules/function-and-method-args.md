# Function and method args

Named functions and methods must use a single object argument named `item` with
an inline type. This rule does not apply to callbacks.

Example:

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  // ...
}
```
