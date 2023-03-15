import { enums } from '~common/barrels/enums';

export interface FileRepRowParameter {
  id?: string;
  id_line_num?: number;

  type?: enums.ParameterTypeEnum;
  type_line_num?: number;

  field?: string;
  field_line_num?: number;

  result?: enums.FieldResultEnum;
  result_line_num?: number;

  formula?: string;
  formula_line_num?: number;

  conditions?: string[];
  conditions_line_num?: number;

  value?: string;
  value_line_num?: number;
}
