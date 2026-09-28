import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateBranchRequest = {
  operation: 'createBranch';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    newBranchId: string;
    fromBranchId: string;
    repoId: string;
  };
};

export let zToBackendCreateBranchRequest = z
  .strictObject({
    operation: z.literal('createBranch'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        newBranchId: z.string(),
        fromBranchId: z.string(),
        repoId: z.string()
      })
      .meta({ id: 'ToBackendCreateBranchInput' })
  })
  .meta({ id: 'ToBackendCreateBranchRequest' });

assertTypesEqual<
  ToBackendCreateBranchRequest,
  z.infer<typeof zToBackendCreateBranchRequest>
>({ value: true });
