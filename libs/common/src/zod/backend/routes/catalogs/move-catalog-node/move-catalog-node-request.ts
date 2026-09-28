import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendMoveCatalogNodeRequest = {
  operation: 'moveCatalogNode';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fromNodeId: string;
    toNodeId: string;
  };
};

export let zToBackendMoveCatalogNodeRequest = z
  .strictObject({
    operation: z.literal('moveCatalogNode'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fromNodeId: z.string(),
        toNodeId: z.string()
      })
      .meta({ id: 'ToBackendMoveCatalogNodeInput' })
  })
  .meta({ id: 'ToBackendMoveCatalogNodeRequest' });

assertTypesEqual<
  ToBackendMoveCatalogNodeRequest,
  z.infer<typeof zToBackendMoveCatalogNodeRequest>
>({ value: true });
