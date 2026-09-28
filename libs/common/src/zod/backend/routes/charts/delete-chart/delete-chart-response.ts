import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteChartOutput,
  zToBackendDeleteChartOutput
} from '#common/zod/backend/routes/charts/delete-chart/delete-chart-output';
import {
  type ToBackendDeleteChartError,
  zToBackendDeleteChartError
} from './delete-chart-error';

export type ToBackendDeleteChartResponse = ToBackendResponseBase<
  'deleteChart',
  ToBackendDeleteChartOutput,
  ToBackendDeleteChartError
>;

export let zToBackendDeleteChartResponse = makeToBackendResponseSchema({
  operation: 'deleteChart',
  output: zToBackendDeleteChartOutput,
  error: zToBackendDeleteChartError
}).meta({ id: 'ToBackendDeleteChartResponse' });

assertTypesEqual<
  ToBackendDeleteChartResponse,
  z.infer<typeof zToBackendDeleteChartResponse>
>({ value: true });
