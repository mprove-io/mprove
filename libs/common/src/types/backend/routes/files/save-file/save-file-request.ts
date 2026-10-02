import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSaveFileRequest = {
  operation: 'saveFile';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fileNodeId: string;
    content: string;
  };
};

export let zToBackendSaveFileRequest = z
  .strictObject({
    operation: z.literal('saveFile'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fileNodeId: z.string(),
        content: z.string()
      })
      .meta({ id: 'ToBackendSaveFileInput' })
  })
  .meta({ id: 'ToBackendSaveFileRequest' });

assertTypesEqual<
  ToBackendSaveFileRequest,
  z.infer<typeof zToBackendSaveFileRequest>
>({ value: true });
