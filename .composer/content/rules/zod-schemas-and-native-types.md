# Zod schemas and native types

Define each named Zod schema in a separate file with its corresponding
handwritten TypeScript type.

Export both and verify equivalence with
`assertTypesEqual<Type, z.infer<typeof schema>>`.

Do not define the native type using `z.infer`.

Exception: finite string literal sets may use a single module-local `const`
tuple declared with `as const`, a native type `(typeof tuple)[number]`, and a
schema `z.enum(tuple)`. Preserve the
`assertTypesEqual<Type, z.infer<typeof schema>>` equality assertion.

For every Zod `.extend()`, define the native type using `Extend` from
`#common/types/extend`; do not use TypeScript `extends` or intersection types
for this purpose.
