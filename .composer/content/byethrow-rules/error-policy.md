# Error policy

Use `Result` failures for anticipated domain errors. Unexpected infrastructure
errors may throw unless they are intentionally converted using `Result.try` or
`Result.fn`.
