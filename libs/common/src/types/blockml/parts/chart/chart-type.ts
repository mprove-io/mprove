import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const chartTypeValues = [
  'table',
  'line',
  'bar',
  'scatter',
  'pie',
  'single',
  'pivot_table'
] as const;

export type ChartType = (typeof chartTypeValues)[number];

export let zChartType = z.enum(chartTypeValues);

assertTypesEqual<ChartType, z.infer<typeof zChartType>>({
  value: true
});
