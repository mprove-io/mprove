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
  type ChartEntToTabResultError,
  zChartEntToTabResultError
} from '#common/types/backend/function-errors/chart-ent-to-tab-result-error';

export type GetChartCheckExistsResultError =
  | BackendChartDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | ChartEntToTabResultError;

export let zGetChartCheckExistsResultError = z.union([
  zBackendChartDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zChartEntToTabResultError
]);

assertTypesEqual<
  GetChartCheckExistsResultError,
  z.infer<typeof zGetChartCheckExistsResultError>
>({ value: true });
