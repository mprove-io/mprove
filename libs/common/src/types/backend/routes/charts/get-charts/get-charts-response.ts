import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetChartsOutput,
  zToBackendGetChartsOutput
} from '#common/types/backend/routes/charts/get-charts/get-charts-output';
import {
  type ToBackendGetChartsError,
  zToBackendGetChartsError
} from './get-charts-error';

export type ToBackendGetChartsResponse = ToBackendResponseBase<
  'getCharts',
  ToBackendGetChartsOutput,
  ToBackendGetChartsError
>;

export let zToBackendGetChartsResponse = makeToBackendResponseSchema({
  operation: 'getCharts',
  output: zToBackendGetChartsOutput,
  error: zToBackendGetChartsError
}).meta({ id: 'ToBackendGetChartsResponse' });

assertTypesEqual<
  ToBackendGetChartsResponse,
  z.infer<typeof zToBackendGetChartsResponse>
>({ value: true });
