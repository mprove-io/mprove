import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetQueriesRequest = {
  operation: 'getQueries';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    mconfigIds: string[];
    skipData: boolean;
  };
};

export let zToBackendGetQueriesRequest = z
  .strictObject({
    operation: z.literal('getQueries'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        mconfigIds: z.array(z.string()).min(1),
        skipData: z.boolean()
      })
      .meta({ id: 'ToBackendGetQueriesInput' })
  })
  .meta({ id: 'ToBackendGetQueriesRequest' });

assertTypesEqual<
  ToBackendGetQueriesRequest,
  z.infer<typeof zToBackendGetQueriesRequest>
>({ value: true });
