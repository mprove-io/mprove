import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSuggestFieldNotFoundError,
  zBackendSuggestFieldNotFoundError
} from '#common/types/backend/errors/backend-suggest-field-not-found-error';
import {
  type CheckChartOrModelAccessError,
  zCheckChartOrModelAccessError
} from '#common/types/backend/function-errors/check-chart-or-model-access-error';
import {
  type DbModelsFindFirstCheckExistsError,
  zDbModelsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/models/db-models-find-first-check-exists-error';
import {
  type GetChartCheckExistsError,
  zGetChartCheckExistsError
} from '#common/types/backend/function-errors/get-chart-check-exists-error';
import {
  type GetDashboardCheckExistsAndAccessError,
  zGetDashboardCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-error';
import {
  type GetModelCheckExistsAndAccessError,
  zGetModelCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import {
  type GetReportCheckExistsAndAccessError,
  zGetReportCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';

export type CheckParentMemberAccessError =
  | BackendSuggestFieldNotFoundError
  | GetDashboardCheckExistsAndAccessError
  | GetReportCheckExistsAndAccessError
  | GetChartCheckExistsError
  | DbModelsFindFirstCheckExistsError
  | GetModelCheckExistsAndAccessError
  | CheckChartOrModelAccessError;

export let zCheckParentMemberAccessError = z.union([
  zBackendSuggestFieldNotFoundError,
  zGetDashboardCheckExistsAndAccessError,
  zGetReportCheckExistsAndAccessError,
  zGetChartCheckExistsError,
  zDbModelsFindFirstCheckExistsError,
  zGetModelCheckExistsAndAccessError,
  zCheckChartOrModelAccessError
]);

assertTypesEqual<
  CheckParentMemberAccessError,
  z.infer<typeof zCheckParentMemberAccessError>
>({ value: true });
