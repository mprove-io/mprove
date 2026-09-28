import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendMergeRepoRequest = {
  operation: 'mergeRepo';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    theirBranchId: string;
    isTheirBranchRemote: boolean;
  };
};

export let zToBackendMergeRepoRequest = z
  .strictObject({
    operation: z.literal('mergeRepo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        theirBranchId: z.string(),
        isTheirBranchRemote: z.boolean()
      })
      .meta({ id: 'ToBackendMergeRepoInput' })
  })
  .meta({ id: 'ToBackendMergeRepoRequest' });

assertTypesEqual<
  ToBackendMergeRepoRequest,
  z.infer<typeof zToBackendMergeRepoRequest>
>({ value: true });
