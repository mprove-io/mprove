import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type DconfigSt = {
  hashSecret: string;
  hashSecretCheck: string;
};

export let zDconfigSt = z
  .object({
    hashSecret: z.string(),
    hashSecretCheck: z.string()
  })
  .meta({ id: 'DconfigSt' });

assertTypesEqual<DconfigSt, z.infer<typeof zDconfigSt>>({ value: true });
