import { Injectable } from '@angular/core';
import { FieldBase } from '@malloydata/malloy/dist/model';
import { formatLocale } from 'd3-format';
import { SeriesOption } from 'echarts';
import { format } from 'ssf';
import { NO_FIELDS_SELECTED, capitalizeFirstLetter } from '~common/_index';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { frontFormatTsUnix } from '../functions/front-format-ts-unix';
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
  name: string;
  value: string;
  valueFmt: string;
}

export interface YSeriesElement {
  yKeyId: string; // multi by multifield
  yFieldId: string;
  points: SeriesPoint[];
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

export interface SeriesDataElement {
  seriesId: string;
  seriesName: string;
  seriesPoints: SeriesPoint[];
  seriesSizeName: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(
    private structQuery: StructQuery,
    private uiQuery: UiQuery
  ) {}

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

  // from malloy
  private formatTimeUnit(
    value: number,
    unit: string,
    options: { numFormat?: string; terse?: boolean } = {},
    thousandsSeparator: string
  ) {
    let terseDurationUnitsMap = new Map<string, string>([
      ['nanoseconds', 'ns'],
      ['microseconds', 'µs'],
      ['milliseconds', 'ms'],
      ['seconds', 's'],
      ['minutes', 'm'],
      ['hours', 'h'],
      ['days', 'd']
    ]);

    let unitString = unit.toString();

    if (options.terse) {
      unitString = terseDurationUnitsMap.get(unit) ?? unitString;
    } else if (value === 1) {
      unitString = unitString.substring(0, unitString.length - 1);
    }

    let formattedValue = options.numFormat
      ? format(options.numFormat, value)
      : Number(value).toLocaleString().split(',').join(thousandsSeparator);

    return `${formattedValue}${options.terse ? '' : ' '}${unitString}`;
  }

  // from malloy
  private getText(item: {
    terse: boolean;
    numFormat: string;
    value: number;
    options: {
      durationUnit?: string;
    };
    thousandsSeparator: string;
  }): string | null {
    let { terse, numFormat, value, options, thousandsSeparator } = item;

    const multiplierMap = new Map<string, number>([
      ['nanoseconds', 1000],
      ['microseconds', 1000],
      ['milliseconds', 1000],
      ['seconds', 60],
      ['minutes', 60],
      ['hours', 24],
      ['days', Number.MAX_VALUE]
    ]);

    let targetUnit = options.durationUnit;

    let currentDuration = value;
    let currentUnitValue = 0;
    let durationParts: string[] = [];
    let foundUnit = false;

    for (const [unit, multiplier] of multiplierMap) {
      if (unit === targetUnit) {
        foundUnit = true;
      }

      if (!foundUnit) {
        continue;
      }

      currentUnitValue = currentDuration % multiplier;
      currentDuration = Math.floor((currentDuration /= multiplier));

      if (currentUnitValue > 0) {
        durationParts = [
          this.formatTimeUnit(
            currentUnitValue,
            unit,
            { numFormat, terse },
            thousandsSeparator
          ),
          ...durationParts
        ];
      }

      if (currentDuration === 0) {
        break;
      }
    }

    if (durationParts.length > 0) {
      return durationParts.slice(0, 2).join(' ');
    }

    return this.formatTimeUnit(
      0,
      targetUnit,
      { numFormat, terse },
      thousandsSeparator
    );
  }

  formatValue(item: {
    value: any;
    formatNumber: string;
    fieldResult: common.FieldResultEnum;
    currencyPrefix: string;
    currencySuffix: string;
    thousandsSeparator: string;
  }) {
    let {
      value,
      thousandsSeparator,
      formatNumber,
      fieldResult,
      currencyPrefix,
      currencySuffix
    } = item;

    if (
      fieldResult === common.FieldResultEnum.Number &&
      this.isNumberString(value) &&
      common.isDefined(formatNumber)
    ) {
      let locale = formatLocale({
        decimal: constants.FORMAT_NUMBER_DECIMAL,
        thousands: thousandsSeparator,
        grouping: constants.FORMAT_NUMBER_GROUPING,
        currency: [currencyPrefix ?? '', currencySuffix ?? '']
      });

      return locale.format(formatNumber)(Number(value));
    } else {
      return value;
    }
  }

  makeQData(item: {
    // mconfigFields: common.MconfigField[];

    query: common.Query;
    mconfig: common.MconfigX;
    // modelType: common.ModelTypeEnum;
    // compiledQuery: CompiledQuery;
  }) {
    let { query, mconfig } = item;

    let struct = this.structQuery.getValue();

    // ---mconfigField
    // description: "The date of the event, formatted as YYYYMMDD"
    // fieldClass: "dimension"
    // hidden: false
    // id: "time.date"
    // isHideColumn: false
    // label: "Date"
    // result: "string"
    // sorting: {fieldId: 'time.date', desc: false}
    // sortingNumber: 0
    // sqlName: "time_date"
    // topId: "time"
    // topLabel: "time"
    // type: "custom"

    let data: SourceDataRow[] = query.data;

    let isStore = common.isUndefined(query.sql);

    // console.log('data');
    // console.log(data);

    // console.log('columns');
    // console.log(mconfigFields);

    if (common.isUndefined(data)) {
      return [];
    }

    let qData: QDataRow[] = [];

    // console.log('dataService data');
    // console.log(data);

    if (mconfig.select.length === 0) {
      console.log('dataService mconfig.compiledQuery');
      console.log(mconfig.compiledQuery);

      console.log('dataService mconfig.select');
      console.log(mconfig.select);

      console.log('dataService mconfig.fields');
      console.log(mconfig.fields);
    }

    data.forEach((row: SourceDataRow) => {
      let r: QDataRow = {};

      // console.log('row');
      // console.log(row);

      let dataRow: SourceDataRow =
        mconfig.modelType === common.ModelTypeEnum.Malloy
          ? (row['row' as any] as unknown as SourceDataRow)
          : row;

      Object.keys(dataRow)
        .filter(k => k !== NO_FIELDS_SELECTED)
        .forEach(key => {
          let value = dataRow[key];

          // console.log('key');
          // console.log(key);

          let fieldId: string;
          let sqlName: string;

          // console.log('mconfig.modelType');
          // console.log(mconfig.modelType);

          if (mconfig.modelType === common.ModelTypeEnum.Malloy) {
            let compiledQueryField =
              mconfig.compiledQuery.structs[0].fields.find(
                x => x.name === key
              ) as FieldBase;

            // console.log('compiledQueryField');
            // console.log(compiledQueryField);

            sqlName = compiledQueryField.name;

            let drillExpression =
              compiledQueryField?.resultMetadata?.drillExpression;

            fieldId =
              drillExpression?.kind === 'field_reference'
                ? drillExpression.path.length > 0
                  ? drillExpression.path.join('.') + '.' + drillExpression.name
                  : drillExpression.name
                : undefined;
          } else if (mconfig.modelType === common.ModelTypeEnum.Store) {
            fieldId = key.toLowerCase();
          }

          // console.log('fieldId');
          // console.log(fieldId);

          let field = mconfig.fields.find(x => {
            return x.id === fieldId;
          });

          // console.log('field');
          // console.log(field);

          if (mconfig.modelType === common.ModelTypeEnum.Store) {
            sqlName = field.sqlName;
          }

          // console.log('sqlName');
          // console.log(sqlName);

          let tsValue: number;

          if (common.isDefined(field.detail)) {
            tsValue = dataRow[field.id] as unknown as number;
          } else if (field.result === common.FieldResultEnum.Ts) {
            let tsValueFn =
              mconfig.modelType === common.ModelTypeEnum.Malloy
                ? this.getDateFromT
                : this.getTsValueFn(sqlName);

            tsValue = common.isDefined(tsValueFn)
              ? tsValueFn(value).getTime()
              : undefined;
          }

          let storeTimeSpec =
            isStore === false
              ? undefined
              : field.detail === common.DetailUnitEnum.Timestamps
                ? common.TimeSpecEnum.Timestamps
                : field.detail === common.DetailUnitEnum.Minutes
                  ? common.TimeSpecEnum.Minutes
                  : field.detail === common.DetailUnitEnum.Hours
                    ? common.TimeSpecEnum.Hours
                    : field.detail === common.DetailUnitEnum.Days
                      ? common.TimeSpecEnum.Days
                      : field.detail === common.DetailUnitEnum.WeeksSunday
                        ? common.TimeSpecEnum.Weeks
                        : field.detail === common.DetailUnitEnum.WeeksMonday
                          ? common.TimeSpecEnum.Weeks
                          : field.detail === common.DetailUnitEnum.Months
                            ? common.TimeSpecEnum.Months
                            : field.detail === common.DetailUnitEnum.Quarters
                              ? common.TimeSpecEnum.Quarters
                              : field.detail === common.DetailUnitEnum.Years
                                ? common.TimeSpecEnum.Years
                                : undefined;

          let malloyNumberTag = field.malloyTags?.find(
            tag => tag.key === 'number'
          );

          let malloyCurrencyTag = field.malloyTags?.find(
            tag => tag.key === 'currency'
          );

          let malloyCurrencySymbol =
            malloyCurrencyTag?.value === 'usd'
              ? '$'
              : malloyCurrencyTag?.value === 'euro'
                ? '€'
                : malloyCurrencyTag?.value === 'pound'
                  ? '£'
                  : common.isDefined(malloyCurrencyTag)
                    ? '$'
                    : '';

          let malloyDurationTag = field.malloyTags?.find(
            tag => tag.key === 'duration'
          );

          let malloyDurationUnit =
            [
              'nanoseconds',
              'microseconds',
              'milliseconds',
              'seconds',
              'minutes',
              'hours',
              'days'
            ].indexOf(malloyDurationTag?.value) > -1
              ? malloyDurationTag.value
              : 'seconds';

          let thousandsSeparatorTag = field.mproveTags?.find(
            tag => tag.key === common.ParameterEnum.ThousandsSeparator
          );

          let thousandsSeparator =
            thousandsSeparatorTag?.value ?? struct.thousandsSeparator;

          // console.log('field');
          // console.log(field);

          // console.log('struct.formatNumber');
          // console.log(struct.formatNumber);

          // console.log('field.formatNumber');
          // console.log(field.formatNumber);

          let cell: QCell = {
            name: key.toLowerCase(),
            value:
              isStore === true && common.isDefined(storeTimeSpec)
                ? ((Number(value) * 1000) as unknown as string)
                : common.isDefined(value)
                  ? value
                  : 'NULL',
            valueFmt: common.isUndefined(value)
              ? 'NULL'
              : common.isDefined(tsValue)
                ? frontFormatTsUnix({
                    timeSpec:
                      isStore === true
                        ? storeTimeSpec
                        : this.getTimeSpecByFieldSqlName(sqlName),
                    unixTimeZoned: isStore === true ? tsValue : tsValue / 1000
                  })
                : // duration
                  field.result === common.FieldResultEnum.Number &&
                    mconfig.modelType === common.ModelTypeEnum.Malloy &&
                    common.isDefined(malloyDurationTag)
                  ? (this.getText({
                      value: Number(value),
                      options: {
                        durationUnit: malloyDurationUnit
                      },
                      terse:
                        field.malloyTags.map(tag => tag.key).indexOf('terse') >
                        -1,
                      numFormat: malloyNumberTag?.value, // if null - add ?? "#,##0,",
                      thousandsSeparator: thousandsSeparator
                    }) ??
                    Number(value)
                      .toLocaleString()
                      .split(',')
                      .join(thousandsSeparator))
                  : // field.formatNumber
                    field.result === common.FieldResultEnum.Number &&
                      mconfig.modelType === common.ModelTypeEnum.Malloy &&
                      common.isDefined(field?.formatNumber)
                    ? this.formatValue({
                        value: value,
                        formatNumber: field?.formatNumber,
                        fieldResult: field?.result,
                        currencyPrefix:
                          field?.currencyPrefix ?? struct.currencyPrefix,
                        currencySuffix:
                          field?.currencySuffix ?? struct.currencySuffix,
                        thousandsSeparator: thousandsSeparator
                      })
                    : // malloy percent
                      field.result === common.FieldResultEnum.Number &&
                        mconfig.modelType === common.ModelTypeEnum.Malloy &&
                        field.malloyTags
                          .map(tag => tag.key)
                          .indexOf('percent') > -1
                      ? format(`#${thousandsSeparator}##0.00%`, value)
                      : // malloy currency
                        field.result === common.FieldResultEnum.Number &&
                          mconfig.modelType === common.ModelTypeEnum.Malloy &&
                          common.isDefined(malloyCurrencyTag)
                        ? format(
                            `${malloyCurrencySymbol}#${thousandsSeparator}##0.00`,
                            value
                          )
                        : // malloy number
                          field.result === common.FieldResultEnum.Number &&
                            mconfig.modelType === common.ModelTypeEnum.Malloy &&
                            common.isDefined(malloyNumberTag)
                          ? format(malloyNumberTag.value, value)
                          : field.result === common.FieldResultEnum.Number &&
                              common.isDefinedAndNotEmpty(struct.formatNumber)
                            ? // struct.formatNumber
                              this.formatValue({
                                value: value,
                                formatNumber: field?.formatNumber,
                                fieldResult: field?.result,
                                currencyPrefix: field?.currencyPrefix,
                                currencySuffix: field?.currencySuffix,
                                thousandsSeparator: thousandsSeparator
                              })
                            : field.result === common.FieldResultEnum.Number
                              ? // no formatNumber
                                Number(value)
                                  .toLocaleString()
                                  .split(',')
                                  .join(thousandsSeparator)
                              : // fallback
                                this.formatValue({
                                  value: value,
                                  formatNumber: field?.formatNumber,
                                  fieldResult: field?.result,
                                  currencyPrefix: field?.currencyPrefix,
                                  currencySuffix: field?.currencySuffix,
                                  thousandsSeparator: thousandsSeparator
                                })
          };

          r[fieldId] = cell;
        });

      qData.push(r);
    });

    // console.log('qData');
    // console.log(qData);

    return qData;
  }

  makeSeriesData(item: {
    modelType: common.ModelTypeEnum;
    selectFields: common.MconfigField[];
    data: QDataRow[];
    multiFieldId: string;
    xFieldId: string;
    sizeFieldId: string;
    yFieldsIds: string[];
    chartType: common.ChartTypeEnum;
  }) {
    let {
      modelType,
      selectFields,
      data,
      multiFieldId,
      xFieldId,
      sizeFieldId,
      yFieldsIds,
      chartType
    } = item;

    let struct = this.structQuery.getValue();

    // console.log('makeSeriesData item');
    // console.log(item);

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

    let multiField = common.isDefined(multiFieldId)
      ? selectFields.find(f => f.id === multiFieldId)
      : undefined;

    if (multiFieldId && !multiField) {
      return [];
    }

    let sizeField = common.isDefined(sizeFieldId)
      ? selectFields.find(f => f.id === sizeFieldId)
      : undefined;

    if (sizeFieldId && !sizeField) {
      return [];
    }

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
          this.isNumberString(x[sizeField.id].value)
            ? Number(x[sizeField.id].value)
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

    let ySeries: YSeriesElement[] = [];

    data.forEach((row: QDataRow) => {
      yFields.forEach(yField => {
        let yKeyId: string;

        let yLabel =
          yField.topLabel +
          (common.isDefined(yField.groupLabel)
            ? ` ${capitalizeFirstLetter(yField.groupLabel)}`
            : '') +
          ` ${capitalizeFirstLetter(yField.label)}`;

        if (multiField?.id) {
          if (yFields.length > 1) {
            yKeyId = row[multiField.id].value
              ? row[multiField.id].value + ' ' + yLabel
              : 'NULL' + ' ' + yLabel;
          } else {
            yKeyId = row[multiField.id].value
              ? row[multiField.id].value
              : 'NULL';
          }
        } else {
          yKeyId = yLabel;
        }

        let ySeriesElement: YSeriesElement = ySeries.find(
          y => y.yKeyId === yKeyId
        );

        if (common.isUndefined(ySeriesElement)) {
          ySeriesElement = {
            yKeyId: yKeyId,
            yFieldId: yField.id,
            points: []
          };

          ySeries.push(ySeriesElement);
        }

        // x null check
        if (row[xField.id]) {
          let tsValueFn =
            modelType === common.ModelTypeEnum.Malloy
              ? this.getDateFromT
              : this.getTsValueFn(xField.sqlName);

          let xV =
            xField.result === common.FieldResultEnum.Ts
              ? common.isDefined(tsValueFn)
                ? tsValueFn(row[xField.id].value).getTime()
                : row[xField.id].value
              : row[xField.id].value;

          if (common.isDefined(xV)) {
            let seriesPoint: SeriesPoint = {
              xValue: common.isUndefined(xV)
                ? 'NULL'
                : xField.result === common.FieldResultEnum.Number
                  ? this.convertToNumberOrNull(xV)
                  : xV,
              xValueFmt: row[xField.id].valueFmt,
              yValue: this.convertToNumberOrNull(row[yField.id].value),
              yValueFmt: row[yField.id].valueFmt,
              sizeValueMod:
                common.isDefined(sizeField?.id) &&
                this.isNumberString(row[sizeField.id].value)
                  ? (Number(row[sizeField.id].value) + addNorm) /
                    (sizeMax + sizeMin)
                  : 1,
              sizeValue:
                common.isDefined(sizeField?.id) &&
                this.isNumberString(row[sizeField.id].value)
                  ? Number(row[sizeField.id].value)
                  : undefined,
              sizeValueFmt:
                common.isDefined(sizeField?.id) &&
                this.isNumberString(row[sizeField.id].value)
                  ? row[sizeField.id].valueFmt
                  : undefined,
              sizeFieldName: sizeFieldLabel
            };

            ySeriesElement.points.push(seriesPoint);
          }
        }
      });
    });

    // console.log('ySeries');
    // console.log(ySeries);

    let sortedDaysOfWeek =
      struct.weekStart === common.ProjectWeekStartEnum.Monday
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

    let seriesData: SeriesDataElement[] = ySeries.map(ySeriesElement =>
      Object.assign({
        seriesName: ySeriesElement.yKeyId,
        seriesId: ySeriesElement.yFieldId,
        seriesSizeName: sizeField?.label,
        seriesPoints:
          chartType !== common.ChartTypeEnum.Scatter &&
          (xField?.result === common.FieldResultEnum.Ts ||
            xField?.result === common.FieldResultEnum.Number ||
            xField?.result === common.FieldResultEnum.DayOfWeek ||
            xField?.result === common.FieldResultEnum.DayOfWeekIndex ||
            xField?.result === common.FieldResultEnum.MonthName ||
            xField?.result === common.FieldResultEnum.QuarterOfYear)
            ? ySeriesElement.points.sort((a: SeriesPoint, b: SeriesPoint) =>
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
            : ySeriesElement.points
      } as SeriesDataElement)
    );

    return seriesData;
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

  private getDateFromT(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)T(\d\d)[:](\d\d)[:](\d\d)$/g;

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

      if (showMetricsTimeFieldName === true) {
        name = `${name} by ${timeLabel}`;
      }

      if (showMetricsModelName === true) {
        name = `${name} - ${topLabel}`;
      }
    }

    return `(${row.rowId}) ${name}`;
  }

  metricsRowToSeries(item: {
    isMiniChart?: boolean;
    row: DataRow;
    dataPoints: DataPoint[];
    chartSeriesElement: common.MconfigChartSeries;
    showMetricsModelName: boolean;
    showMetricsTimeFieldName: boolean;
  }) {
    let {
      isMiniChart,
      row,
      chartSeriesElement,
      dataPoints,
      showMetricsModelName,
      showMetricsTimeFieldName
    } = item;

    let struct = this.structQuery.getValue();

    let rowName = this.metricsMakeRowName({
      row: row,
      showMetricsModelName: showMetricsModelName,
      showMetricsTimeFieldName: showMetricsTimeFieldName
    });

    let seriesOption: SeriesOption;

    if (isMiniChart === true) {
      // console.log('row');
      // console.log(row);

      seriesOption = {
        type: 'bar',
        barWidth: '90%',
        itemStyle: {
          color: '#0084d1',
          borderRadius: [0, 0, 0, 0]
          // borderRadius: [2, 2, 0, 0]
        },
        showBackground: true,
        backgroundStyle: {
          color: '#cdecfe'
        },
        //
        yAxisIndex: chartSeriesElement?.yAxisIndex,
        cursor: 'default',
        emphasis: {
          disabled: true
        },
        name: rowName,
        data: dataPoints.map(dataPoint => ({
          name: rowName,
          value: [dataPoint.columnId * 1000, dataPoint[rowName]]
        }))
      };
    } else {
      seriesOption = {
        type: common.isDefined(chartSeriesElement?.type)
          ? (chartSeriesElement.type as any)
          : 'line',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
        },
        //
        yAxisIndex: chartSeriesElement?.yAxisIndex,
        cursor: 'default',
        // legendHoverLink: true,
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

            let columnLabel = frontFormatTsUnix({
              timeSpec: timeSpec,
              unixTimeZoned: p.data.value[0] / 1000
            });

            let formattedValue = common.isDefined(p.data.value[1])
              ? this.formatValue({
                  value: Number(p.data.value[1]),
                  formatNumber: row.formatNumber,
                  fieldResult: common.FieldResultEnum.Number,
                  currencyPrefix: row.currencyPrefix,
                  currencySuffix: row.currencySuffix,
                  thousandsSeparator: struct.thousandsSeparator
                })
              : 'null';

            return `${p.name}<br/><strong>${formattedValue}</strong><br/>${columnLabel}`;
          }
          // textStyle: {}
        }
      };
    }

    return seriesOption;
  }
}
