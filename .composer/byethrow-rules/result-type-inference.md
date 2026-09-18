# Result type inference

Byethrow `Result` pipelines are exempt from the general explicit variable type
rule in these cases:

- Callbacks passed to Result combinators may return expressions directly without
  intermediate variables.
- Variables assigned directly from `Result.pipe` or `Result.unwrap` may rely on
  inferred types when the enclosing function or method has an explicit return
  type.
- Return `Result.succeed` and `Result.fail` directly without intermediate
  variables.
- Return a `ResultAsync` helper directly instead of wrapping it in redundant
  `async`/`await`.

Standalone Result-producing functions must retain explicit return types.
