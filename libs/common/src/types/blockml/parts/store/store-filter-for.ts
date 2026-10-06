import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const storeFilterForValues = ['Filter', 'Result'] as const;

export type StoreFilterFor = (typeof storeFilterForValues)[number];

export let zStoreFilterFor = z.enum(storeFilterForValues);

assertTypesEqual<StoreFilterFor, z.infer<typeof zStoreFilterFor>>({
  value: true
});
