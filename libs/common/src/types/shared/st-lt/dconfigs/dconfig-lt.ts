import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type DconfigLt = {
  emptyData?: number;
};

export let zDconfigLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'DconfigLt' });

assertTypesEqual<DconfigLt, z.infer<typeof zDconfigLt>>({ value: true });
