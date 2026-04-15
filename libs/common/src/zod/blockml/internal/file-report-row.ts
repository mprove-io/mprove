import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { zFileReportRowParameter } from '#common/zod/blockml/internal/file-report-row-parameter';

export let zFileReportRow = z
  .object({
    row_id: z.string().nullish(),
    row_id_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    type: z.enum(RowTypeEnum).nullish(),
    type_line_num: z.number().nullish(),
    metric: z.string().nullish(),
    metric_line_num: z.number().nullish(),
    parameters: z.array(zFileReportRowParameter).nullish(),
    parameters_line_num: z.number().nullish(),
    formula: z.string().nullish(),
    formula_line_num: z.number().nullish(),
    show_chart: z.string().nullish(),
    show_chart_line_num: z.number().nullish(),
    format_number: z.string().nullish(),
    format_number_line_num: z.number().nullish(),
    currency_prefix: z.string().nullish(),
    currency_prefix_line_num: z.number().nullish(),
    currency_suffix: z.string().nullish(),
    currency_suffix_line_num: z.number().nullish(),
    model: z.string().nullish(),
    isStore: z.boolean().nullish()
  })
  .meta({ id: 'FileReportRow' });

export type FileReportRow = z.infer<typeof zFileReportRow>;
