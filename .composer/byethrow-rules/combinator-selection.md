# Combinator selection

Use the combinator matching the operation:

- `map` transforms a successful value without introducing an anticipated error.
- `mapError` transforms an anticipated error.
- `andThen` replaces the successful value with another Result-producing
  computation.
- `andThrough` runs a validation or side effect and preserves the successful
  value.
- `bind` retains a successful computation under a semantic property name when
  later steps need it. Do not bind `void` results or final projections.
