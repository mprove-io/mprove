import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendChartCreatorIdMismatchError,
  zBackendChartCreatorIdMismatchError
} from '#common/types/backend/errors/backend-chart-creator-id-mismatch-error';
import {
  type BackendChartDoesNotExistError,
  zBackendChartDoesNotExistError
} from '#common/types/backend/errors/backend-chart-does-not-exist-error';
import {
  type DbChartsFindFirstError,
  zDbChartsFindFirstError
} from '#common/types/backend/function-errors/db/charts/db-charts-find-first-error';

export type GetChartCheckExistsError =
  | BackendChartDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | DbChartsFindFirstError;

export let zGetChartCheckExistsError = z.union([
  zBackendChartDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zDbChartsFindFirstError
]);

assertTypesEqual<
  GetChartCheckExistsError,
  z.infer<typeof zGetChartCheckExistsError>
>({ value: true });
