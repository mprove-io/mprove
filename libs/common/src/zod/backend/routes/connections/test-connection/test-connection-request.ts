import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { StoreMethodEnum } from '#common/enums/store-method.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/zod/backend/connection-parts/connection-options';

export type ToBackendTestConnectionInput = {
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

export type ToBackendTestConnectionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendTestConnectionInput;
};

export let zToBackendTestConnectionInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    options: zConnectionOptions.nullish(),
    storeMethod: z.enum(StoreMethodEnum).nullish()
  })
  .meta({ id: 'ToBackendTestConnectionInput' });

export let zToBackendTestConnectionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendTestConnectionInput
  })
  .meta({ id: 'ToBackendTestConnectionRequest' });

assertTypesEqual<
  ToBackendTestConnectionInput,
  z.infer<typeof zToBackendTestConnectionInput>
>({ value: true });

assertTypesEqual<
  ToBackendTestConnectionRequest,
  z.infer<typeof zToBackendTestConnectionRequest>
>({ value: true });
