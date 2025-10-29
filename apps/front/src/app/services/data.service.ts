import { Injectable } from '@angular/core';
import { FieldBase } from '@malloydata/malloy/dist/model';
import { formatLocale } from 'd3-format';
import { SeriesOption } from 'echarts';
import { DateTime } from 'luxon';
import { format } from 'ssf';
import { NO_FIELDS_SELECTED } from '~common/constants/top';
import {
  FORMAT_NUMBER_DECIMAL,
  FORMAT_NUMBER_GROUPING
} from '~common/constants/top-front';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { DetailUnitEnum } from '~common/enums/detail-unit.enum';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { MconfigField } from '~common/interfaces/backend/mconfig-field';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { MconfigChartSeries } from '~common/interfaces/blockml/mconfig-chart-series';
import { Query } from '~common/interfaces/blockml/query';
import { DataPoint } from '~common/interfaces/front/data-point';
import { DataRow } from '~common/interfaces/front/data-row';
import { frontFormatTsUnix } from '../functions/front-format-ts-unix';
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
    let xNum = isDefined(x) ? Number(x) : null;
    let y = isDefined(xNum) && this.isNumberString(xNum) ? xNum : null;
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

  d3FormatValue(item: {
    value: any;
    formatNumber: string;
    fieldResult: FieldResultEnum;
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
      fieldResult === FieldResultEnum.Number &&
      this.isNumberString(value) &&
      isDefined(formatNumber)
    ) {
      let locale = formatLocale({
        decimal: FORMAT_NUMBER_DECIMAL,
        thousands: thousandsSeparator,
        grouping: FORMAT_NUMBER_GROUPING,
        currency: [currencyPrefix ?? '', currencySuffix ?? '']
      });

      return locale.format(formatNumber)(Number(value));
    } else {
      return value;
    }
  }

  formatValue(item: {
    value: any;
    modelType: ModelTypeEnum;
    field: MconfigField;
    fieldResult: FieldResultEnum;
    rowFormatNumber?: string;
    rowCurrencyPrefix?: string;
    rowCurrencySuffix?: string;
  }) {
    let {
      value,
      modelType,
      field,
      fieldResult,
      rowFormatNumber,
      rowCurrencyPrefix,
      rowCurrencySuffix
    } = item;

    let struct = this.structQuery.getValue();

    let fieldFormatNumber = isDefinedAndNotEmpty(rowFormatNumber)
      ? rowFormatNumber
      : field?.formatNumber;

    let fieldCurrencyPrefix = isDefined(rowCurrencyPrefix)
      ? rowCurrencyPrefix
      : field?.currencyPrefix;

    let fieldCurrencySuffix = isDefined(rowCurrencySuffix)
      ? rowCurrencySuffix
      : field?.currencySuffix;

    let fieldMalloyTags = field?.malloyTags || [];

    let fieldMalloyNumberTag = fieldMalloyTags.find(
      tag => tag.key === 'number'
    );

    let fieldMalloyCurrencyTag = fieldMalloyTags.find(
      tag => tag.key === 'currency'
    );

    let fieldMalloyCurrencySymbol =
      fieldMalloyCurrencyTag?.value === 'usd'
        ? '$'
        : fieldMalloyCurrencyTag?.value === 'euro'
          ? '€'
          : fieldMalloyCurrencyTag?.value === 'pound'
            ? '£'
            : isDefined(fieldMalloyCurrencyTag)
              ? '$'
              : '';

    let fieldMalloyDurationTag = fieldMalloyTags.find(
      tag => tag.key === 'duration'
    );

    let fieldMalloyDurationUnit =
      [
        'nanoseconds',
        'microseconds',
        'milliseconds',
        'seconds',
        'minutes',
        'hours',
        'days'
      ].indexOf(fieldMalloyDurationTag?.value) > -1
        ? fieldMalloyDurationTag.value
        : 'seconds';

    let fieldThousandsSeparatorTag = field?.mproveTags?.find(
      tag => tag.key === ParameterEnum.ThousandsSeparator
    );

    let thousandsSeparator =
      fieldThousandsSeparatorTag?.value ??
      struct.mproveConfig.thousandsSeparator;

    let formattedValue =
      // malloy duration
      fieldResult === FieldResultEnum.Number &&
      modelType === ModelTypeEnum.Malloy &&
      isDefined(fieldMalloyDurationTag)
        ? (this.getText({
            value: Number(value),
            options: {
              durationUnit: fieldMalloyDurationUnit
            },
            terse: fieldMalloyTags.map(tag => tag.key).indexOf('terse') > -1,
            numFormat: fieldMalloyNumberTag?.value, // if null - add ?? "#,##0,",
            thousandsSeparator: thousandsSeparator
          }) ??
          Number(value).toLocaleString().split(',').join(thousandsSeparator))
        : // field.formatNumber
          fieldResult === FieldResultEnum.Number &&
            isDefinedAndNotEmpty(fieldFormatNumber)
          ? this.d3FormatValue({
              value: value,
              formatNumber: fieldFormatNumber,
              fieldResult: fieldResult,
              currencyPrefix:
                fieldCurrencyPrefix ?? struct.mproveConfig.currencyPrefix,
              currencySuffix:
                fieldCurrencySuffix ?? struct.mproveConfig.currencySuffix,
              thousandsSeparator: thousandsSeparator
            })
          : // malloy percent
            fieldResult === FieldResultEnum.Number &&
              modelType === ModelTypeEnum.Malloy &&
              fieldMalloyTags.map(tag => tag.key).indexOf('percent') > -1
            ? format(`#${thousandsSeparator}##0.00%`, value)
            : // malloy currency
              fieldResult === FieldResultEnum.Number &&
                modelType === ModelTypeEnum.Malloy &&
                isDefined(fieldMalloyCurrencyTag)
              ? format(
                  `${fieldMalloyCurrencySymbol}#${thousandsSeparator}##0.00`,
                  value
                )
              : // malloy number
                fieldResult === FieldResultEnum.Number &&
                  modelType === ModelTypeEnum.Malloy &&
                  isDefined(fieldMalloyNumberTag)
                ? format(fieldMalloyNumberTag.value, value)
                : fieldResult === FieldResultEnum.Number &&
                    isDefinedAndNotEmpty(struct.mproveConfig.formatNumber)
                  ? // struct.mproveConfig.formatNumber
                    this.d3FormatValue({
                      value: value,
                      formatNumber: struct.mproveConfig.formatNumber,
                      fieldResult: fieldResult,
                      currencyPrefix: fieldCurrencyPrefix,
                      currencySuffix: fieldCurrencySuffix,
                      thousandsSeparator: thousandsSeparator
                    })
                  : fieldResult === FieldResultEnum.Number
                    ? // no formatNumber
                      Number(value)
                        .toLocaleString()
                        .split(',')
                        .join(thousandsSeparator)
                    : // fallback
                      value;

    return formattedValue;
  }

  makeQData(item: {
    query: Query;
    mconfig: MconfigX;
  }) {
    let { query, mconfig } = item;

    let data: SourceDataRow[] = query.data;

    let isStore = mconfig.modelType === ModelTypeEnum.Store;

    if (isUndefined(data)) {
      return [];
    }

    let qData: QDataRow[] = [];

    data.forEach((row: SourceDataRow) => {
      let r: QDataRow = {};

      let dataRow: SourceDataRow =
        mconfig.modelType === ModelTypeEnum.Malloy
          ? query.connectionType === ConnectionTypeEnum.PostgreSQL
            ? (row['row' as any] as unknown as SourceDataRow)
            : row
          : row;

      Object.keys(dataRow)
        .filter(k => k !== NO_FIELDS_SELECTED)
        .forEach(key => {
          let value = dataRow[key];

          let fieldId: string;
          let sqlName: string;

          if (mconfig.modelType === ModelTypeEnum.Malloy) {
            let compiledQueryField =
              mconfig.compiledQuery.structs[0].fields.find(
                x => x.name === key
              ) as FieldBase;

            sqlName = compiledQueryField.name;

            let drillExpression =
              compiledQueryField?.resultMetadata?.drillExpression;

            fieldId =
              drillExpression?.kind === 'field_reference'
                ? drillExpression.path.length > 0
                  ? drillExpression.path.join('.') + '.' + drillExpression.name
                  : drillExpression.name
                : undefined;
          } else if (mconfig.modelType === ModelTypeEnum.Store) {
            fieldId = key.toLowerCase();
          }

          let field = mconfig.fields.find(x => {
            return x.id === fieldId;
          });

          if (mconfig.modelType === ModelTypeEnum.Store) {
            sqlName = field.sqlName;
          }

          let tsValueMs: number;

          if (isDefined(field.detail)) {
            tsValueMs = dataRow[field.id] as unknown as number;
          } else if (field.result === FieldResultEnum.Ts) {
            tsValueMs =
              mconfig.modelType === ModelTypeEnum.Malloy
                ? this.getMsFromT({
                    value: value,
                    timezone: mconfig.timezone
                  })
                : this.getMsFromValue({
                    fieldSqlName: sqlName,
                    value: value
                  });
          }

          let storeTimeSpec =
            isStore === false
              ? undefined
              : field.detail === DetailUnitEnum.Timestamps
                ? TimeSpecEnum.Timestamps
                : field.detail === DetailUnitEnum.Minutes
                  ? TimeSpecEnum.Minutes
                  : field.detail === DetailUnitEnum.Hours
                    ? TimeSpecEnum.Hours
                    : field.detail === DetailUnitEnum.Days
                      ? TimeSpecEnum.Days
                      : field.detail === DetailUnitEnum.WeeksSunday
                        ? TimeSpecEnum.Weeks
                        : field.detail === DetailUnitEnum.WeeksMonday
                          ? TimeSpecEnum.Weeks
                          : field.detail === DetailUnitEnum.Months
                            ? TimeSpecEnum.Months
                            : field.detail === DetailUnitEnum.Quarters
                              ? TimeSpecEnum.Quarters
                              : field.detail === DetailUnitEnum.Years
                                ? TimeSpecEnum.Years
                                : undefined;

          let cell: QCell = {
            name: key.toLowerCase(),
            value:
              isStore === true && isDefined(storeTimeSpec)
                ? ((Number(value) * 1000) as unknown as string)
                : isDefined(value)
                  ? value
                  : 'NULL',
            valueFmt: isUndefined(value)
              ? 'NULL'
              : isDefined(tsValueMs)
                ? frontFormatTsUnix({
                    timeSpec:
                      isStore === true
                        ? storeTimeSpec
                        : this.getTimeSpecByMalloyTimeframe({
                            timeframe: field.timeframe
                          }),
                    unixTimeZoned:
                      isStore === true ? tsValueMs : tsValueMs / 1000
                  })
                : this.formatValue({
                    value: value,
                    modelType: mconfig.modelType,
                    field: field,
                    fieldResult: field?.result
                  })
          };

          r[fieldId] = cell;
        });

      qData.push(r);
    });

    return qData;
  }

  makeSeriesData(item: {
    modelType: ModelTypeEnum;
    mconfigTimezone: string;
    selectFields: MconfigField[];
    data: QDataRow[];
    multiFieldId: string;
    xFieldId: string;
    sizeFieldId: string;
    yFieldsIds: string[];
    chartType: ChartTypeEnum;
  }) {
    let {
      modelType,
      mconfigTimezone,
      selectFields,
      data,
      multiFieldId,
      xFieldId,
      sizeFieldId,
      yFieldsIds,
      chartType
    } = item;

    let struct = this.structQuery.getValue();

    let xField = selectFields.find(f => f.id === xFieldId);

    if (!xField) {
      return [];
    }

    let yFields: MconfigField[] = [];

    yFieldsIds.forEach(yFieldId => {
      let yField = selectFields.find(f => f.id === yFieldId);

      if (!yField) {
        return [];
      }

      yFields.push(yField);
    });

    let multiField = isDefined(multiFieldId)
      ? selectFields.find(f => f.id === multiFieldId)
      : undefined;

    if (multiFieldId && !multiField) {
      return [];
    }

    let sizeField = isDefined(sizeFieldId)
      ? selectFields.find(f => f.id === sizeFieldId)
      : undefined;

    if (sizeFieldId && !sizeField) {
      return [];
    }

    let addNorm = 0;
    let sizeMin = 1;
    let sizeMax = 1;

    let sizeFieldLabel: string;

    if (isDefined(sizeField)) {
      sizeFieldLabel =
        sizeField.topLabel +
        (isDefined(sizeField.groupLabel)
          ? ` ${capitalizeFirstLetter(sizeField.groupLabel)}`
          : '') +
        ` ${capitalizeFirstLetter(sizeField.label)}`;

      let sizeValues = data
        .map((x: QDataRow) =>
          this.isNumberString(x[sizeField.id].value)
            ? Number(x[sizeField.id].value)
            : undefined
        )
        .filter(x => isDefined(x));

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
          (isDefined(yField.groupLabel)
            ? ` ${capitalizeFirstLetter(yField.groupLabel)}`
            : '') +
          ` ${capitalizeFirstLetter(yField.label)}`;

        if (multiField?.id) {
          if (yFields.length > 1) {
            yKeyId = row[multiField.id].valueFmt
              ? row[multiField.id].valueFmt + ' ' + yLabel
              : 'NULL' + ' ' + yLabel;
          } else {
            yKeyId = row[multiField.id].valueFmt
              ? row[multiField.id].valueFmt
              : 'NULL';
          }
        } else {
          yKeyId = yLabel;
        }

        let ySeriesElement: YSeriesElement = ySeries.find(
          y => y.yKeyId === yKeyId
        );

        if (isUndefined(ySeriesElement)) {
          ySeriesElement = {
            yKeyId: yKeyId,
            yFieldId: yField.id,
            points: []
          };

          ySeries.push(ySeriesElement);
        }

        // x null check
        if (row[xField.id]) {
          let tsValueMs =
            xField.result === FieldResultEnum.Ts
              ? modelType === ModelTypeEnum.Malloy
                ? this.getMsFromT({
                    value: row[xField.id].value,
                    timezone: mconfigTimezone
                  })
                : this.getMsFromValue({
                    fieldSqlName: xField.sqlName,
                    value: row[xField.id].value
                  })
              : undefined;

          let xV =
            xField.result === FieldResultEnum.Ts
              ? (tsValueMs ?? row[xField.id].value)
              : row[xField.id].value;

          if (isDefined(xV)) {
            let seriesPoint: SeriesPoint = {
              xValue: isUndefined(xV)
                ? 'NULL'
                : xField.result === FieldResultEnum.Number
                  ? this.convertToNumberOrNull(xV)
                  : xV,
              xValueFmt: row[xField.id].valueFmt,
              yValue: this.convertToNumberOrNull(row[yField.id].value),
              yValueFmt: row[yField.id].valueFmt,
              sizeValueMod:
                isDefined(sizeField?.id) &&
                this.isNumberString(row[sizeField.id].value)
                  ? (Number(row[sizeField.id].value) + addNorm) /
                    (sizeMax + sizeMin)
                  : 1,
              sizeValue:
                isDefined(sizeField?.id) &&
                this.isNumberString(row[sizeField.id].value)
                  ? Number(row[sizeField.id].value)
                  : undefined,
              sizeValueFmt:
                isDefined(sizeField?.id) &&
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

    let sortedDaysOfWeek =
      struct.mproveConfig.weekStart === ProjectWeekStartEnum.Monday
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
          chartType !== ChartTypeEnum.Scatter &&
          (xField?.result === FieldResultEnum.Ts ||
            xField?.result === FieldResultEnum.Number ||
            xField?.result === FieldResultEnum.DayOfWeek ||
            xField?.result === FieldResultEnum.DayOfWeekIndex ||
            xField?.result === FieldResultEnum.MonthName ||
            xField?.result === FieldResultEnum.QuarterOfYear)
            ? ySeriesElement.points.sort((a: SeriesPoint, b: SeriesPoint) =>
                xField?.result === FieldResultEnum.Number ||
                xField?.result === FieldResultEnum.DayOfWeekIndex ||
                xField?.result === FieldResultEnum.Ts
                  ? Number(a.xValue) > Number(b.xValue)
                    ? 1
                    : Number(b.xValue) > Number(a.xValue)
                      ? -1
                      : 0
                  : xField?.result === FieldResultEnum.DayOfWeek
                    ? sortedDaysOfWeek.indexOf(a.xValue as string) >
                      sortedDaysOfWeek.indexOf(b.xValue as string)
                      ? 1
                      : sortedDaysOfWeek.indexOf(b.xValue as string) >
                          sortedDaysOfWeek.indexOf(a.xValue as string)
                        ? -1
                        : 0
                    : xField?.result === FieldResultEnum.MonthName
                      ? sortedMonthNames.indexOf(a.xValue as string) >
                        sortedMonthNames.indexOf(b.xValue as string)
                        ? 1
                        : sortedMonthNames.indexOf(b.xValue as string) >
                            sortedMonthNames.indexOf(a.xValue as string)
                          ? -1
                          : 0
                      : xField?.result === FieldResultEnum.QuarterOfYear
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

  private getMsFromValue(item: { value: string; fieldSqlName: string }) {
    let { value, fieldSqlName } = item;

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

    let ms = isDefined(tsValueFn) ? tsValueFn(value)?.getTime() : undefined;

    return ms;
  }

  getTimeSpecByFieldSqlName(fieldSqlName: string) {
    return fieldSqlName.match(/(?:___year)$/g)
      ? TimeSpecEnum.Years
      : fieldSqlName.match(/(?:___quarter)$/g)
        ? TimeSpecEnum.Quarters
        : fieldSqlName.match(/(?:___month)$/g)
          ? TimeSpecEnum.Months
          : fieldSqlName.match(/(?:___week)$/g)
            ? TimeSpecEnum.Weeks
            : fieldSqlName.match(/(?:___date)$/g)
              ? TimeSpecEnum.Days
              : fieldSqlName.match(/(?:___hour)$/g)
                ? TimeSpecEnum.Hours
                : fieldSqlName.match(/(?:___hour2)$/g)
                  ? TimeSpecEnum.Hours
                  : fieldSqlName.match(/(?:___hour3)$/g)
                    ? TimeSpecEnum.Hours
                    : fieldSqlName.match(/(?:___hour4)$/g)
                      ? TimeSpecEnum.Hours
                      : fieldSqlName.match(/(?:___hour6)$/g)
                        ? TimeSpecEnum.Hours
                        : fieldSqlName.match(/(?:___hour8)$/g)
                          ? TimeSpecEnum.Hours
                          : fieldSqlName.match(/(?:___hour12)$/g)
                            ? TimeSpecEnum.Hours
                            : fieldSqlName.match(/(?:___ts)$/g)
                              ? TimeSpecEnum.Timestamps
                              : TimeSpecEnum.Minutes;
  }

  getTimeSpecByMalloyTimeframe(item: {
    timeframe: string;
  }) {
    let { timeframe } = item;

    // export type TimestampTimeframe = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

    return timeframe === 'year'
      ? TimeSpecEnum.Years
      : timeframe === 'quarter'
        ? TimeSpecEnum.Quarters
        : timeframe === 'month'
          ? TimeSpecEnum.Months
          : timeframe === 'week'
            ? TimeSpecEnum.Weeks
            : timeframe === 'day'
              ? TimeSpecEnum.Days
              : timeframe === 'hour'
                ? TimeSpecEnum.Hours
                : timeframe === 'minute'
                  ? TimeSpecEnum.Minutes
                  : timeframe === 'second'
                    ? TimeSpecEnum.Seconds
                    : TimeSpecEnum.Timestamps;
  }

  private getDateFromDate(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (isUndefined(r)) {
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

    if (isUndefined(r)) {
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

    if (isUndefined(r)) {
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

  private getMsFromT(item: { value: string; timezone: string }) {
    let { value, timezone } = item;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)[T|\s](\d\d)[:](\d\d)[:](\d\d)/g;

    let r = regEx.exec(value);

    if (isUndefined(r)) {
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

    let dateMs = date.getTime();

    // packages/malloy-render/src/html/utils.ts -> normalizeToTimezone

    let dateTime = DateTime.fromMillis(dateMs, {
      zone: timezone
    });

    let dateTZ = new Date(
      Date.UTC(
        dateTime.year,
        dateTime.month - 1,
        dateTime.day,
        dateTime.hour,
        dateTime.minute,
        dateTime.second,
        dateTime.millisecond
      )
    );

    return dateTZ.getTime();
  }

  private getDateFromMonth(rValue: string) {
    let data = rValue;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let r = regEx.exec(data);

    if (isUndefined(r)) {
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

    if (isUndefined(r)) {
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

    if (isUndefined(r)) {
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

    let regEx =
      /^(\d\d\d\d)[-](\d\d)[-](\d\d)[T](\d\d)[:](\d\d)[:](\d\d)\.(\d\d\d)/g;

    let r = regEx.exec(data);

    if (isUndefined(r)) {
      return null;
    }

    let [full, year, month, day, hour, minute, second, ms] = r;

    let date = isDefinedAndNotEmpty(ms)
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

    if (isUndefined(r)) {
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

    if (isUndefined(r)) {
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

    if (row.rowType !== RowTypeEnum.Metric) {
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
    chartSeriesElement: MconfigChartSeries;
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
      seriesOption = {
        type: 'bar',
        barWidth: '90%',
        itemStyle: {
          color: '#0084d1',
          borderRadius: [0, 0, 0, 0]
        },
        showBackground: true,
        backgroundStyle: {
          color: '#cdecfe'
        },
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
        type: isDefined(chartSeriesElement?.type)
          ? (chartSeriesElement.type as any)
          : 'line',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
        },
        yAxisIndex: chartSeriesElement?.yAxisIndex,
        cursor: 'default',
        emphasis: {
          disabled: true
        },
        name: rowName,
        data: dataPoints.map(dataPoint => ({
          name: rowName,
          value: [dataPoint.columnId * 1000, dataPoint[rowName]]
        })),
        tooltip: {
          borderWidth: 2,
          textStyle: {
            fontSize: 16
          },
          formatter: (p: any) => {
            let timeSpec = this.uiQuery.getValue().timeSpec;

            let columnLabel = frontFormatTsUnix({
              timeSpec: timeSpec,
              unixTimeZoned: p.data.value[0] / 1000
            });

            let formattedValue = isDefined(p.data.value[1])
              ? this.d3FormatValue({
                  value: Number(p.data.value[1]),
                  formatNumber: row.formatNumber,
                  fieldResult: FieldResultEnum.Number,
                  currencyPrefix: row.currencyPrefix,
                  currencySuffix: row.currencySuffix,
                  thousandsSeparator: struct.mproveConfig.thousandsSeparator
                })
              : 'null';

            return `${p.name}<br/><strong>${formattedValue}</strong><br/>${columnLabel}`;
          }
        }
      };
    }

    return seriesOption;
  }
}
