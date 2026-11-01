# Throwing adapters

Functions and methods that delegate to a Result-returning operation, return its
success value, and throw on failure must use the base operation's name plus
`Unwrap`. The Result-returning operation uses the base name, without a `Result`
suffix merely to distinguish it from the adapter. Match standalone adapter
filenames and directories to their names.

```ts
getConfig(...)        // Result<McliConfig, GetConfigError>
getConfigUnwrap(...)  // McliConfig; throws on failure
```

For example, `getConfigUnwrap` lives in `get-config-unwrap/get-config-unwrap.ts`
when organized in a function directory.

The suffix does not require using Byethrow's `Result.unwrap`. Preserve required
error translation, such as creating a `ServerError`. Do not use a fallback value
in a throwing adapter.

This rule does not apply to throw-to-Result adapters such as `dbErrorToResult`,
or names where "Result" describes domain data, such as `getWrapResult`.
