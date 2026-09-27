import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendViewCachedColumnInput = {
  projectId: string;
  envId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  offset: number;
};

export type ToBackendViewCachedColumnRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendViewCachedColumnInput;
};

export let zToBackendViewCachedColumnInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    schemaName: z.string(),
    tableName: z.string(),
    columnName: z.string(),
    offset: z.number()
  })
  .meta({
    id: 'ToBackendViewCachedColumnInput'
  });

export let zToBackendViewCachedColumnRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendViewCachedColumnInput
  })
  .meta({ id: 'ToBackendViewCachedColumnRequest' });

assertTypesEqual<
  ToBackendViewCachedColumnInput,
  z.infer<typeof zToBackendViewCachedColumnInput>
>({ value: true });

assertTypesEqual<
  ToBackendViewCachedColumnRequest,
  z.infer<typeof zToBackendViewCachedColumnRequest>
>({ value: true });
