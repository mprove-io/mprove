import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type UserSt = {
  emptyData?: number;
};

export let zUserSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'UserSt' });

assertTypesEqual<UserSt, z.infer<typeof zUserSt>>({ value: true });
