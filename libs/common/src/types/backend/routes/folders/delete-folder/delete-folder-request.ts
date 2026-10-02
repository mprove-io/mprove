import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteFolderRequest = {
  operation: 'deleteFolder';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    folderNodeId: string;
  };
};

export let zToBackendDeleteFolderRequest = z
  .strictObject({
    operation: z.literal('deleteFolder'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        folderNodeId: z.string()
      })
      .meta({ id: 'ToBackendDeleteFolderInput' })
  })
  .meta({ id: 'ToBackendDeleteFolderRequest' });

assertTypesEqual<
  ToBackendDeleteFolderRequest,
  z.infer<typeof zToBackendDeleteFolderRequest>
>({ value: true });
