import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MconfigSt = {
  emptyData?: number;
};

export let zMconfigSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'MconfigSt' });

assertTypesEqual<MconfigSt, z.infer<typeof zMconfigSt>>({ value: true });
