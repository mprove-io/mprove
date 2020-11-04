import * as apiEnums from '../../enums/_index';

export class ModelField {
  id: string;
  hidden: boolean;
  label: string;
  fieldClass: apiEnums.ModelFieldFieldClassEnum;
  result: apiEnums.ModelFieldResultEnum;
  sqlName: string;
  topId: string;
  topLabel: string;
  forceDims: string[];
  description?: string;
  type?: apiEnums.ModelFieldTypeEnum;
  groupId?: string;
  groupLabel?: string;
  groupDescription?: string;
  formatNumber: string;
  currencyPrefix: string;
  currencySuffix: string;
}
