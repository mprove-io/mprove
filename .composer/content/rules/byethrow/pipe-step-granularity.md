# Pipe step granularity

Prefer flat pipelines with named steps for distinct intermediate operations
rather than putting several prerequisite queries or transformations in one
callback.

- Separate prerequisite lookups and derived query inputs, such as ID arrays,
  when doing so leaves each query binding focused on one operation.
- Bind intermediate filtering, sorting, lookup-map construction, and fallback
  selection when they obscure the final response projection.
- Bind a value once when multiple later steps use it, rather than repeating a
  lookup or transformation. Keep the binding at the original first-use point.
- For infallible named intermediate values, use `Result.bind` with
  `Result.succeed` and an explicit `Result.Result<Value, never>` callback return
  type. Do not manually rebuild the full pipeline state just to add a property.

Do not add steps merely for every expression or trivial one-off output field.
Keep lookup/conversion together as specified by "Combine lookup and conversion",
and keep final projections inline as specified by "Result callback return
types".

Step-only refactors must preserve query, validation, conversion, and side-effect
order; conditional bypasses and empty-list guards; missing-value behavior and
error precedence; and transaction/retry boundaries. Do not split a transaction
or retry into pipeline steps, introduce new existence failures, or move
post-persistence selection before persistence.

```ts
Result.bind(
  'projectIds',
  (v): Result.Result<string[], never> =>
    Result.succeed(
      v.userMemberEnts.map(userMemberEnt => userMemberEnt.projectId)
    )
);
```
