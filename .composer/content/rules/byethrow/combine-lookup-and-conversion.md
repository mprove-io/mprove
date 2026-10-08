# Combine lookup and conversion

When a database entity or entity collection is used only for conversion to a Tab
value, combine lookup and conversion in one Result binding. Keep the entity
local to the callback rather than adding an entity binding followed immediately
by a Tab binding.

Use the query promise's `.then(...)` for conversion, following "Result callback
return types" and the promise-chain exception under "Explicit variable types".
The outer callback follows "Async promise chains".

```ts
Result.bind(
  'avatar',
  (v): Result.ResultAsync<AvatarTab, AvatarEntToTabResultError> =>
    v.db.drizzle.query.avatarsTable
      .findFirst({
        where: eq(avatarsTable.userId, v.avatarUserId)
      })
      .then((avatarEnt: AvatarEnt) =>
        isUndefined(avatarEnt)
          ? Result.succeed(undefined)
          : v.tabService.avatarEntToTabResult({ avatarEnt: avatarEnt })
      )
);
```

For collections, return `Result.sequence` with the conversion callback from
`.then(...)`, preserving first-failure processing order.

Keep missing-entity guards at the caller and preserve existing missing-value
behavior. Keep steps separate when entities are needed elsewhere in the
pipeline, including authorization, existence checks, or mutations. Do not
reorder checks, queries, or side effects merely to combine steps.
