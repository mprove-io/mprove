import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteBranchInput = {
  projectId: string;
  repoId: string;
  branchId: string;
};

export type ToBackendDeleteBranchRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteBranchInput;
};

export let zToBackendDeleteBranchInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string()
  })
  .meta({ id: 'ToBackendDeleteBranchInput' });

export let zToBackendDeleteBranchRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteBranchInput
  })
  .meta({ id: 'ToBackendDeleteBranchRequest' });

assertTypesEqual<
  ToBackendDeleteBranchInput,
  z.infer<typeof zToBackendDeleteBranchInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteBranchRequest,
  z.infer<typeof zToBackendDeleteBranchRequest>
>({ value: true });
