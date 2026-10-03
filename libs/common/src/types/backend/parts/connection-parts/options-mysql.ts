import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OptionsMysql = {
  host?: string;
  internalHost?: string;
  port?: number;
  internalPort?: number;
  database?: string;
  user?: string;
  password?: string;
};

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

assertTypesEqual<OptionsMysql, z.infer<typeof zOptionsMysql>>({ value: true });
