import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetCachedColumnsRequest = {
  operation: 'getCachedColumns';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    columns: {
      connectionId: string;
      schemaName: string;
      tableName: string;
      columnName: string;
    }[];
  };
};

export let zToBackendGetCachedColumnsRequest = z
  .strictObject({
    operation: z.literal('getCachedColumns'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendGetCachedColumnsInput' })
  })
  .meta({ id: 'ToBackendGetCachedColumnsRequest' });

assertTypesEqual<
  ToBackendGetCachedColumnsRequest,
  z.infer<typeof zToBackendGetCachedColumnsRequest>
>({ value: true });
