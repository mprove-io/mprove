import { Injectable } from '@angular/core';
import { formatLocale } from 'd3-format';
import { SeriesOption } from 'echarts';
import { NO_FIELDS_SELECTED, capitalizeFirstLetter } from '~common/_index';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { DataPoint } from '../interfaces/data-point';
import { DataRow } from '../interfaces/data-row';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';

export interface SourceDataRow {
  [k: string]: string;
}

export interface QDataRow {
  [k: string]: QCell;
}

export interface QCell {
  id: string;
  value: string;
  valueFmt: string;
}

export interface SeriesDataElement {
  seriesName: string;
  seriesPoints: SeriesPoint[];
  seriesSizeName: string;
}

export interface SeriesPoint {
  xValue: string | number;
  xValueFmt: string;
  yValue: number;
  yValueFmt: string;
  sizeValue: number;
  sizeValueFmt: string;
  sizeValueMod: number;
  sizeFieldName: string;
}

interface PrepareData {
  [key: string]: SeriesPoint[];
}

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private structQuery: StructQuery, private uiQuery: UiQuery) {}

  private isNumberString(v: unknown): boolean {
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

  private convertToNumberOrNull(x: any) {
    let xNum = common.isDefined(x) ? Number(x) : null;
    let y = common.isDefined(xNum) && this.isNumberString(xNum) ? xNum : null;
    return y;
  }

  // private convertToNumberOrZero(x: any) {
  //   let xNum = common.isDefined(x) ? Number(x) : 0;
  //   let y = Number.isNaN(xNum) === false ? xNum : 0;
  //   return y;
  // }

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
      fieldResult === common.FieldResultEnum.Number &&
      this.isNumberString(value) &&
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

  makeQData(item: { data: SourceDataRow[]; columns: common.MconfigField[] }) {
    let { data, columns } = item;

    // console.log('data');
    // console.log(data);
    // console.log('columns');
    // console.log(columns);

    if (common.isUndefined(data)) {
      return [];
    }

    let qData: QDataRow[] = [];

    data.forEach((row: SourceDataRow) => {
      let r: QDataRow = {};

      Object.keys(row)
        .filter(k => k !== NO_FIELDS_SELECTED)
        .forEach(key => {
          let value = row[key];

          let fieldId = key.toLowerCase();

          let field = columns.find(x => x.sqlName === fieldId);

          let tsValue: number;

          if (field.result === common.FieldResultEnum.Ts) {
            let tsValueFn = this.getTsValueFn(field.sqlName);

            tsValue = common.isDefined(tsValueFn)
              ? tsValueFn(value).getTime()
              : undefined;
          }

          let cell: QCell = {
            id: key.toLowerCase(),
            value: common.isDefined(value) ? value : 'NULL',
            valueFmt: common.isUndefined(value)
              ? 'NULL'
              : common.isDefined(tsValue)
              ? common.formatTsUnix({
                  timeSpec: this.getTimeSpecByFieldSqlName(field.sqlName),
                  unixTimeZoned: tsValue / 1000
                })
              : this.formatValue({
                  value: value,
                  formatNumber: field?.formatNumber,
                  fieldResult: field?.result,
                  currencyPrefix: field?.currencyPrefix,
                  currencySuffix: field?.currencySuffix
                })
          };

          r[key.toLowerCase()] = cell;
        });

      qData.push(r);
    });

    // console.log('qData');
    // console.log(qData);

    return qData;
  }

  makeSeriesData(item: {
    selectFields: common.MconfigField[];
    data: QDataRow[];
    multiFieldId: string;
    xFieldId: string;
    sizeFieldId: string;
    yFieldsIds: string[];
    chartType: common.ChartTypeEnum;
  }) {
    let {
      selectFields,
      data,
      multiFieldId,
      xFieldId,
      sizeFieldId,
      yFieldsIds,
      chartType
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

    let prepareData: {
      [key: string]: SeriesPoint[];
    } = {};

    let addNorm = 0;
    let sizeMin = 1;
    let sizeMax = 1;

    let sizeFieldLabel: string;

    if (common.isDefined(sizeField)) {
      sizeFieldLabel =
        sizeField.topLabel +
        (common.isDefined(sizeField.groupLabel)
          ? ` ${capitalizeFirstLetter(sizeField.groupLabel)}`
          : '') +
        ` ${capitalizeFirstLetter(sizeField.label)}`;

      let sizeValues = data
        .map((x: QDataRow) =>
          this.isNumberString(x[sizeField.sqlName].value)
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

    data.forEach((row: QDataRow) => {
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
          let tsValueFn = this.getTsValueFn(xName);

          let xV =
            xField.result === common.FieldResultEnum.Ts
              ? common.isDefined(tsValueFn)
                ? tsValueFn(row[xName].value).getTime()
                : row[xName].value
              : row[xName].value;

          if (common.isDefined(xV)) {
            let element: SeriesPoint = {
              xValue: common.isUndefined(xV)
                ? 'NULL'
                : xField.result === common.FieldResultEnum.Number
                ? this.convertToNumberOrNull(xV)
                : xV,
              yValue: this.convertToNumberOrNull(row[yName].value),
              xValueFmt: row[xName].valueFmt,
              yValueFmt: row[yName].valueFmt,
              sizeValueMod:
                common.isDefined(sizeName) &&
                this.isNumberString(row[sizeName].value)
                  ? (Number(row[sizeName].value) + addNorm) /
                    (sizeMax + sizeMin)
                  : 1,
              sizeValue:
                common.isDefined(sizeName) &&
                this.isNumberString(row[sizeName].value)
                  ? Number(row[sizeName].value)
                  : undefined,
              sizeValueFmt:
                common.isDefined(sizeName) &&
                this.isNumberString(row[sizeName].value)
                  ? row[sizeName].valueFmt
                  : undefined,
              sizeFieldName: sizeFieldLabel
            };

            if (prepareData[key as keyof PrepareData]) {
              prepareData[key as keyof PrepareData].push(element);
            } else {
              prepareData[key as keyof PrepareData] = [element];
            }
          }
        }
      });
    });

    let structState = this.structQuery.getValue();

    let sortedDaysOfWeek =
      structState.weekStart === common.ProjectWeekStartEnum.Monday
        ? [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ]
        : [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ];

    let sortedMonthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    let sortedQuartersOfYear = ['Q1', 'Q2', 'Q3', 'Q4'];

    let seriesData: SeriesDataElement[] = Object.keys(prepareData).map(x =>
      Object.assign({
        seriesName: x,
        seriesSizeName: sizeField?.label,
        seriesPoints:
          chartType !== common.ChartTypeEnum.Scatter &&
          (xField?.result === common.FieldResultEnum.Ts ||
            xField?.result === common.FieldResultEnum.Number ||
            xField?.result === common.FieldResultEnum.DayOfWeek ||
            xField?.result === common.FieldResultEnum.DayOfWeekIndex ||
            xField?.result === common.FieldResultEnum.MonthName ||
            xField?.result === common.FieldResultEnum.QuarterOfYear)
            ? prepareData[x].sort((a: SeriesPoint, b: SeriesPoint) =>
                xField?.result === common.FieldResultEnum.Number ||
                xField?.result === common.FieldResultEnum.DayOfWeekIndex ||
                xField?.result === common.FieldResultEnum.Ts
                  ? Number(a.xValue) > Number(b.xValue)
                    ? 1
                    : Number(b.xValue) > Number(a.xValue)
                    ? -1
                    : 0
                  : xField?.result === common.FieldResultEnum.DayOfWeek
                  ? sortedDaysOfWeek.indexOf(a.xValue as string) >
                    sortedDaysOfWeek.indexOf(b.xValue as string)
                    ? 1
                    : sortedDaysOfWeek.indexOf(b.xValue as string) >
                      sortedDaysOfWeek.indexOf(a.xValue as string)
                    ? -1
                    : 0
                  : xField?.result === common.FieldResultEnum.MonthName
                  ? sortedMonthNames.indexOf(a.xValue as string) >
                    sortedMonthNames.indexOf(b.xValue as string)
                    ? 1
                    : sortedMonthNames.indexOf(b.xValue as string) >
                      sortedMonthNames.indexOf(a.xValue as string)
                    ? -1
                    : 0
                  : xField?.result === common.FieldResultEnum.QuarterOfYear
                  ? sortedQuartersOfYear.indexOf(a.xValue as string) >
                    sortedQuartersOfYear.indexOf(b.xValue as string)
                    ? 1
                    : sortedQuartersOfYear.indexOf(b.xValue as string) >
                      sortedQuartersOfYear.indexOf(a.xValue as string)
                    ? -1
                    : 0
                  : 0
              )
            : prepareData[x]
      } as SeriesDataElement)
    );

    // console.log('seriesData');
    // console.log(seriesData);

    return seriesData;
  }

  makeEData(item: { qData: QDataRow[]; xField: common.MconfigField }) {
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
          let tsValueFn = this.getTsValueFn(xName);

          resRow[cell.id] =
            xField.result === common.FieldResultEnum.Ts
              ? common.isDefined(tsValueFn)
                ? tsValueFn(row[xName].value).getTime()
                : row[xName].value
              : row[xName].value;
        } else if (this.isNumberString(cell.value)) {
          resRow[cell.id] = Number(cell.value);
        } else {
          resRow[cell.id] = cell.value;
        }
      });

      eData.push(resRow);
    });

    return eData;
  }

  private getTsValueFn(fieldSqlName: string) {
    let tsValueFn: (rValue: string) => Date;

    if (fieldSqlName.match(/(?:___date)$/g)) {
      tsValueFn = this.getDateFromDate;
    } else if (fieldSqlName.match(/(?:___week)$/g)) {
      tsValueFn = this.getDateFromWeek;
    } else if (fieldSqlName.match(/(?:___month)$/g)) {
      tsValueFn = this.getDateFromMonth;
    } else if (fieldSqlName.match(/(?:___quarter)$/g)) {
      tsValueFn = this.getDateFromQuarter;
    } else if (fieldSqlName.match(/(?:___year)$/g)) {
      tsValueFn = this.getDateFromYear;
    } else if (fieldSqlName.match(/(?:___time)$/g)) {
      tsValueFn = this.getDateFromTime;
    } else if (fieldSqlName.match(/(?:___ts)$/g)) {
      // _ts,
      tsValueFn = this.getDateFromTimestamp;
    } else if (fieldSqlName.match(/(?:_ts)$/g)) {
      // date_ts, week_ts, month_ts, quarter_ts, year_ts, hour_ts, minute_ts
      tsValueFn = this.getDateFromTimestamp;
    } else if (fieldSqlName.match(/(?:___hour)$/g)) {
      tsValueFn = this.getDateFromHour;
    } else if (fieldSqlName.match(/(?:___hour2)$/g)) {
      tsValueFn = this.getDateFromHour;
    } else if (fieldSqlName.match(/(?:___hour3)$/g)) {
      tsValueFn = this.getDateFromHour;
    } else if (fieldSqlName.match(/(?:___hour4)$/g)) {
      tsValueFn = this.getDateFromHour;
    } else if (fieldSqlName.match(/(?:___hour6)$/g)) {
      tsValueFn = this.getDateFromHour;
    } else if (fieldSqlName.match(/(?:___hour8)$/g)) {
      tsValueFn = this.getDateFromHour;
    } else if (fieldSqlName.match(/(?:___hour12)$/g)) {
      tsValueFn = this.getDateFromHour;
    } else if (fieldSqlName.match(/(?:___minute)$/g)) {
      tsValueFn = this.getDateFromMinute;
    } else if (fieldSqlName.match(/(?:___minute2)$/g)) {
      tsValueFn = this.getDateFromMinute;
    } else if (fieldSqlName.match(/(?:___minute3)$/g)) {
      tsValueFn = this.getDateFromMinute;
    } else if (fieldSqlName.match(/(?:___minute5)$/g)) {
      tsValueFn = this.getDateFromMinute;
    } else if (fieldSqlName.match(/(?:___minute10)$/g)) {
      tsValueFn = this.getDateFromMinute;
    } else if (fieldSqlName.match(/(?:___minute15)$/g)) {
      tsValueFn = this.getDateFromMinute;
    } else if (fieldSqlName.match(/(?:___minute30)$/g)) {
      tsValueFn = this.getDateFromMinute;
    }

    return tsValueFn;
  }

  getTimeSpecByFieldSqlName(fieldSqlName: string) {
    return fieldSqlName.match(/(?:___year)$/g)
      ? common.TimeSpecEnum.Years
      : fieldSqlName.match(/(?:___quarter)$/g)
      ? common.TimeSpecEnum.Quarters
      : fieldSqlName.match(/(?:___month)$/g)
      ? common.TimeSpecEnum.Months
      : fieldSqlName.match(/(?:___week)$/g)
      ? common.TimeSpecEnum.Weeks
      : fieldSqlName.match(/(?:___date)$/g)
      ? common.TimeSpecEnum.Days
      : fieldSqlName.match(/(?:___hour)$/g)
      ? common.TimeSpecEnum.Hours
      : fieldSqlName.match(/(?:___hour2)$/g)
      ? common.TimeSpecEnum.Hours
      : fieldSqlName.match(/(?:___hour3)$/g)
      ? common.TimeSpecEnum.Hours
      : fieldSqlName.match(/(?:___hour4)$/g)
      ? common.TimeSpecEnum.Hours
      : fieldSqlName.match(/(?:___hour6)$/g)
      ? common.TimeSpecEnum.Hours
      : fieldSqlName.match(/(?:___hour8)$/g)
      ? common.TimeSpecEnum.Hours
      : fieldSqlName.match(/(?:___hour12)$/g)
      ? common.TimeSpecEnum.Hours
      : fieldSqlName.match(/(?:___ts)$/g)
      ? common.TimeSpecEnum.Timestamps
      : common.TimeSpecEnum.Minutes;
  }

  private getDateFromDate(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day] = r;

    let date = new Date(
      Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
    );

    return date;
  }

  private getDateFromHour(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour] = r;

    let date = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10)
      )
    );

    return date;
  }

  private getDateFromMinute(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour, minute] = r;

    let date = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10)
      )
    );

    return date;
  }

  private getDateFromMonth(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month] = r;

    let date = new Date(
      Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1)
    );

    return date;
  }

  private getDateFromQuarter(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month] = r;

    let date = new Date(
      Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1)
    );

    return date;
  }

  private getDateFromTime(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d)[:](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour, minute, second] = r;

    let date = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      )
    );

    return date;
  }

  private getDateFromTimestamp(rValue: string) {
    let data = rValue;

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
          Date.UTC(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(minute, 10),
            parseInt(second, 10),
            parseInt(ms, 10)
          )
        )
      : new Date(
          Date.UTC(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(minute, 10),
            parseInt(second, 10)
          )
        );

    return date;
  }

  private getDateFromWeek(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year, month, day] = r;

    let date = new Date(
      Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
    );

    return date;
  }

  private getDateFromYear(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)$/g;

    let r = regEx.exec(data);

    if (common.isUndefined(r)) {
      return null;
    }

    let [full, year] = r;

    let date = new Date(Date.UTC(parseInt(year, 10), 0, 1));

    return date;
  }

  makeAgData(item: { qData: QDataRow[]; xField: common.MconfigField }) {
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

            let tsValueFn = this.getTsValueFn(xName);

            resRow[cell.id] =
              xField.result === common.FieldResultEnum.Ts
                ? common.isDefined(tsValueFn)
                  ? tsValueFn(row[xName].value).getTime()
                  : row[xName].value
                : row[xName].value;
          } else if (this.isNumberString(cell.value)) {
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
    data: QDataRow[];
    currentValueFieldId: string;
    previousValueFieldId: string;
  }) {
    let { mconfigFields, data, currentValueFieldId, previousValueFieldId } =
      item;

    let currentValueField = mconfigFields.find(
      f => f.id === currentValueFieldId
    );

    let currentValueName = currentValueField.sqlName;

    let currentValue = this.convertToNumberOrNull(
      data[0][currentValueName].value
    );

    let previousValueField;

    previousValueField = mconfigFields.find(f => f.id === previousValueFieldId);

    if (!previousValueField) {
      return [currentValue, 0];
    }

    let previousValueName = previousValueField.sqlName;

    let previousValue = this.convertToNumberOrNull(
      data[0][previousValueName].value
    );

    return [currentValue, previousValue];
  }

  getSingleData(item: {
    selectFields: common.MconfigField[];
    data: QDataRow[];
    xFieldId: string;
    yFieldId: string;
  }) {
    let { selectFields, data, xFieldId, yFieldId } = item;

    let xField = selectFields.find(f => f.id === xFieldId);
    let yField = selectFields.find(f => f.id === yFieldId);

    let xName = xField.sqlName;
    let yName = yField.sqlName;

    let singleData = data.map((row: QDataRow) => ({
      name: common.isDefined(row[xName].value) ? `${row[xName].value}` : 'NULL',
      value: this.convertToNumberOrNull(row[yName].value)
    }));

    return singleData;
  }

  getSingleDataForNumberCard(item: {
    selectFields: common.MconfigField[];
    data: QDataRow[];
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
      ? data.map((row: QDataRow) =>
          Object.assign({
            name: common.isDefined(xField)
              ? common.isDefined(row[xName].value)
                ? row[xName].value
                : 'NULL'
              : ' ',
            value: this.convertToNumberOrNull(row[yName].value)
          })
        )
      : [];

    return singleData;
  }

  metricsMakeRowName(item: {
    row: DataRow;
    showMetricsModelName: boolean;
    showMetricsTimeFieldName: boolean;
  }) {
    let { row, showMetricsModelName, showMetricsTimeFieldName } = item;
    let { partLabel, topLabel, timeLabel } = item.row;

    let name;

    if (row.rowType !== common.RowTypeEnum.Metric) {
      name = row.name;
    } else {
      name = partLabel;

      if (showMetricsModelName === true) {
        name = `${topLabel} ${name}`;
      }

      if (showMetricsTimeFieldName === true) {
        name = `${name} by ${timeLabel}`;
      }
    }

    return `(${row.rowId}) ${name}`;
  }

  metricsRowToSeries(item: {
    row: DataRow;
    dataPoints: DataPoint[];
    showMetricsModelName: boolean;
    showMetricsTimeFieldName: boolean;
  }) {
    let { row, dataPoints, showMetricsModelName, showMetricsTimeFieldName } =
      item;

    let rowName = this.metricsMakeRowName({
      row: row,
      showMetricsModelName: showMetricsModelName,
      showMetricsTimeFieldName: showMetricsTimeFieldName
    });

    let seriesOption: SeriesOption = {
      type: 'line',
      symbol: 'circle',
      symbolSize: 8,
      cursor: 'default',
      // legendHoverLink: true,
      lineStyle: {
        width: 3
      },
      // areaStyle: {},
      emphasis: {
        disabled: true
      },
      name: rowName,
      data: dataPoints.map(dataPoint => ({
        name: rowName,
        value: [dataPoint.columnId * 1000, dataPoint[rowName]]
      })),
      tooltip: {
        // position: 'top',
        borderWidth: 2,
        textStyle: {
          fontSize: 16
        },
        // valueFormatter: ...
        formatter: (p: any) => {
          // console.log(p);

          let timeSpec = this.uiQuery.getValue().timeSpec;

          let columnLabel = common.formatTsUnix({
            timeSpec: timeSpec,
            unixTimeZoned: p.data.value[0] / 1000
          });

          let formattedValue = common.isDefined(p.data.value[1])
            ? this.formatValue({
                value: Number(p.data.value[1]),
                formatNumber: row.formatNumber,
                fieldResult: common.FieldResultEnum.Number,
                currencyPrefix: row.currencyPrefix,
                currencySuffix: row.currencySuffix
              })
            : 'null';

          return `${p.name}<br/><strong>${formattedValue}</strong><br/>${columnLabel}`;
        }
        // textStyle: {}
      }
    };

    return seriesOption;
  }
}
