import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type AccessRoleCombined = { role: string; isDirect: boolean };

export let zAccessRoleCombined = z.object({
  role: z.string(),
  isDirect: z.boolean()
});

assertTypesEqual<AccessRoleCombined, z.infer<typeof zAccessRoleCombined>>({
  value: true
});
