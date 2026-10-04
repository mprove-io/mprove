import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const chartSaveAsValues = ['NEW_CHART', 'TILE_OF_DASHBOARD'] as const;

export type ChartSaveAs = (typeof chartSaveAsValues)[number];

export let zChartSaveAs = z.enum(chartSaveAsValues);

assertTypesEqual<ChartSaveAs, z.infer<typeof zChartSaveAs>>({
  value: true
});
