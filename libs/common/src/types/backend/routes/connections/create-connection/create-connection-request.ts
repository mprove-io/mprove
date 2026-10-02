import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';

export type ToBackendCreateConnectionRequest = {
  operation: 'createConnection';
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
  };
};

export let zToBackendCreateConnectionRequest = z
  .strictObject({
    operation: z.literal('createConnection'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string().regex(/^[a-z0-9_]+$/, {
          message:
            'connectionId must contain only lowercase letters, digits or underscores'
        }),
        type: z.enum(ConnectionTypeEnum),
        options: zConnectionOptions.nullish()
      })
      .meta({ id: 'ToBackendCreateConnectionInput' })
  })
  .meta({ id: 'ToBackendCreateConnectionRequest' });

assertTypesEqual<
  ToBackendCreateConnectionRequest,
  z.infer<typeof zToBackendCreateConnectionRequest>
>({ value: true });
