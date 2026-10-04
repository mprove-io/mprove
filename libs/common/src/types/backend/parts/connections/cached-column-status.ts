import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const cachedColumnStatusValues = ['running', 'completed', 'error'] as const;

export type CachedColumnStatus = (typeof cachedColumnStatusValues)[number];

export let zCachedColumnStatus = z.enum(cachedColumnStatusValues);

assertTypesEqual<CachedColumnStatus, z.infer<typeof zCachedColumnStatus>>({
  value: true
});
