import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OptionsPostgres = {
  host?: string;
  internalHost?: string;
  port?: number;
  internalPort?: number;
  database?: string;
  username?: string;
  password?: string;
  isSSL?: boolean;
};

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

assertTypesEqual<OptionsPostgres, z.infer<typeof zOptionsPostgres>>({
  value: true
});
