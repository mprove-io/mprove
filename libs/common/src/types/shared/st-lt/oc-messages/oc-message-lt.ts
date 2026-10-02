import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OcMessageLt = {
  emptyData?: number;
};

export let zOcMessageLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcMessageLt' });

assertTypesEqual<OcMessageLt, z.infer<typeof zOcMessageLt>>({ value: true });
