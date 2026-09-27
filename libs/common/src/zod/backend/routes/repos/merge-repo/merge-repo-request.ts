import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendMergeRepoInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  theirBranchId: string;
  isTheirBranchRemote: boolean;
};

export type ToBackendMergeRepoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendMergeRepoInput;
};

export let zToBackendMergeRepoInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    theirBranchId: z.string(),
    isTheirBranchRemote: z.boolean()
  })
  .meta({ id: 'ToBackendMergeRepoInput' });

export let zToBackendMergeRepoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendMergeRepoInput
  })
  .meta({ id: 'ToBackendMergeRepoRequest' });

assertTypesEqual<
  ToBackendMergeRepoInput,
  z.infer<typeof zToBackendMergeRepoInput>
>({ value: true });

assertTypesEqual<
  ToBackendMergeRepoRequest,
  z.infer<typeof zToBackendMergeRepoRequest>
>({ value: true });
