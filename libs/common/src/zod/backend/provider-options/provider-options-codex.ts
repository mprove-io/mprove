import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ProviderOptionsCodex = { [key: string]: never };

export let zProviderOptionsCodex = z
  .strictObject({})
  .meta({ id: 'ProviderOptionsCodex' });

assertTypesEqual<ProviderOptionsCodex, z.infer<typeof zProviderOptionsCodex>>({
  value: true
});
