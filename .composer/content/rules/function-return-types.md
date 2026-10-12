# Function return types

Standalone named functions must declare an explicit return type. Reuse an
existing domain or output type when it fits; do not create a new contract merely
for naming.

When a function only produces a single primitive value, return that primitive
directly with an explicit type, such as `string`. Do not introduce a
single-field object wrapper merely to define an `Output` contract.

When a function or method needs a dedicated return contract, name it
`<FunctionName>Output`, omitting a trailing `Result` and any service prefix. Use
`Output`, not `ResultValue`: `editMalloyQueryResult` → `EditMalloyQueryOutput`.
For Result-returning functions, this names the success type, not the Result
wrapper.

Reserve `Payload` for new, step-specific intermediate inline pipe types as
described in "Singular and plural names". Final pipe projections use the
enclosing function's return or success contract, not a step-specific `Payload`.
