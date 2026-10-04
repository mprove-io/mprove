import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartUnit,
  zChartUnit
} from '#common/types/backend/parts/chart/chart-unit';

export type ToBackendDeleteDraftChartsOutput = {
  chartUnitDrafts: ChartUnit[];
};

export let zToBackendDeleteDraftChartsOutput = z
  .object({
    chartUnitDrafts: z.array(zChartUnit)
  })
  .meta({ id: 'ToBackendDeleteDraftChartsOutput' });

assertTypesEqual<
  ToBackendDeleteDraftChartsOutput,
  z.infer<typeof zToBackendDeleteDraftChartsOutput>
>({ value: true });
