import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendClearCachedColumnInput = {
  projectId: string;
  envId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
};

export type ToBackendClearCachedColumnRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendClearCachedColumnInput;
};

export let zToBackendClearCachedColumnInput = z
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
  });

export let zToBackendClearCachedColumnRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendClearCachedColumnInput
  })
  .meta({ id: 'ToBackendClearCachedColumnRequest' });

assertTypesEqual<
  ToBackendClearCachedColumnInput,
  z.infer<typeof zToBackendClearCachedColumnInput>
>({ value: true });

assertTypesEqual<
  ToBackendClearCachedColumnRequest,
  z.infer<typeof zToBackendClearCachedColumnRequest>
>({ value: true });
