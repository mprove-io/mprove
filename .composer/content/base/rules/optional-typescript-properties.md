# Optional TypeScript properties

Do not explicitly add `| null` or `| undefined` to TypeScript types.

- For optional properties and arguments, use `name?: string`.

```ts
// correct
apiKey?: string;

// wrong
apiKey?: string | null;
```
