import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type CachedColumnLt = {
  emptyData?: number;
};

export let zCachedColumnLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'CachedColumnLt' });

assertTypesEqual<CachedColumnLt, z.infer<typeof zCachedColumnLt>>({
  value: true
});
