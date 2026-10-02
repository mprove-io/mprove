import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type UconfigLt = {
  emptyData?: number;
};

export let zUconfigLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'UconfigLt' });

assertTypesEqual<UconfigLt, z.infer<typeof zUconfigLt>>({ value: true });
