# Singular and plural names

Use plural names only for arrays. Use singular names for non-array variables,
properties, pipeline bindings, and types, including objects that group arrays.

Intermediate inline pipe steps may reuse an existing domain or output type when
it fits. Do not create a `Payload` type merely to rename an existing contract.
When a grouped intermediate object needs a new, step-specific type, use the
step's action name plus `Payload` for both the type and binding, such as
`PrepareReportQueriesPayload` / `prepareReportQueriesPayload`, not
`ReportQueries` / `reportQueries`. Keep array fields inside the payload plural.
Function return contracts follow "Function return types" instead.
