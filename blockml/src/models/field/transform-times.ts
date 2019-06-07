import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { gen } from '../../barrels/gen';

export function transformTimes<
  T extends interfaces.View | interfaces.Model
>(item: {
  entities: Array<T>;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnectionEnum;
}): Array<T> {
  item.entities.forEach((x: T) => {
    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {
      // process only times
      if (field.field_class !== enums.FieldClassEnum.Time) {
        newFields.push(field);
        return;
      }

      // start of check
      if (
        typeof field.timeframes === 'undefined' ||
        field.timeframes === null
      ) {
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
      } else if (!Array.isArray(field.timeframes)) {
        // error e58
        ErrorsCollector.addError(
          new AmError({
            title: `timeframes is not a List`,
            message: `"timeframes:" must be a List of values. Try to use construction like this:
timeframes:
- year
- month
- day
- ...`,
            lines: [
              {
                line: field.timeframes_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }
      // end of check

      let groupLabel = field.group_label ? field.group_label : field.name;
      let groupDescription = field.group_description;
      let ts;
      if (
        typeof field.source === 'undefined' ||
        field.source === null ||
        field.source === enums.TimeSourceEnum.Timestamp
      ) {
        ts = field.sql;
      } else if (field.source === enums.TimeSourceEnum.Epoch) {
        ts = gen.makeSourceEpoch({
          field: field,
          connection: item.connection
        });
      } else if (field.source === enums.TimeSourceEnum.YYYYMMDD) {
        ts = gen.makeSourceYYYYMMDD({
          field: field,
          connection: item.connection
        });
      } else {
        // error e59
        ErrorsCollector.addError(
          new AmError({
            title: `wrong time source`,
            message: `possible values for "source:" of time field are: "timestamp", "epoch", "yyyymmdd"`,
            lines: [
              {
                line: field.source_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }

      let sqlTimestamp = `mprovetimestampstart${ts}mprovetimestampend`;

      field.timeframes.forEach(timeframe => {
        let sqlTransformed: string;
        let name: string;
        let label: string;
        let result: enums.FieldExtResultEnum;

        // 2019-06-27 12:32:02.230908+00
        switch (true) {
          case timeframe === enums.TimeframeEnum.DayOfWeek: {
            name = field.name + `___day_of_week`;
            label = `Day of Week`;

            sqlTransformed = gen.makeTimeframeDayOfWeek({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // Thursday

            result = enums.FieldExtResultEnum.DayOfWeek;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfWeekIndex: {
            name = field.name + `___day_of_week_index`;
            label = `Day of Week Index`;

            sqlTransformed = gen.makeTimeframeDayOfWeekIndex({
              sql_timestamp: sqlTimestamp,
              week_start: item.weekStart,
              connection: item.connection
            }); // 5 or 4

            result = enums.FieldExtResultEnum.DayOfWeekIndex;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfYear: {
            name = field.name + `___day_of_year`;
            label = `Day of Year`;
            // no need for $week_start
            sqlTransformed = gen.makeTimeframeDayOfYear({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 178

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Week: {
            name = field.name + `___week`;
            label = `Week`;

            sqlTransformed = gen.makeTimeframeWeek({
              sql_timestamp: sqlTimestamp,
              week_start: item.weekStart,
              connection: item.connection
            }); // 2019-06-24

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.WeekOfYear: {
            name = field.name + `___week_of_year`;
            label = `Week of Year`;

            sqlTransformed = gen.makeTimeframeWeekOfYear({
              sql_timestamp: sqlTimestamp,
              week_start: item.weekStart,
              connection: item.connection
            }); // 26

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Date: {
            name = field.name + `___date`;
            label = `Date`;

            sqlTransformed = gen.makeTimeframeDate({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 2019-06-27

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfMonth: {
            name = field.name + `___day_of_month`;
            label = `Day of Month`;

            sqlTransformed = gen.makeTimeframeDayOfMonth({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 27

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Hour: {
            name = field.name + `___hour`;
            label = `Hour`;

            sqlTransformed = gen.makeTimeframeHour({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 2019-06-27 12

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.HourOfDay: {
            name = field.name + `___hour_of_day`;
            label = `Hour of Day`;

            sqlTransformed = gen.makeTimeframeHourOfDay({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 12

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Hour2 ||
            timeframe === enums.TimeframeEnum.Hour3 ||
            timeframe === enums.TimeframeEnum.Hour4 ||
            timeframe === enums.TimeframeEnum.Hour6 ||
            timeframe === enums.TimeframeEnum.Hour8 ||
            timeframe === enums.TimeframeEnum.Hour12: {
            let reg = ApRegex.CAPTURE_DIGITS_G();
            let r = reg.exec(timeframe);

            let num = r[1];

            name = field.name + `___${timeframe}`;
            label = timeframe;

            sqlTransformed = gen.makeTimeframeHourNum({
              sql_timestamp: sqlTimestamp,
              num: num,
              connection: item.connection
            }); // 2019-06-27 12

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Minute: {
            name = field.name + `___minute`;
            label = `Minute`;

            sqlTransformed = gen.makeTimeframeMinute({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 2019-06-27 12:32

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Minute2 ||
            timeframe === enums.TimeframeEnum.Minute3 ||
            timeframe === enums.TimeframeEnum.Minute5 ||
            timeframe === enums.TimeframeEnum.Minute10 ||
            timeframe === enums.TimeframeEnum.Minute15 ||
            timeframe === enums.TimeframeEnum.Minute30: {
            let reg = ApRegex.CAPTURE_DIGITS_G();
            let r = reg.exec(timeframe);
            let num = r[1];

            name = field.name + `___${timeframe}`;
            label = timeframe;

            sqlTransformed = gen.makeTimeframeMinuteNum({
              sql_timestamp: sqlTimestamp,
              num: num,
              connection: item.connection
            }); // 2019-06-27 12:32

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Month: {
            name = field.name + `___month`;
            label = `Month`;

            sqlTransformed = gen.makeTimeframeMonth({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 2019-06

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.MonthName: {
            name = field.name + `___month_name`;
            label = `Month Name`;

            sqlTransformed = gen.makeTimeframeMonthName({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // June

            result = enums.FieldExtResultEnum.MonthName;
            break;
          }

          case timeframe === enums.TimeframeEnum.MonthNum: {
            name = field.name + `___month_num`;
            label = `Month Num`;

            sqlTransformed = gen.makeTimeframeMonthNum({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 6

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Quarter: {
            name = field.name + `___quarter`;
            label = `Quarter`;

            sqlTransformed = gen.makeTimeframeQuarter({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 2019-04

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.QuarterOfYear: {
            name = field.name + `___quarter_of_year`;
            label = `Quarter of Year`;

            sqlTransformed = gen.makeTimeframeQuarterOfYear({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // Q2

            result = enums.FieldExtResultEnum.QuarterOfYear;
            break;
          }

          case timeframe === enums.TimeframeEnum.Time: {
            name = field.name + `___time`;
            label = `Time`;

            sqlTransformed = gen.makeTimeframeTime({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 2019-06-27 12:32:02

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.TimeOfDay: {
            name = field.name + `___time_of_day`;
            label = `Time of Day`;

            sqlTransformed = gen.makeTimeframeTimeOfDay({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 12:32

            result = enums.FieldExtResultEnum.String;
            break;
          }

          case timeframe === enums.TimeframeEnum.Year: {
            name = field.name + `___year`;
            label = `Year`;

            sqlTransformed = gen.makeTimeframeYear({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // 2019

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.YesNoHasValue: {
            name = field.name + `___yesno_has_value`;
            label = `Has value (Yes / No)`;

            sqlTransformed = gen.makeTimeframeYesNoHasValue({
              sql_timestamp: sqlTimestamp,
              connection: item.connection
            }); // Yes

            result = enums.FieldExtResultEnum.Yesno;
            break;
          }

          default: {
            // error e141
            ErrorsCollector.addError(
              new AmError({
                title: `wrong timeframes value`,
                message: `found unknown "timeframes:" parameter's value '${timeframe}'`,
                lines: [
                  {
                    line: field.timeframes_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            return; // next timeframe
          }
        }

        newFields.push({
          field_class: enums.FieldClassEnum.Dimension,
          field_class_line_num: 0,

          hidden: field.hidden,
          hidden_line_num: 0,

          type: enums.FieldExtTypeEnum.Custom,
          type_line_num: 0,

          name: name,
          name_line_num: field.name_line_num,

          label: label,
          label_line_num: 0,

          group_id: field.name,

          group_label: groupLabel,
          group_label_line_num: 0,

          group_description: groupDescription,
          group_description_line_num: 0,

          sql_timestamp:
            result === enums.FieldExtResultEnum.Ts ? sqlTimestamp : undefined,
          sql_timestamp_name:
            result === enums.FieldExtResultEnum.Ts
              ? field.name + '___timestamp'
              : undefined,
          sql_timestamp_real: undefined,

          sql: sqlTransformed,
          sql_line_num: field.sql_line_num,
          sql_real: undefined,

          result: result,
          result_line_num: 0,

          unnest: field.unnest,
          unnest_line_num: 0,

          // extra common parameters
          description: undefined,
          description_line_num: undefined,

          // extra time parameters
          timeframes: undefined,
          timeframes_line_num: undefined,
          source: undefined,
          source_line_num: undefined,

          // extra measure parameters
          sql_key: undefined,
          sql_key_line_num: undefined,
          sql_key_real: undefined,
          percentile: undefined,
          percentile_line_num: undefined,

          // extra calculation parameters
          prep_force_dims: undefined,
          force_dims: undefined,

          // extra filter parameters
          default: undefined,
          default_line_num: undefined,
          from_field: undefined,
          from_field_line_num: undefined,
          fractions: undefined,

          // extra
          format_number: undefined,
          format_number_line_num: undefined,
          currency_prefix: undefined,
          currency_prefix_line_num: undefined,
          currency_suffix: undefined,
          currency_suffix_line_num: undefined
        });
      });

      // no fields push of time field (no need to time field anymore)
    });

    x.fields = newFields;
  });

  return item.entities;
}
