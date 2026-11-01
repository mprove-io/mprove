# Negated comparisons

When negating a single comparison, use the inverse comparison operator rather
than wrapping the comparison in `!`. Prefer `!==` over `!(... === ...)`, `===`
over `!(... !== ...)`, and inverse relational operators where equivalent.

This rule does not require rewriting negated compound conditions or
boolean-returning calls. Collection membership follows "Membership checks".

```ts
// correct
if (parameter !== ('columns' satisfies FileParameter)) {
  // Handle other parameters.
}

// wrong
if (!(parameter === ('columns' satisfies FileParameter))) {
  // Handle other parameters.
}
```
