import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type GivenLt = {
  emptyData?: number;
};

export let zGivenLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'GivenLt' });

assertTypesEqual<GivenLt, z.infer<typeof zGivenLt>>({ value: true });
