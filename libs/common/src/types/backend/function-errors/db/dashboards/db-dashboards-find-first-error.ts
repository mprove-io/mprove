import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardEntToTabError,
  zDashboardEntToTabError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';

export type DbDashboardsFindFirstError = DashboardEntToTabError;

export let zDbDashboardsFindFirstError = zDashboardEntToTabError;

assertTypesEqual<
  DbDashboardsFindFirstError,
  z.infer<typeof zDbDashboardsFindFirstError>
>({
  value: true
});
