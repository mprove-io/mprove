import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRevertRepoToLastCommitInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendRevertRepoToLastCommitRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRevertRepoToLastCommitInput;
};

export let zToBackendRevertRepoToLastCommitInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitInput' });

export let zToBackendRevertRepoToLastCommitRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRevertRepoToLastCommitInput
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitRequest' });

assertTypesEqual<
  ToBackendRevertRepoToLastCommitInput,
  z.infer<typeof zToBackendRevertRepoToLastCommitInput>
>({ value: true });

assertTypesEqual<
  ToBackendRevertRepoToLastCommitRequest,
  z.infer<typeof zToBackendRevertRepoToLastCommitRequest>
>({ value: true });
