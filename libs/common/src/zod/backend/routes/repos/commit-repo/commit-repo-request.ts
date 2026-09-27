import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCommitRepoInput = {
  projectId: string;
  branchId: string;
  repoId: string;
  commitMessage: string;
};

export type ToBackendCommitRepoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCommitRepoInput;
};

export let zToBackendCommitRepoInput = z
  .object({
    projectId: z.string(),
    branchId: z.string(),
    repoId: z.string(),
    commitMessage: z.string()
  })
  .meta({ id: 'ToBackendCommitRepoInput' });

export let zToBackendCommitRepoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCommitRepoInput
  })
  .meta({ id: 'ToBackendCommitRepoRequest' });

assertTypesEqual<
  ToBackendCommitRepoInput,
  z.infer<typeof zToBackendCommitRepoInput>
>({ value: true });

assertTypesEqual<
  ToBackendCommitRepoRequest,
  z.infer<typeof zToBackendCommitRepoRequest>
>({ value: true });
