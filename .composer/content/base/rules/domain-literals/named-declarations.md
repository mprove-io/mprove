# Named declarations

Use explicit domain types for named variables, objects, parameters, and return
types. Literal-array collections follow the "Collections" rule instead.

Do not widen domain types to `string`. Import types with `import type`; do not
use `as` assertions to bypass checking.

```ts
let status: TaskStatus = 'queued';
```
