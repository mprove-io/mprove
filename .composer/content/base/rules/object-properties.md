# Object properties

Always use explicit `key: value` syntax in object literals — never use shorthand
property names.

```ts
// correct
let payload = { models: models };
doSomething({ sessionId: sessionId });

// wrong
let payload = { models };
doSomething({ sessionId });
```
