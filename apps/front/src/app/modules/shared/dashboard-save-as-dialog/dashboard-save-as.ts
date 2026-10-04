import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const dashboardSaveAsValues = [
  'NEW_DASHBOARD',
  'REPLACE_EXISTING_DASHBOARD'
] as const;

export type DashboardSaveAs = (typeof dashboardSaveAsValues)[number];

export let zDashboardSaveAs = z.enum(dashboardSaveAsValues);

assertTypesEqual<DashboardSaveAs, z.infer<typeof zDashboardSaveAs>>({
  value: true
});
