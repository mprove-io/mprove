import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

export let zFileChartOptionsSeriesElement = z
  .object({
    data_row_id: z.string().nullish(),
    data_row_id_line_num: z.number().nullish(),
    data_field: z.string().nullish(),
    data_field_line_num: z.number().nullish(),
    type: z.enum(ChartTypeEnum).nullish(),
    type_line_num: z.number().nullish(),
    y_axis_index: z.string().nullish(),
    y_axis_index_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartOptionsSeriesElement' });

export type FileChartOptionsSeriesElement = z.infer<
  typeof zFileChartOptionsSeriesElement
>;
