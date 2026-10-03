import type { ConnectionOptions } from 'trino-client';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

type OptionsPrestoTrinoCommonOwnKeys =
  | 'server'
  | 'internalServer'
  | 'catalog'
  | 'schema'
  | 'user'
  | 'password'
  | 'extraConfig';

export type OptionsPrestoTrinoCommon = {
  server?: string;
  internalServer?: string;
  catalog?: string;
  schema?: string;
  user?: string;
  password?: string;
  extraConfig?: Partial<
    Omit<ConnectionOptions, OptionsPrestoTrinoCommonOwnKeys>
  >;
};

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

assertTypesEqual<
  OptionsPrestoTrinoCommon,
  z.infer<typeof zOptionsPrestoTrinoCommon>
>({ value: true });
