import { enums } from '../barrels/enums';
import { Field } from './field';

export interface Dimension extends Field {
  label: string;
  labelLineNum: number;

  type: enums.FieldExtTypeEnum;
  typeLineNum: number;

  result: enums.FieldExtResultEnum;
  resultLineNum: number;

  unnest: string;
  unnestLineNum: number;

  formatNumber: string;
  formatNumberLineNum: number;

  currencyPrefix: string;
  currencyPrefixLineNum: number;

  currencySuffix: string;
  currencySuffixLineNum: number;

  groupId: string;
  sqlTimestampName: string;
  sqlTimestamp: string;
  sqlTimestampReal: string;
}
