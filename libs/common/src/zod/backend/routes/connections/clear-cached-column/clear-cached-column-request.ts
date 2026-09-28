import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendClearCachedColumnRequest = {
  operation: 'clearCachedColumn';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
  };
};

export let zToBackendClearCachedColumnRequest = z
  .strictObject({
    operation: z.literal('clearCachedColumn'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string(),
        schemaName: z.string(),
        tableName: z.string(),
        columnName: z.string()
      })
      .meta({
        id: 'ToBackendClearCachedColumnInput'
      })
  })
  .meta({ id: 'ToBackendClearCachedColumnRequest' });

assertTypesEqual<
  ToBackendClearCachedColumnRequest,
  z.infer<typeof zToBackendClearCachedColumnRequest>
>({ value: true });
