# Non boolean results

Assign a non-boolean function or method result to an explicitly typed variable
before evaluating it in a condition.

Exception: compare membership indices directly as specified by "Membership
checks"; do not store an index solely to test presence or absence.

```ts
let member: Member = members.get(memberId);

if (isUndefined(member)) {
  // Handle the missing member.
}
```
