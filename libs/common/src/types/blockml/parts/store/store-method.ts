import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const storeMethodValues = ['POST', 'GET'] as const;

export type StoreMethod = (typeof storeMethodValues)[number];

export let zStoreMethod = z.enum(storeMethodValues);

assertTypesEqual<StoreMethod, z.infer<typeof zStoreMethod>>({
  value: true
});
