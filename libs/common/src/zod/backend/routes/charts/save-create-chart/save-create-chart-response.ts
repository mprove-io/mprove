import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSaveCreateChartOutput,
  zToBackendSaveCreateChartOutput
} from '#common/zod/backend/routes/charts/save-create-chart/save-create-chart-output';
import {
  type ToBackendSaveCreateChartError,
  zToBackendSaveCreateChartError
} from './save-create-chart-error';

export type ToBackendSaveCreateChartResponse = ToBackendResponseBase<
  'saveCreateChart',
  ToBackendSaveCreateChartOutput,
  ToBackendSaveCreateChartError
>;

export let zToBackendSaveCreateChartResponse = makeToBackendResponseSchema({
  operation: 'saveCreateChart',
  output: zToBackendSaveCreateChartOutput,
  error: zToBackendSaveCreateChartError
}).meta({ id: 'ToBackendSaveCreateChartResponse' });

assertTypesEqual<
  ToBackendSaveCreateChartResponse,
  z.infer<typeof zToBackendSaveCreateChartResponse>
>({ value: true });
