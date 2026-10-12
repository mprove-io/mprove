import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardEntToTabError,
  zDashboardEntToTabError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';

export type GetDashboardsCatalogError = DashboardEntToTabError;

export let zGetDashboardsCatalogError = zDashboardEntToTabError;

assertTypesEqual<
  GetDashboardsCatalogError,
  z.infer<typeof zGetDashboardsCatalogError>
>({ value: true });
