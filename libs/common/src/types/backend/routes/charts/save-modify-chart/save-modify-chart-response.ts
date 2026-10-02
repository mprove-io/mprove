import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSaveModifyChartOutput,
  zToBackendSaveModifyChartOutput
} from '#common/types/backend/routes/charts/save-modify-chart/save-modify-chart-output';
import {
  type ToBackendSaveModifyChartError,
  zToBackendSaveModifyChartError
} from './save-modify-chart-error';

export type ToBackendSaveModifyChartResponse = ToBackendResponseBase<
  'saveModifyChart',
  ToBackendSaveModifyChartOutput,
  ToBackendSaveModifyChartError
>;

export let zToBackendSaveModifyChartResponse = makeToBackendResponseSchema({
  operation: 'saveModifyChart',
  output: zToBackendSaveModifyChartOutput,
  error: zToBackendSaveModifyChartError
}).meta({ id: 'ToBackendSaveModifyChartResponse' });

assertTypesEqual<
  ToBackendSaveModifyChartResponse,
  z.infer<typeof zToBackendSaveModifyChartResponse>
>({ value: true });
