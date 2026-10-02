import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OcEventLt = {
  emptyData?: number;
};

export let zOcEventLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcEventLt' });

assertTypesEqual<OcEventLt, z.infer<typeof zOcEventLt>>({ value: true });
