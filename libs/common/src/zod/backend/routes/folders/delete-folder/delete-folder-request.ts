import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteFolderInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  folderNodeId: string;
};

export type ToBackendDeleteFolderRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteFolderInput;
};

export let zToBackendDeleteFolderInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    folderNodeId: z.string()
  })
  .meta({ id: 'ToBackendDeleteFolderInput' });

export let zToBackendDeleteFolderRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteFolderInput
  })
  .meta({ id: 'ToBackendDeleteFolderRequest' });

assertTypesEqual<
  ToBackendDeleteFolderInput,
  z.infer<typeof zToBackendDeleteFolderInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteFolderRequest,
  z.infer<typeof zToBackendDeleteFolderRequest>
>({ value: true });
