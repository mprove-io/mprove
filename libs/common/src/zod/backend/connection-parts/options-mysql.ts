import { z } from 'zod';

export let zOptionsMysql = z
  .object({
    host: z.string().nullish(),
    internalHost: z.string().nullish(),
    port: z.number().int().nullish(),
    internalPort: z.number().int().nullish(),
    database: z.string().nullish(),
    user: z.string().nullish(),
    password: z.string().nullish()
  })
  .meta({ id: 'OptionsMysql' });

export type OptionsMysql = z.infer<typeof zOptionsMysql>;
