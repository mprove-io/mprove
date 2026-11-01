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
- `map` transforms or mutates pipeline data without introducing an anticipated
  error. For an in-place mutation, return the same state object with `return v`
  to preserve references.
- `mapError` transforms a failure value.
- `andThen` replaces a success with another Result-producing computation.
- `andThrough` runs a validation or operational side effect, such as
  persistence, notification, or a background-work launch, and preserves the
  original success. Return the operation's Result or ResultAsync so its
  anticipated failure stops the pipeline. Background launches follow "Fire and
  forget promises" and immediately return `Result.succeed()`, confirming launch
  rather than completion.
- `bind` adds a Result-producing computation's success under a named property.
  Do not bind `void` results or final projections.
- `orElse` replaces a failure with another Result-producing computation.
- `orThrough` runs a Result-producing operation on a failure and preserves the
  original failure when that operation succeeds.
- `inspect` is reserved for observation, such as debug logging and diagnostics,
  without mutating pipeline data.
- `inspectError` runs an infallible side effect on a failure without changing
  the result.

Both `inspect` and `andThrough` wait for promises returned by their callbacks,
but only `andThrough` propagates a returned Result failure. Do not discard a
fallible Result inside either callback. Callback annotations follow "Result
callback return types".

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
