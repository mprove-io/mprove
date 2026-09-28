import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionSampleRequest = {
  operation: 'getConnectionSample';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName?: string;
    offset?: number;
  };
};

export let zToBackendGetConnectionSampleRequest = z
  .strictObject({
    operation: z.literal('getConnectionSample'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string(),
        schemaName: z.string(),
        tableName: z.string(),
        columnName: z.string().nullish(),
        offset: z.number().nullish()
      })
      .meta({ id: 'ToBackendGetConnectionSampleInput' })
  })
  .meta({ id: 'ToBackendGetConnectionSampleRequest' });

assertTypesEqual<
  ToBackendGetConnectionSampleRequest,
  z.infer<typeof zToBackendGetConnectionSampleRequest>
>({ value: true });
