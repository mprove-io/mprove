import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendChartDoesNotExistError,
  zBackendChartDoesNotExistError
} from '#common/types/backend/errors/backend-chart-does-not-exist-error';
import {
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';

export type DbChartsFindFirstCheckExistsError =
  | ChartEntToTabError
  | BackendChartDoesNotExistError;

export let zDbChartsFindFirstCheckExistsError = z.union([
  zChartEntToTabError,
  zBackendChartDoesNotExistError
]);

assertTypesEqual<
  DbChartsFindFirstCheckExistsError,
  z.infer<typeof zDbChartsFindFirstCheckExistsError>
>({
  value: true
});
