import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type StructSt = {
  emptyData?: number;
};

export let zStructSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'StructSt' });

assertTypesEqual<StructSt, z.infer<typeof zStructSt>>({ value: true });
