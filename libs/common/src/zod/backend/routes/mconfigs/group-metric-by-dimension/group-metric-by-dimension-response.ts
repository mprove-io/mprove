import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type MconfigX, zMconfigX } from '#common/zod/backend/mconfig-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendGroupMetricByDimensionError,
  zToBackendGroupMetricByDimensionError
} from './group-metric-by-dimension-error';

export type ToBackendGroupMetricByDimensionOutput = {
  mconfig: MconfigX;
  query: Query;
};

export type ToBackendGroupMetricByDimensionResponse = ToBackendResponse<
  ToBackendGroupMetricByDimensionOutput,
  ToBackendGroupMetricByDimensionError
>;

export let zToBackendGroupMetricByDimensionOutput = z
  .object({
    mconfig: zMconfigX,
    query: zQuery
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionOutput' });

export let zToBackendGroupMetricByDimensionResponse =
  makeToBackendResponseSchema({
    success: zToBackendGroupMetricByDimensionOutput,
    error: zToBackendGroupMetricByDimensionError
  }).meta({ id: 'ToBackendGroupMetricByDimensionResponse' });

assertTypesEqual<
  ToBackendGroupMetricByDimensionOutput,
  z.infer<typeof zToBackendGroupMetricByDimensionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGroupMetricByDimensionResponse,
  z.infer<typeof zToBackendGroupMetricByDimensionResponse>
>({ value: true });
