# Pipe state

**Initialization**

Start every `Result.pipe` with `Result.succeed`.

When `item` has an inline object type declared in the function or method
parameter list, use `Result.succeed(item)` when no additional or derived values
are needed. When adding additional or derived values, spreading `item` into an
explicit object is allowed.

When the input structure comes from another file, explicitly list each input
property carried into the pipeline using `key: value` syntax. Do not pass or
spread the input object directly.

Exception: an input whose type is a union of object variants may be carried
intact under a named pipeline-state property, even when its type comes from
another file. Use this to preserve variant relationships and property presence
without rebuilding each variant. Do not spread or flatten the union into state.

```ts
Result.succeed({
  input: body.input,
  userId: user.userId
});
```

```ts
export function buildSpace(item: {
  spaces: FileSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  return Result.pipe(
    Result.succeed(item)
    // Steps access operation data through v.
  );
}
```

```ts
// Inline parameter type, with derived data:
Result.succeed({
  ...item,
  repoDir: `${item.projectDir}/${item.repoId}`
});

// Imported input type:
return Result.pipe(
  Result.succeed({
    orgId: item.orgId,
    projectId: item.projectId
  }),
  Result.andThen(
    (v): Result.Result<Something, DoSomethingError> => doSomething(v)
  )
);
```

**Step access**

After the initial `Result.succeed`, access operation inputs and accumulated
pipeline data only through `v`. Do not reference `item`, `body.input`, other
arguments, destructured argument properties, or local variables declared before
`Result.pipe`. Carry all required operation data through the pipeline state.

In NestJS controller and service methods, access injected dependencies and
instance methods directly through `this`, including inside nested callbacks
within a step. Do not copy dependencies or the class instance into pipeline
state or local aliases.

Controller DTO example:

```ts
return Result.pipe(
  Result.succeed({
    projectId: body.input.projectId,
    userId: user.userId
  }),
  Result.andThen(
    (v): Result.Result<Something, DoSomethingError> =>
      this.someService.doSomething({
        projectId: v.projectId,
        userId: v.userId
      })
  )
);
```
