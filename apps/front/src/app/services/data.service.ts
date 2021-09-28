import { Injectable } from '@angular/core';
import { capitalizeFirstLetter } from '~common/_index';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { RData } from './query.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor() {}

  getValueData(item: {
    columnFields: interfaces.ColumnField[];
    data: RData[];
    currentValueFieldId: string;
    previousValueFieldId: string;
  }) {
    let {
      columnFields,
      data,
      currentValueFieldId,
      previousValueFieldId
    } = item;

    let currentValueField = columnFields.find(
      f => f.id === currentValueFieldId
    );

    let currentValueName = currentValueField.sqlName;

    let currentValue = convertToNumberOrZero(data[0][currentValueName].value);

    let previousValueField;

    previousValueField = columnFields.find(f => f.id === previousValueFieldId);

    if (!previousValueField) {
      return [currentValue, 0];
    }

    let previousValueName = previousValueField.sqlName;

    let previousValue = convertToNumberOrZero(data[0][previousValueName].value);

    return [currentValue, previousValue];
  }

  getSingleData(item: {
    selectFields: interfaces.ColumnField[];
    data: RData[];
    xFieldId: string;
    yFieldId: string;
  }) {
    let { selectFields, data, xFieldId, yFieldId } = item;

    let xField = selectFields.find(f => f.id === xFieldId);
    let yField = selectFields.find(f => f.id === yFieldId);

    let xName = xField.sqlName;
    let yName = yField.sqlName;

    let singleData = data.map((raw: RData) => ({
      name: common.isDefined(raw[xName].value) ? `${raw[xName].value}` : 'NULL',
      value: convertToNumberOrZero(raw[yName].value)
    }));

    // console.log(singleData);

    return singleData;
  }

  getSingleDataForNumberCard(item: {
    selectFields: interfaces.ColumnField[];
    data: any[];
    xFieldId: string;
    yFieldId: string;
  }) {
    let { selectFields, data, xFieldId, yFieldId } = item;

    let xField = xFieldId
      ? selectFields.find(f => f.id === xFieldId)
      : undefined;

    let yField = selectFields.find(f => f.id === yFieldId);

    let xName = common.isDefined(xField) ? xField.sqlName : undefined;
    let yName = yField.sqlName;

    let singleData = data
      ? data.map((raw: RData) =>
          Object.assign({
            name: common.isDefined(xField) ? raw[xName].value || 'NULL' : ' ',
            value: convertToNumberOrZero(raw[yName].value)
          })
        )
      : [];

    return singleData;
  }

  getMultiData(item: {
    selectFields: interfaces.ColumnField[];
    data: any[];
    multiFieldId: string;
    xFieldId: string;
    yFieldsIds: string[];
    chartType: common.ChartTypeEnum;
  }) {
    // console.log(item);

    let {
      selectFields,
      data,
      multiFieldId,
      xFieldId,
      yFieldsIds,
      chartType
    } = item;

    let xField = selectFields.find(f => f.id === xFieldId);

    if (!xField) {
      return [];
    }

    let yFields: interfaces.ColumnField[] = [];

    yFieldsIds.forEach(yFieldId => {
      let yField = selectFields.find(f => f.id === yFieldId);

      if (!yField) {
        return [];
      }

      yFields.push(yField);
    });

    let xName = xField.sqlName;
    let xValueFn =
      xField.result === common.FieldResultEnum.Ts
        ? this.getTsValueFn(xName)
        : this.getRawValue;

    let multiField = multiFieldId
      ? selectFields.find(f => f.id === multiFieldId)
      : undefined;

    if (multiFieldId && !multiField) {
      return [];
    }

    let multiName = multiField ? multiField.sqlName : undefined;

    let prepareData: any = {};

    data.forEach((raw: RData) => {
      yFields.forEach(yField => {
        let yName = yField.sqlName;

        let key: string;

        let yLabel =
          yField.topLabel +
          (common.isDefined(yField.groupLabel)
            ? ` ${capitalizeFirstLetter(yField.groupLabel)}`
            : '') +
          ` ${capitalizeFirstLetter(yField.label)}`;

        if (multiName) {
          if (yFields.length > 1) {
            key = raw[multiName].value
              ? raw[multiName].value + ' ' + yLabel
              : 'NULL' + ' ' + yLabel;
          } else {
            key = raw[multiName].value ? raw[multiName].value : 'NULL';
          }
        } else {
          key = yLabel;
        }

        // x null check
        if (raw[xName]) {
          let xV = xValueFn(raw, xName);
          let yV = raw[yName].value;

          if (
            [
              common.ChartTypeEnum.Line,
              common.ChartTypeEnum.Area,
              common.ChartTypeEnum.AreaNormalized,
              common.ChartTypeEnum.AreaStacked
            ].indexOf(chartType) < 0 ||
            common.isDefined(xV)
          ) {
            let element = {
              name: common.isUndefined(xV)
                ? 'NULL'
                : xField.result === common.FieldResultEnum.Number
                ? convertToNumberOrZero(xV)
                : xV,
              value: convertToNumberOrZero(yV)
            };

            if (prepareData[key]) {
              prepareData[key].push(element);
            } else {
              prepareData[key] = [element];
            }
          }
        }
      });
    });

    let multiData: any[] = Object.keys(prepareData).map(x =>
      Object.assign({
        name: x,
        series: prepareData[x]
      })
    );

    // console.log('multiData');
    // console.log(multiData);

    return multiData;
  }

  private getRawValue(raw: any, fieldName: string) {
    return raw[fieldName].value;
  }

  private getTsValueFn(fieldName: string) {
    let fieldValue: any;

    if (fieldName.match(/(?:___date)$/g)) {
      fieldValue = this.getDateFromDate;
    } else if (fieldName.match(/(?:___hour)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour2)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour3)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour4)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour6)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour8)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour12)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___minute)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute2)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute3)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute5)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute10)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute15)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute30)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___month)$/g)) {
      fieldValue = this.getDateFromMonth;
    } else if (fieldName.match(/(?:___quarter)$/g)) {
      fieldValue = this.getDateFromQuarter;
    } else if (fieldName.match(/(?:___time)$/g)) {
      fieldValue = this.getDateFromTime;
    } else if (fieldName.match(/(?:___week)$/g)) {
      fieldValue = this.getDateFromWeek;
    } else if (fieldName.match(/(?:___year)$/g)) {
      fieldValue = this.getDateFromYear;
    }

    return fieldValue;
  }

  private getDateFromDate(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day] = r;

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );

    return date;
  }

  private getDateFromHour(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour] = r;

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10)
    );

    return date;
  }

  private getDateFromMinute(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour, minute] = r;

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10)
    );

    return date;
  }

  private getDateFromMonth(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month] = r;

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromQuarter(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month] = r;

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromTime(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d)[:](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour, minute, second] = r;

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    );

    return date;
  }

  private getDateFromWeek(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day] = r;

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );

    return date;
  }

  private getDateFromYear(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year] = r;

    let date = new Date(parseInt(year, 10), 0, 1);

    return date;
  }
}

function convertToNumberOrZero(x: any) {
  let xNum = common.isDefined(x) ? Number(x) : 0;
  let z = Number.isNaN(xNum) === false ? xNum : 0;
  return z;
}
