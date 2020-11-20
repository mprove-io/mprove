import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { barTimestamp } from '../../barrels/bar-timestamp';

export function processFilter(item: {
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
  timezone: string;
  result: enums.FieldAnyResultEnum;
  filterBricks: string[];
  proc: string;
  sqlTimestampSelect: string;
  ORs: string[];
  NOTs: string[];
  IN: string[];
  NOTIN: string[];
  fractions: api.Fraction[];
}): { valid: number; brick?: string } {
  let answerError: { valid: number; brick?: string };

  let bricks = [...new Set(item.filterBricks)];

  bricks.forEach(brick => {
    let r;
    let num: string;
    let value: string;
    let value1: string;
    let value2: string;
    let not: string;
    let nullValue: string;
    let blank: string;
    let condition: string;

    if (answerError) {
      return;
    }

    if (item.result === enums.FieldAnyResultEnum.Number) {
      // IS EQUAL TO
      // IS NOT EQUAL TO
      if ((r = api.MyRegex.BRICK_NUMBER_NOT_AND_DIGITS().exec(brick))) {
        not = r[1];

        let equals = brick.split(',');

        let nums: string[] = [];

        equals.forEach(equal => {
          if (answerError) {
            return;
          }

          let eReg = api.MyRegex.BRICK_NUMBER_EQUAL_TO();
          let eR = eReg.exec(equal);

          if (eR) {
            num = eR[1];
          }

          if (not && num) {
            item.NOTIN.push(num);
            nums.push(num);
          } else if (num) {
            item.IN.push(num);
            nums.push(num);
          } else if (not) {
            item.NOTs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          } else {
            item.ORs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          }
        });

        let numValues = nums.join(', ');

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.NumberIsNotEqualTo,
            numberValues: numValues
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.NumberIsEqualTo,
            numberValues: numValues
          });
        }

        // IS GREATER THAN OR EQUAL TO
      } else if (
        (r = api.MyRegex.BRICK_NUMBER_IS_GREATER_THAN_OR_EQUAL_TO().exec(brick))
      ) {
        value = r[1];

        item.ORs.push(`${item.proc} >= ${value}`);

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.NumberIsGreaterThanOrEqualTo,
          numberValue1: Number(value)
        });

        // IS GREATER THAN
      } else if ((r = api.MyRegex.BRICK_NUMBER_IS_GREATER_THAN().exec(brick))) {
        value = r[1];

        item.ORs.push(`${item.proc} > ${value}`);

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.NumberIsGreaterThan,
          numberValue1: Number(value)
        });

        // IS LESS THAN OR EQUAL TO
      } else if (
        (r = api.MyRegex.BRICK_NUMBER_IS_LESS_THAN_OR_EQUAL_TO().exec(brick))
      ) {
        value = r[1];

        item.ORs.push(`${item.proc} <= ${value}`);

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.NumberIsLessThanOrEqualTo,
          numberValue1: Number(value)
        });

        // IS LESS THAN
      } else if ((r = api.MyRegex.BRICK_NUMBER_IS_LESS_THAN().exec(brick))) {
        value = r[1];

        item.ORs.push(`${item.proc} < ${value}`);

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.NumberIsLessThan,
          numberValue1: Number(value)
        });

        // IS ANY VALUE
      } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        item.ORs.push("'any' = 'any'");

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.NumberIsAnyValue
        });
      } else {
        // [,]
        // not [,]
        if ((r = api.MyRegex.BRICK_NUMBER_IS_BETWEEN_INCLUSIVE().exec(brick))) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${item.proc} >= ${value1}) AND (${item.proc} <= ${value2}))`;

          if (not) {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.And,
              type: api.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption: api.FractionNumberBetweenOptionEnum.Inclusive
            });
          } else {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.Or,
              type: api.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption: api.FractionNumberBetweenOptionEnum.Inclusive
            });
          }

          // [,)
          // not [,)
        } else if (
          (r = api.MyRegex.BRICK_NUMBER_IS_BETWEEN_LEFT_INCLUSIVE().exec(brick))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${item.proc} >= ${value1}) AND (${item.proc} < ${value2}))`;

          if (not) {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.And,
              type: api.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                api.FractionNumberBetweenOptionEnum.LeftInclusive
            });
          } else {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.Or,
              type: api.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                api.FractionNumberBetweenOptionEnum.LeftInclusive
            });
          }

          // (,]
          // not (,]
        } else if (
          (r = api.MyRegex.BRICK_NUMBER_IS_BETWEEN_RIGHT_INCLUSIVE().exec(
            brick
          ))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${item.proc} > ${value1}) AND (${item.proc} <= ${value2}))`;

          if (not) {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.And,
              type: api.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                api.FractionNumberBetweenOptionEnum.RightInclusive
            });
          } else {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.Or,
              type: api.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                api.FractionNumberBetweenOptionEnum.RightInclusive
            });
          }

          // (,)
          // not (,)
        } else if (
          (r = api.MyRegex.BRICK_NUMBER_IS_BETWEEN_EXCLUSIVE().exec(brick))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${item.proc} > ${value1}) AND (${item.proc} < ${value2}))`;

          if (not) {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.And,
              type: api.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption: api.FractionNumberBetweenOptionEnum.Exclusive
            });
          } else {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.Or,
              type: api.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption: api.FractionNumberBetweenOptionEnum.Exclusive
            });
          }

          // IS NULL
          // IS NOT NULL
        } else if ((r = api.MyRegex.BRICK_IS_NULL().exec(brick))) {
          not = r[1];
          nullValue = r[2];

          condition = `(${item.proc} IS NULL)`;

          if (not) {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.And,
              type: api.FractionTypeEnum.NumberIsNotNull
            });
          } else {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.Or,
              type: api.FractionTypeEnum.NumberIsNull
            });
          }
        }

        // common for else of number
        if (not && condition) {
          item.NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          item.ORs.push(condition);
        } else if (not) {
          item.NOTs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        } else {
          item.ORs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        }
      }
    } else if (item.result === enums.FieldAnyResultEnum.String) {
      // IS EQUAL TO
      // IS NOT EQUAL TO
      if ((r = api.MyRegex.BRICK_STRING_IS_EQUAL_TO().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `${item.proc} = '${value}'`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.StringIsNotEqualTo,
            stringValue: value
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.StringIsEqualTo,
            stringValue: value
          });
        }

        // CONTAINS
        // DOES NOT CONTAIN
      } else if ((r = api.MyRegex.BRICK_STRING_CONTAINS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `${item.proc} LIKE '%${value}%'`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.StringDoesNotContain,
            stringValue: value
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.StringContains,
            stringValue: value
          });
        }

        // STARTS WITH
        // DOES NOT START WITH
      } else if ((r = api.MyRegex.BRICK_STRING_STARTS_WITH().exec(brick))) {
        value = r[1];
        not = r[2];

        condition = `${item.proc} LIKE '${value}%'`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.StringDoesNotStartWith,
            stringValue: value
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.StringStartsWith,
            stringValue: value
          });
        }

        // ENDS WITH
        // DOES NOT END WITH
      } else if ((r = api.MyRegex.BRICK_STRING_ENDS_WITH().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `${item.proc} LIKE '%${value}'`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.StringDoesNotEndWith,
            stringValue: value
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.StringEndsWith,
            stringValue: value
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = api.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${item.proc} IS NULL)`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.StringIsNotNull
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.StringIsNull
          });
        }

        // IS BLANK
        // IS NOT BLANK
      } else if ((r = api.MyRegex.BRICK_STRING_IS_BLANK().exec(brick))) {
        not = r[1];
        blank = r[2];

        if (item.connection.type === api.ConnectionTypeEnum.BigQuery) {
          condition = `(${item.proc} IS NULL OR LENGTH(CAST(${item.proc} AS STRING)) = 0)`;
        } else if (item.connection.type === api.ConnectionTypeEnum.PostgreSQL) {
          condition = `(${item.proc} IS NULL OR LENGTH(CAST(${item.proc} AS TEXT)) = 0)`;
        }

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.StringIsNotBlank
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.StringIsBlank
          });
        }

        // IS ANY VALUE
      } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = "'any' = 'any'";

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.StringIsAnyValue
        });
      }

      // common for string
      if (not && condition) {
        item.NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        item.ORs.push(condition);
      } else if (not) {
        item.NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        item.ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (item.result === enums.FieldAnyResultEnum.Yesno) {
      // YESNO YES
      if ((r = api.MyRegex.BRICK_YESNO_IS_YES().exec(brick))) {
        condition = `${item.proc} = 'Yes'`;

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.YesnoIs,
          yesnoValue: api.FractionYesnoValueEnum.Yes
        });

        // YESNO NO
      } else if ((r = api.MyRegex.BRICK_YESNO_IS_NO().exec(brick))) {
        condition = `${item.proc} = 'No'`;

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.YesnoIs,
          yesnoValue: api.FractionYesnoValueEnum.No
        });

        // IS ANY VALUE
      } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = "'any' = 'any'";

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.YesnoIsAnyValue
        });
      }

      // common for yesno
      if (condition) {
        item.ORs.push(condition);
      } else {
        item.ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (item.result === enums.FieldAnyResultEnum.Ts) {
      let {
        currentTs,
        currentMinuteTs,
        currentHourTs,
        currentDateTs,
        currentWeekStartTs,
        currentMonthTs,
        currentQuarterTs,
        currentYearTs
      } = barTimestamp.makeTimestampsCurrent({
        timezone: item.timezone,
        weekStart: item.weekStart,
        connection: item.connection
      });

      let way;
      let integerStr: string;
      let unit;

      let year;
      let month;
      let day;
      let hour;
      let minute;

      let toYear;
      let toMonth;
      let toDay;
      let toHour;
      let toMinute;

      let complete;
      let when;
      let plusCurrent;
      let forIntegerStr: string;
      let forUnit;

      if ((r = api.MyRegex.BRICK_TS_INTERVALS().exec(brick))) {
        way = r[1];
        integerStr = r[2];
        unit = r[3];
        year = r[4];
        month = r[5];
        day = r[6];
        hour = r[7];
        minute = r[8];
        complete = r[9];
        when = r[10];
        plusCurrent = r[11];
        forIntegerStr = r[12];
        forUnit = r[13];

        let open;
        let close;
        let one;
        let two;

        if (year) {
          open = barTimestamp.makeTimestampOpenFromDateParts({
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            connection: item.connection
          });

          switch (true) {
            case way === 'after': {
              one = `${item.sqlTimestampSelect} >= ${open}`;
              two = '';
              break;
            }
            case way === 'before': {
              one = `${item.sqlTimestampSelect} < ${open}`;
              two = '';
              break;
            }
          }
        } else {
          // OPEN INTERVAL
          if (
            (way.match(/^last$/) && complete) ||
            (way.match(/^before|after$/) && when.match(/^ago$/) && complete)
          ) {
            open = barTimestamp.makeTimestampOpenLastBeforeAfterComplete({
              unit: unit,
              integer: Number(integerStr),
              currentYearTs: currentYearTs,
              currentQuarterTs: currentQuarterTs,
              currentMonthTs: currentMonthTs,
              currentWeekStartTs: currentWeekStartTs,
              currentDateTs: currentDateTs,
              currentHourTs: currentHourTs,
              currentMinuteTs: currentMinuteTs,
              connection: item.connection
            });
          } else if (
            way.match(/^last$/) ||
            (way.match(/^before|after$/) && when.match(/^ago$/))
          ) {
            open = barTimestamp.makeTimestampOpenLastBeforeAfter({
              unit: unit,
              integer: Number(integerStr),
              currentTs: currentTs,
              connection: item.connection
            });
          } else if (
            way.match(/^before|after$/) &&
            when.match(/^in\s+future$/) &&
            complete
          ) {
            open = barTimestamp.makeTimestampOpenBeforeAfterInFutureComplete({
              unit: unit,
              integer: Number(integerStr),
              currentYearTs: currentYearTs,
              currentQuarterTs: currentQuarterTs,
              currentMonthTs: currentMonthTs,
              currentWeekStartTs: currentWeekStartTs,
              currentDateTs: currentDateTs,
              currentHourTs: currentHourTs,
              currentMinuteTs: currentMinuteTs,
              connection: item.connection
            });
          } else if (
            way.match(/^before|after$/) &&
            when.match(/^in\s+future$/)
          ) {
            open = barTimestamp.makeTimestampOpenBeforeAfterInFuture({
              unit: unit,
              integer: Number(integerStr),
              currentTs: currentTs,
              connection: item.connection
            });
          }

          // CLOSE INTERVAL
          if (way.match(/^last$/) && complete && plusCurrent) {
            close = barTimestamp.makeTimestampCloseLastCompletePlusCurrent({
              unit: unit,
              integer: Number(integerStr),
              currentYearTs: currentYearTs,
              currentQuarterTs: currentQuarterTs,
              currentMonthTs: currentMonthTs,
              currentWeekStartTs: currentWeekStartTs,
              currentDateTs: currentDateTs,
              currentHourTs: currentHourTs,
              currentMinuteTs: currentMinuteTs,
              connection: item.connection
            });
          } else if (way.match(/^last$/) && complete) {
            close =
              unit === enums.FractionUnitEnum.Minutes
                ? currentMinuteTs
                : unit === enums.FractionUnitEnum.Hours
                ? currentHourTs
                : unit === enums.FractionUnitEnum.Days
                ? currentDateTs
                : unit === enums.FractionUnitEnum.Weeks
                ? currentWeekStartTs
                : unit === enums.FractionUnitEnum.Months
                ? currentMonthTs
                : unit === enums.FractionUnitEnum.Quarters
                ? currentQuarterTs
                : unit === enums.FractionUnitEnum.Years
                ? currentYearTs
                : undefined;
          } else if (way.match(/^last$/)) {
            close = currentTs;
          }
        }

        if (way.match(/^before|after$/) && forUnit) {
          let sIntegerStr = way.match(/^after$/)
            ? `${forIntegerStr}`
            : `-${forIntegerStr}`;

          close = barTimestamp.makeTimestampCloseBeforeAfterForUnit({
            open: open,
            forUnit: forUnit,
            sInteger: Number(sIntegerStr),
            connection: item.connection
          });
        }

        if (way.match(/^last|after$/)) {
          one = `${item.sqlTimestampSelect} >= ${open}`;
        } else if (way.match(/^before$/)) {
          one = `${item.sqlTimestampSelect} < ${open}`;
        }

        if (way.match(/^last$/)) {
          two = ` AND ${item.sqlTimestampSelect} < ${close}`;
        } else if (way.match(/^after$/) && forUnit) {
          two = ` AND ${item.sqlTimestampSelect} < ${close}`;
        } else if (way.match(/^before$/) && forUnit) {
          two = ` AND ${item.sqlTimestampSelect} >= ${close}`;
        } else if (way.match(/^before|after$/)) {
          two = '';
        }

        item.ORs.push(`(${one}` + `${two})`);

        if (way.match(/^last$/)) {
          let tsLastCompleteOption =
            complete && plusCurrent
              ? api.FractionTsLastCompleteOptionEnum.CompletePlusCurrent
              : complete
              ? api.FractionTsLastCompleteOptionEnum.Complete
              : api.FractionTsLastCompleteOptionEnum.Incomplete;

          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsInLast,
            tsLastValue: Number(integerStr),
            tsLastUnit: <any>unit,
            tsLastCompleteOption: tsLastCompleteOption
          });
        } else if (way.match(/^before$/) && year) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsBeforeDate,
            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute),
            tsForOption: forUnit
              ? api.FractionTsForOptionEnum.For
              : api.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^before$/)) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsBeforeRelative,
            tsRelativeValue: Number(integerStr),
            tsRelativeUnit: <any>unit,
            tsRelativeCompleteOption: complete
              ? api.FractionTsRelativeCompleteOptionEnum.Complete
              : api.FractionTsRelativeCompleteOptionEnum.Incomplete,
            tsRelativeWhenOption: when.match(/^ago$/)
              ? api.FractionTsRelativeWhenOptionEnum.Ago
              : when.match(/^in\s+future$/)
              ? api.FractionTsRelativeWhenOptionEnum.InFuture
              : undefined,
            tsForOption: forUnit
              ? api.FractionTsForOptionEnum.For
              : api.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^after$/) && year) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsAfterDate,
            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute),
            tsForOption: forUnit
              ? api.FractionTsForOptionEnum.For
              : api.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^after$/)) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsAfterRelative,
            tsRelativeValue: Number(integerStr),
            tsRelativeUnit: <any>unit,
            tsRelativeCompleteOption: complete
              ? api.FractionTsRelativeCompleteOptionEnum.Complete
              : api.FractionTsRelativeCompleteOptionEnum.Incomplete,
            tsRelativeWhenOption: when.match(/^ago$/)
              ? api.FractionTsRelativeWhenOptionEnum.Ago
              : when.match(/^in\s+future$/)
              ? api.FractionTsRelativeWhenOptionEnum.InFuture
              : undefined,
            tsForOption: forUnit
              ? api.FractionTsForOptionEnum.For
              : api.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        }

        // IS
        // BETWEEN
        // on (year)/(month)/(day) (hour):(minute) [to (year)/(month)/(day) (hour):(minute)]
      } else if ((r = api.MyRegex.BRICK_TS_IS_BETWEEN_ON().exec(brick))) {
        year = r[1];
        month = r[2];
        day = r[3];
        hour = r[4];
        minute = r[5];

        toYear = r[6];
        toMonth = r[7];
        toDay = r[8];
        toHour = r[9];
        toMinute = r[10];

        let open;
        let close;

        open = barTimestamp.makeTimestampOpenFromDateParts({
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
          connection: item.connection
        });

        if (typeof toYear === 'undefined' || toYear === null) {
          close = barTimestamp.makeTimestampCloseBetween({
            open: open,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            connection: item.connection
          });
        } else {
          // to
          close = barTimestamp.makeTimestampCloseBetweenTo({
            toYear: toYear,
            toMonth: toMonth,
            toDay: toDay,
            toHour: toHour,
            toMinute: toMinute,
            connection: item.connection
          });
        }

        item.ORs.push(
          `(${item.sqlTimestampSelect} >= ${open} AND ${item.sqlTimestampSelect} < ${close})`
        );

        if (toYear) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsInRange,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute),

            tsDateToYear: Number(toYear),
            tsDateToMonth: Number(toMonth),
            tsDateToDay: Number(toDay),
            tsDateToHour: Number(toHour),
            tsDateToMinute: Number(toMinute)
          });
        } else if (minute) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsOnMinute,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute)
          });
        } else if (hour) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsOnHour,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour)
          });
        } else if (day) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsOnDay,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day)
          });
        } else if (month) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsOnMonth,

            tsDateYear: Number(year),
            tsDateMonth: Number(month)
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsOnYear,

            tsDateYear: Number(year)
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = api.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${item.sqlTimestampSelect} IS NULL)`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.TsIsNotNull
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.TsIsNull
          });
        }

        if (not && condition) {
          item.NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          item.ORs.push(condition);
        }

        // IS ANY VALUE
      } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        item.ORs.push("'any' = 'any'");

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.TsIsAnyValue
        });

        if (not && condition) {
          item.NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          item.ORs.push(condition);
        }
      } else {
        item.ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (item.result === enums.FieldAnyResultEnum.DayOfWeek) {
      // IS
      // IS NOT
      if ((r = api.MyRegex.BRICK_DAY_OF_WEEK_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${item.proc}) = UPPER('${value}')`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.DayOfWeekIsNot,
            dayOfWeekValue: <any>value.toLowerCase()
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.DayOfWeekIs,
            dayOfWeekValue: <any>value.toLowerCase()
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = api.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${item.proc} IS NULL)`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.DayOfWeekIsNotNull
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.DayOfWeekIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = "'any' = 'any'";

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.DayOfWeekIsAnyValue
        });
      }

      // common for DayOfWeek
      if (not && condition) {
        item.NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        item.ORs.push(condition);
      } else if (not) {
        item.NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        item.ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (item.result === enums.FieldAnyResultEnum.DayOfWeekIndex) {
      if ((r = api.MyRegex.BRICK_DAY_OF_WEEK_INDEX_IS_EQUAL().exec(brick))) {
        not = r[1];

        let equals = brick.split(',');

        let dayOfWeekIndexValues: string[] = [];

        equals.forEach(equal => {
          if (answerError) {
            return;
          }

          let eReg = api.MyRegex.BRICK_DAY_OF_WEEK_INDEX_EQUAL_TO();
          let eR = eReg.exec(equal);

          if (eR) {
            num = eR[1];
          }

          if (not && num) {
            item.NOTIN.push(num);
            dayOfWeekIndexValues.push(num);
          } else if (num) {
            item.IN.push(num);
            dayOfWeekIndexValues.push(num);
          } else if (not) {
            item.NOTs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          } else {
            item.ORs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          }
        });

        let dayOfWeekIndexValuesString = dayOfWeekIndexValues.join(', ');

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.DayOfWeekIndexIsNotEqualTo,
            dayOfWeekIndexValues: dayOfWeekIndexValuesString
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.DayOfWeekIndexIsEqualTo,
            dayOfWeekIndexValues: dayOfWeekIndexValuesString
          });
        }
      } else {
        // IS NULL
        // IS NOT NULL
        if ((r = api.MyRegex.BRICK_IS_NULL().exec(brick))) {
          not = r[1];
          nullValue = r[2];

          condition = `(${item.proc} IS NULL)`;

          if (not) {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.And,
              type: api.FractionTypeEnum.DayOfWeekIndexIsNotNull
            });
          } else {
            item.fractions.push({
              brick: brick,
              operator: api.FractionOperatorEnum.Or,
              type: api.FractionTypeEnum.DayOfWeekIndexIsNull
            });
          }

          // IS ANY VALUE
        } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
          condition = "'any' = 'any'";

          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.DayOfWeekIndexIsAnyValue
          });
        }

        // common for DayOfWeekIndex
        if (not && condition) {
          item.NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          item.ORs.push(condition);
        } else if (not) {
          item.NOTs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        } else {
          item.ORs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        }
      }
    } else if (item.result === enums.FieldAnyResultEnum.MonthName) {
      // IS
      // IS NOT
      if ((r = api.MyRegex.BRICK_MONTH_NAME_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${item.proc}) = UPPER('${value}')`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.MonthNameIsNot,
            monthNameValue: <any>value.toLowerCase()
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.MonthNameIs,
            monthNameValue: <any>value.toLowerCase()
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = api.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${item.proc} IS NULL)`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.MonthNameIsNotNull
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.MonthNameIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = "'any' = 'any'";

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.MonthNameIsAnyValue
        });
      }

      // common for MonthName
      if (not && condition) {
        item.NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        item.ORs.push(condition);
      } else if (not) {
        item.NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        item.ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (item.result === enums.FieldAnyResultEnum.QuarterOfYear) {
      // IS
      // IS NOT
      if ((r = api.MyRegex.BRICK_QUARTER_OF_YEAR_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${item.proc}) = UPPER('${value}')`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.QuarterOfYearIsNot,
            quarterOfYearValue: <any>value
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.QuarterOfYearIs,
            quarterOfYearValue: <any>value
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = api.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${item.proc} IS NULL)`;

        if (not) {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.And,
            type: api.FractionTypeEnum.QuarterOfYearIsNotNull
          });
        } else {
          item.fractions.push({
            brick: brick,
            operator: api.FractionOperatorEnum.Or,
            type: api.FractionTypeEnum.QuarterOfYearIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = api.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = "'any' = 'any'";

        item.fractions.push({
          brick: brick,
          operator: api.FractionOperatorEnum.Or,
          type: api.FractionTypeEnum.QuarterOfYearIsAnyValue
        });
      }

      // common for QuarterOfYear
      if (not && condition) {
        item.NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        item.ORs.push(condition);
      } else if (not) {
        item.NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        item.ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    }
  });

  if (answerError) {
    return answerError;
  }

  return { valid: 1 };
}
