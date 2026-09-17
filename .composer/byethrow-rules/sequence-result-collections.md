# sequence Result collections

Use `Result.sequence` when applying a Result-producing operation to every item
in a collection and processing should stop at the first failure. Do not manually
accumulate the collection result by repeatedly applying a curried combinator.
