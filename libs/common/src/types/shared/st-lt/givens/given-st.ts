import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type GivenSt = {
  values: string[];
};

export let zGivenSt = z
  .object({ values: z.array(z.string()) })
  .meta({ id: 'GivenSt' });

assertTypesEqual<GivenSt, z.infer<typeof zGivenSt>>({ value: true });
