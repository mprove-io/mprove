import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ConnectionItem = {
  connectionId: string;
  type:
    | ConnectionTypeEnum.PostgreSQL
    | ConnectionTypeEnum.MySQL
    | ConnectionTypeEnum.SnowFlake
    | ConnectionTypeEnum.BigQuery
    | ConnectionTypeEnum.Databricks
    | ConnectionTypeEnum.MotherDuck
    | ConnectionTypeEnum.Presto
    | ConnectionTypeEnum.Trino
    | ConnectionTypeEnum.GoogleApi
    | ConnectionTypeEnum.Api;
  baseUrl?: string;
  headerKeys?: string[];
  googleAuthScopes?: string[];
};

export let zConnectionItem = z
  .object({
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    baseUrl: z.string().nullish(),
    headerKeys: z.array(z.string()).nullish(),
    googleAuthScopes: z.array(z.string()).nullish()
  })
  .meta({ id: 'ConnectionItem' });

assertTypesEqual<ConnectionItem, z.infer<typeof zConnectionItem>>({
  value: true
});
