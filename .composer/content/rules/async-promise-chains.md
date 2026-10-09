# Async promise chains

Use `async` for promise-chain functions or methods where TypeScript offers "This
may be converted to an async function" (`ts(80006)`), even when their bodies
contain no `await`. Keep the explicit outer return type.

Keep `.then(...)` when it expresses lookup/conversion clearly; do not rewrite it
to `await` solely to satisfy that suggestion.

Block-bodied arrow functions (`=> { ... }`) with an explicit
`Result.ResultAsync<Success, Error>` return type must be declared `async`, even
when their bodies contain no `await`. Expression-bodied arrow functions
(`=> expression`) are exempt from this requirement.

Otherwise, do not add `async` to callbacks solely because they return a promise
when no `ts(80006)` suggestion applies. Expression-bodied Result combinator
callbacks may directly return a promise chain with an explicit
`Result.ResultAsync<Success, Error>` return type and no `async`. Use `async`
when the callback needs `await`; keep synchronous `.then(...)` conversion
callbacks non-async.

When a Result callback must return a promise but has a synchronous fallback
branch, make the enclosing callback `async` and return `Result.succeed(...)`
directly from that branch instead of `Promise.resolve(Result.succeed(...))`.
Retain its explicit `Result.ResultAsync<Success, Error>` return type and keep
query `.then(...)` conversion chains intact.

Keeping `async` on functions and methods also preserves conversion of
synchronous exceptions in the outer body to promise rejections. Direct returns
from `.then(...)` follow the promise-chain exception under "Explicit variable
types".
