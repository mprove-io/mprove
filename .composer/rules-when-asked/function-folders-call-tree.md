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
- Create a child directory named `<NN>-<function-name>` and place the called
  function's implementation file inside it.
- Move the function's colocated `tests/` directory with the function.
- Number child directories by the order in which functions are first called in
  the caller, starting with `01`.
- Apply the same process recursively to every moved function.
- Leave functions with multiple non-test callers at their existing paths.
- Represent each directly called multi-caller function with a numbered
  `<NN>-<function-name>/.gitkeep` placeholder directory.
- Import multi-caller functions from their actual implementation paths.
  Placeholder directories contain no implementation.
- Ignore standard library calls, dependencies, methods, callbacks, combinators,
  and recursive self-calls when constructing the tree.
- Do not move types, schemas, constants, configuration, or unrelated support
  files merely because a moved function imports them.
- Update all affected imports, including imports in moved tests.
- Renumber sibling directories when calls are added, removed, or reordered.
- Do not restructure code outside the selected root's recursive single-caller
  function tree.
