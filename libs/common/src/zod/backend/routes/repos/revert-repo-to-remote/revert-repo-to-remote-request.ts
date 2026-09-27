import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRevertRepoToRemoteInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendRevertRepoToRemoteRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRevertRepoToRemoteInput;
};

export let zToBackendRevertRepoToRemoteInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteInput' });

export let zToBackendRevertRepoToRemoteRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRevertRepoToRemoteInput
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteRequest' });

assertTypesEqual<
  ToBackendRevertRepoToRemoteInput,
  z.infer<typeof zToBackendRevertRepoToRemoteInput>
>({ value: true });

assertTypesEqual<
  ToBackendRevertRepoToRemoteRequest,
  z.infer<typeof zToBackendRevertRepoToRemoteRequest>
>({ value: true });
