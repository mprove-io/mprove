# Zod schemas and native types

Define each named Zod schema in a separate file with its corresponding
handwritten TypeScript type.

Export both and verify equivalence with
`assertTypesEqual<Type, z.infer<typeof schema>>`.

This requirement is one-way: a native TypeScript type does not automatically
require a Zod schema. Add a schema when needed for runtime validation or
contract composition, not merely because a native type exists.

Do not define the native type using `z.infer`.

Example in `member.ts` (imports omitted):

```ts
export type Member = {
  id: string;
  nickname?: string;
};

export const zMember = z.object({
  id: z.string(),
  nickname: z.string().nullish()
});

assertTypesEqual<Member, z.infer<typeof zMember>>({
  value: true
});
```

Exception: finite domain string unions follow "Canonical values" under "Domain
literals". Use their canonical `as const` tuple, a native type
`(typeof tuple)[number]`, and a schema `z.enum(tuple)`. Preserve the
`assertTypesEqual<Type, z.infer<typeof schema>>` equality assertion.

For every Zod `.extend()`, define the native type using `Extend` from
`#common/types/extend`; do not use TypeScript `extends` or intersection types
for this purpose.

Example in a separate `member-with-label.ts`, using imported `Member`,
`zMember`, and `Extend` (imports omitted):

```ts
export type MemberWithLabel = Extend<Member, { label: string }>;

export const zMemberWithLabel = zMember.extend({
  label: z.string()
});

assertTypesEqual<MemberWithLabel, z.infer<typeof zMemberWithLabel>>({
  value: true
});
```
