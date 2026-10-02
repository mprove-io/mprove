import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendViewCachedColumnRequest = {
  operation: 'viewCachedColumn';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
    offset: number;
  };
};

export let zToBackendViewCachedColumnRequest = z
  .strictObject({
    operation: z.literal('viewCachedColumn'),
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
        offset: z.number()
      })
      .meta({
        id: 'ToBackendViewCachedColumnInput'
      })
  })
  .meta({ id: 'ToBackendViewCachedColumnRequest' });

assertTypesEqual<
  ToBackendViewCachedColumnRequest,
  z.infer<typeof zToBackendViewCachedColumnRequest>
>({ value: true });
