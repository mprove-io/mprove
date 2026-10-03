import type { RowTypeEnum } from '#common/enums/row-type.enum';
import type { FileReportRowParameter } from '#common/types/blockml/parts/internal/file-report-row-parameter';
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
