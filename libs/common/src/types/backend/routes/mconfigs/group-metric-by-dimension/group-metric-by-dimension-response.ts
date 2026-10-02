import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGroupMetricByDimensionOutput,
  zToBackendGroupMetricByDimensionOutput
} from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-output';
import {
  type ToBackendGroupMetricByDimensionError,
  zToBackendGroupMetricByDimensionError
} from './group-metric-by-dimension-error';

export type ToBackendGroupMetricByDimensionResponse = ToBackendResponseBase<
  'groupMetricByDimension',
  ToBackendGroupMetricByDimensionOutput,
  ToBackendGroupMetricByDimensionError
>;

export let zToBackendGroupMetricByDimensionResponse =
  makeToBackendResponseSchema({
    operation: 'groupMetricByDimension',
    output: zToBackendGroupMetricByDimensionOutput,
    error: zToBackendGroupMetricByDimensionError
  }).meta({ id: 'ToBackendGroupMetricByDimensionResponse' });

assertTypesEqual<
  ToBackendGroupMetricByDimensionResponse,
  z.infer<typeof zToBackendGroupMetricByDimensionResponse>
>({ value: true });
