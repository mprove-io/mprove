import type { ConnectionOptions } from 'trino-client';
import { z } from 'zod';

type OptionsPrestoTrinoCommonOwnKeys =
  | 'server'
  | 'internalServer'
  | 'catalog'
  | 'schema'
  | 'user'
  | 'password'
  | 'extraConfig';

export let zOptionsPrestoTrinoCommon = z
  .object({
    server: z.string().nullish(),
    internalServer: z.string().nullish(),
    catalog: z.string().nullish(),
    schema: z.string().nullish(),
    user: z.string().nullish(),
    password: z.string().nullish(),
    extraConfig: z
      .custom<
        Partial<Omit<ConnectionOptions, OptionsPrestoTrinoCommonOwnKeys>>
      >()
      .nullish()
  })
  .meta({ id: 'OptionsPrestoTrinoCommon' });

export type OptionsPrestoTrinoCommon = z.infer<
  typeof zOptionsPrestoTrinoCommon
>;
