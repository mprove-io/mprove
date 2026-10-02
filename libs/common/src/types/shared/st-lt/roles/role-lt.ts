import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type RoleLt = {
  emptyData?: number;
};

export let zRoleLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'RoleLt' });

assertTypesEqual<RoleLt, z.infer<typeof zRoleLt>>({ value: true });
