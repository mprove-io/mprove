# Undefined checks

Use `isUndefined(value)`, not `!isDefined(value)`, when checking for an
undefined value.

```ts
if (isUndefined(member)) {
  // Handle the missing member.
}
```
