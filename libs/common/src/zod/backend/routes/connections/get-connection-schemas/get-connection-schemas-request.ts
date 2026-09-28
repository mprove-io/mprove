import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionSchemasRequest = {
  operation: 'getConnectionSchemas';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    repoId: string;
    branchId: string;
    isRefreshExistingCache: boolean;
  };
};

export let zToBackendGetConnectionSchemasRequest = z
  .strictObject({
    operation: z.literal('getConnectionSchemas'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        isRefreshExistingCache: z.boolean()
      })
      .meta({ id: 'ToBackendGetConnectionSchemasInput' })
  })
  .meta({ id: 'ToBackendGetConnectionSchemasRequest' });

assertTypesEqual<
  ToBackendGetConnectionSchemasRequest,
  z.infer<typeof zToBackendGetConnectionSchemasRequest>
>({ value: true });
