import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRunQueriesDryRequest = {
  operation: 'runQueriesDry';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    mconfigIds: string[];
    dryId: string;
  };
};

export let zToBackendRunQueriesDryRequest = z
  .strictObject({
    operation: z.literal('runQueriesDry'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        mconfigIds: z.array(z.string()).min(1),
        dryId: z.string()
      })
      .meta({ id: 'ToBackendRunQueriesDryInput' })
  })
  .meta({ id: 'ToBackendRunQueriesDryRequest' });

assertTypesEqual<
  ToBackendRunQueriesDryRequest,
  z.infer<typeof zToBackendRunQueriesDryRequest>
>({ value: true });
