import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/zod/backend/chart-unit';
import { type ChartX, zChartX } from '#common/zod/backend/chart-x';

export type ToBackendCreateDraftChartOutput = {
  chart: ChartX;
  chartUnitDrafts: ChartUnit[];
};

export let zToBackendCreateDraftChartOutput = z
  .object({
    chart: zChartX,
    chartUnitDrafts: z.array(zChartUnit)
  })
  .meta({ id: 'ToBackendCreateDraftChartOutput' });

assertTypesEqual<
  ToBackendCreateDraftChartOutput,
  z.infer<typeof zToBackendCreateDraftChartOutput>
>({ value: true });
