# Result callback return types

For `Result.map`, place output types according to the callback's role:

- Final projections must declare an explicit callback return type using the
  enclosing function's success or return contract.
- Callbacks that discard the success value must declare `void` explicitly.
- Intermediate callbacks must omit return annotations. Object outputs follow the
  intermediate success-object construction requirement below.
- In-place mutation callbacks that return the same state object must return `v`
  directly without a callback return annotation or a redundant typed variable.
  Do not introduce a state type solely to annotate these callbacks.

For inline callbacks passed to other Result combinators as `Result.pipe` steps,
including `Result.bind`, `Result.andThen`, and `Result.andThrough`, do not
annotate callback return types. Infer their outputs from the returned
expressions. Do not introduce types solely to annotate callback signatures.
Parameter annotations follow "Pipe step argument types".

For intermediate success-object construction in any Result callback, assign the
new object to an explicitly typed local variable. Return that variable directly
from `Result.map`, or pass it to `Result.succeed` in Result-producing callbacks
such as `Result.bind` and `Result.andThen`. Do not substitute a
`Result.succeed<Payload>({...})` type argument, `satisfies`, or a type assertion
for the typed local variable. This requirement concerns newly constructed
success objects, not existing values, function argument objects, arrays,
primitives, or error objects. Final projections and in-place mutations follow
their rules above.

Reuse existing domain or output types for callback outputs when they fit. When a
dedicated object-shaped output type is needed, use a named handwritten type.
Intermediate type naming follows "Singular and plural names"; final projections
use the enclosing function's success or return contract as described in
"Function return types". Keep explicit return contracts on enclosing functions
and methods where otherwise required.

```ts
Result.bind('manifest', v =>
  loadManifest({
    manifestPath: v.manifestPath
  })
);
```

```ts
Result.andThen(v => doSomething({ projectId: v.projectId }));
```

Intermediate success-object construction:

```ts
Result.bind('prepareQueryPayload', v => {
  let prepareQueryPayload: PrepareQueryPayload = {
    model: v.model,
    query: v.query
  };

  return Result.succeed(prepareQueryPayload);
});
```

Intermediate object projection:

```ts
Result.map(v => {
  let prepareQueryPayload: PrepareQueryPayload = {
    model: v.model,
    query: v.query
  };

  return prepareQueryPayload;
});
```

Synchronous in-place mutation callbacks follow "Byethrow function selection".

```ts
Result.map(v => {
  v.role.gvs.push({ givenId: v.givenId, values: v.values });
  return v;
});
```

```ts
Result.map((v): void => undefined);
```

Keep a one-off final projection inline in the `Result.map` callback. Do not
extract it into a named function used only by that final projection.

When a final projection callback only constructs the output object, return the
object directly with an expression body. Do not introduce a redundant typed
`payload` variable followed by `return payload`. Intermediate operations follow
"Pipe step granularity".

```ts
Result.map(
  (v): GetModelOutput => ({
    modelId: v.modelId,
    name: v.name
  })
);
```
