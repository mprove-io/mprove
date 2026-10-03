import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileChartOptionsSeriesElement,
  zFileChartOptionsSeriesElement
} from '#common/types/blockml/parts/internal/file-chart-options-series';
import {
  type FileChartOptionsXAxisElement,
  zFileChartOptionsXAxisElement
} from '#common/types/blockml/parts/internal/file-chart-options-x-axis';
import {
  type FileChartOptionsYAxisElement,
  zFileChartOptionsYAxisElement
} from '#common/types/blockml/parts/internal/file-chart-options-y-axis';

export type FileChartOptions = {
  format?: string;
  format_line_num?: number;
  first_column_width?: string;
  first_column_width_line_num?: number;
  value_columns_width?: string;
  value_columns_width_line_num?: number;
  x_axis?: FileChartOptionsXAxisElement;
  x_axis_line_num?: number;
  y_axis?: FileChartOptionsYAxisElement[];
  y_axis_line_num?: number;
  series?: FileChartOptionsSeriesElement[];
  series_line_num?: number;
};

export let zFileChartOptions = z
  .object({
    format: z.string().nullish(),
    format_line_num: z.number().nullish(),
    first_column_width: z.string().nullish(),
    first_column_width_line_num: z.number().nullish(),
    value_columns_width: z.string().nullish(),
    value_columns_width_line_num: z.number().nullish(),
    x_axis: zFileChartOptionsXAxisElement.nullish(),
    x_axis_line_num: z.number().nullish(),
    y_axis: z.array(zFileChartOptionsYAxisElement).nullish(),
    y_axis_line_num: z.number().nullish(),
    series: z.array(zFileChartOptionsSeriesElement).nullish(),
    series_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartOptions' });

assertTypesEqual<FileChartOptions, z.infer<typeof zFileChartOptions>>({
  value: true
});
