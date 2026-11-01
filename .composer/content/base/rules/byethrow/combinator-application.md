# Combinator application

Pass Result combinators as steps to `Result.pipe`. Do not directly invoke the
curried function returned by a combinator, such as
`Result.map(callback)(result)`. If using `Result.pipe` would create a nested
pipe in the same function, extract the operation into a standalone function in
its own file.
