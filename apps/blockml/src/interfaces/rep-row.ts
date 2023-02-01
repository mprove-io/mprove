export interface RepRow {
  id: string;
  id_line_num: number;

  metric: string;
  metric_line_num: number;

  formula: string;
  formula_line_num: number;

  params: any[];
  params_line_num: number;
}
