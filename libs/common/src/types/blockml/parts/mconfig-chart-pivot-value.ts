import { z } from 'zod';

export let zMconfigChartPivotValue = z
  .object({
    field: z.string()
  })
  .meta({ id: 'MconfigChartPivotValue' });

export type MconfigChartPivotValue = z.infer<typeof zMconfigChartPivotValue>;
