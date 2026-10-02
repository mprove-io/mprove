import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type UconfigSt = {
  emptyData?: number;
};

export let zUconfigSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'UconfigSt' });

assertTypesEqual<UconfigSt, z.infer<typeof zUconfigSt>>({ value: true });
