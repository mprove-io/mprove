import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardEntToTabResultError,
  zDashboardEntToTabResultError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-result-error';

export type GetDashboardPartsResultError = DashboardEntToTabResultError;

export let zGetDashboardPartsResultError = zDashboardEntToTabResultError;

assertTypesEqual<
  GetDashboardPartsResultError,
  z.infer<typeof zGetDashboardPartsResultError>
>({ value: true });
