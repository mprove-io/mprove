import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';
import {
  type ConnectionRawSchema,
  zConnectionRawSchema
} from '#common/types/backend/parts/connection-schemas/raw-schema';

export type ToBackendSeedRecordsInputConnectionsItem = {
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
  rawSchema?: ConnectionRawSchema;
};

export let zToBackendSeedRecordsInputConnectionsItem = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    options: zConnectionOptions.nullish(),
    rawSchema: zConnectionRawSchema.nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInputConnectionsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputConnectionsItem,
  z.infer<typeof zToBackendSeedRecordsInputConnectionsItem>
>({ value: true });
