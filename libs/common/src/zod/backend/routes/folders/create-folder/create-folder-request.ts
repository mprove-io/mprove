import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateFolderInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
  folderName: string;
};

export type ToBackendCreateFolderRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateFolderInput;
};

export let zToBackendCreateFolderInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    parentNodeId: z.string(),
    folderName: z.string()
  })
  .meta({ id: 'ToBackendCreateFolderInput' });

export let zToBackendCreateFolderRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateFolderInput
  })
  .meta({ id: 'ToBackendCreateFolderRequest' });

assertTypesEqual<
  ToBackendCreateFolderInput,
  z.infer<typeof zToBackendCreateFolderInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateFolderRequest,
  z.infer<typeof zToBackendCreateFolderRequest>
>({ value: true });
