# One function per file

Each non-test file may define at most one standalone named function
implementation.

This rule applies to function declarations and function-valued variables at
module scope. It does not apply to callbacks, class or object methods,
constructors, getters, or setters.

Types, schemas, constants, and other non-function declarations may coexist with
the function in the same file.
