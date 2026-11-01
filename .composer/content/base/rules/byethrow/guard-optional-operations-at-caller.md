# Guard optional operations at caller

When a Result-producing operation depends on an optional value, handle the
absent case in the caller. Pass the narrowed, required value to the callee.

Do not make a callee accept an optional value solely so it can return a neutral
`Result.succeed` when the value is absent.

Keep the optional-value guard in the callee only when absence is intrinsic
domain behavior shared by multiple callers.

```ts
// correct
return isUndefined(v.name) ? Result.succeed() : printName({ name: v.name });

function printName(item: {
  name: string;
}): Result.Result<void, PrintNameError> {
  // ...
}

// wrong
function printName(item: {
  name?: string;
}): Result.Result<void, PrintNameError> {
  if (isUndefined(item.name)) {
    return Result.succeed();
  }

  // ...
}
```
