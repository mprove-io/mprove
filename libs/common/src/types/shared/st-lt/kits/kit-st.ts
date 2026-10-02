import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type KitSt = {
  emptyData?: number;
};

export let zKitSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'KitSt' });

assertTypesEqual<KitSt, z.infer<typeof zKitSt>>({ value: true });
