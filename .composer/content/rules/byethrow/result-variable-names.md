# Result variable names

Use context-specific names:

- **Named function in a pipe:** bind its success value by domain, optionally
  prefixed: `getCarResult` returning `Result<Car, GetCarError>` may bind to
  `car` or `originalCar`. Reuse the callee's success type.
- **Throwing compatibility wrapper:** when `getCar` delegates to `getCarResult`,
  name the local Result variable `result`.
- **Inline pipe computation:** match the binding and its named handwritten
  success type when introducing a step-specific contract: `prepareQueryPayload`
  / `PrepareQueryPayload`. When reusing an existing type, bind by domain
  instead. Avoid redundant enclosing-operation prefixes. Type requirements and
  exceptions follow "Result callback return types"; grouped object naming and
  type reuse follow "Singular and plural names".
- **Other local Result variables:** prefer the named output contract in lower
  camel case when there is a dedicated output contract. Otherwise, use the
  success value's domain name plus `Result`: `carResult` or `originalCarResult`
  for `Result<Car, GetCarError>`. Do not derive an `Output` name merely from the
  called function name. For guarded conversions, name the conversion rather than
  the guard or fallback.

Dedicated output contract naming follows "Function return types". Its local
Result variable uses lower camel case: `EditMalloyQueryOutput` /
`editMalloyQueryOutput`.

Keep meaningful domain names for unwrapped values and intermediate state; entity
names follow "Entity and Tab variable names". Do not use placeholders such as
`operationResult9`, `prepared1`, `SomeOperationState14`, `bindingResult`, or
`boundValue`. Distinguish values with meaningful prefixes, not numeric suffixes.
Meaningful numeric names such as `keyBase64` are allowed.
