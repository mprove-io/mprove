import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRevertRepoToRemoteRequest = {
  operation: 'revertRepoToRemote';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendRevertRepoToRemoteRequest = z
  .strictObject({
    operation: z.literal('revertRepoToRemote'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendRevertRepoToRemoteInput' })
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteRequest' });

assertTypesEqual<
  ToBackendRevertRepoToRemoteRequest,
  z.infer<typeof zToBackendRevertRepoToRemoteRequest>
>({ value: true });
