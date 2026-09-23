# Condition expressions

Inline a boolean expression in a condition when a variable would only store the
expression for that single condition. This includes function and method calls
that return a boolean.

Use `isUndefined(value)` instead of `!isDefined(value)` when checking for an
undefined value.

When a function or method call returns a non-boolean value, assign its result to
an explicitly typed variable before evaluating that value in a condition.

Start boolean variable names with `is`. In particular, use `isOutputInParent`,
not `outputIsInParent`.

```ts
// correct: single-use boolean expression
if (manifestPath === outputPath) {

// correct: call returns a boolean
if (isDefined(member)) {

// correct: check for an undefined value
if (isUndefined(member)) {

// wrong: negated isDefined
if (!isDefined(member)) {

// correct: call returns a non-boolean value
let member: unknown = this.membersService.getMember(memberId);

if (!member) {

// wrong: unnecessary single-use boolean variable
let pathsConflict: boolean = manifestPath === outputPath;

if (pathsConflict) {

// correct: boolean variable starts with is
let isOutputInParent: boolean = relativeOutputPath === '..';

// wrong: is is in the middle
let outputIsInParent: boolean = relativeOutputPath === '..';

// wrong: call returns a non-boolean value
if (!this.membersService.getMember(memberId)) {
```
