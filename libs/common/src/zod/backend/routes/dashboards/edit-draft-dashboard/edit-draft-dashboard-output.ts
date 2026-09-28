import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type DashboardX, zDashboardX } from '#common/zod/backend/dashboard-x';

export type ToBackendEditDraftDashboardOutput = {
  dashboard: DashboardX;
};

export let zToBackendEditDraftDashboardOutput = z
  .object({
    dashboard: zDashboardX
  })
  .meta({ id: 'ToBackendEditDraftDashboardOutput' });

assertTypesEqual<
  ToBackendEditDraftDashboardOutput,
  z.infer<typeof zToBackendEditDraftDashboardOutput>
>({ value: true });
