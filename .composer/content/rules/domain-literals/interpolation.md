# Interpolation

Interpolate domain literals using `satisfies` with their existing union type; do
not embed domain tokens as unchecked plain text. Ordinary prose and
already-typed expressions need no checks.

```ts
let message: string = `Task status must be "${'queued' satisfies TaskStatus}"`;
```
