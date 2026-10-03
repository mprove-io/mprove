import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OptionsSnowflake = {
  account?: string;
  warehouse?: string;
  database?: string;
  username?: string;
  password?: string;
};

export let zOptionsSnowflake = z
  .object({
    account: z.string().nullish(),
    warehouse: z.string().nullish(),
    database: z.string().nullish(),
    username: z.string().nullish(),
    password: z.string().nullish()
  })
  .meta({ id: 'OptionsSnowflake' });

assertTypesEqual<OptionsSnowflake, z.infer<typeof zOptionsSnowflake>>({
  value: true
});
