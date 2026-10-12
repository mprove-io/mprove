import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardEntToTabError,
  zDashboardEntToTabError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';

export type GetDashboardPartsError = DashboardEntToTabError;

export let zGetDashboardPartsError = zDashboardEntToTabError;

assertTypesEqual<
  GetDashboardPartsError,
  z.infer<typeof zGetDashboardPartsError>
>({ value: true });
