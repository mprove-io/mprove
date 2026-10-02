import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetRepoRequest = {
  operation: 'getRepo';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    isFetch: boolean;
  };
};

export let zToBackendGetRepoRequest = z
  .strictObject({
    operation: z.literal('getRepo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        isFetch: z.boolean()
      })
      .meta({ id: 'ToBackendGetRepoInput' })
  })
  .meta({ id: 'ToBackendGetRepoRequest' });

assertTypesEqual<
  ToBackendGetRepoRequest,
  z.infer<typeof zToBackendGetRepoRequest>
>({ value: true });
