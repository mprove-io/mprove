import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteFileRequest = {
  operation: 'deleteFile';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fileNodeId: string;
  };
};

export let zToBackendDeleteFileRequest = z
  .strictObject({
    operation: z.literal('deleteFile'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fileNodeId: z.string()
      })
      .meta({ id: 'ToBackendDeleteFileInput' })
  })
  .meta({ id: 'ToBackendDeleteFileRequest' });

assertTypesEqual<
  ToBackendDeleteFileRequest,
  z.infer<typeof zToBackendDeleteFileRequest>
>({ value: true });
