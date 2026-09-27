import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSaveFileInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  fileNodeId: string;
  content: string;
};

export type ToBackendSaveFileRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSaveFileInput;
};

export let zToBackendSaveFileInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fileNodeId: z.string(),
    content: z.string()
  })
  .meta({ id: 'ToBackendSaveFileInput' });

export let zToBackendSaveFileRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSaveFileInput
  })
  .meta({ id: 'ToBackendSaveFileRequest' });

assertTypesEqual<
  ToBackendSaveFileInput,
  z.infer<typeof zToBackendSaveFileInput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveFileRequest,
  z.infer<typeof zToBackendSaveFileRequest>
>({ value: true });
