import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barTimestamp } from '~blockml/barrels/bar-timestamp';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';

export function processFilter(item: {
  filterBricks: string[];
  result: apiToBlockml.FieldResultEnum;
  // parameters below do not affect validation
  weekStart?: common.ProjectWeekStartEnum;
  connection?: common.ProjectConnection;
  timezone?: string;
  proc?: string;
  sqlTsSelect?: string;
  ORs?: string[];
  NOTs?: string[];
  INs?: string[];
  NOTINs?: string[];
  fractions?: apiToBlockml.Fraction[];
}): { valid: number; brick?: string } {
  let {
    filterBricks,
    result,
    weekStart,
    connection,
    timezone,
    proc,
    sqlTsSelect,
    ORs,
    NOTs,
    INs,
    NOTINs,
    fractions
  } = item;

  weekStart = helper.isDefined(weekStart)
    ? weekStart
    : common.ProjectWeekStartEnum.Monday;

  let cn = {
    name: 'cn',
    type: common.ConnectionTypeEnum.PostgreSQL
  };
  connection = helper.isDefined(connection) ? connection : cn;

  timezone = helper.isDefined(timezone) ? timezone : constants.UTC;
  proc = helper.isDefined(proc) ? proc : 'proc';
  sqlTsSelect = helper.isDefined(sqlTsSelect) ? sqlTsSelect : 'sqlTsSelect';
  ORs = helper.isDefined(ORs) ? ORs : [];
  NOTs = helper.isDefined(NOTs) ? NOTs : [];
  INs = helper.isDefined(INs) ? INs : [];
  NOTINs = helper.isDefined(NOTINs) ? NOTINs : [];
  fractions = helper.isDefined(fractions) ? fractions : [];

  let answerError: { valid: number; brick?: string };

  let bricks = [...new Set(filterBricks)];

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

    if (result === apiToBlockml.FieldResultEnum.Number) {
      // IS EQUAL TO
      // IS NOT EQUAL TO
      if ((r = common.MyRegex.BRICK_NUMBER_NOT_AND_DIGITS().exec(brick))) {
        not = r[1];

        let equals = brick.split(',');

        let nums: string[] = [];

        equals.forEach(equal => {
          if (answerError) {
            return;
          }

          let eReg = common.MyRegex.BRICK_NUMBER_EQUAL_TO();
          let eR = eReg.exec(equal);

          if (eR) {
            num = eR[1];
          }

          if (not && num) {
            NOTINs.push(num);
            nums.push(num);
          } else if (num) {
            INs.push(num);
            nums.push(num);
          } else if (not) {
            NOTs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          } else {
            ORs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          }
        });

        let numValues = nums.join(', ');

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.NumberIsNotEqualTo,
            numberValues: numValues
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.NumberIsEqualTo,
            numberValues: numValues
          });
        }

        // IS GREATER THAN OR EQUAL TO
      } else if (
        (r = common.MyRegex.BRICK_NUMBER_IS_GREATER_THAN_OR_EQUAL_TO().exec(
          brick
        ))
      ) {
        value = r[1];

        ORs.push(`${proc} >= ${value}`);

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.NumberIsGreaterThanOrEqualTo,
          numberValue1: Number(value)
        });

        // IS GREATER THAN
      } else if (
        (r = common.MyRegex.BRICK_NUMBER_IS_GREATER_THAN().exec(brick))
      ) {
        value = r[1];

        ORs.push(`${proc} > ${value}`);

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.NumberIsGreaterThan,
          numberValue1: Number(value)
        });

        // IS LESS THAN OR EQUAL TO
      } else if (
        (r = common.MyRegex.BRICK_NUMBER_IS_LESS_THAN_OR_EQUAL_TO().exec(brick))
      ) {
        value = r[1];

        ORs.push(`${proc} <= ${value}`);

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.NumberIsLessThanOrEqualTo,
          numberValue1: Number(value)
        });

        // IS LESS THAN
      } else if ((r = common.MyRegex.BRICK_NUMBER_IS_LESS_THAN().exec(brick))) {
        value = r[1];

        ORs.push(`${proc} < ${value}`);

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.NumberIsLessThan,
          numberValue1: Number(value)
        });

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        ORs.push(constants.SQL_TRUE_CONDITION);

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.NumberIsAnyValue
        });
      } else {
        // [,]
        // not [,]
        if (
          (r = common.MyRegex.BRICK_NUMBER_IS_BETWEEN_INCLUSIVE().exec(brick))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${proc} >= ${value1}) AND (${proc} <= ${value2}))`;

          if (not) {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.And,
              type: apiToBlockml.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.Inclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.Or,
              type: apiToBlockml.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.Inclusive
            });
          }

          // [,)
          // not [,)
        } else if (
          (r = common.MyRegex.BRICK_NUMBER_IS_BETWEEN_LEFT_INCLUSIVE().exec(
            brick
          ))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${proc} >= ${value1}) AND (${proc} < ${value2}))`;

          if (not) {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.And,
              type: apiToBlockml.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.LeftInclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.Or,
              type: apiToBlockml.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.LeftInclusive
            });
          }

          // (,]
          // not (,]
        } else if (
          (r = common.MyRegex.BRICK_NUMBER_IS_BETWEEN_RIGHT_INCLUSIVE().exec(
            brick
          ))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${proc} > ${value1}) AND (${proc} <= ${value2}))`;

          if (not) {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.And,
              type: apiToBlockml.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.RightInclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.Or,
              type: apiToBlockml.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.RightInclusive
            });
          }

          // (,)
          // not (,)
        } else if (
          (r = common.MyRegex.BRICK_NUMBER_IS_BETWEEN_EXCLUSIVE().exec(brick))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${proc} > ${value1}) AND (${proc} < ${value2}))`;

          if (not) {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.And,
              type: apiToBlockml.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.Exclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.Or,
              type: apiToBlockml.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                apiToBlockml.FractionNumberBetweenOptionEnum.Exclusive
            });
          }

          // IS NULL
          // IS NOT NULL
        } else if ((r = common.MyRegex.BRICK_IS_NULL().exec(brick))) {
          not = r[1];
          nullValue = r[2];

          condition = `(${proc} IS NULL)`;

          if (not) {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.And,
              type: apiToBlockml.FractionTypeEnum.NumberIsNotNull
            });
          } else {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.Or,
              type: apiToBlockml.FractionTypeEnum.NumberIsNull
            });
          }
        }

        // common for else of number
        if (not && condition) {
          NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          ORs.push(condition);
        } else if (not) {
          NOTs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        } else {
          ORs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        }
      }
    } else if (result === apiToBlockml.FieldResultEnum.String) {
      // IS EQUAL TO
      // IS NOT EQUAL TO
      if ((r = common.MyRegex.BRICK_STRING_IS_EQUAL_TO().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `${proc} = '${value}'`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.StringIsNotEqualTo,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.StringIsEqualTo,
            stringValue: value
          });
        }

        // CONTAINS
        // DOES NOT CONTAIN
      } else if ((r = common.MyRegex.BRICK_STRING_CONTAINS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `${proc} LIKE '%${value}%'`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.StringDoesNotContain,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.StringContains,
            stringValue: value
          });
        }

        // STARTS WITH
        // DOES NOT START WITH
      } else if ((r = common.MyRegex.BRICK_STRING_STARTS_WITH().exec(brick))) {
        value = r[1];
        not = r[2];

        condition = `${proc} LIKE '${value}%'`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.StringDoesNotStartWith,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.StringStartsWith,
            stringValue: value
          });
        }

        // ENDS WITH
        // DOES NOT END WITH
      } else if ((r = common.MyRegex.BRICK_STRING_ENDS_WITH().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `${proc} LIKE '%${value}'`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.StringDoesNotEndWith,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.StringEndsWith,
            stringValue: value
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = common.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${proc} IS NULL)`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.StringIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.StringIsNull
          });
        }

        // IS BLANK
        // IS NOT BLANK
      } else if ((r = common.MyRegex.BRICK_STRING_IS_BLANK().exec(brick))) {
        not = r[1];
        blank = r[2];

        if (connection.type === common.ConnectionTypeEnum.BigQuery) {
          condition = `(${proc} IS NULL OR LENGTH(CAST(${proc} AS STRING)) = 0)`;
        } else if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
          condition = `(${proc} IS NULL OR LENGTH(CAST(${proc} AS TEXT)) = 0)`;
        }

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.StringIsNotBlank
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.StringIsBlank
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.StringIsAnyValue
        });
      }

      // common for string
      if (not && condition) {
        NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        ORs.push(condition);
      } else if (not) {
        NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === apiToBlockml.FieldResultEnum.Yesno) {
      // YESNO YES
      if ((r = common.MyRegex.BRICK_YESNO_IS_YES().exec(brick))) {
        condition = `${proc} = 'Yes'`;

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.YesnoIs,
          yesnoValue: apiToBlockml.FractionYesnoValueEnum.Yes
        });

        // YESNO NO
      } else if ((r = common.MyRegex.BRICK_YESNO_IS_NO().exec(brick))) {
        condition = `${proc} = 'No'`;

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.YesnoIs,
          yesnoValue: apiToBlockml.FractionYesnoValueEnum.No
        });

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.YesnoIsAnyValue
        });
      }

      // common for yesno
      if (condition) {
        ORs.push(condition);
      } else {
        ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === apiToBlockml.FieldResultEnum.Ts) {
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
        timezone: timezone,
        weekStart: weekStart,
        connection: connection
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

      if ((r = common.MyRegex.BRICK_TS_INTERVALS().exec(brick))) {
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
            connection: connection
          });

          switch (true) {
            case way === 'after': {
              one = `${sqlTsSelect} >= ${open}`;
              two = '';
              break;
            }
            case way === 'before': {
              one = `${sqlTsSelect} < ${open}`;
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
              connection: connection
            });
          } else if (
            way.match(/^last$/) ||
            (way.match(/^before|after$/) && when.match(/^ago$/))
          ) {
            open = barTimestamp.makeTimestampOpenLastBeforeAfter({
              unit: unit,
              integer: Number(integerStr),
              currentTs: currentTs,
              connection: connection
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
              connection: connection
            });
          } else if (
            way.match(/^before|after$/) &&
            when.match(/^in\s+future$/)
          ) {
            open = barTimestamp.makeTimestampOpenBeforeAfterInFuture({
              unit: unit,
              integer: Number(integerStr),
              currentTs: currentTs,
              connection: connection
            });
          }

          // CLOSE INTERVAL
          if (way.match(/^last$/) && complete && plusCurrent) {
            close = barTimestamp.makeTimestampCloseLastCompletePlusCurrent({
              unit: unit,
              currentYearTs: currentYearTs,
              currentQuarterTs: currentQuarterTs,
              currentMonthTs: currentMonthTs,
              currentWeekStartTs: currentWeekStartTs,
              currentDateTs: currentDateTs,
              currentHourTs: currentHourTs,
              currentMinuteTs: currentMinuteTs,
              connection: connection
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
            connection: connection
          });
        }

        if (way.match(/^last|after$/)) {
          one = `${sqlTsSelect} >= ${open}`;
        } else if (way.match(/^before$/)) {
          one = `${sqlTsSelect} < ${open}`;
        }

        if (way.match(/^last$/)) {
          two = ` AND ${sqlTsSelect} < ${close}`;
        } else if (way.match(/^after$/) && forUnit) {
          two = ` AND ${sqlTsSelect} < ${close}`;
        } else if (way.match(/^before$/) && forUnit) {
          two = ` AND ${sqlTsSelect} >= ${close}`;
        } else if (way.match(/^before|after$/)) {
          two = '';
        }

        ORs.push(`(${one}` + `${two})`);

        if (way.match(/^last$/)) {
          let tsLastCompleteOption =
            complete && plusCurrent
              ? apiToBlockml.FractionTsLastCompleteOptionEnum
                  .CompletePlusCurrent
              : complete
              ? apiToBlockml.FractionTsLastCompleteOptionEnum.Complete
              : apiToBlockml.FractionTsLastCompleteOptionEnum.Incomplete;

          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsInLast,
            tsLastValue: Number(integerStr),
            tsLastUnit: <any>unit,
            tsLastCompleteOption: tsLastCompleteOption
          });
        } else if (way.match(/^before$/) && year) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsBeforeDate,
            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute),
            tsForOption: forUnit
              ? apiToBlockml.FractionTsForOptionEnum.For
              : apiToBlockml.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^before$/)) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsBeforeRelative,
            tsRelativeValue: Number(integerStr),
            tsRelativeUnit: <any>unit,
            tsRelativeCompleteOption: complete
              ? apiToBlockml.FractionTsRelativeCompleteOptionEnum.Complete
              : apiToBlockml.FractionTsRelativeCompleteOptionEnum.Incomplete,
            tsRelativeWhenOption: when.match(/^ago$/)
              ? apiToBlockml.FractionTsRelativeWhenOptionEnum.Ago
              : when.match(/^in\s+future$/)
              ? apiToBlockml.FractionTsRelativeWhenOptionEnum.InFuture
              : undefined,
            tsForOption: forUnit
              ? apiToBlockml.FractionTsForOptionEnum.For
              : apiToBlockml.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^after$/) && year) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsAfterDate,
            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute),
            tsForOption: forUnit
              ? apiToBlockml.FractionTsForOptionEnum.For
              : apiToBlockml.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^after$/)) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsAfterRelative,
            tsRelativeValue: Number(integerStr),
            tsRelativeUnit: <any>unit,
            tsRelativeCompleteOption: complete
              ? apiToBlockml.FractionTsRelativeCompleteOptionEnum.Complete
              : apiToBlockml.FractionTsRelativeCompleteOptionEnum.Incomplete,
            tsRelativeWhenOption: when.match(/^ago$/)
              ? apiToBlockml.FractionTsRelativeWhenOptionEnum.Ago
              : when.match(/^in\s+future$/)
              ? apiToBlockml.FractionTsRelativeWhenOptionEnum.InFuture
              : undefined,
            tsForOption: forUnit
              ? apiToBlockml.FractionTsForOptionEnum.For
              : apiToBlockml.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        }

        // IS
        // BETWEEN
        // on (year)/(month)/(day) (hour):(minute) [to (year)/(month)/(day) (hour):(minute)]
      } else if ((r = common.MyRegex.BRICK_TS_IS_BETWEEN_ON().exec(brick))) {
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
          connection: connection
        });

        if (helper.isUndefined(toYear)) {
          close = barTimestamp.makeTimestampCloseBetween({
            open: open,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            connection: connection
          });
        } else {
          // to
          close = barTimestamp.makeTimestampCloseBetweenTo({
            toYear: toYear,
            toMonth: toMonth,
            toDay: toDay,
            toHour: toHour,
            toMinute: toMinute,
            connection: connection
          });
        }

        ORs.push(`(${sqlTsSelect} >= ${open} AND ${sqlTsSelect} < ${close})`);

        if (toYear) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsInRange,

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
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsOnMinute,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute)
          });
        } else if (hour) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsOnHour,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour)
          });
        } else if (day) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsOnDay,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day)
          });
        } else if (month) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsOnMonth,

            tsDateYear: Number(year),
            tsDateMonth: Number(month)
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsOnYear,

            tsDateYear: Number(year)
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = common.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${sqlTsSelect} IS NULL)`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.TsIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.TsIsNull
          });
        }

        if (not && condition) {
          NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          ORs.push(condition);
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        ORs.push(constants.SQL_TRUE_CONDITION);

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.TsIsAnyValue
        });

        if (not && condition) {
          NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          ORs.push(condition);
        }
      } else {
        ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === apiToBlockml.FieldResultEnum.DayOfWeek) {
      // IS
      // IS NOT
      if ((r = common.MyRegex.BRICK_DAY_OF_WEEK_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${proc}) = UPPER('${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.DayOfWeekIsNot,
            dayOfWeekValue: <any>value.toLowerCase()
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.DayOfWeekIs,
            dayOfWeekValue: <any>value.toLowerCase()
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = common.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${proc} IS NULL)`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.DayOfWeekIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.DayOfWeekIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.DayOfWeekIsAnyValue
        });
      }

      // common for DayOfWeek
      if (not && condition) {
        NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        ORs.push(condition);
      } else if (not) {
        NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === apiToBlockml.FieldResultEnum.DayOfWeekIndex) {
      if ((r = common.MyRegex.BRICK_DAY_OF_WEEK_INDEX_IS_EQUAL().exec(brick))) {
        not = r[1];

        let equals = brick.split(',');

        let dayOfWeekIndexValues: string[] = [];

        equals.forEach(equal => {
          if (answerError) {
            return;
          }

          let eReg = common.MyRegex.BRICK_DAY_OF_WEEK_INDEX_EQUAL_TO();
          let eR = eReg.exec(equal);

          if (eR) {
            num = eR[1];
          }

          if (not && num) {
            NOTINs.push(num);
            dayOfWeekIndexValues.push(num);
          } else if (num) {
            INs.push(num);
            dayOfWeekIndexValues.push(num);
          } else if (not) {
            NOTs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          } else {
            ORs.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          }
        });

        let dayOfWeekIndexValuesString = dayOfWeekIndexValues.join(', ');

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.DayOfWeekIndexIsNotEqualTo,
            dayOfWeekIndexValues: dayOfWeekIndexValuesString
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.DayOfWeekIndexIsEqualTo,
            dayOfWeekIndexValues: dayOfWeekIndexValuesString
          });
        }
      } else {
        // IS NULL
        // IS NOT NULL
        if ((r = common.MyRegex.BRICK_IS_NULL().exec(brick))) {
          not = r[1];
          nullValue = r[2];

          condition = `(${proc} IS NULL)`;

          if (not) {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.And,
              type: apiToBlockml.FractionTypeEnum.DayOfWeekIndexIsNotNull
            });
          } else {
            fractions.push({
              brick: brick,
              operator: apiToBlockml.FractionOperatorEnum.Or,
              type: apiToBlockml.FractionTypeEnum.DayOfWeekIndexIsNull
            });
          }

          // IS ANY VALUE
        } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
          condition = constants.SQL_TRUE_CONDITION;

          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.DayOfWeekIndexIsAnyValue
          });
        }

        // common for DayOfWeekIndex
        if (not && condition) {
          NOTs.push(`NOT ${condition}`);
        } else if (condition) {
          ORs.push(condition);
        } else if (not) {
          NOTs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        } else {
          ORs.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        }
      }
    } else if (result === apiToBlockml.FieldResultEnum.MonthName) {
      // IS
      // IS NOT
      if ((r = common.MyRegex.BRICK_MONTH_NAME_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${proc}) = UPPER('${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.MonthNameIsNot,
            monthNameValue: <any>value.toLowerCase()
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.MonthNameIs,
            monthNameValue: <any>value.toLowerCase()
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = common.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${proc} IS NULL)`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.MonthNameIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.MonthNameIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.MonthNameIsAnyValue
        });
      }

      // common for MonthName
      if (not && condition) {
        NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        ORs.push(condition);
      } else if (not) {
        NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ORs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === apiToBlockml.FieldResultEnum.QuarterOfYear) {
      // IS
      // IS NOT
      if ((r = common.MyRegex.BRICK_QUARTER_OF_YEAR_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${proc}) = UPPER('${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.QuarterOfYearIsNot,
            quarterOfYearValue: <any>value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.QuarterOfYearIs,
            quarterOfYearValue: <any>value
          });
        }

        // IS NULL
        // IS NOT NULL
      } else if ((r = common.MyRegex.BRICK_IS_NULL().exec(brick))) {
        not = r[1];
        nullValue = r[2];

        condition = `(${proc} IS NULL)`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.And,
            type: apiToBlockml.FractionTypeEnum.QuarterOfYearIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: apiToBlockml.FractionOperatorEnum.Or,
            type: apiToBlockml.FractionTypeEnum.QuarterOfYearIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: apiToBlockml.FractionOperatorEnum.Or,
          type: apiToBlockml.FractionTypeEnum.QuarterOfYearIsAnyValue
        });
      }

      // common for QuarterOfYear
      if (not && condition) {
        NOTs.push(`NOT ${condition}`);
      } else if (condition) {
        ORs.push(condition);
      } else if (not) {
        NOTs.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ORs.push(constants.FAIL);
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
