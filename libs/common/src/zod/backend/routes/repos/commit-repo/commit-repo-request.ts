import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCommitRepoRequest = {
  operation: 'commitRepo';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    branchId: string;
    repoId: string;
    commitMessage: string;
  };
};

export let zToBackendCommitRepoRequest = z
  .strictObject({
    operation: z.literal('commitRepo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        branchId: z.string(),
        repoId: z.string(),
        commitMessage: z.string()
      })
      .meta({ id: 'ToBackendCommitRepoInput' })
  })
  .meta({ id: 'ToBackendCommitRepoRequest' });

assertTypesEqual<
  ToBackendCommitRepoRequest,
  z.infer<typeof zToBackendCommitRepoRequest>
>({ value: true });
