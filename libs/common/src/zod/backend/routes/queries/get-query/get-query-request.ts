import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetQueryRequest = {
  operation: 'getQuery';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    mconfigId: string;
    queryId: string;
  };
};

export let zToBackendGetQueryRequest = z
  .strictObject({
    operation: z.literal('getQuery'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        mconfigId: z.string(),
        queryId: z.string()
      })
      .meta({ id: 'ToBackendGetQueryInput' })
  })
  .meta({ id: 'ToBackendGetQueryRequest' });

assertTypesEqual<
  ToBackendGetQueryRequest,
  z.infer<typeof zToBackendGetQueryRequest>
>({ value: true });
