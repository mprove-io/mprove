# No calls in conditions

Do not call functions or methods inside `if` conditions. Extract the result to a
variable first.

These existing functions can be called in conditions:

- isDefined
- isDefinedAndNotEmpty
- isUndefiend
- isUndefinedOrEmpty

```ts
// correct
let member = this.membersService.getMember(memberId);
if (!member) {

// wrong
if (!this.membersService.getMember(memberId)) {
```
