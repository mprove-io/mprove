import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRefreshCachedColumnRequest = {
  operation: 'refreshCachedColumn';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
    refreshType: 'full' | 'sample';
    sampleSize?: number;
  };
};

export let zToBackendRefreshCachedColumnRequest = z
  .strictObject({
    operation: z.literal('refreshCachedColumn'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string(),
        schemaName: z.string(),
        tableName: z.string(),
        columnName: z.string(),
        refreshType: z.enum(['full', 'sample']),
        sampleSize: z.number().nullish()
      })
      .meta({ id: 'ToBackendRefreshCachedColumnInput' })
  })
  .meta({ id: 'ToBackendRefreshCachedColumnRequest' });

assertTypesEqual<
  ToBackendRefreshCachedColumnRequest,
  z.infer<typeof zToBackendRefreshCachedColumnRequest>
>({ value: true });
