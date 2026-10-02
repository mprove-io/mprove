import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProviderLt = {
  emptyData?: number;
};

export let zProviderLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'ProviderLt' });

assertTypesEqual<ProviderLt, z.infer<typeof zProviderLt>>({ value: true });
