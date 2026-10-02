import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BridgeSt = {
  emptyData?: number;
};

export let zBridgeSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BridgeSt' });

assertTypesEqual<BridgeSt, z.infer<typeof zBridgeSt>>({ value: true });
