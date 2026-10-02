import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OcSessionLt = {
  emptyData?: number;
};

export let zOcSessionLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcSessionLt' });

assertTypesEqual<OcSessionLt, z.infer<typeof zOcSessionLt>>({ value: true });
