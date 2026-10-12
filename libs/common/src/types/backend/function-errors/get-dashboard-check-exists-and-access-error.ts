import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDashboardCreatorIdMismatchError,
  zBackendDashboardCreatorIdMismatchError
} from '#common/types/backend/errors/backend-dashboard-creator-id-mismatch-error';
import {
  type BackendDashboardDoesNotExistError,
  zBackendDashboardDoesNotExistError
} from '#common/types/backend/errors/backend-dashboard-does-not-exist-error';
import {
  type BackendForbiddenDashboardError,
  zBackendForbiddenDashboardError
} from '#common/types/backend/errors/backend-forbidden-dashboard-error';
import {
  type DashboardEntToTabError,
  zDashboardEntToTabError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';

export type GetDashboardCheckExistsAndAccessError =
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendForbiddenDashboardError
  | DashboardEntToTabError;

export let zGetDashboardCheckExistsAndAccessError = z.union([
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendForbiddenDashboardError,
  zDashboardEntToTabError
]);

assertTypesEqual<
  GetDashboardCheckExistsAndAccessError,
  z.infer<typeof zGetDashboardCheckExistsAndAccessError>
>({ value: true });
