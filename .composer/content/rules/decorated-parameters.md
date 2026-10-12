# Decorated parameters

Keep parameter decorators on the same line as the parameter declaration,
including constructor injection and controller handler parameters. Do not put
the decorator on its own line.

```ts
// correct
@Inject(DRIZZLE) private db: Db

@AttachUser() user: UserTab,

@Body() body: ToBackendEditDraftReportRequestDto

// wrong
@Inject(DRIZZLE)
private db: Db

@AttachUser()
user: UserTab,
```
