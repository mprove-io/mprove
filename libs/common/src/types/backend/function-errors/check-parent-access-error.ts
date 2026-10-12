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
  type GetModelCheckExistsError,
  zGetModelCheckExistsError
} from '#common/types/backend/function-errors/get-model-check-exists-error';
import {
  type GetReportCheckExistsAndAccessError,
  zGetReportCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';

export type CheckParentAccessError =
  | BackendSuggestFieldNotFoundError
  | GetDashboardCheckExistsAndAccessError
  | GetReportCheckExistsAndAccessError
  | GetChartCheckExistsError
  | GetModelCheckExistsError
  | GetModelCheckExistsAndAccessError
  | CheckChartOrModelAccessError;

export let zCheckParentAccessError = z.union([
  zBackendSuggestFieldNotFoundError,
  zGetDashboardCheckExistsAndAccessError,
  zGetReportCheckExistsAndAccessError,
  zGetChartCheckExistsError,
  zGetModelCheckExistsError,
  zGetModelCheckExistsAndAccessError,
  zCheckChartOrModelAccessError
]);

assertTypesEqual<
  CheckParentAccessError,
  z.infer<typeof zCheckParentAccessError>
>({ value: true });
