import { z } from 'zod';

export let zOptionsSnowflake = z
  .object({
    account: z.string().nullish(),
    warehouse: z.string().nullish(),
    database: z.string().nullish(),
    username: z.string().nullish(),
    password: z.string().nullish()
  })
  .meta({ id: 'OptionsSnowflake' });

export type OptionsSnowflake = z.infer<typeof zOptionsSnowflake>;
