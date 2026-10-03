import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FileChartOptionsSeriesElement = {
  data_row_id?: string;
  data_row_id_line_num?: number;
  data_field?: string;
  data_field_line_num?: number;
  type?: EnumValues<typeof ChartTypeEnum>;
  type_line_num?: number;
  y_axis_index?: string;
  y_axis_index_line_num?: number;
};

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

assertTypesEqual<
  FileChartOptionsSeriesElement,
  z.infer<typeof zFileChartOptionsSeriesElement>
>({ value: true });
