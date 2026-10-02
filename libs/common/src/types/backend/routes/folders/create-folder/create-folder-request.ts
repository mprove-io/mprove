import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateFolderRequest = {
  operation: 'createFolder';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    parentNodeId: string;
    folderName: string;
  };
};

export let zToBackendCreateFolderRequest = z
  .strictObject({
    operation: z.literal('createFolder'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        parentNodeId: z.string(),
        folderName: z.string()
      })
      .meta({ id: 'ToBackendCreateFolderInput' })
  })
  .meta({ id: 'ToBackendCreateFolderRequest' });

assertTypesEqual<
  ToBackendCreateFolderRequest,
  z.infer<typeof zToBackendCreateFolderRequest>
>({ value: true });
