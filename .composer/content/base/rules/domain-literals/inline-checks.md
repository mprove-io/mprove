# Inline checks

Use `satisfies` for inline expressions without a domain-checked context. Prefer
checking the whole object or collection against an existing contract; otherwise
check individual domain literals.

```ts
JSON.stringify({
  status: 'queued' satisfies TaskStatus
});
```
