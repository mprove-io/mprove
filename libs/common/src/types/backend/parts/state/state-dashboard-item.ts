import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type StateDashboardItem = { dashboardId: string; url: string };

export let zStateDashboardItem = z
  .object({
    dashboardId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateDashboardItem' });

assertTypesEqual<StateDashboardItem, z.infer<typeof zStateDashboardItem>>({
  value: true
});
