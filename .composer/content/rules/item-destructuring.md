# Item destructuring

Destructure `item` inside a named function or method when individual properties
are needed outside a `Result.pipe` pipeline.

Only top-level controller and MCP-tool handlers may forward a complete input
directly or spread it before adding trusted context. Avoid destructuring solely
for forwarding there. Elsewhere, explicitly map arguments. Keep explicit mapping
for subsets, renamed fields, or transformations.

Result pipelines follow "Pipe state" and "Pipe step callbacks" instead.

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}

return this.connectionSampleService.getConnectionSampleResult({
  ...body.input,
  userId: user.userId
});
```
