# Inline guarded Result callbacks

Use an expression-bodied conditional for Result combinator and
promise-conversion callbacks that only select between a fallback Result and one
operation, including simple success/failure checks.

For guarded existence queries, return
`.then(ent => Result.succeed(isDefined(ent)))` instead of awaiting a temporary
entity. Tab conversion follows "Combine lookup and conversion".

Keep block bodies for multi-statement orchestration; do not restructure it
solely to inline a callback.

Async handling, guard ownership, and behavior preservation follow "Async promise
chains", "Guard optional operations at caller", and "Pipe step granularity".
