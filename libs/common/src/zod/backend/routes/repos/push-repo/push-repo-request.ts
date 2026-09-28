import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPushRepoRequest = {
  operation: 'pushRepo';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendPushRepoRequest = z
  .strictObject({
    operation: z.literal('pushRepo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendPushRepoInput' })
  })
  .meta({ id: 'ToBackendPushRepoRequest' });

assertTypesEqual<
  ToBackendPushRepoRequest,
  z.infer<typeof zToBackendPushRepoRequest>
>({ value: true });
