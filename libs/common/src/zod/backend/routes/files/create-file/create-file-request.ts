import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ModelInfo, zModelInfo } from '#common/zod/backend/model-info';

export type ToBackendCreateFileInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
  fileName: string;
  modelInfo?: ModelInfo;
};

export type ToBackendCreateFileRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateFileInput;
};

export let zToBackendCreateFileInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    parentNodeId: z.string(),
    fileName: z.string(),
    modelInfo: zModelInfo.nullish()
  })
  .meta({ id: 'ToBackendCreateFileInput' });

export let zToBackendCreateFileRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateFileInput
  })
  .meta({ id: 'ToBackendCreateFileRequest' });

assertTypesEqual<
  ToBackendCreateFileInput,
  z.infer<typeof zToBackendCreateFileInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateFileRequest,
  z.infer<typeof zToBackendCreateFileRequest>
>({ value: true });
