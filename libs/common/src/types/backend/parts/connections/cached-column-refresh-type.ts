import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const cachedColumnRefreshTypeValues = ['full', 'sample'] as const;

export type CachedColumnRefreshType =
  (typeof cachedColumnRefreshTypeValues)[number];

export let zCachedColumnRefreshType = z.enum(cachedColumnRefreshTypeValues);

assertTypesEqual<
  CachedColumnRefreshType,
  z.infer<typeof zCachedColumnRefreshType>
>({
  value: true
});
