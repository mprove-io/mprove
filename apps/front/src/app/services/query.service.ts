import { Injectable } from '@angular/core';
import { formatLocale } from 'd3-format';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export class RData {
  [k: string]: Cell;
}

export class Cell {
  value: string;
  fValue: string;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class QueryService {
  constructor() {}

  makeQData(item: { data: any; columns: common.MconfigField[] }) {
    let { data, columns } = item;

    if (common.isUndefined(data)) {
      return [];
    }

    let qData: RData[] = [];

    data.forEach((row: any) => {
      let r: RData = {};

      Object.keys(row).forEach(key => {
        let value = row[key];
        let column = columns.find(x => x.sqlName === key.toLowerCase());

        let cell: Cell = {
          id: key.toLowerCase(),
          value: common.isDefined(value) ? value : 'NULL',
          fValue: common.isDefined(value)
            ? this.formatValue({
                value: value,
                formatNumber: column?.formatNumber,
                fieldResult: column?.result,
                currencyPrefix: column?.currencyPrefix,
                currencySuffix: column?.currencySuffix
              })
            : 'NULL'
        };

        r[key.toLowerCase()] = cell;
      });

      qData.push(r);
    });

    return qData;
  }

  formatValue(item: {
    value: any;
    formatNumber: string;
    fieldResult: common.FieldResultEnum;
    currencyPrefix: string;
    currencySuffix: string;
  }) {
    let { value, formatNumber, fieldResult, currencyPrefix, currencySuffix } =
      item;

    if (
      !isNaN(value) &&
      fieldResult === common.FieldResultEnum.Number &&
      common.isDefined(formatNumber)
    ) {
      let locale = formatLocale({
        decimal: constants.FORMAT_NUMBER_DECIMAL,
        thousands: constants.FORMAT_NUMBER_THOUSANDS,
        grouping: constants.FORMAT_NUMBER_GROUPING,
        currency: [currencyPrefix, currencySuffix]
      });

      return locale.format(formatNumber)(Number(value));
    } else {
      return value;
    }
  }
}
