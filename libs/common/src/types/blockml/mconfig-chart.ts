import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { zMconfigChartPivotValue } from '#common/types/blockml/mconfig-chart-pivot-value';
import { zMconfigChartSeries } from '#common/types/blockml/mconfig-chart-series';
import { zMconfigChartXAxis } from '#common/types/blockml/mconfig-chart-x-axis';
import { zMconfigChartYAxis } from '#common/types/blockml/mconfig-chart-y-axis';

export let zMconfigChart = z
  .object({
    isValid: z.boolean(),
    type: z.enum(ChartTypeEnum),
    title: z.string().nullish(),
    xField: z.string().nullish(),
    yFields: z.array(z.string()).nullish(),
    multiField: z.string().nullish(),
    sizeField: z.string().nullish(),
    pivotRows: z.array(z.string()).nullish(),
    pivotColumns: z.array(z.string()).nullish(),
    pivotValues: z.array(zMconfigChartPivotValue).nullish(),
    format: z.boolean().nullish(),
    pivotTheme: z.string().nullish(),
    firstColumnWidth: z.number().nullish(),
    valueColumnsWidth: z.number().nullish(),
    xAxis: zMconfigChartXAxis,
    yAxis: z.array(zMconfigChartYAxis),
    series: z.array(zMconfigChartSeries)
  })
  .meta({ id: 'MconfigChart' });

export type MconfigChart = z.infer<typeof zMconfigChart>;
