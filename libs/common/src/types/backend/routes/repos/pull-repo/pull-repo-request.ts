import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPullRepoRequest = {
  operation: 'pullRepo';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendPullRepoRequest = z
  .strictObject({
    operation: z.literal('pullRepo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendPullRepoInput' })
  })
  .meta({ id: 'ToBackendPullRepoRequest' });

assertTypesEqual<
  ToBackendPullRepoRequest,
  z.infer<typeof zToBackendPullRepoRequest>
>({ value: true });
