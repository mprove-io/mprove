import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDashboardCreatorIdMismatchError,
  zBackendDashboardCreatorIdMismatchError
} from '#common/types/backend/errors/backend-dashboard-creator-id-mismatch-error';
import {
  type BackendForbiddenDashboardError,
  zBackendForbiddenDashboardError
} from '#common/types/backend/errors/backend-forbidden-dashboard-error';
import {
  type DbDashboardsFindFirstCheckExistsError,
  zDbDashboardsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/dashboards/db-dashboards-find-first-check-exists-error';

export type GetDashboardCheckExistsAndAccessError =
  | BackendDashboardCreatorIdMismatchError
  | BackendForbiddenDashboardError
  | DbDashboardsFindFirstCheckExistsError;

export let zGetDashboardCheckExistsAndAccessError = z.union([
  zBackendDashboardCreatorIdMismatchError,
  zBackendForbiddenDashboardError,
  zDbDashboardsFindFirstCheckExistsError
]);

assertTypesEqual<
  GetDashboardCheckExistsAndAccessError,
  z.infer<typeof zGetDashboardCheckExistsAndAccessError>
>({ value: true });
