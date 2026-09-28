import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCancelQueriesRequest = {
  operation: 'cancelQueries';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    mconfigIds: string[];
  };
};

export let zToBackendCancelQueriesRequest = z
  .strictObject({
    operation: z.literal('cancelQueries'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        mconfigIds: z.array(z.string()).min(1)
      })
      .meta({ id: 'ToBackendCancelQueriesInput' })
  })
  .meta({ id: 'ToBackendCancelQueriesRequest' });

assertTypesEqual<
  ToBackendCancelQueriesRequest,
  z.infer<typeof zToBackendCancelQueriesRequest>
>({ value: true });
