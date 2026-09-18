# Pipe step callbacks

Pass an inline callback to every Result combinator used as a `Result.pipe` step.
Name the callback argument `v`. Do not pass a named function directly as the
callback; wrap the call and project the required pipeline state explicitly.

Named functions still use `item` as required by the function argument rule.

```ts
// correct
Result.andThrough(v =>
  validateModel({
    modelId: v.modelId
  })
);

// wrong
Result.andThrough(validateModel);
```
