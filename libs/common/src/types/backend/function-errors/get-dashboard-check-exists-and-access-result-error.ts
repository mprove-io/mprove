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
  type DashboardEntToTabResultError,
  zDashboardEntToTabResultError
} from '#common/types/backend/function-errors/dashboard-ent-to-tab-result-error';

export type GetDashboardCheckExistsAndAccessResultError =
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendForbiddenDashboardError
  | DashboardEntToTabResultError;

export let zGetDashboardCheckExistsAndAccessResultError = z.union([
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendForbiddenDashboardError,
  zDashboardEntToTabResultError
]);

assertTypesEqual<
  GetDashboardCheckExistsAndAccessResultError,
  z.infer<typeof zGetDashboardCheckExistsAndAccessResultError>
>({ value: true });
