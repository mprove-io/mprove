# Byethrow function selection

Use the Byethrow function matching the operation.

## Creating results

- `succeed` creates a successful result.
- `fail` creates a failed result.
- `do` creates `succeed({})` as a neutral object-building pipeline state.
- `try` immediately executes a possibly throwing function and converts the
  outcome to a result.
- `fn` wraps a possibly throwing function and returns a reusable
  Result-producing function.

## Composing and transforming

- `pipe` applies functions from left to right.
- `map` transforms a success value without introducing an anticipated error.
- `mapError` transforms a failure value.
- `andThen` replaces a success with another Result-producing computation.
- `andThrough` runs a Result-producing validation or side effect and preserves
  the original success.
- `bind` adds a Result-producing computation's success under a named property.
  Do not bind `void` results or final projections.
- `orElse` replaces a failure with another Result-producing computation.
- `orThrough` runs a Result-producing operation on a failure and preserves the
  original failure when that operation succeeds.
- `inspect` runs an infallible side effect on a success without changing the
  result.
- `inspectError` runs an infallible side effect on a failure without changing
  the result.

## Combining and validating

- `sequence` combines results, stopping at the first failure.
- `collect` combines results, processing all inputs and collecting every
  failure.
- `parse` validates a value with a synchronous Standard Schema and returns
  validation issues as a failure.

## Checking and asserting

- `isResult` checks whether an unknown value has a Result shape.
- `isSuccess` narrows a result to a success.
- `isFailure` narrows a result to a failure.
- `assertSuccess` asserts that a result with error type `never` is successful.
- `assertFailure` asserts that a result with success type `never` is failed.

## Extracting values

- `unwrap` extracts the success value, using a default or throwing the failure.
- `unwrapError` extracts the failure value, using a default or throwing the
  success value.
