import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SessionLt = {
  emptyData?: number;
};

export let zSessionLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'SessionLt' });

assertTypesEqual<SessionLt, z.infer<typeof zSessionLt>>({ value: true });
