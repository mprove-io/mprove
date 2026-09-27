import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionSampleInput = {
  projectId: string;
  envId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
};

export type ToBackendGetConnectionSampleRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetConnectionSampleInput;
};

export let zToBackendGetConnectionSampleInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    schemaName: z.string(),
    tableName: z.string(),
    columnName: z.string().nullish(),
    offset: z.number().nullish()
  })
  .meta({ id: 'ToBackendGetConnectionSampleInput' });

export let zToBackendGetConnectionSampleRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetConnectionSampleInput
  })
  .meta({ id: 'ToBackendGetConnectionSampleRequest' });

assertTypesEqual<
  ToBackendGetConnectionSampleInput,
  z.infer<typeof zToBackendGetConnectionSampleInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionSampleRequest,
  z.infer<typeof zToBackendGetConnectionSampleRequest>
>({ value: true });
