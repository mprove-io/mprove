import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { Field } from './field';

export interface Filter extends Field {
  label: string;
  labelLineNum: number;

  result: enums.FieldExtResultEnum;
  resultLineNum: number;

  default: string[];
  defaultLineNum: number;

  fromField: string;
  fromFieldLineNum: number;

  prepForceDims: {
    [dim: string]: number;
  };

  fractions: api.Fraction[];
}
