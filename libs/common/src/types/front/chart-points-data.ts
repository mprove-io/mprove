import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ChartPointsData = {
  dataPoints: any;
  newQueriesLength: number;
  runningQueriesLength: number;
};

export let zChartPointsData = z
  .object({
    dataPoints: z.any(),
    newQueriesLength: z.number(),
    runningQueriesLength: z.number()
  })
  .meta({ id: 'ChartPointsData' });

assertTypesEqual<ChartPointsData, z.infer<typeof zChartPointsData>>({
  value: true
});
