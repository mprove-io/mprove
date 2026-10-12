import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendChartNotFoundError,
  zBackendChartNotFoundError
} from '#common/types/backend/errors/backend-chart-not-found-error';
import {
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';

export type PrepareRunChartError =
  | ChartEntToTabError
  | ModelEntToTabError
  | BackendChartNotFoundError;

export const zPrepareRunChartError = z.union([
  zChartEntToTabError,
  zModelEntToTabError,
  zBackendChartNotFoundError
]);

assertTypesEqual<PrepareRunChartError, z.infer<typeof zPrepareRunChartError>>({
  value: true
});
