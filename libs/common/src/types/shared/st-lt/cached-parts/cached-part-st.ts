import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type CachedPartSt = {
  emptyData?: number;
};

export let zCachedPartSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'CachedPartSt' });

assertTypesEqual<CachedPartSt, z.infer<typeof zCachedPartSt>>({ value: true });
