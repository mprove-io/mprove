import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { types } from '../../barrels/types';
import { api } from '../../barrels/api';
import { barTimeframe } from '../../barrels/bar-timeframe';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.TransformTimes;

export function transformTimes<T extends types.vmType>(item: {
  entities: Array<T>;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}): Array<T> {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    let newFields: interfaces.FieldAny[] = [];

    x.fields.forEach(field => {
      if (field.fieldClass !== enums.FieldClassEnum.Time) {
        newFields.push(field);
        return;
      }

      if (helper.isUndefined(field.timeframes)) {
        field.timeframes = [
          enums.TimeframeEnum.Time,
          enums.TimeframeEnum.Date,
          enums.TimeframeEnum.HourOfDay,
          enums.TimeframeEnum.Hour,
          enums.TimeframeEnum.TimeOfDay,
          enums.TimeframeEnum.DayOfWeek,
          enums.TimeframeEnum.DayOfWeekIndex,
          enums.TimeframeEnum.DayOfYear,
          enums.TimeframeEnum.Week,
          enums.TimeframeEnum.WeekOfYear,
          enums.TimeframeEnum.DayOfMonth,
          enums.TimeframeEnum.Month,
          enums.TimeframeEnum.MonthNum,
          enums.TimeframeEnum.MonthName,
          enums.TimeframeEnum.Year,
          enums.TimeframeEnum.Quarter,
          enums.TimeframeEnum.QuarterOfYear,
          enums.TimeframeEnum.Minute,
          enums.TimeframeEnum.YesNoHasValue
        ];

        field.timeframes_line_num = 0;
      }

      let groupLabel = field.group_label ? field.group_label : field.name;

      let groupDescription = field.group_description;

      let ts;

      if (
        helper.isUndefined(field.source) ||
        field.source === enums.TimeSourceEnum.Timestamp
      ) {
        ts = field.sql;
      } else if (field.source === enums.TimeSourceEnum.Epoch) {
        ts = barTimeframe.makeTsFromSourceEpoch({
          sql: field.sql,
          connection: x.connection
        });
      } else if (field.source === enums.TimeSourceEnum.YYYYMMDD) {
        ts = barTimeframe.makeTsFromSourceYYYYMMDD({
          sql: field.sql,
          connection: x.connection
        });
      } else {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_TIME_SOURCE,
            message: `possible values for "${enums.ParameterEnum.Source}" of time field are: "${enums.TimeSourceEnum.Timestamp}", "${enums.TimeSourceEnum.Epoch}", "${enums.TimeSourceEnum.YYYYMMDD}"`,
            lines: [
              {
                line: field.source_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let sqlTimestamp = `${constants.MPROVE_TIMESTAMP_START}${ts}${constants.MPROVE_TIMESTAMP_END}`;

      field.timeframes.forEach(timeframe => {
        let sqlTransformed: string;
        let name: string;
        let label: string;
        let result: enums.FieldAnyResultEnum;

        switch (true) {
          case timeframe === enums.TimeframeEnum.DayOfWeek: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;

            label = enums.TimeLabelEnum.DayOfWeek;

            sqlTransformed = barTimeframe.makeTimeframeDayOfWeek({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.DayOfWeek;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfWeekIndex: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.DayOfWeekIndex;

            sqlTransformed = barTimeframe.makeTimeframeDayOfWeekIndex({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection,
              weekStart: item.weekStart
            });

            result = enums.FieldAnyResultEnum.DayOfWeekIndex;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfYear: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.DayOfYear;

            // no need for weekStart
            sqlTransformed = barTimeframe.makeTimeframeDayOfYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Week: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Week;

            sqlTransformed = barTimeframe.makeTimeframeWeek({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection,
              weekStart: item.weekStart
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.WeekOfYear: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.WeekOfYear;

            sqlTransformed = barTimeframe.makeTimeframeWeekOfYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection,
              weekStart: item.weekStart
            });

            result = enums.FieldAnyResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Date: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Date;

            sqlTransformed = barTimeframe.makeTimeframeDate({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfMonth: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.DayOfMonth;

            sqlTransformed = barTimeframe.makeTimeframeDayOfMonth({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Hour: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Hour;

            sqlTransformed = barTimeframe.makeTimeframeHour({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.HourOfDay: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.HourOfDay;

            sqlTransformed = barTimeframe.makeTimeframeHourOfDay({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Hour2 ||
            timeframe === enums.TimeframeEnum.Hour3 ||
            timeframe === enums.TimeframeEnum.Hour4 ||
            timeframe === enums.TimeframeEnum.Hour6 ||
            timeframe === enums.TimeframeEnum.Hour8 ||
            timeframe === enums.TimeframeEnum.Hour12: {
            let reg = api.MyRegex.CAPTURE_DIGITS_G();
            let r = reg.exec(timeframe);

            let num = r[1];

            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = timeframe;

            sqlTransformed = barTimeframe.makeTimeframeHourNum({
              num: num,
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Minute: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Minute;

            sqlTransformed = barTimeframe.makeTimeframeMinute({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Minute2 ||
            timeframe === enums.TimeframeEnum.Minute3 ||
            timeframe === enums.TimeframeEnum.Minute5 ||
            timeframe === enums.TimeframeEnum.Minute10 ||
            timeframe === enums.TimeframeEnum.Minute15 ||
            timeframe === enums.TimeframeEnum.Minute30: {
            let reg = api.MyRegex.CAPTURE_DIGITS_G();
            let r = reg.exec(timeframe);
            let num = r[1];

            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = timeframe;

            sqlTransformed = barTimeframe.makeTimeframeMinuteNum({
              num: num,
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Month: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Month;

            sqlTransformed = barTimeframe.makeTimeframeMonth({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.MonthName: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.MonthName;

            sqlTransformed = barTimeframe.makeTimeframeMonthName({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.MonthName;
            break;
          }

          case timeframe === enums.TimeframeEnum.MonthNum: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.MonthNum;

            sqlTransformed = barTimeframe.makeTimeframeMonthNum({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Quarter: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Quarter;

            sqlTransformed = barTimeframe.makeTimeframeQuarter({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.QuarterOfYear: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.QuarterOfYear;

            sqlTransformed = barTimeframe.makeTimeframeQuarterOfYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.QuarterOfYear;
            break;
          }

          case timeframe === enums.TimeframeEnum.Time: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Time;

            sqlTransformed = barTimeframe.makeTimeframeTime({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.TimeOfDay: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.TimeOfDay;

            sqlTransformed = barTimeframe.makeTimeframeTimeOfDay({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.String;
            break;
          }

          case timeframe === enums.TimeframeEnum.Year: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Year;

            sqlTransformed = barTimeframe.makeTimeframeYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.YesNoHasValue: {
            name = field.name + api.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.YesNoHasValue;

            sqlTransformed = barTimeframe.makeTimeframeYesNoHasValue({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = enums.FieldAnyResultEnum.Yesno;
            break;
          }

          default: {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.WRONG_TIMEFRAMES_ELEMENT,
                message: `Element "${timeframe}" is wrong`,
                lines: [
                  {
                    line: field.timeframes_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return; // next timeframe
          }
        }

        let newDimension: interfaces.Dimension = {
          hidden: field.hidden,
          hidden_line_num: 0,

          label: label,
          label_line_num: 0,

          // description: undefined,

          sql: sqlTransformed,
          sql_line_num: field.sql_line_num,

          type: enums.FieldAnyTypeEnum.Custom,
          type_line_num: 0,

          result: result,
          result_line_num: 0,

          unnest: field.unnest,
          unnest_line_num: 0,

          // format_number: undefined,
          // currency_prefix: undefined,
          // currency_suffix: undefined,

          //
          group_label: groupLabel,
          group_label_line_num: 0,

          group_description: groupDescription,
          group_description_line_num: 0,
          //
          name: name,
          name_line_num: field.name_line_num,
          fieldClass: enums.FieldClassEnum.Dimension,
          // sqlReal: undefined,
          groupId: field.name,
          sqlTimestamp:
            result === enums.FieldAnyResultEnum.Ts ? sqlTimestamp : undefined,
          sqlTimestampName:
            result === enums.FieldAnyResultEnum.Ts
              ? field.name + api.TRIPLE_UNDERSCORE + constants.TIMESTAMP
              : undefined
          // sqlTimestampReal: undefined,
        };

        newFields.push(newDimension);
      });

      // no push of time field (transformed to dimensions)
    });

    if (errorsOnStart === item.errors.length) {
      x.fields = newFields;
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
