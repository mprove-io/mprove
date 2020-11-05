import { enums } from '../barrels/enums';
import { Field } from './field';

export interface Measure extends Field {
  label: string;
  labelLineNum: number;

  type: enums.FieldExtTypeEnum;
  typeLineNum: number;

  result: enums.FieldExtResultEnum;
  resultLineNum: number;

  formatNumber: string;
  formatNumberLineNum: number;

  currencyPrefix: string;
  currencyPrefixLineNum: number;

  currencySuffix: string;
  currencySuffixLineNum: number;

  sqlKey: string;
  sqlKeyLineNum: number;

  percentile: string; // number
  percentileLineNum: number;

  sqlKeyReal: string;
}
