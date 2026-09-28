import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ModelInfo, zModelInfo } from '#common/zod/backend/model-info';

export type ToBackendCreateFileRequest = {
  operation: 'createFile';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    parentNodeId: string;
    fileName: string;
    modelInfo?: ModelInfo;
  };
};

export let zToBackendCreateFileRequest = z
  .strictObject({
    operation: z.literal('createFile'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        parentNodeId: z.string(),
        fileName: z.string(),
        modelInfo: zModelInfo.nullish()
      })
      .meta({ id: 'ToBackendCreateFileInput' })
  })
  .meta({ id: 'ToBackendCreateFileRequest' });

assertTypesEqual<
  ToBackendCreateFileRequest,
  z.infer<typeof zToBackendCreateFileRequest>
>({ value: true });
