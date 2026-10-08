# Async promise chains

Use `async` for promise-chain functions or methods where TypeScript offers "This
may be converted to an async function" (`ts(80006)`), even when their bodies
contain no `await`. Keep the explicit outer return type.

Keep `.then(...)` when it expresses lookup/conversion clearly; do not rewrite it
to `await` solely to satisfy that suggestion.

Do not add `async` to callbacks solely because they return a promise when no
`ts(80006)` suggestion applies. In particular, Result combinator callbacks may
directly return a promise chain with an explicit
`Result.ResultAsync<Success, Error>` return type and no `async`. Use `async`
when the callback needs `await`; keep synchronous `.then(...)` conversion
callbacks non-async.

Keeping `async` on functions and methods also preserves conversion of
synchronous exceptions in the outer body to promise rejections. Direct returns
from `.then(...)` follow the promise-chain exception under "Explicit variable
types".
