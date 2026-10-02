import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type EnvLt = {
  emptyData?: number;
};

export let zEnvLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'EnvLt' });

assertTypesEqual<EnvLt, z.infer<typeof zEnvLt>>({ value: true });
