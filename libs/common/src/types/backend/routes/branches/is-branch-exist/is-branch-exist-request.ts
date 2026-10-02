import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsBranchExistRequest = {
  operation: 'isBranchExist';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    branchId: string;
    repoId: string;
  };
};

export let zToBackendIsBranchExistRequest = z
  .strictObject({
    operation: z.literal('isBranchExist'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        branchId: z.string(),
        repoId: z.string()
      })
      .meta({ id: 'ToBackendIsBranchExistInput' })
  })
  .meta({ id: 'ToBackendIsBranchExistRequest' });

assertTypesEqual<
  ToBackendIsBranchExistRequest,
  z.infer<typeof zToBackendIsBranchExistRequest>
>({ value: true });
