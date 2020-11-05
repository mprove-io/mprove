import { enums } from '../barrels/enums';
import { Field } from './field';

export interface Calculation extends Field {
  label: string;
  labelLineNum: number;

  result: enums.FieldExtResultEnum;
  resultLineNum: number;

  formatNumber: string;
  formatNumberLineNum: number;

  currencyPrefix: string;
  currencyPrefixLineNum: number;

  currencySuffix: string;
  currencySuffixLineNum: number;

  prepForceDims: {
    [dim: string]: number;
  };
  forceDims: {
    [as: string]: {
      [dim: string]: number;
    };
  };
}
