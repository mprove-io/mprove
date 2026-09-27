import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/zod/backend/chart-unit';
import { type ChartX, zChartX } from '#common/zod/backend/chart-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateDraftChartError,
  zToBackendCreateDraftChartError
} from './create-draft-chart-error';

export type ToBackendCreateDraftChartOutput = {
  chart: ChartX;
  chartUnitDrafts: ChartUnit[];
};

export type ToBackendCreateDraftChartResponse = ToBackendResponse<
  ToBackendCreateDraftChartOutput,
  ToBackendCreateDraftChartError
>;

export let zToBackendCreateDraftChartOutput = z
  .object({
    chart: zChartX,
    chartUnitDrafts: z.array(zChartUnit)
  })
  .meta({ id: 'ToBackendCreateDraftChartOutput' });

export let zToBackendCreateDraftChartResponse = makeToBackendResponseSchema({
  success: zToBackendCreateDraftChartOutput,
  error: zToBackendCreateDraftChartError
}).meta({ id: 'ToBackendCreateDraftChartResponse' });

assertTypesEqual<
  ToBackendCreateDraftChartOutput,
  z.infer<typeof zToBackendCreateDraftChartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateDraftChartResponse,
  z.infer<typeof zToBackendCreateDraftChartResponse>
>({ value: true });
