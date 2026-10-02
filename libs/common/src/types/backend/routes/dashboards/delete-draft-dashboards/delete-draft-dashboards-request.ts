import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDraftDashboardsRequest = {
  operation: 'deleteDraftDashboards';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    dashboardIds: string[];
  };
};

export let zToBackendDeleteDraftDashboardsRequest = z
  .strictObject({
    operation: z.literal('deleteDraftDashboards'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        dashboardIds: z.array(z.string())
      })
      .meta({ id: 'ToBackendDeleteDraftDashboardsInput' })
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsRequest' });

assertTypesEqual<
  ToBackendDeleteDraftDashboardsRequest,
  z.infer<typeof zToBackendDeleteDraftDashboardsRequest>
>({ value: true });
