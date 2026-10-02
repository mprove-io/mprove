import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetChartOutput,
  zToBackendGetChartOutput
} from '#common/types/backend/routes/charts/get-chart/get-chart-output';
import {
  type ToBackendGetChartError,
  zToBackendGetChartError
} from './get-chart-error';

export type ToBackendGetChartResponse = ToBackendResponseBase<
  'getChart',
  ToBackendGetChartOutput,
  ToBackendGetChartError
>;

export let zToBackendGetChartResponse = makeToBackendResponseSchema({
  operation: 'getChart',
  output: zToBackendGetChartOutput,
  error: zToBackendGetChartError
}).meta({ id: 'ToBackendGetChartResponse' });

assertTypesEqual<
  ToBackendGetChartResponse,
  z.infer<typeof zToBackendGetChartResponse>
>({ value: true });
