import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/types/backend/chart-unit';
import { type ChartX, zChartX } from '#common/types/backend/chart-x';

export type ToBackendEditDraftChartOutput = {
  chart: ChartX;
  chartUnitDrafts: ChartUnit[];
};

export let zToBackendEditDraftChartOutput = z
  .object({
    chart: zChartX,
    chartUnitDrafts: z.array(zChartUnit)
  })
  .meta({ id: 'ToBackendEditDraftChartOutput' });

assertTypesEqual<
  ToBackendEditDraftChartOutput,
  z.infer<typeof zToBackendEditDraftChartOutput>
>({ value: true });
