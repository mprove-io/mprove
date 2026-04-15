import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { zMconfigChartSeries } from '#common/zod/blockml/mconfig-chart-series';
import { zMconfigChartXAxis } from '#common/zod/blockml/mconfig-chart-x-axis';
import { zMconfigChartYAxis } from '#common/zod/blockml/mconfig-chart-y-axis';

export let zMconfigChart = z
  .object({
    isValid: z.boolean(),
    type: z.enum(ChartTypeEnum),
    title: z.string().nullish(),
    xField: z.string().nullish(),
    yFields: z.array(z.string()).nullish(),
    multiField: z.string().nullish(),
    sizeField: z.string().nullish(),
    format: z.boolean().nullish(),
    xAxis: zMconfigChartXAxis,
    yAxis: z.array(zMconfigChartYAxis),
    series: z.array(zMconfigChartSeries)
  })
  .meta({ id: 'MconfigChart' });

export type MconfigChart = z.infer<typeof zMconfigChart>;
