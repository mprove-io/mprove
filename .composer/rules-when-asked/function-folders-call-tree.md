# Function folders call tree

Apply this rule to the specific function named by the user.

- Treat the specified function as the root of the call tree.
- Keep the root function's file in its current location.
- Inspect project-local functions called directly by the root.
- Count distinct non-test callers across the codebase. Multiple calls from the
  same function count as one caller.
- Tests do not count as callers.
- Move a called function into the tree only when it has exactly one non-test
  caller.
- Create a numbered child directory and place the called function's
  implementation file inside it. Use two digits at the first function-folder
  level and add one digit at each deeper level: `<NN>-<function-name>`, then
  `<NNN>-<function-name>`, then `<NNNN>-<function-name>`.
- Move the function's colocated `tests/` directory with the function.
- Number child directories by the order in which functions are first called in
  the caller, starting with `01` at the first level, `001` at the second level,
  and `0001` at the third level.
- Apply the same process recursively to every moved function.
- Leave functions with multiple non-test callers at their existing paths.
- Represent each directly called multi-caller function with a numbered
  `<number>-<function-name>/.gitkeep` placeholder directory using the number
  width for that level.
- Import multi-caller functions from their actual implementation paths.
  Placeholder directories contain no implementation.
- Ignore standard library calls, dependencies, methods, callbacks, combinators,
  and recursive self-calls when constructing the tree.
- Do not move types, schemas, constants, configuration, or unrelated support
  files merely because a moved function imports them.
- Update all affected imports, including imports in moved tests.
- Renumber sibling directories when calls are added, removed, or reordered.
- Prefer no more than two function-folder levels. Before adding a deeper level,
  check whether the operation can be another step in the existing linear
  pipeline, can be promoted to the first-level orchestrator without leaking
  incidental state, can be reasonably inlined when it is a small pure helper, or
  can be passed directly to `Result.sequence` as an existing Result-producing
  function.
- The two-level preference is not strict. Add a deeper level when flattening
  would introduce a nested `Result.pipe` in one function, duplicate logic or
  error handling, broaden pipeline state unnecessarily, or move implementation
  details into the wrong orchestrator. Result composition and semantic ownership
  take precedence over folder depth.
- Do not restructure code outside the selected root's recursive single-caller
  function tree.
