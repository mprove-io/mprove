import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetDashboardCheckExistsAndAccessError,
  zGetDashboardCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-error';
import {
  type GetDashboardXUsingDashboardTabError,
  zGetDashboardXUsingDashboardTabError
} from '#common/types/backend/function-errors/get-dashboard-x-using-dashboard-tab-error';

export type GetDashboardXCheckExistsAndAccessError =
  | GetDashboardCheckExistsAndAccessError
  | GetDashboardXUsingDashboardTabError;

export const zGetDashboardXCheckExistsAndAccessError = z.union([
  zGetDashboardCheckExistsAndAccessError,
  zGetDashboardXUsingDashboardTabError
]);

assertTypesEqual<
  GetDashboardXCheckExistsAndAccessError,
  z.infer<typeof zGetDashboardXCheckExistsAndAccessError>
>({ value: true });
