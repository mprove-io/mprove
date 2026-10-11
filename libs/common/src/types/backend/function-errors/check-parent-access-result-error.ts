import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSuggestFieldNotFoundError,
  zBackendSuggestFieldNotFoundError
} from '#common/types/backend/errors/backend-suggest-field-not-found-error';
import {
  type CheckChartOrModelAccessResultError,
  zCheckChartOrModelAccessResultError
} from '#common/types/backend/function-errors/check-chart-or-model-access-result-error';
import {
  type GetChartCheckExistsResultError,
  zGetChartCheckExistsResultError
} from '#common/types/backend/function-errors/get-chart-check-exists-result-error';
import {
  type GetDashboardCheckExistsAndAccessResultError,
  zGetDashboardCheckExistsAndAccessResultError
} from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-result-error';
import {
  type GetModelCheckExistsAndAccessResultError,
  zGetModelCheckExistsAndAccessResultError
} from '#common/types/backend/function-errors/get-model-check-exists-and-access-result-error';
import {
  type GetModelCheckExistsResultError,
  zGetModelCheckExistsResultError
} from '#common/types/backend/function-errors/get-model-check-exists-result-error';
import {
  type GetReportCheckExistsAndAccessResultError,
  zGetReportCheckExistsAndAccessResultError
} from '#common/types/backend/function-errors/get-report-check-exists-and-access-result-error';

export type CheckParentAccessResultError =
  | BackendSuggestFieldNotFoundError
  | GetDashboardCheckExistsAndAccessResultError
  | GetReportCheckExistsAndAccessResultError
  | GetChartCheckExistsResultError
  | GetModelCheckExistsResultError
  | GetModelCheckExistsAndAccessResultError
  | CheckChartOrModelAccessResultError;

export let zCheckParentAccessResultError = z.union([
  zBackendSuggestFieldNotFoundError,
  zGetDashboardCheckExistsAndAccessResultError,
  zGetReportCheckExistsAndAccessResultError,
  zGetChartCheckExistsResultError,
  zGetModelCheckExistsResultError,
  zGetModelCheckExistsAndAccessResultError,
  zCheckChartOrModelAccessResultError
]);

assertTypesEqual<
  CheckParentAccessResultError,
  z.infer<typeof zCheckParentAccessResultError>
>({ value: true });
