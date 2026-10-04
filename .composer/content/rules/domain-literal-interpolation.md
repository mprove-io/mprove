# Domain literal interpolation

In constructed strings, interpolate domain literals using `satisfies` with their
existing string-literal union type, rather than embedding them as plain text.

Import types with `import type`; do not use `as` assertions. Ordinary prose and
already-typed expressions need no checks.

```ts
// correct
message: `parameter "${'method' satisfies FileParameter}" is required`,

// wrong: domain token has no compiler validation
message: `parameter "method" is required`,
```
