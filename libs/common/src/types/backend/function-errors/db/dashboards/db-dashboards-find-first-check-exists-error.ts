import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDashboardDoesNotExistError,
  zBackendDashboardDoesNotExistError
} from '#common/types/backend/errors/backend-dashboard-does-not-exist-error';
import {
  type DashboardEntToTabError,
  zDashboardEntToTabError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';

export type DbDashboardsFindFirstCheckExistsError =
  | DashboardEntToTabError
  | BackendDashboardDoesNotExistError;

export let zDbDashboardsFindFirstCheckExistsError = z.union([
  zDashboardEntToTabError,
  zBackendDashboardDoesNotExistError
]);

assertTypesEqual<
  DbDashboardsFindFirstCheckExistsError,
  z.infer<typeof zDbDashboardsFindFirstCheckExistsError>
>({
  value: true
});
