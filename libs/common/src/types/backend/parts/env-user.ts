import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type EnvUser = {
  userId: string;
  alias: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

export let zEnvUser = z
  .object({
    userId: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string()
  })
  .meta({ id: 'EnvUser' });

assertTypesEqual<EnvUser, z.infer<typeof zEnvUser>>({ value: true });
