import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/zod/backend/chart-unit';
import { type ChartX, zChartX } from '#common/zod/backend/chart-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditDraftChartError,
  zToBackendEditDraftChartError
} from './edit-draft-chart-error';

export type ToBackendEditDraftChartOutput = {
  chart: ChartX;
  chartUnitDrafts: ChartUnit[];
};

export type ToBackendEditDraftChartResponse = ToBackendResponse<
  ToBackendEditDraftChartOutput,
  ToBackendEditDraftChartError
>;

export let zToBackendEditDraftChartOutput = z
  .object({
    chart: zChartX,
    chartUnitDrafts: z.array(zChartUnit)
  })
  .meta({ id: 'ToBackendEditDraftChartOutput' });

export let zToBackendEditDraftChartResponse = makeToBackendResponseSchema({
  success: zToBackendEditDraftChartOutput,
  error: zToBackendEditDraftChartError
}).meta({ id: 'ToBackendEditDraftChartResponse' });

assertTypesEqual<
  ToBackendEditDraftChartOutput,
  z.infer<typeof zToBackendEditDraftChartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditDraftChartResponse,
  z.infer<typeof zToBackendEditDraftChartResponse>
>({ value: true });
