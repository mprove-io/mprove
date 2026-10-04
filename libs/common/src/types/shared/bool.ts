import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const boolValues = ['TRUE', 'FALSE'] as const;

export type Bool = (typeof boolValues)[number];

export let zBool = z.enum(boolValues);

assertTypesEqual<Bool, z.infer<typeof zBool>>({
  value: true
});
