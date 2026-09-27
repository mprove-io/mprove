import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetCachedColumnsInput = {
  projectId: string;
  envId: string;
  columns: {
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
  }[];
};

export type ToBackendGetCachedColumnsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetCachedColumnsInput;
};

export let zToBackendGetCachedColumnsInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    columns: z.array(
      z.object({
        connectionId: z.string(),
        schemaName: z.string(),
        tableName: z.string(),
        columnName: z.string()
      })
    )
  })
  .meta({ id: 'ToBackendGetCachedColumnsInput' });

export let zToBackendGetCachedColumnsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetCachedColumnsInput
  })
  .meta({ id: 'ToBackendGetCachedColumnsRequest' });

assertTypesEqual<
  ToBackendGetCachedColumnsInput,
  z.infer<typeof zToBackendGetCachedColumnsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetCachedColumnsRequest,
  z.infer<typeof zToBackendGetCachedColumnsRequest>
>({ value: true });
