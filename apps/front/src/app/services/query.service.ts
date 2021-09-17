import { Injectable } from '@angular/core';
import { formatLocale } from 'd3-format';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';

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

  makeQData(item: { data: any; columns: interfaces.ColumnField[] }) {
    let { data, columns } = item;

    if (common.isUndefined(data)) {
      return [];
    }

    let qData: RData[] = [];

    data.forEach((row: any) => {
      let r: RData = {};

      Object.keys(row).forEach(key => {
        let value = row[key];
        let column = columns.find(x => x.sqlName === key);

        let cell: Cell = {
          id: key,
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

        r[key] = cell;
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
    let {
      value,
      formatNumber,
      fieldResult,
      currencyPrefix,
      currencySuffix
    } = item;

    if (
      !isNaN(value) &&
      fieldResult === common.FieldResultEnum.Number &&
      formatNumber !== null
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
