import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRefreshCachedColumnInput = {
  projectId: string;
  envId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  refreshType: 'full' | 'sample';
  sampleSize?: number;
};

export type ToBackendRefreshCachedColumnRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRefreshCachedColumnInput;
};

export let zToBackendRefreshCachedColumnInput = z
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
  .meta({ id: 'ToBackendRefreshCachedColumnInput' });

export let zToBackendRefreshCachedColumnRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRefreshCachedColumnInput
  })
  .meta({ id: 'ToBackendRefreshCachedColumnRequest' });

assertTypesEqual<
  ToBackendRefreshCachedColumnInput,
  z.infer<typeof zToBackendRefreshCachedColumnInput>
>({ value: true });

assertTypesEqual<
  ToBackendRefreshCachedColumnRequest,
  z.infer<typeof zToBackendRefreshCachedColumnRequest>
>({ value: true });
