import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { Field } from './field';

export interface Filter extends Field {
  label: string;
  label_line_num: number;
  result: enums.FieldExtResultEnum;
  result_line_num: number;
  default: string[];
  default_line_num: number;
  from_field: string;
  from_field_line_num: number;

  prep_force_dims: {
    [dim: string]: number;
  };

  fractions: api.Fraction[];
}
