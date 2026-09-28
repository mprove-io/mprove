import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDashboardRequest = {
  operation: 'deleteDashboard';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    dashboardId: string;
  };
};

export let zToBackendDeleteDashboardRequest = z
  .strictObject({
    operation: z.literal('deleteDashboard'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        dashboardId: z.string()
      })
      .meta({ id: 'ToBackendDeleteDashboardInput' })
  })
  .meta({ id: 'ToBackendDeleteDashboardRequest' });

assertTypesEqual<
  ToBackendDeleteDashboardRequest,
  z.infer<typeof zToBackendDeleteDashboardRequest>
>({ value: true });
