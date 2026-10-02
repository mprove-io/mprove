import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type CachedPartLt = {
  emptyData?: number;
};

export let zCachedPartLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'CachedPartLt' });

assertTypesEqual<CachedPartLt, z.infer<typeof zCachedPartLt>>({ value: true });
