# Function error types

For every Result-producing function with anticipated errors, define a named
`<FunctionName>Error` type in `types/function-errors/<function-name>-error.ts`.

The function error type must union errors created directly by the function with
the function error types of directly called lower-level functions. Import
lower-level function error types instead of repeating their leaf error members.

Define single-member and pass-through aliases as function error types too, so
every fallible function has its own error contract.
