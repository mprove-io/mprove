import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRenameCatalogNodeRequest = {
  operation: 'renameCatalogNode';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    nodeId: string;
    newName: string;
  };
};

export let zToBackendRenameCatalogNodeRequest = z
  .strictObject({
    operation: z.literal('renameCatalogNode'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        nodeId: z.string(),
        newName: z.string()
      })
      .meta({ id: 'ToBackendRenameCatalogNodeInput' })
  })
  .meta({ id: 'ToBackendRenameCatalogNodeRequest' });

assertTypesEqual<
  ToBackendRenameCatalogNodeRequest,
  z.infer<typeof zToBackendRenameCatalogNodeRequest>
>({ value: true });
