import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendValidateFilesInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendValidateFilesRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendValidateFilesInput;
};

export let zToBackendValidateFilesInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendValidateFilesInput' });

export let zToBackendValidateFilesRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendValidateFilesInput
  })
  .meta({ id: 'ToBackendValidateFilesRequest' });

assertTypesEqual<
  ToBackendValidateFilesInput,
  z.infer<typeof zToBackendValidateFilesInput>
>({ value: true });

assertTypesEqual<
  ToBackendValidateFilesRequest,
  z.infer<typeof zToBackendValidateFilesRequest>
>({ value: true });
