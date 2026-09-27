import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPushRepoInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendPushRepoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendPushRepoInput;
};

export let zToBackendPushRepoInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendPushRepoInput' });

export let zToBackendPushRepoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendPushRepoInput
  })
  .meta({ id: 'ToBackendPushRepoRequest' });

assertTypesEqual<
  ToBackendPushRepoInput,
  z.infer<typeof zToBackendPushRepoInput>
>({ value: true });

assertTypesEqual<
  ToBackendPushRepoRequest,
  z.infer<typeof zToBackendPushRepoRequest>
>({ value: true });
