# No "for (let ... of ..." and "for (let ... in ..."

Use `forEach` for synchronous iteration.

Use `forEachSeries` when an asynchronous callback must be awaited sequentially.

Exception: `for (let i = 0; i < ...; i++)` index loops are allowed.
