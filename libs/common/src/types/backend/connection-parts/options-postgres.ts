import { z } from 'zod';

export let zOptionsPostgres = z
  .object({
    host: z.string().nullish(),
    internalHost: z.string().nullish(),
    port: z.number().int().nullish(),
    internalPort: z.number().int().nullish(),
    database: z.string().nullish(),
    username: z.string().nullish(),
    password: z.string().nullish(),
    isSSL: z.boolean().nullish()
  })
  .meta({ id: 'OptionsPostgres' });

export type OptionsPostgres = z.infer<typeof zOptionsPostgres>;
