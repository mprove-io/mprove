# Boolean conditions

Inline a boolean expression or boolean-returning call when a variable would only
store it for one condition. Exception: name membership booleans in compound
conditions as specified by "Membership checks".

Start boolean variable names with `is`: use `isOutputInParent`, not
`outputIsInParent`.

```ts
if (isDefined(member) && sourcePath !== outputPath) {
  // Process the member.
}
```
