# Function folders call tree

- A caller is a non-test file that directly imports and uses a standalone named
  project-local function. The imported function is the callee. Count each caller
  once per callee.
- Treat the specified standalone named project-local function as the root.
- For each function in the tree, inspect the callees imported by its file and
  used by the function.
- When a callee has one caller, move it to `<function-name>/<function-name>.ts`
  under the current function's directory and apply these rules to it
  recursively.
- When a callee has multiple callers, keep it in an appropriate shared
  `functions/` location in the app, `node-common`, or `common`. Callers must
  import it directly from its implementation path.
- Move tests with their function and remove directories left empty by a move.
- If a type is used only by a caller and its callee, define it in the callee's
  file.
- Prefer flat pipes. Before adding another directory level, check whether the
  operation can be another step in the existing linear pipeline.
