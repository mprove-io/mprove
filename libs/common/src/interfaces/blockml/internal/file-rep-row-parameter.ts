import { enums } from '~common/barrels/enums';

export interface FileRepRowParameter {
  type?: enums.ParameterTypeEnum;
  type_line_num?: number;

  filter?: string;
  filter_line_num?: number;

  formula?: string;
  formula_line_num?: number;

  conditions?: string[];
  conditions_line_num?: number;
}
