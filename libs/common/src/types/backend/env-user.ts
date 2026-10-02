import { z } from 'zod';

export let zEnvUser = z
  .object({
    userId: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string()
  })
  .meta({ id: 'EnvUser' });

export type EnvUser = z.infer<typeof zEnvUser>;
