# Function folders call tree

Apply this rule to the specific function named by the user.

- Treat the specified function as the root of the call tree.
- Inspect project-local functions called directly by the root.
- Count distinct non-test callers across the codebase. Multiple calls from the
  same function count as one caller.
- Tests do not count as callers.
- Move a called function into the tree only when it has exactly one non-test
  caller.
- Create a plain `<function-name>` child directory and place the called function
  in `<function-name>/<function-name>.ts`.
- When moving a function, move its `tests/` directory or `.spec.ts` file with
  it.
- Remove any empty directories left behind after moving files.
- Apply the same process recursively to every moved function.
- Keep functions with multiple non-test callers outside the single-caller tree.
  Use an appropriate shared `functions/` location in the app, `node-common`, or
  `common`.
- Import multi-caller functions from their actual implementation paths.
- If a type is used only by a caller and its callee, define it in the callee's
  file.
- Prefer flat pipes. Before adding another directory level, check whether the
  operation can be another step in the existing linear pipeline.
