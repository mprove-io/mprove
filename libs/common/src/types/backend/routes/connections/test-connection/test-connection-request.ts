import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { StoreMethodEnum } from '#common/enums/store-method.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/connection-parts/connection-options';

export type ToBackendTestConnectionRequest = {
  operation: 'testConnection';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
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
    options?: ConnectionOptions;
    storeMethod?: StoreMethodEnum.Post | StoreMethodEnum.Get;
  };
};

export let zToBackendTestConnectionRequest = z
  .strictObject({
    operation: z.literal('testConnection'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string(),
        type: z.enum(ConnectionTypeEnum),
        options: zConnectionOptions.nullish(),
        storeMethod: z.enum(StoreMethodEnum).nullish()
      })
      .meta({ id: 'ToBackendTestConnectionInput' })
  })
  .meta({ id: 'ToBackendTestConnectionRequest' });

assertTypesEqual<
  ToBackendTestConnectionRequest,
  z.infer<typeof zToBackendTestConnectionRequest>
>({ value: true });
