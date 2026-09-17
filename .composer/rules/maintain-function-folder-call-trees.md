# Maintain function folder call trees

When a function is already organized according to the opt-in "Function folders
call tree" rule, maintain that structure whenever changing the root function or
any function in its tree. The user does not need to ask again.

- Re-evaluate the root's recursive call tree after changing function calls.
- Add, remove, move, or renumber child directories as required by the original
  rule.
- Update affected imports and move colocated tests with their functions.
- Do not restructure functions that are not already part of an established
  function folder call tree unless the user explicitly asks.
