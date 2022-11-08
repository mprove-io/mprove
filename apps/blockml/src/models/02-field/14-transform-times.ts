import { ConfigService } from '@nestjs/config';
import { barTimeframe } from '~blockml/barrels/bar-timeframe';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.TransformTimes;

export function transformTimes<T extends types.vmType>(
  item: {
    entities: T[];
    weekStart: common.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): T[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    let newFields: interfaces.FieldAny[] = [];

    x.fields.forEach(field => {
      if (field.fieldClass !== common.FieldClassEnum.Time) {
        newFields.push(field);
        return;
      }

      if (common.isUndefined(field.timeframes)) {
        field.timeframes = [
          common.TimeframeEnum.Time,
          common.TimeframeEnum.Date,
          common.TimeframeEnum.HourOfDay,
          common.TimeframeEnum.Hour,
          common.TimeframeEnum.TimeOfDay,
          common.TimeframeEnum.DayOfWeek,
          common.TimeframeEnum.DayOfWeekIndex,
          common.TimeframeEnum.DayOfYear,
          common.TimeframeEnum.Week,
          common.TimeframeEnum.WeekOfYear,
          common.TimeframeEnum.DayOfMonth,
          common.TimeframeEnum.Month,
          common.TimeframeEnum.MonthNum,
          common.TimeframeEnum.MonthName,
          common.TimeframeEnum.Year,
          common.TimeframeEnum.Quarter,
          common.TimeframeEnum.QuarterOfYear,
          common.TimeframeEnum.Minute,
          common.TimeframeEnum.YesNoHasValue
        ];

        field.timeframes_line_num = 0;
      }

      let groupLabel = field.group_label;

      if (common.isUndefined(groupLabel)) {
        groupLabel = common.MyRegex.replaceUnderscoresWithSpaces(field.name);
        groupLabel = groupLabel
          .split(' ')
          .map(word => common.capitalizeFirstLetter(word))
          .join(' ');
      }

      let groupDescription = field.group_description;

      let ts;

      if (
        common.isUndefined(field.source) ||
        field.source === common.TimeSourceEnum.Timestamp
      ) {
        ts = field.sql;
      } else if (field.source === common.TimeSourceEnum.Epoch) {
        ts = barTimeframe.makeTsFromSourceEpoch({
          sql: field.sql,
          connection: x.connection
        });
      } else if (field.source === common.TimeSourceEnum.YYYYMMDD) {
        ts = barTimeframe.makeTsFromSourceYYYYMMDD({
          sql: field.sql,
          connection: x.connection
        });
      } else {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_TIME_SOURCE,
            message: `possible values for "${enums.ParameterEnum.Source}" of time field are: "${common.TimeSourceEnum.Timestamp}", "${common.TimeSourceEnum.Epoch}", "${common.TimeSourceEnum.YYYYMMDD}"`,
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
        let result: common.FieldResultEnum;

        switch (true) {
          case timeframe === common.TimeframeEnum.DayOfWeek: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;

            label = enums.TimeLabelEnum.DayOfWeek;

            sqlTransformed = barTimeframe.makeTimeframeDayOfWeek({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.DayOfWeek;
            break;
          }

          case timeframe === common.TimeframeEnum.DayOfWeekIndex: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.DayOfWeekIndex;

            sqlTransformed = barTimeframe.makeTimeframeDayOfWeekIndex({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection,
              weekStart: item.weekStart
            });

            result = common.FieldResultEnum.DayOfWeekIndex;
            break;
          }

          case timeframe === common.TimeframeEnum.DayOfYear: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.DayOfYear;

            // no need for weekStart
            sqlTransformed = barTimeframe.makeTimeframeDayOfYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Number;
            break;
          }

          case timeframe === common.TimeframeEnum.Week: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Week;

            sqlTransformed = barTimeframe.makeTimeframeWeek({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection,
              weekStart: item.weekStart
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.WeekOfYear: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.WeekOfYear;

            sqlTransformed = barTimeframe.makeTimeframeWeekOfYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection,
              weekStart: item.weekStart
            });

            result = common.FieldResultEnum.Number;
            break;
          }

          case timeframe === common.TimeframeEnum.Date: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Date;

            sqlTransformed = barTimeframe.makeTimeframeDate({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.DayOfMonth: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.DayOfMonth;

            sqlTransformed = barTimeframe.makeTimeframeDayOfMonth({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Number;
            break;
          }

          case timeframe === common.TimeframeEnum.Hour: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Hour;

            sqlTransformed = barTimeframe.makeTimeframeHour({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.HourOfDay: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.HourOfDay;

            sqlTransformed = barTimeframe.makeTimeframeHourOfDay({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Number;
            break;
          }

          case timeframe === common.TimeframeEnum.Hour2 ||
            timeframe === common.TimeframeEnum.Hour3 ||
            timeframe === common.TimeframeEnum.Hour4 ||
            timeframe === common.TimeframeEnum.Hour6 ||
            timeframe === common.TimeframeEnum.Hour8 ||
            timeframe === common.TimeframeEnum.Hour12: {
            let reg = common.MyRegex.CAPTURE_DIGITS_G();
            let r = reg.exec(timeframe);

            let num = r[1];

            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = timeframe;

            sqlTransformed = barTimeframe.makeTimeframeHourNum({
              num: num,
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.Minute: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Minute;

            sqlTransformed = barTimeframe.makeTimeframeMinute({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.Minute2 ||
            timeframe === common.TimeframeEnum.Minute3 ||
            timeframe === common.TimeframeEnum.Minute5 ||
            timeframe === common.TimeframeEnum.Minute10 ||
            timeframe === common.TimeframeEnum.Minute15 ||
            timeframe === common.TimeframeEnum.Minute30: {
            let reg = common.MyRegex.CAPTURE_DIGITS_G();
            let r = reg.exec(timeframe);
            let num = r[1];

            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = timeframe;

            sqlTransformed = barTimeframe.makeTimeframeMinuteNum({
              num: num,
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.Month: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Month;

            sqlTransformed = barTimeframe.makeTimeframeMonth({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.MonthName: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.MonthName;

            sqlTransformed = barTimeframe.makeTimeframeMonthName({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.MonthName;
            break;
          }

          case timeframe === common.TimeframeEnum.MonthNum: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.MonthNum;

            sqlTransformed = barTimeframe.makeTimeframeMonthNum({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Number;
            break;
          }

          case timeframe === common.TimeframeEnum.Quarter: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Quarter;

            sqlTransformed = barTimeframe.makeTimeframeQuarter({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.QuarterOfYear: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.QuarterOfYear;

            sqlTransformed = barTimeframe.makeTimeframeQuarterOfYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.QuarterOfYear;
            break;
          }

          case timeframe === common.TimeframeEnum.Time: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Time;

            sqlTransformed = barTimeframe.makeTimeframeTime({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.TimeOfDay: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.TimeOfDay;

            sqlTransformed = barTimeframe.makeTimeframeTimeOfDay({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.String;
            break;
          }

          case timeframe === common.TimeframeEnum.Year: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.Year;

            sqlTransformed = barTimeframe.makeTimeframeYear({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Ts;
            break;
          }

          case timeframe === common.TimeframeEnum.YesNoHasValue: {
            name = field.name + common.TRIPLE_UNDERSCORE + timeframe;
            label = enums.TimeLabelEnum.YesNoHasValue;

            sqlTransformed = barTimeframe.makeTimeframeYesNoHasValue({
              sqlTimestamp: sqlTimestamp,
              connection: x.connection
            });

            result = common.FieldResultEnum.Yesno;
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

          type: common.FieldTypeEnum.Custom,
          type_line_num: 0,

          result: result,
          result_line_num: 0,

          unnest: field.unnest,
          unnest_line_num: 0,

          format_number:
            result === common.FieldResultEnum.Number ? ',' : undefined,
          format_number_line_num: 0,

          currency_prefix:
            result === common.FieldResultEnum.Number ? '$' : undefined,
          currency_prefix_line_num: 0,

          currency_suffix:
            result === common.FieldResultEnum.Number ? '' : undefined,
          currency_suffix_line_num: 0,

          //
          group_label: groupLabel,
          group_label_line_num: 0,

          group_description: groupDescription,
          group_description_line_num: 0,
          //
          name: name,
          name_line_num: field.name_line_num,
          fieldClass: common.FieldClassEnum.Dimension,
          // sqlReal: undefined,
          groupId: field.name,
          sqlTimestamp:
            result === common.FieldResultEnum.Ts ? sqlTimestamp : undefined,
          sqlTimestampName:
            result === common.FieldResultEnum.Ts
              ? field.name + common.TRIPLE_UNDERSCORE + constants.TIMESTAMP
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
