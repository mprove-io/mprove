import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteBranchRequest = {
  operation: 'deleteBranch';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
  };
};

export let zToBackendDeleteBranchRequest = z
  .strictObject({
    operation: z.literal('deleteBranch'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string()
      })
      .meta({ id: 'ToBackendDeleteBranchInput' })
  })
  .meta({ id: 'ToBackendDeleteBranchRequest' });

assertTypesEqual<
  ToBackendDeleteBranchRequest,
  z.infer<typeof zToBackendDeleteBranchRequest>
>({ value: true });
