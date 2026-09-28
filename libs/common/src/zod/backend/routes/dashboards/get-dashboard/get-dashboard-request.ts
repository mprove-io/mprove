import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendGetDashboardRequest = {
  operation: 'getDashboard';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    dashboardId: string;
    timezone: string;
  };
};

export let zToBackendGetDashboardRequest = z
  .strictObject({
    operation: z.literal('getDashboard'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        dashboardId: z.string(),
        timezone: zTimezone
      })
      .meta({ id: 'ToBackendGetDashboardInput' })
  })
  .meta({ id: 'ToBackendGetDashboardRequest' });

assertTypesEqual<
  ToBackendGetDashboardRequest,
  z.infer<typeof zToBackendGetDashboardRequest>
>({ value: true });
