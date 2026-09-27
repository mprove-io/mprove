import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPullRepoInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendPullRepoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendPullRepoInput;
};

export let zToBackendPullRepoInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendPullRepoInput' });

export let zToBackendPullRepoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendPullRepoInput
  })
  .meta({ id: 'ToBackendPullRepoRequest' });

assertTypesEqual<
  ToBackendPullRepoInput,
  z.infer<typeof zToBackendPullRepoInput>
>({ value: true });

assertTypesEqual<
  ToBackendPullRepoRequest,
  z.infer<typeof zToBackendPullRepoRequest>
>({ value: true });
