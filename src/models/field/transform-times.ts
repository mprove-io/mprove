import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function transformTimes<
  T extends interfaces.View | interfaces.Model
>(item: { entities: Array<T>; weekStart: api.ProjectWeekStartEnum }): Array<T> {
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

      let sqlTimestamp: string;

      if (
        typeof field.source === 'undefined' ||
        field.source === null ||
        field.source === enums.TimeSourceEnum.Timestamp
      ) {
        sqlTimestamp =
          `mprovetimestampstart` + field.sql + `mprovetimestampend`;
      } else if (field.source === enums.TimeSourceEnum.Epoch) {
        sqlTimestamp =
          `mprovetimestampstart` +
          `TIMESTAMP_SECONDS(${field.sql})` +
          `mprovetimestampend`;
      } else if (field.source === enums.TimeSourceEnum.YYYYMMDD) {
        sqlTimestamp =
          `mprovetimestampstart` +
          `PARSE_TIMESTAMP('%Y%m%d', CAST(${field.sql} AS STRING))` +
          `mprovetimestampend`;
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

      field.timeframes.forEach(timeframe => {
        let sqlTransformed: string;
        let name: string;
        let label: string;
        let result: enums.FieldExtResultEnum;

        switch (true) {
          case timeframe === enums.TimeframeEnum.DayOfWeek: {
            name = field.name + `___day_of_week`;
            label = `Day of Week`;

            sqlTransformed = `FORMAT_TIMESTAMP('%A', ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.DayOfWeek;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfWeekIndex: {
            name = field.name + `___day_of_week_index`;
            label = `Day of Week Index`;

            sqlTransformed =
              item.weekStart === api.ProjectWeekStartEnum.Sunday
                ? `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp})`
                : `CASE
      WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) - 1
    END`;

            result = enums.FieldExtResultEnum.DayOfWeekIndex;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfYear: {
            name = field.name + `___day_of_year`;
            label = `Day of Year`;
            // no need for $week_start
            sqlTransformed = `EXTRACT(DAYOFYEAR FROM ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Week: {
            name = field.name + `___week`;
            label = `Week`;

            let dayOfYear = `EXTRACT(DAYOFYEAR FROM ${sqlTimestamp})`;

            let dayOfWeekIndex =
              item.weekStart === api.ProjectWeekStartEnum.Sunday
                ? `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp})`
                : `(CASE WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN 7 ELSE ` +
                  `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) - 1 END)`;

            let fullWeekStartDate =
              item.weekStart === api.ProjectWeekStartEnum.Sunday
                ? `CAST(CAST(TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), WEEK) AS DATE) AS STRING)`
                : `CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), WEEK) AS DATE), INTERVAL 1 DAY) AS STRING)`;

            sqlTransformed = `CASE
      WHEN ${dayOfYear} >= ${dayOfWeekIndex} THEN ${fullWeekStartDate}
      ELSE CAST(DATE_ADD(CAST(${sqlTimestamp} AS DATE), INTERVAL -${dayOfYear} + 1 DAY) AS STRING)
    END`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.WeekOfYear: {
            name = field.name + `___week_of_year`;
            label = `Week of Year`;

            sqlTransformed =
              item.weekStart === api.ProjectWeekStartEnum.Sunday
                ? `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64)`
                : `CASE
      WHEN EXTRACT(DAYOFWEEK FROM TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), YEAR)) = 1 THEN ` +
                  `(CASE WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN ` +
                  `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) ELSE ` +
                  `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) + 1 END)
      ELSE (CASE WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN ` +
                  `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) - 1 ELSE ` +
                  `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) END)
    END`;

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Date: {
            name = field.name + `___date`;
            label = `Date`;

            sqlTransformed = `CAST(CAST(${sqlTimestamp} AS DATE) AS STRING)`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.DayOfMonth: {
            name = field.name + `___day_of_month`;
            label = `Day of Month`;

            sqlTransformed = `EXTRACT(DAY FROM ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Hour: {
            name = field.name + `___hour`;
            label = `Hour`;

            sqlTransformed = `FORMAT_TIMESTAMP('%F %H', ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.HourOfDay: {
            name = field.name + `___hour_of_day`;
            label = `Hour of Day`;

            sqlTransformed = `EXTRACT(HOUR FROM ${sqlTimestamp})`;

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

            sqlTransformed =
              `FORMAT_TIMESTAMP('%F %H', ` +
              `TIMESTAMP_TRUNC(TIMESTAMP_ADD(${sqlTimestamp}, INTERVAL ` +
              `MOD(-1 * EXTRACT(HOUR FROM ${sqlTimestamp}), ${num}) HOUR), HOUR))`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Minute: {
            name = field.name + `___minute`;
            label = `Minute`;

            sqlTransformed = `FORMAT_TIMESTAMP('%F %H:%M', ${sqlTimestamp})`;

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

            sqlTransformed =
              `FORMAT_TIMESTAMP('%F %H:%M', ` +
              `TIMESTAMP_TRUNC(TIMESTAMP_SECONDS((UNIX_SECONDS(${sqlTimestamp}) - ` +
              `MOD(UNIX_SECONDS(${sqlTimestamp}), (60*${num})))), MINUTE))`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.Month: {
            name = field.name + `___month`;
            label = `Month`;

            sqlTransformed = `FORMAT_TIMESTAMP('%Y-%m', ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.MonthName: {
            name = field.name + `___month_name`;
            label = `Month Name`;

            sqlTransformed = `CASE
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 1 THEN 'January'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 2 THEN 'February'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 3 THEN 'March'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 4 THEN 'April'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 5 THEN 'May'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 6 THEN 'June'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 7 THEN 'July'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 8 THEN 'August'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 9 THEN 'September'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 10 THEN 'October'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 11 THEN 'November'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 12 THEN 'December'
    END`;

            result = enums.FieldExtResultEnum.MonthName;
            break;
          }

          case timeframe === enums.TimeframeEnum.MonthNum: {
            name = field.name + `___month_num`;
            label = `Month Num`;

            sqlTransformed = `EXTRACT(MONTH FROM ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.Number;
            break;
          }

          case timeframe === enums.TimeframeEnum.Quarter: {
            name = field.name + `___quarter`;
            label = `Quarter`;

            sqlTransformed = `FORMAT_TIMESTAMP('%Y-%m', TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), QUARTER))`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.QuarterOfYear: {
            name = field.name + `___quarter_of_year`;
            label = `Quarter of Year`;

            sqlTransformed = `CONCAT(CAST('Q' AS STRING), CAST(EXTRACT(QUARTER FROM ${sqlTimestamp}) AS STRING))`;

            result = enums.FieldExtResultEnum.QuarterOfYear;
            break;
          }

          case timeframe === enums.TimeframeEnum.Time: {
            name = field.name + `___time`;
            label = `Time`;

            sqlTransformed = `FORMAT_TIMESTAMP('%F %T', ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.TimeOfDay: {
            name = field.name + `___time_of_day`;
            label = `Time of Day`;

            sqlTransformed = `FORMAT_TIMESTAMP('%H:%M', ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.String;
            break;
          }

          case timeframe === enums.TimeframeEnum.Year: {
            name = field.name + `___year`;
            label = `Year`;

            sqlTransformed = `EXTRACT(YEAR FROM ${sqlTimestamp})`;

            result = enums.FieldExtResultEnum.Ts;
            break;
          }

          case timeframe === enums.TimeframeEnum.YesNoHasValue: {
            name = field.name + `___yesno_has_value`;
            label = `Has value (Yes / No)`;

            sqlTransformed = `CASE
      WHEN (${sqlTimestamp}) IS NOT NULL THEN 'Yes'
      ELSE 'No'
    END`;

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
