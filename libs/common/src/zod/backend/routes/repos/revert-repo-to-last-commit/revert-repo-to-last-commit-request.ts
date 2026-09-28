import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRevertRepoToLastCommitRequest = {
  operation: 'revertRepoToLastCommit';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendRevertRepoToLastCommitRequest = z
  .strictObject({
    operation: z.literal('revertRepoToLastCommit'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendRevertRepoToLastCommitInput' })
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitRequest' });

assertTypesEqual<
  ToBackendRevertRepoToLastCommitRequest,
  z.infer<typeof zToBackendRevertRepoToLastCommitRequest>
>({ value: true });
