import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type CachedColumnSt = {
  emptyData?: number;
};

export let zCachedColumnSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'CachedColumnSt' });

assertTypesEqual<CachedColumnSt, z.infer<typeof zCachedColumnSt>>({
  value: true
});
