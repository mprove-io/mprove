# Domain literal type checking

When using a literal from an existing domain union in a place that does not
check that union, add a type annotation or `satisfies`. Prefer checking the
whole object against its contract when one exists; otherwise check the literal
itself.

`as` assertions and `as const` do not validate union membership. Already-typed
contexts need no redundant checks. Import types with `import type`.

```ts
// correct
JSON.stringify({
  command: 'set-title' satisfies AiStreamCommand
});

// wrong: JSON.stringify does not check the domain type
JSON.stringify({
  command: 'set-title'
});
```
