import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRunQueriesRequest = {
  operation: 'runQueries';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    mconfigIds: string[];
    poolSize?: number;
  };
};

export let zToBackendRunQueriesRequest = z
  .strictObject({
    operation: z.literal('runQueries'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        mconfigIds: z.array(z.string()).min(1),
        poolSize: z.number().int().positive().nullish()
      })
      .meta({ id: 'ToBackendRunQueriesInput' })
  })
  .meta({ id: 'ToBackendRunQueriesRequest' });

assertTypesEqual<
  ToBackendRunQueriesRequest,
  z.infer<typeof zToBackendRunQueriesRequest>
>({ value: true });
