import { enums } from '~common/barrels/enums';

export interface FileReportRowParameter {
  type?: enums.ParameterTypeEnum;
  type_line_num?: number;

  apply_to?: string;
  apply_to_line_num?: number;

  listen?: string;
  listen_line_num?: number;

  formula?: string;
  formula_line_num?: number;

  conditions?: string[];
  conditions_line_num?: number;

  //

  topParId?: string;

  globalFieldResult: enums.FieldResultEnum;
}
