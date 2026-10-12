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
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';

export type GetChartCheckExistsError =
  | BackendChartDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | ChartEntToTabError;

export let zGetChartCheckExistsError = z.union([
  zBackendChartDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zChartEntToTabError
]);

assertTypesEqual<
  GetChartCheckExistsError,
  z.infer<typeof zGetChartCheckExistsError>
>({ value: true });
