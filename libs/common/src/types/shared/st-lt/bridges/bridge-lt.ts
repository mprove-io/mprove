import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BridgeLt = {
  emptyData?: number;
};

export let zBridgeLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BridgeLt' });

assertTypesEqual<BridgeLt, z.infer<typeof zBridgeLt>>({ value: true });
