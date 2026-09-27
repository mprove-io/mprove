import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateBranchInput = {
  projectId: string;
  newBranchId: string;
  fromBranchId: string;
  repoId: string;
};

export type ToBackendCreateBranchRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateBranchInput;
};

export let zToBackendCreateBranchInput = z
  .object({
    projectId: z.string(),
    newBranchId: z.string(),
    fromBranchId: z.string(),
    repoId: z.string()
  })
  .meta({ id: 'ToBackendCreateBranchInput' });

export let zToBackendCreateBranchRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateBranchInput
  })
  .meta({ id: 'ToBackendCreateBranchRequest' });

assertTypesEqual<
  ToBackendCreateBranchInput,
  z.infer<typeof zToBackendCreateBranchInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateBranchRequest,
  z.infer<typeof zToBackendCreateBranchRequest>
>({ value: true });
