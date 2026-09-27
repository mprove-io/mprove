import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsBranchExistInput = {
  projectId: string;
  branchId: string;
  repoId: string;
};

export type ToBackendIsBranchExistRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendIsBranchExistInput;
};

export let zToBackendIsBranchExistInput = z
  .object({
    projectId: z.string(),
    branchId: z.string(),
    repoId: z.string()
  })
  .meta({ id: 'ToBackendIsBranchExistInput' });

export let zToBackendIsBranchExistRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendIsBranchExistInput
  })
  .meta({ id: 'ToBackendIsBranchExistRequest' });

assertTypesEqual<
  ToBackendIsBranchExistInput,
  z.infer<typeof zToBackendIsBranchExistInput>
>({ value: true });

assertTypesEqual<
  ToBackendIsBranchExistRequest,
  z.infer<typeof zToBackendIsBranchExistRequest>
>({ value: true });
