import { Injectable } from '@angular/core';
import { capitalizeFirstLetter } from '~common/_index';
import { common } from '~front/barrels/common';
import { RData } from './query.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor() {}

  // isNumber(v: string) {
  //   const num = Number(v);
  //   return typeof v === 'string' && v.trim() !== '' && !isNaN(num);
  // }

  private isNumber(v: unknown): boolean {
    if (typeof v === 'number') {
      return !isNaN(v) && isFinite(v);
    }

    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed === '') return false;
      return !isNaN(Number(trimmed)) && isFinite(Number(trimmed));
    }

    return false;
  }

  getSeriesData(item: {
    selectFields: common.MconfigField[];
    data: any[];
    multiFieldId: string;
    xFieldId: string;
    sizeFieldId: string;
    yFieldsIds: string[];
  }) {
    let {
      selectFields,
      data,
      multiFieldId,
      xFieldId,
      sizeFieldId,
      yFieldsIds
    } = item;

    let xField = selectFields.find(f => f.id === xFieldId);

    if (!xField) {
      return [];
    }

    let yFields: common.MconfigField[] = [];

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

    let multiField = common.isDefined(multiFieldId)
      ? selectFields.find(f => f.id === multiFieldId)
      : undefined;

    if (multiFieldId && !multiField) {
      return [];
    }

    let multiName = multiField ? multiField.sqlName : undefined;

    let sizeField = common.isDefined(sizeFieldId)
      ? selectFields.find(f => f.id === sizeFieldId)
      : undefined;

    if (sizeField && !sizeField) {
      return [];
    }

    let sizeName = sizeField ? sizeField.sqlName : undefined;

    let prepareData: any = {};

    let addNorm = 0;
    let sizeMin = 1;
    let sizeMax = 1;

    if (common.isDefined(sizeField)) {
      let sizeValues = data
        .map((x: RData) =>
          this.isNumber(x[sizeField.sqlName].value)
            ? Number(x[sizeField.sqlName].value)
            : undefined
        )
        .filter(x => common.isDefined(x));

      if (sizeValues.length > 0) {
        sizeMin = Math.min(...sizeValues);
        sizeMax = Math.max(...sizeValues);

        if (sizeMin < 0) {
          addNorm = 0 - sizeMin;
          sizeMin = sizeMin + addNorm;
          sizeMax = sizeMax + addNorm;
        }
      }
    }

    data.forEach((row: RData) => {
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
            key = row[multiName].value
              ? row[multiName].value + ' ' + yLabel
              : 'NULL' + ' ' + yLabel;
          } else {
            key = row[multiName].value ? row[multiName].value : 'NULL';
          }
        } else {
          key = yLabel;
        }

        // x null check
        if (row[xName]) {
          let xV = xValueFn(row, xName);
          let yV = row[yName].value;
          let sV =
            common.isDefined(sizeName) && this.isNumber(row[sizeName].value)
              ? (Number(row[sizeName].value) + addNorm) / (sizeMax + sizeMin)
              : 1;

          if (
            // [
            //   common.ChartTypeEnum.Line,
            //   common.ChartTypeEnum.Area,
            //   common.ChartTypeEnum.AreaNormalized,
            //   common.ChartTypeEnum.AreaStacked
            // ].indexOf(chartType) < 0 ||
            common.isDefined(xV)
          ) {
            let element = {
              name: common.isUndefined(xV)
                ? 'NULL'
                : xField.result === common.FieldResultEnum.Number
                ? convertToNumberOrNull(xV)
                : xV,
              value: convertToNumberOrNull(yV),
              sizeValue: sV
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

    return multiData;
  }

  makeEData(item: { qData: RData[]; xField: common.MconfigField }) {
    let { qData, xField } = item;

    let eData: any[] = [];

    qData.forEach(row => {
      let resRow: { [k: string]: any } = {};

      Object.keys(row).forEach(key => {
        let cell = row[key];

        if (
          xField.result === common.FieldResultEnum.Ts &&
          xField.sqlName === cell.id
        ) {
          let xName = xField.sqlName;
          let xValueFn = this.getTsValueFn(xName);

          resRow[cell.id] = xValueFn(row, xName);
        } else if (this.isNumber(cell.value)) {
          resRow[cell.id] = Number(cell.value);
        } else {
          resRow[cell.id] = cell.value;
        }
      });

      eData.push(resRow);
    });

    return eData;
  }

  private getRawValue(row: any, fieldName: string) {
    return row[fieldName].value;
  }

  private getTsValueFn(fieldName: string) {
    let fieldValue: any;

    if (fieldName.match(/(?:___date)$/g)) {
      fieldValue = this.getDateFromDate;
    } else if (fieldName.match(/(?:___week)$/g)) {
      fieldValue = this.getDateFromWeek;
    } else if (fieldName.match(/(?:___month)$/g)) {
      fieldValue = this.getDateFromMonth;
    } else if (fieldName.match(/(?:___quarter)$/g)) {
      fieldValue = this.getDateFromQuarter;
    } else if (fieldName.match(/(?:___year)$/g)) {
      fieldValue = this.getDateFromYear;
    } else if (fieldName.match(/(?:___time)$/g)) {
      fieldValue = this.getDateFromTime;
    } else if (fieldName.match(/(?:___ts)$/g)) {
      // _ts,
      fieldValue = this.getDateFromTimestamp;
    } else if (fieldName.match(/(?:_ts)$/g)) {
      // date_ts, week_ts, month_ts, quarter_ts, year_ts, hour_ts, minute_ts
      fieldValue = this.getDateFromTimestamp;
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
    } else {
      fieldValue = this.getRawValue;
    }

    return fieldValue;
  }

  private getDateFromDate(row: any, fieldName: string) {
    let data = row[fieldName].value;

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

  private getDateFromHour(row: any, fieldName: string) {
    let data = row[fieldName].value;

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

  private getDateFromMinute(row: any, fieldName: string) {
    let data = row[fieldName].value;

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

  private getDateFromMonth(row: any, fieldName: string) {
    let data = row[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month] = r;

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromQuarter(row: any, fieldName: string) {
    let data = row[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month] = r;

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromTime(row: any, fieldName: string) {
    let data = row[fieldName].value;

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

  private getDateFromTimestamp(row: any, fieldName: string) {
    let data = row[fieldName].value;

    // let date = new Date(data); can be used if offset specified

    let regEx =
      /^(\d\d\d\d)[-](\d\d)[-](\d\d)[T](\d\d)[:](\d\d)[:](\d\d)\.(\d\d\d)/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour, minute, second, ms] = r;

    let date = common.isDefinedAndNotEmpty(ms)
      ? new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10),
          parseInt(ms, 10)
        )
      : new Date(
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

  makeAgData(item: { qData: RData[]; xField: common.MconfigField }) {
    let { qData, xField } = item;
    // console.log('xField ===========')
    // console.log(xField)

    // console.log('qData ===========')
    // console.log(qData[0])

    let newData = new Array(qData.length);

    for (let i = 0; i < qData.length; i++) {
      let row = qData[i];
      let resRow: { [k: string]: any } = {};

      for (const cellKey in row) {
        if (Object.prototype.hasOwnProperty.call(row, cellKey)) {
          let cell = row[cellKey];

          if (
            xField.result === common.FieldResultEnum.Ts &&
            xField.sqlName === cell.id
          ) {
            let xName = xField.sqlName;
            let xValueFn = this.getTsValueFn(xName);
            resRow[cell.id] = xValueFn(row, xName);
          } else if (this.isNumber(cell.value)) {
            resRow[cell.id] = Number(cell.value);
          } else {
            resRow[cell.id] = cell.value;
          }
        }
      }

      resRow[common.CHART_DEFAULT_SIZE_FIELD_VALUE] = 1;

      newData[i] = resRow;
    }
    // console.log('newData ===========')
    // console.log(newData[0])
    return newData;
  }

  getValueData(item: {
    mconfigFields: common.MconfigField[];
    data: RData[];
    currentValueFieldId: string;
    previousValueFieldId: string;
  }) {
    let { mconfigFields, data, currentValueFieldId, previousValueFieldId } =
      item;

    let currentValueField = mconfigFields.find(
      f => f.id === currentValueFieldId
    );

    let currentValueName = currentValueField.sqlName;

    let currentValue = convertToNumberOrNull(data[0][currentValueName].value);

    let previousValueField;

    previousValueField = mconfigFields.find(f => f.id === previousValueFieldId);

    if (!previousValueField) {
      return [currentValue, 0];
    }

    let previousValueName = previousValueField.sqlName;

    let previousValue = convertToNumberOrNull(data[0][previousValueName].value);

    return [currentValue, previousValue];
  }

  getSingleData(item: {
    selectFields: common.MconfigField[];
    data: RData[];
    xFieldId: string;
    yFieldId: string;
  }) {
    let { selectFields, data, xFieldId, yFieldId } = item;

    let xField = selectFields.find(f => f.id === xFieldId);
    let yField = selectFields.find(f => f.id === yFieldId);

    let xName = xField.sqlName;
    let yName = yField.sqlName;

    let singleData = data.map((row: RData) => ({
      name: common.isDefined(row[xName].value) ? `${row[xName].value}` : 'NULL',
      value: convertToNumberOrNull(row[yName].value)
    }));

    return singleData;
  }

  getSingleDataForNumberCard(item: {
    selectFields: common.MconfigField[];
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
      ? data.map((row: RData) =>
          Object.assign({
            name: common.isDefined(xField)
              ? common.isDefined(row[xName].value)
                ? row[xName].value
                : 'NULL'
              : ' ',
            value: convertToNumberOrNull(row[yName].value)
          })
        )
      : [];

    return singleData;
  }
}

function convertToNumberOrNull(x: any) {
  let xNum = common.isDefined(x) ? Number(x) : null;
  let y = common.isDefined(xNum) && Number.isNaN(xNum) === false ? xNum : null;
  return y;
}

// function convertToNumberOrZero(x: any) {
//   let xNum = common.isDefined(x) ? Number(x) : 0;
//   let y = Number.isNaN(xNum) === false ? xNum : 0;
//   return y;
// }
