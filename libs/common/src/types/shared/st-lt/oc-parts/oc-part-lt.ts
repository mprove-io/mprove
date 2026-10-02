import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OcPartLt = {
  emptyData?: number;
};

export let zOcPartLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcPartLt' });

assertTypesEqual<OcPartLt, z.infer<typeof zOcPartLt>>({ value: true });
