# No "for (let ... of ..." and "for (let ... in ..."

Use `forEach`, `forEachSeries` for async.

Exception: `for (let i = 0; i < ...; i++)` index loops are allowed.
