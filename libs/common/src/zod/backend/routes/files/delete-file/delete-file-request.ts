import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteFileInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  fileNodeId: string;
};

export type ToBackendDeleteFileRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteFileInput;
};

export let zToBackendDeleteFileInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fileNodeId: z.string()
  })
  .meta({ id: 'ToBackendDeleteFileInput' });

export let zToBackendDeleteFileRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteFileInput
  })
  .meta({ id: 'ToBackendDeleteFileRequest' });

assertTypesEqual<
  ToBackendDeleteFileInput,
  z.infer<typeof zToBackendDeleteFileInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteFileRequest,
  z.infer<typeof zToBackendDeleteFileRequest>
>({ value: true });
