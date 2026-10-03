import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileReportRowParameter,
  zFileReportRowParameter
} from '#common/types/blockml/parts/internal/file-report-row-parameter';
import type { EnumValues } from '#common/types/enum-values';

export type FileReportRow = {
  row_id?: string;
  row_id_line_num?: number;
  name?: string;
  name_line_num?: number;
  type?: EnumValues<typeof RowTypeEnum>;
  type_line_num?: number;
  metric?: string;
  metric_line_num?: number;
  parameters?: FileReportRowParameter[];
  parameters_line_num?: number;
  formula?: string;
  formula_line_num?: number;
  show_chart?: string;
  show_chart_line_num?: number;
  format_number?: string;
  format_number_line_num?: number;
  currency_prefix?: string;
  currency_prefix_line_num?: number;
  currency_suffix?: string;
  currency_suffix_line_num?: number;
  model?: string;
  isStore?: boolean;
};

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

assertTypesEqual<FileReportRow, z.infer<typeof zFileReportRow>>({
  value: true
});
