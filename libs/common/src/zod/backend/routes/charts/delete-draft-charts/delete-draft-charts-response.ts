import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/zod/backend/chart-unit';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteDraftChartsError,
  zToBackendDeleteDraftChartsError
} from './delete-draft-charts-error';

export type ToBackendDeleteDraftChartsOutput = {
  chartUnitDrafts: ChartUnit[];
};

export type ToBackendDeleteDraftChartsResponse = ToBackendResponse<
  ToBackendDeleteDraftChartsOutput,
  ToBackendDeleteDraftChartsError
>;

export let zToBackendDeleteDraftChartsOutput = z
  .object({
    chartUnitDrafts: z.array(zChartUnit)
  })
  .meta({ id: 'ToBackendDeleteDraftChartsOutput' });

export let zToBackendDeleteDraftChartsResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteDraftChartsOutput,
  error: zToBackendDeleteDraftChartsError
}).meta({ id: 'ToBackendDeleteDraftChartsResponse' });

assertTypesEqual<
  ToBackendDeleteDraftChartsOutput,
  z.infer<typeof zToBackendDeleteDraftChartsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDraftChartsResponse,
  z.infer<typeof zToBackendDeleteDraftChartsResponse>
>({ value: true });
