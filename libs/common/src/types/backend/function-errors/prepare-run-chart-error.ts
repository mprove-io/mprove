import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendChartNotFoundError,
  zBackendChartNotFoundError
} from '#common/types/backend/errors/backend-chart-not-found-error';
import {
  type DbChartsFindManyError,
  zDbChartsFindManyError
} from '#common/types/backend/function-errors/db/charts/db-charts-find-many-error';
import {
  type DbModelsFindManyError,
  zDbModelsFindManyError
} from '#common/types/backend/function-errors/db/models/db-models-find-many-error';

export type PrepareRunChartError =
  | BackendChartNotFoundError
  | DbChartsFindManyError
  | DbModelsFindManyError;

export const zPrepareRunChartError = z.union([
  zBackendChartNotFoundError,
  zDbChartsFindManyError,
  zDbModelsFindManyError
]);

assertTypesEqual<PrepareRunChartError, z.infer<typeof zPrepareRunChartError>>({
  value: true
});
