import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

export let zMconfigChartSeries = z
  .object({
    dataField: z.string().nullish(),
    dataRowId: z.string().nullish(),
    type: z.enum(ChartTypeEnum).nullish(),
    yAxisIndex: z.number().int().nullish()
  })
  .meta({ id: 'MconfigChartSeries' });

export type MconfigChartSeries = z.infer<typeof zMconfigChartSeries>;
