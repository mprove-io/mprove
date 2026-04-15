import { z } from 'zod';
import { zFileChartOptionsSeriesElement } from '#common/zod/blockml/internal/file-chart-options-series';
import { zFileChartOptionsXAxisElement } from '#common/zod/blockml/internal/file-chart-options-x-axis';
import { zFileChartOptionsYAxisElement } from '#common/zod/blockml/internal/file-chart-options-y-axis';

export let zFileChartOptions = z
  .object({
    format: z.string().nullish(),
    format_line_num: z.number().nullish(),
    x_axis: zFileChartOptionsXAxisElement.nullish(),
    x_axis_line_num: z.number().nullish(),
    y_axis: z.array(zFileChartOptionsYAxisElement).nullish(),
    y_axis_line_num: z.number().nullish(),
    series: z.array(zFileChartOptionsSeriesElement).nullish(),
    series_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartOptions' });

export type FileChartOptions = z.infer<typeof zFileChartOptions>;
