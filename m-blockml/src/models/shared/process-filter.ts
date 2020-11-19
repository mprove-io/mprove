// import { ApRegex } from '../../barrels/am-regex';
// import { api } from '../../barrels/api';
// import { enums } from '../../barrels/enums';
// import { gen } from '../../barrels/gen';

// export function processFilter(item: {
//   result: enums.FieldExtResultEnum;
//   filter_bricks: string[];
//   proc: string;
//   weekStart: api.ProjectWeekStartEnum;
//   connection: api.ProjectConnectionEnum;
//   timezone: string;
//   sqlTimestampSelect: string;
//   ORs: string[];
//   NOTs: string[];
//   IN: string[];
//   NOTIN: string[];
//   fractions: api.Fraction[];
// }): { valid: number; brick?: string } {
//   let answerError: { valid: number; brick?: string };

//   let bricks = [...new Set(item.filter_bricks)];

//   bricks.forEach(brick => {
//     let r;
//     let num: string;
//     let value: string;
//     let value1: string;
//     let value2: string;
//     let not: string;
//     let nullValue: string;
//     let blank: string;
//     let condition: string;

//     if (answerError) {
//       return;
//     }

//     if (item.result === enums.FieldExtResultEnum.Number) {
//       // IS EQUAL TO
//       // IS NOT EQUAL TO
//       if ((r = ApRegex.BRICK_NUMBER_NOT_AND_DIGITS().exec(brick))) {
//         not = r[1];

//         let equals = brick.split(',');

//         let nums: string[] = [];

//         equals.forEach(equal => {
//           if (answerError) {
//             return;
//           }

//           let eReg = ApRegex.BRICK_NUMBER_EQUAL_TO();
//           let eR = eReg.exec(equal);

//           if (eR) {
//             num = eR[1];
//           }

//           if (not && num) {
//             item.NOTIN.push(num);
//             nums.push(num);
//           } else if (num) {
//             item.IN.push(num);
//             nums.push(num);
//           } else if (not) {
//             item.NOTs.push(`FAIL`);
//             answerError = { valid: 0, brick: brick };
//             return;
//           } else {
//             item.ORs.push(`FAIL`);
//             answerError = { valid: 0, brick: brick };
//             return;
//           }
//         });

//         let numValues = nums.join(`, `);

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.NumberIsNotEqualTo,
//             number_values: numValues
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.NumberIsEqualTo,
//             number_values: numValues
//           });
//         }

//         // IS GREATER THAN OR EQUAL TO
//       } else if (
//         (r = ApRegex.BRICK_NUMBER_IS_GREATER_THAN_OR_EQUAL_TO().exec(brick))
//       ) {
//         value = r[1];

//         item.ORs.push(`${item.proc} >= ${value}`);

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.NumberIsGreaterThanOrEqualTo,
//           number_value1: Number(value)
//         });

//         // IS GREATER THAN
//       } else if ((r = ApRegex.BRICK_NUMBER_IS_GREATER_THAN().exec(brick))) {
//         value = r[1];

//         item.ORs.push(`${item.proc} > ${value}`);

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.NumberIsGreaterThan,
//           number_value1: Number(value)
//         });

//         // IS LESS THAN OR EQUAL TO
//       } else if (
//         (r = ApRegex.BRICK_NUMBER_IS_LESS_THAN_OR_EQUAL_TO().exec(brick))
//       ) {
//         value = r[1];

//         item.ORs.push(`${item.proc} <= ${value}`);

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.NumberIsLessThanOrEqualTo,
//           number_value1: Number(value)
//         });

//         // IS LESS THAN
//       } else if ((r = ApRegex.BRICK_NUMBER_IS_LESS_THAN().exec(brick))) {
//         value = r[1];

//         item.ORs.push(`${item.proc} < ${value}`);

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.NumberIsLessThan,
//           number_value1: Number(value)
//         });

//         // IS ANY VALUE
//       } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//         item.ORs.push(`'any' = 'any'`);

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.NumberIsAnyValue
//         });
//       } else {
//         // [,]
//         // not [,]
//         if ((r = ApRegex.BRICK_NUMBER_IS_BETWEEN_INCLUSIVE().exec(brick))) {
//           not = r[1];
//           value1 = r[2];
//           value2 = r[3];

//           condition = `((${item.proc} >= ${value1}) AND (${
//             item.proc
//           } <= ${value2}))`;

//           if (not) {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.And,
//               type: api.FractionTypeEnum.NumberIsNotBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.Inclusive
//             });
//           } else {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.Or,
//               type: api.FractionTypeEnum.NumberIsBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.Inclusive
//             });
//           }

//           // [,)
//           // not [,)
//         } else if (
//           (r = ApRegex.BRICK_NUMBER_IS_BETWEEN_LEFT_INCLUSIVE().exec(brick))
//         ) {
//           not = r[1];
//           value1 = r[2];
//           value2 = r[3];

//           condition = `((${item.proc} >= ${value1}) AND (${
//             item.proc
//           } < ${value2}))`;

//           if (not) {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.And,
//               type: api.FractionTypeEnum.NumberIsNotBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.LeftInclusive
//             });
//           } else {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.Or,
//               type: api.FractionTypeEnum.NumberIsBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.LeftInclusive
//             });
//           }

//           // (,]
//           // not (,]
//         } else if (
//           (r = ApRegex.BRICK_NUMBER_IS_BETWEEN_RIGHT_INCLUSIVE().exec(brick))
//         ) {
//           not = r[1];
//           value1 = r[2];
//           value2 = r[3];

//           condition = `((${item.proc} > ${value1}) AND (${
//             item.proc
//           } <= ${value2}))`;

//           if (not) {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.And,
//               type: api.FractionTypeEnum.NumberIsNotBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.RightInclusive
//             });
//           } else {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.Or,
//               type: api.FractionTypeEnum.NumberIsBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.RightInclusive
//             });
//           }

//           // (,)
//           // not (,)
//         } else if (
//           (r = ApRegex.BRICK_NUMBER_IS_BETWEEN_EXCLUSIVE().exec(brick))
//         ) {
//           not = r[1];
//           value1 = r[2];
//           value2 = r[3];

//           condition = `((${item.proc} > ${value1}) AND (${
//             item.proc
//           } < ${value2}))`;

//           if (not) {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.And,
//               type: api.FractionTypeEnum.NumberIsNotBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.Exclusive
//             });
//           } else {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.Or,
//               type: api.FractionTypeEnum.NumberIsBetween,
//               number_value1: Number(value1),
//               number_value2: Number(value2),
//               number_between_option:
//                 api.FractionNumberBetweenOptionEnum.Exclusive
//             });
//           }

//           // IS NULL
//           // IS NOT NULL
//         } else if ((r = ApRegex.BRICK_IS_NULL().exec(brick))) {
//           not = r[1];
//           nullValue = r[2];

//           condition = `(${item.proc} IS NULL)`;

//           if (not) {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.And,
//               type: api.FractionTypeEnum.NumberIsNotNull
//             });
//           } else {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.Or,
//               type: api.FractionTypeEnum.NumberIsNull
//             });
//           }
//         }

//         // common for else of number
//         if (not && condition) {
//           item.NOTs.push(`NOT ${condition}`);
//         } else if (condition) {
//           item.ORs.push(condition);
//         } else if (not) {
//           item.NOTs.push(`FAIL`);
//           answerError = { valid: 0, brick: brick };
//           return;
//         } else {
//           item.ORs.push(`FAIL`);
//           answerError = { valid: 0, brick: brick };
//           return;
//         }
//       }
//     } else if (item.result === enums.FieldExtResultEnum.String) {
//       // IS EQUAL TO
//       // IS NOT EQUAL TO
//       if ((r = ApRegex.BRICK_STRING_IS_EQUAL_TO().exec(brick))) {
//         not = r[1];
//         value = r[2];

//         condition = `${item.proc} = '${value}'`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.StringIsNotEqualTo,
//             string_value: value
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.StringIsEqualTo,
//             string_value: value
//           });
//         }

//         // CONTAINS
//         // DOES NOT CONTAIN
//       } else if ((r = ApRegex.BRICK_STRING_CONTAINS().exec(brick))) {
//         not = r[1];
//         value = r[2];

//         condition = `${item.proc} LIKE '%${value}%'`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.StringDoesNotContain,
//             string_value: value
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.StringContains,
//             string_value: value
//           });
//         }

//         // STARTS WITH
//         // DOES NOT START WITH
//       } else if ((r = ApRegex.BRICK_STRING_STARTS_WITH().exec(brick))) {
//         value = r[1];
//         not = r[2];

//         condition = `${item.proc} LIKE '${value}%'`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.StringDoesNotStartWith,
//             string_value: value
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.StringStartsWith,
//             string_value: value
//           });
//         }

//         // ENDS WITH
//         // DOES NOT END WITH
//       } else if ((r = ApRegex.BRICK_STRING_ENDS_WITH().exec(brick))) {
//         not = r[1];
//         value = r[2];

//         condition = `${item.proc} LIKE '%${value}'`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.StringDoesNotEndWith,
//             string_value: value
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.StringEndsWith,
//             string_value: value
//           });
//         }

//         // IS NULL
//         // IS NOT NULL
//       } else if ((r = ApRegex.BRICK_IS_NULL().exec(brick))) {
//         not = r[1];
//         nullValue = r[2];

//         condition = `(${item.proc} IS NULL)`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.StringIsNotNull
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.StringIsNull
//           });
//         }

//         // IS BLANK
//         // IS NOT BLANK
//       } else if ((r = ApRegex.BRICK_STRING_IS_BLANK().exec(brick))) {
//         not = r[1];
//         blank = r[2];

//         if (item.connection === api.ProjectConnectionEnum.BigQuery) {
//           condition = `(${item.proc} IS NULL OR LENGTH(CAST(${
//             item.proc
//           } AS STRING)) = 0)`;
//         } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
//           condition = `(${item.proc} IS NULL OR LENGTH(CAST(${
//             item.proc
//           } AS TEXT)) = 0)`;
//         }

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.StringIsNotBlank
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.StringIsBlank
//           });
//         }

//         // IS ANY VALUE
//       } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//         condition = `'any' = 'any'`;

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.StringIsAnyValue
//         });
//       }

//       // common for string
//       if (not && condition) {
//         item.NOTs.push(`NOT ${condition}`);
//       } else if (condition) {
//         item.ORs.push(condition);
//       } else if (not) {
//         item.NOTs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       } else {
//         item.ORs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       }
//     } else if (item.result === enums.FieldExtResultEnum.Yesno) {
//       // YESNO YES
//       if ((r = ApRegex.BRICK_YESNO_IS_YES().exec(brick))) {
//         condition = `${item.proc} = 'Yes'`;

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.YesnoIs,
//           yesno_value: api.FractionYesnoValueEnum.Yes
//         });

//         // YESNO NO
//       } else if ((r = ApRegex.BRICK_YESNO_IS_NO().exec(brick))) {
//         condition = `${item.proc} = 'No'`;

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.YesnoIs,
//           yesno_value: api.FractionYesnoValueEnum.No
//         });

//         // IS ANY VALUE
//       } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//         condition = `'any' = 'any'`;

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.YesnoIsAnyValue
//         });
//       }

//       // common for yesno
//       if (condition) {
//         item.ORs.push(condition);
//       } else {
//         item.ORs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       }
//     } else if (item.result === enums.FieldExtResultEnum.Ts) {
//       let tsItem = gen.makeTimestampsCurrent({
//         timezone: item.timezone,
//         week_start: item.weekStart,
//         connection: item.connection
//       });

//       let currentTimestamp = tsItem.current_ts;
//       let currentMinuteTimestamp = tsItem.current_minute_ts;
//       let currentHourTimestamp = tsItem.current_hour_ts;
//       let currentDateTimestamp = tsItem.current_date_ts;
//       let currentWeekStartTimestamp = tsItem.current_week_start_ts;
//       let currentMonthTimestamp = tsItem.current_month_ts;
//       let currentQuarterTimestamp = tsItem.current_quarter_ts;
//       let currentYearTimestamp = tsItem.current_year_ts;

//       let way;
//       let integerStr: string;
//       let unit;

//       let year;
//       let month;
//       let day;
//       let hour;
//       let minute;

//       let toYear;
//       let toMonth;
//       let toDay;
//       let toHour;
//       let toMinute;

//       let complete;
//       let when;
//       let plusCurrent;
//       let forIntegerStr: string;
//       let forUnit;

//       if ((r = ApRegex.BRICK_TS_INTERVALS().exec(brick))) {
//         way = r[1];
//         integerStr = r[2];
//         unit = r[3];
//         year = r[4];
//         month = r[5];
//         day = r[6];
//         hour = r[7];
//         minute = r[8];
//         complete = r[9];
//         when = r[10];
//         plusCurrent = r[11];
//         forIntegerStr = r[12];
//         forUnit = r[13];

//         let open;
//         let close;
//         let one;
//         let two;

//         if (year) {
//           open = gen.makeTimestampOpenFromDateParts({
//             year: year,
//             month: month,
//             day: day,
//             hour: hour,
//             minute: minute,
//             connection: item.connection
//           });

//           switch (true) {
//             case way === 'after': {
//               one = `${item.sqlTimestampSelect} >= ${open}`;
//               two = ``;
//               break;
//             }
//             case way === 'before': {
//               one = `${item.sqlTimestampSelect} < ${open}`;
//               two = ``;
//               break;
//             }
//           }
//         } else {
//           // OPEN INTERVAL
//           if (
//             (way.match(/^last$/) && complete) ||
//             (way.match(/^before|after$/) && when.match(/^ago$/) && complete)
//           ) {
//             open = gen.makeTimestampOpenLastBeforeAfterComplete({
//               unit: unit,
//               integer: Number(integerStr),
//               current_year_ts: currentYearTimestamp,
//               current_quarter_ts: currentQuarterTimestamp,
//               current_month_ts: currentMonthTimestamp,
//               current_week_start_ts: currentWeekStartTimestamp,
//               current_date_ts: currentDateTimestamp,
//               current_hour_ts: currentHourTimestamp,
//               current_minute_ts: currentMinuteTimestamp,
//               connection: item.connection
//             });
//           } else if (
//             way.match(/^last$/) ||
//             (way.match(/^before|after$/) && when.match(/^ago$/))
//           ) {
//             open = gen.makeTimestampOpenLastBeforeAfter({
//               unit: unit,
//               integer: Number(integerStr),
//               current_ts: currentTimestamp,
//               connection: item.connection
//             });
//           } else if (
//             way.match(/^before|after$/) &&
//             when.match(/^in\s+future$/) &&
//             complete
//           ) {
//             open = gen.makeTimestampOpenBeforeAfterInFutureComplete({
//               unit: unit,
//               integer: Number(integerStr),
//               current_year_ts: currentYearTimestamp,
//               current_quarter_ts: currentQuarterTimestamp,
//               current_month_ts: currentMonthTimestamp,
//               current_week_start_ts: currentWeekStartTimestamp,
//               current_date_ts: currentDateTimestamp,
//               current_hour_ts: currentHourTimestamp,
//               current_minute_ts: currentMinuteTimestamp,
//               connection: item.connection
//             });
//           } else if (
//             way.match(/^before|after$/) &&
//             when.match(/^in\s+future$/)
//           ) {
//             open = gen.makeTimestampOpenBeforeAfterInFuture({
//               unit: unit,
//               integer: Number(integerStr),
//               current_ts: currentTimestamp,
//               connection: item.connection
//             });
//           }

//           // CLOSE INTERVAL
//           if (way.match(/^last$/) && complete && plusCurrent) {
//             close = gen.makeTimestampCloseLastCompletePlusCurrent({
//               unit: unit,
//               integer: Number(integerStr),
//               current_year_ts: currentYearTimestamp,
//               current_quarter_ts: currentQuarterTimestamp,
//               current_month_ts: currentMonthTimestamp,
//               current_week_start_ts: currentWeekStartTimestamp,
//               current_date_ts: currentDateTimestamp,
//               current_hour_ts: currentHourTimestamp,
//               current_minute_ts: currentMinuteTimestamp,
//               connection: item.connection
//             });
//           } else if (way.match(/^last$/) && complete) {
//             close =
//               unit === enums.FractionUnitEnum.Minutes
//                 ? currentMinuteTimestamp
//                 : unit === enums.FractionUnitEnum.Hours
//                 ? currentHourTimestamp
//                 : unit === enums.FractionUnitEnum.Days
//                 ? currentDateTimestamp
//                 : unit === enums.FractionUnitEnum.Weeks
//                 ? currentWeekStartTimestamp
//                 : unit === enums.FractionUnitEnum.Months
//                 ? currentMonthTimestamp
//                 : unit === enums.FractionUnitEnum.Quarters
//                 ? currentQuarterTimestamp
//                 : unit === enums.FractionUnitEnum.Years
//                 ? currentYearTimestamp
//                 : undefined;
//           } else if (way.match(/^last$/)) {
//             close = currentTimestamp;
//           }
//         }

//         if (way.match(/^before|after$/) && forUnit) {
//           let sIntegerStr = way.match(/^after$/)
//             ? `${forIntegerStr}`
//             : `-${forIntegerStr}`;

//           close = gen.makeTimestampCloseBeforeAfterForUnit({
//             open: open,
//             for_unit: forUnit,
//             s_integer: Number(sIntegerStr),
//             connection: item.connection
//           });
//         }

//         if (way.match(/^last|after$/)) {
//           one = `${item.sqlTimestampSelect} >= ${open}`;
//         } else if (way.match(/^before$/)) {
//           one = `${item.sqlTimestampSelect} < ${open}`;
//         }

//         if (way.match(/^last$/)) {
//           two = ` AND ${item.sqlTimestampSelect} < ${close}`;
//         } else if (way.match(/^after$/) && forUnit) {
//           two = ` AND ${item.sqlTimestampSelect} < ${close}`;
//         } else if (way.match(/^before$/) && forUnit) {
//           two = ` AND ${item.sqlTimestampSelect} >= ${close}`;
//         } else if (way.match(/^before|after$/)) {
//           two = ``;
//         }

//         item.ORs.push(`(${one}` + `${two})`);

//         if (way.match(/^last$/)) {
//           let tsLastCompleteOption =
//             complete && plusCurrent
//               ? api.FractionTsLastCompleteOptionEnum.CompletePlusCurrent
//               : complete
//               ? api.FractionTsLastCompleteOptionEnum.Complete
//               : api.FractionTsLastCompleteOptionEnum.Incomplete;

//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsInLast,
//             ts_last_value: Number(integerStr),
//             ts_last_unit: <any>unit,
//             ts_last_complete_option: tsLastCompleteOption
//           });
//         } else if (way.match(/^before$/) && year) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsBeforeDate,
//             ts_date_year: Number(year),
//             ts_date_month: Number(month),
//             ts_date_day: Number(day),
//             ts_date_hour: Number(hour),
//             ts_date_minute: Number(minute),
//             ts_for_option: forUnit
//               ? api.FractionTsForOptionEnum.For
//               : api.FractionTsForOptionEnum.ForInfinity,
//             ts_for_value: Number(forIntegerStr),
//             ts_for_unit: <any>forUnit
//           });
//         } else if (way.match(/^before$/)) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsBeforeRelative,
//             ts_relative_value: Number(integerStr),
//             ts_relative_unit: <any>unit,
//             ts_relative_complete_option: complete
//               ? api.FractionTsRelativeCompleteOptionEnum.Complete
//               : api.FractionTsRelativeCompleteOptionEnum.Incomplete,
//             ts_relative_when_option: when.match(/^ago$/)
//               ? api.FractionTsRelativeWhenOptionEnum.Ago
//               : when.match(/^in\s+future$/)
//               ? api.FractionTsRelativeWhenOptionEnum.InFuture
//               : undefined,
//             ts_for_option: forUnit
//               ? api.FractionTsForOptionEnum.For
//               : api.FractionTsForOptionEnum.ForInfinity,
//             ts_for_value: Number(forIntegerStr),
//             ts_for_unit: <any>forUnit
//           });
//         } else if (way.match(/^after$/) && year) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsAfterDate,
//             ts_date_year: Number(year),
//             ts_date_month: Number(month),
//             ts_date_day: Number(day),
//             ts_date_hour: Number(hour),
//             ts_date_minute: Number(minute),
//             ts_for_option: forUnit
//               ? api.FractionTsForOptionEnum.For
//               : api.FractionTsForOptionEnum.ForInfinity,
//             ts_for_value: Number(forIntegerStr),
//             ts_for_unit: <any>forUnit
//           });
//         } else if (way.match(/^after$/)) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsAfterRelative,
//             ts_relative_value: Number(integerStr),
//             ts_relative_unit: <any>unit,
//             ts_relative_complete_option: complete
//               ? api.FractionTsRelativeCompleteOptionEnum.Complete
//               : api.FractionTsRelativeCompleteOptionEnum.Incomplete,
//             ts_relative_when_option: when.match(/^ago$/)
//               ? api.FractionTsRelativeWhenOptionEnum.Ago
//               : when.match(/^in\s+future$/)
//               ? api.FractionTsRelativeWhenOptionEnum.InFuture
//               : undefined,
//             ts_for_option: forUnit
//               ? api.FractionTsForOptionEnum.For
//               : api.FractionTsForOptionEnum.ForInfinity,
//             ts_for_value: Number(forIntegerStr),
//             ts_for_unit: <any>forUnit
//           });
//         }

//         // IS
//         // BETWEEN
//         // on (year)/(month)/(day) (hour):(minute) [to (year)/(month)/(day) (hour):(minute)]
//       } else if ((r = ApRegex.BRICK_TS_IS_BETWEEN_ON().exec(brick))) {
//         year = r[1];
//         month = r[2];
//         day = r[3];
//         hour = r[4];
//         minute = r[5];

//         toYear = r[6];
//         toMonth = r[7];
//         toDay = r[8];
//         toHour = r[9];
//         toMinute = r[10];

//         let open;
//         let close;

//         open = gen.makeTimestampOpenFromDateParts({
//           year: year,
//           month: month,
//           day: day,
//           hour: hour,
//           minute: minute,
//           connection: item.connection
//         });

//         if (typeof toYear === 'undefined' || toYear === null) {
//           close = gen.makeTimestampCloseBetween({
//             open: open,
//             year: year,
//             month: month,
//             day: day,
//             hour: hour,
//             minute: minute,
//             connection: item.connection
//           });
//         } else {
//           // to
//           close = gen.makeTimestampCloseBetweenTo({
//             to_year: toYear,
//             to_month: toMonth,
//             to_day: toDay,
//             to_hour: toHour,
//             to_minute: toMinute,
//             connection: item.connection
//           });
//         }

//         item.ORs.push(
//           `(${item.sqlTimestampSelect} >= ${open} AND ${
//             item.sqlTimestampSelect
//           } < ${close})`
//         );

//         if (toYear) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsInRange,

//             ts_date_year: Number(year),
//             ts_date_month: Number(month),
//             ts_date_day: Number(day),
//             ts_date_hour: Number(hour),
//             ts_date_minute: Number(minute),

//             ts_date_to_year: Number(toYear),
//             ts_date_to_month: Number(toMonth),
//             ts_date_to_day: Number(toDay),
//             ts_date_to_hour: Number(toHour),
//             ts_date_to_minute: Number(toMinute)
//           });
//         } else if (minute) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsOnMinute,

//             ts_date_year: Number(year),
//             ts_date_month: Number(month),
//             ts_date_day: Number(day),
//             ts_date_hour: Number(hour),
//             ts_date_minute: Number(minute)
//           });
//         } else if (hour) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsOnHour,

//             ts_date_year: Number(year),
//             ts_date_month: Number(month),
//             ts_date_day: Number(day),
//             ts_date_hour: Number(hour)
//           });
//         } else if (day) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsOnDay,

//             ts_date_year: Number(year),
//             ts_date_month: Number(month),
//             ts_date_day: Number(day)
//           });
//         } else if (month) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsOnMonth,

//             ts_date_year: Number(year),
//             ts_date_month: Number(month)
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsOnYear,

//             ts_date_year: Number(year)
//           });
//         }

//         // IS NULL
//         // IS NOT NULL
//       } else if ((r = ApRegex.BRICK_IS_NULL().exec(brick))) {
//         not = r[1];
//         nullValue = r[2];

//         condition = `(${item.sqlTimestampSelect} IS NULL)`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.TsIsNotNull
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.TsIsNull
//           });
//         }

//         if (not && condition) {
//           item.NOTs.push(`NOT ${condition}`);
//         } else if (condition) {
//           item.ORs.push(condition);
//         }

//         // IS ANY VALUE
//       } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//         item.ORs.push(`'any' = 'any'`);

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.TsIsAnyValue
//         });

//         if (not && condition) {
//           item.NOTs.push(`NOT ${condition}`);
//         } else if (condition) {
//           item.ORs.push(condition);
//         }
//       } else {
//         item.ORs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       }
//     } else if (item.result === enums.FieldExtResultEnum.DayOfWeek) {
//       // IS
//       // IS NOT
//       if ((r = ApRegex.BRICK_DAY_OF_WEEK_IS().exec(brick))) {
//         not = r[1];
//         value = r[2];

//         condition = `UPPER(${item.proc}) = UPPER('${value}')`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.DayOfWeekIsNot,
//             day_of_week_value: <any>value.toLowerCase()
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.DayOfWeekIs,
//             day_of_week_value: <any>value.toLowerCase()
//           });
//         }

//         // IS NULL
//         // IS NOT NULL
//       } else if ((r = ApRegex.BRICK_IS_NULL().exec(brick))) {
//         not = r[1];
//         nullValue = r[2];

//         condition = `(${item.proc} IS NULL)`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.DayOfWeekIsNotNull
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.DayOfWeekIsNull
//           });
//         }

//         // IS ANY VALUE
//       } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//         condition = `'any' = 'any'`;

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.DayOfWeekIsAnyValue
//         });
//       }

//       // common for DayOfWeek
//       if (not && condition) {
//         item.NOTs.push(`NOT ${condition}`);
//       } else if (condition) {
//         item.ORs.push(condition);
//       } else if (not) {
//         item.NOTs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       } else {
//         item.ORs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       }
//     } else if (item.result === enums.FieldExtResultEnum.DayOfWeekIndex) {
//       if ((r = ApRegex.BRICK_DAY_OF_WEEK_INDEX_IS_EQUAL().exec(brick))) {
//         not = r[1];

//         let equals = brick.split(',');

//         let dayOfWeekIndexValues: string[] = [];

//         equals.forEach(equal => {
//           if (answerError) {
//             return;
//           }

//           let eReg = ApRegex.BRICK_DAY_OF_WEEK_INDEX_EQUAL_TO();
//           let eR = eReg.exec(equal);

//           if (eR) {
//             num = eR[1];
//           }

//           if (not && num) {
//             item.NOTIN.push(num);
//             dayOfWeekIndexValues.push(num);
//           } else if (num) {
//             item.IN.push(num);
//             dayOfWeekIndexValues.push(num);
//           } else if (not) {
//             item.NOTs.push(`FAIL`);
//             answerError = { valid: 0, brick: brick };
//             return;
//           } else {
//             item.ORs.push(`FAIL`);
//             answerError = { valid: 0, brick: brick };
//             return;
//           }
//         });

//         let dayOfWeekIndexValuesString = dayOfWeekIndexValues.join(`, `);

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.DayOfWeekIndexIsNotEqualTo,
//             day_of_week_index_values: dayOfWeekIndexValuesString
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.DayOfWeekIndexIsEqualTo,
//             day_of_week_index_values: dayOfWeekIndexValuesString
//           });
//         }
//       } else {
//         // IS NULL
//         // IS NOT NULL
//         if ((r = ApRegex.BRICK_IS_NULL().exec(brick))) {
//           not = r[1];
//           nullValue = r[2];

//           condition = `(${item.proc} IS NULL)`;

//           if (not) {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.And,
//               type: api.FractionTypeEnum.DayOfWeekIndexIsNotNull
//             });
//           } else {
//             item.fractions.push({
//               brick: brick,
//               operator: api.FractionOperatorEnum.Or,
//               type: api.FractionTypeEnum.DayOfWeekIndexIsNull
//             });
//           }

//           // IS ANY VALUE
//         } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//           condition = `'any' = 'any'`;

//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.DayOfWeekIndexIsAnyValue
//           });
//         }

//         // common for DayOfWeekIndex
//         if (not && condition) {
//           item.NOTs.push(`NOT ${condition}`);
//         } else if (condition) {
//           item.ORs.push(condition);
//         } else if (not) {
//           item.NOTs.push(`FAIL`);
//           answerError = { valid: 0, brick: brick };
//           return;
//         } else {
//           item.ORs.push(`FAIL`);
//           answerError = { valid: 0, brick: brick };
//           return;
//         }
//       }
//     } else if (item.result === enums.FieldExtResultEnum.MonthName) {
//       // IS
//       // IS NOT
//       if ((r = ApRegex.BRICK_MONTH_NAME_IS().exec(brick))) {
//         not = r[1];
//         value = r[2];

//         condition = `UPPER(${item.proc}) = UPPER('${value}')`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.MonthNameIsNot,
//             month_name_value: <any>value.toLowerCase()
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.MonthNameIs,
//             month_name_value: <any>value.toLowerCase()
//           });
//         }

//         // IS NULL
//         // IS NOT NULL
//       } else if ((r = ApRegex.BRICK_IS_NULL().exec(brick))) {
//         not = r[1];
//         nullValue = r[2];

//         condition = `(${item.proc} IS NULL)`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.MonthNameIsNotNull
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.MonthNameIsNull
//           });
//         }

//         // IS ANY VALUE
//       } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//         condition = `'any' = 'any'`;

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.MonthNameIsAnyValue
//         });
//       }

//       // common for MonthName
//       if (not && condition) {
//         item.NOTs.push(`NOT ${condition}`);
//       } else if (condition) {
//         item.ORs.push(condition);
//       } else if (not) {
//         item.NOTs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       } else {
//         item.ORs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       }
//     } else if (item.result === enums.FieldExtResultEnum.QuarterOfYear) {
//       // IS
//       // IS NOT
//       if ((r = ApRegex.BRICK_QUARTER_OF_YEAR_IS().exec(brick))) {
//         not = r[1];
//         value = r[2];

//         condition = `UPPER(${item.proc}) = UPPER('${value}')`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.QuarterOfYearIsNot,
//             quarter_of_year_value: <any>value
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.QuarterOfYearIs,
//             quarter_of_year_value: <any>value
//           });
//         }

//         // IS NULL
//         // IS NOT NULL
//       } else if ((r = ApRegex.BRICK_IS_NULL().exec(brick))) {
//         not = r[1];
//         nullValue = r[2];

//         condition = `(${item.proc} IS NULL)`;

//         if (not) {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.And,
//             type: api.FractionTypeEnum.QuarterOfYearIsNotNull
//           });
//         } else {
//           item.fractions.push({
//             brick: brick,
//             operator: api.FractionOperatorEnum.Or,
//             type: api.FractionTypeEnum.QuarterOfYearIsNull
//           });
//         }

//         // IS ANY VALUE
//       } else if ((r = ApRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
//         condition = `'any' = 'any'`;

//         item.fractions.push({
//           brick: brick,
//           operator: api.FractionOperatorEnum.Or,
//           type: api.FractionTypeEnum.QuarterOfYearIsAnyValue
//         });
//       }

//       // common for QuarterOfYear
//       if (not && condition) {
//         item.NOTs.push(`NOT ${condition}`);
//       } else if (condition) {
//         item.ORs.push(condition);
//       } else if (not) {
//         item.NOTs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       } else {
//         item.ORs.push(`FAIL`);
//         answerError = { valid: 0, brick: brick };
//         return;
//       }
//     }
//   });

//   if (answerError) {
//     return answerError;
//   }

//   return { valid: 1 };
// }
