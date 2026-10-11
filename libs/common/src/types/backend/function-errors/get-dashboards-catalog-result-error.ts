import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardEntToTabResultError,
  zDashboardEntToTabResultError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-result-error';

export type GetDashboardsCatalogResultError = DashboardEntToTabResultError;

export let zGetDashboardsCatalogResultError = zDashboardEntToTabResultError;

assertTypesEqual<
  GetDashboardsCatalogResultError,
  z.infer<typeof zGetDashboardsCatalogResultError>
>({ value: true });
