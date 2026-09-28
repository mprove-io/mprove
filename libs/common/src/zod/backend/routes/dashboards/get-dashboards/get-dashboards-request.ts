import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetDashboardsRequest = {
  operation: 'getDashboards';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendGetDashboardsRequest = z
  .strictObject({
    operation: z.literal('getDashboards'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendGetDashboardsInput' })
  })
  .meta({ id: 'ToBackendGetDashboardsRequest' });

assertTypesEqual<
  ToBackendGetDashboardsRequest,
  z.infer<typeof zToBackendGetDashboardsRequest>
>({ value: true });
