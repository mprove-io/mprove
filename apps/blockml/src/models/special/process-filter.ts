import { fromUnixTime, getUnixTime } from 'date-fns';
import { barTimestamp } from '~blockml/barrels/bar-timestamp';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

export function processFilter(item: {
  filterBricks: string[];
  result: common.FieldResultEnum;
  // parameters below do not affect validation
  weekStart?: common.ProjectWeekStartEnum;
  connection?: common.ProjectConnection;
  timezone?: string;
  proc?: string;
  sqlTsSelect?: string;
  ors?: string[];
  nots?: string[];
  ins?: string[];
  notIns?: string[];
  fractions?: common.Fraction[];
  getTimeRange?: boolean;
  caseSensitiveStringFilters: boolean;
}): {
  valid: number;
  brick?: string;
  rangeOpen?: number;
  rangeClose?: number;
} {
  let {
    filterBricks,
    result,
    weekStart,
    connection,
    timezone,
    proc,
    sqlTsSelect,
    ors,
    nots,
    ins,
    notIns,
    fractions,
    getTimeRange,
    caseSensitiveStringFilters
  } = item;

  if (getTimeRange === true) {
    if (filterBricks.length !== 1) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_TIME_RANGE_BRICKS_LENGTH
      });
    }

    if (result !== common.FieldResultEnum.Ts) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_TIME_RANGE_FIELD_RESULT
      });
    }
  }

  let rangeOpen: Date;
  let rangeClose: Date;

  weekStart = common.isDefined(weekStart)
    ? weekStart
    : common.ProjectWeekStartEnum.Monday;

  let cn = {
    connectionId: 'cn',
    type: common.ConnectionTypeEnum.PostgreSQL
  };
  connection = common.isDefined(connection) ? connection : cn;

  timezone = common.isDefined(timezone) ? timezone : common.UTC;
  proc = common.isDefined(proc) ? proc : 'proc';
  sqlTsSelect = common.isDefined(sqlTsSelect) ? sqlTsSelect : 'sqlTsSelect';
  ors = common.isDefined(ors) ? ors : [];
  nots = common.isDefined(nots) ? nots : [];
  ins = common.isDefined(ins) ? ins : [];
  notIns = common.isDefined(notIns) ? notIns : [];
  fractions = common.isDefined(fractions) ? fractions : [];

  let answerError: { valid: number; brick?: string };

  filterBricks.forEach(brick => {
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

    if (result === common.FieldResultEnum.Number) {
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
            notIns.push(num);
            nums.push(num);
          } else if (num) {
            ins.push(num);
            nums.push(num);
          } else if (not) {
            nots.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          } else {
            ors.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          }
        });

        let numValues = nums.join(', ');

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.NumberIsNotEqualTo,
            numberValues: numValues
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.NumberIsEqualTo,
            numberValues: numValues
          });
        }

        // IS GREATER THAN OR EQUAL TO
      } else if (
        (r =
          common.MyRegex.BRICK_NUMBER_IS_GREATER_THAN_OR_EQUAL_TO().exec(brick))
      ) {
        value = r[1];

        ors.push(`${proc} >= ${value}`);

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo,
          numberValue1: Number(value)
        });

        // IS GREATER THAN
      } else if (
        (r = common.MyRegex.BRICK_NUMBER_IS_GREATER_THAN().exec(brick))
      ) {
        value = r[1];

        ors.push(`${proc} > ${value}`);

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.NumberIsGreaterThan,
          numberValue1: Number(value)
        });

        // IS LESS THAN OR EQUAL TO
      } else if (
        (r = common.MyRegex.BRICK_NUMBER_IS_LESS_THAN_OR_EQUAL_TO().exec(brick))
      ) {
        value = r[1];

        ors.push(`${proc} <= ${value}`);

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.NumberIsLessThanOrEqualTo,
          numberValue1: Number(value)
        });

        // IS LESS THAN
      } else if ((r = common.MyRegex.BRICK_NUMBER_IS_LESS_THAN().exec(brick))) {
        value = r[1];

        ors.push(`${proc} < ${value}`);

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.NumberIsLessThan,
          numberValue1: Number(value)
        });

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        ors.push(constants.SQL_TRUE_CONDITION);

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.NumberIsAnyValue
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
              operator: common.FractionOperatorEnum.And,
              type: common.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.Inclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.Inclusive
            });
          }

          // [,)
          // not [,)
        } else if (
          (r =
            common.MyRegex.BRICK_NUMBER_IS_BETWEEN_LEFT_INCLUSIVE().exec(brick))
        ) {
          not = r[1];
          value1 = r[2];
          value2 = r[3];

          condition = `((${proc} >= ${value1}) AND (${proc} < ${value2}))`;

          if (not) {
            fractions.push({
              brick: brick,
              operator: common.FractionOperatorEnum.And,
              type: common.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.LeftInclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.LeftInclusive
            });
          }

          // (,]
          // not (,]
        } else if (
          (r =
            common.MyRegex.BRICK_NUMBER_IS_BETWEEN_RIGHT_INCLUSIVE().exec(
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
              operator: common.FractionOperatorEnum.And,
              type: common.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.RightInclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.RightInclusive
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
              operator: common.FractionOperatorEnum.And,
              type: common.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.Exclusive
            });
          } else {
            fractions.push({
              brick: brick,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.NumberIsBetween,
              numberValue1: Number(value1),
              numberValue2: Number(value2),
              numberBetweenOption:
                common.FractionNumberBetweenOptionEnum.Exclusive
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
              operator: common.FractionOperatorEnum.And,
              type: common.FractionTypeEnum.NumberIsNotNull
            });
          } else {
            fractions.push({
              brick: brick,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.NumberIsNull
            });
          }
        }

        // common for else of number
        if (not && condition) {
          nots.push(`NOT ${condition}`);
        } else if (condition) {
          ors.push(condition);
        } else if (not) {
          nots.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        } else {
          ors.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        }
      }
    } else if (result === common.FieldResultEnum.String) {
      // IS EQUAL TO
      // IS NOT EQUAL TO
      if ((r = common.MyRegex.BRICK_STRING_IS_EQUAL_TO().exec(brick))) {
        not = r[1];
        value = r[2];

        condition =
          caseSensitiveStringFilters === true
            ? `${proc} = '${value}'`
            : `LOWER(${proc}) = LOWER('${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.StringIsNotEqualTo,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.StringIsEqualTo,
            stringValue: value
          });
        }

        // CONTAINS
        // DOES NOT CONTAIN
      } else if ((r = common.MyRegex.BRICK_STRING_CONTAINS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition =
          caseSensitiveStringFilters === true
            ? `${proc} LIKE '%${value}%'`
            : `LOWER(${proc}) LIKE LOWER('%${value}%')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.StringDoesNotContain,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.StringContains,
            stringValue: value
          });
        }

        // STARTS WITH
        // DOES NOT START WITH
      } else if ((r = common.MyRegex.BRICK_STRING_STARTS_WITH().exec(brick))) {
        value = r[1];
        not = r[2];

        condition =
          caseSensitiveStringFilters === true
            ? `${proc} LIKE '${value}%'`
            : `LOWER(${proc}) LIKE LOWER('${value}%')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.StringDoesNotStartWith,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.StringStartsWith,
            stringValue: value
          });
        }

        // ENDS WITH
        // DOES NOT END WITH
      } else if ((r = common.MyRegex.BRICK_STRING_ENDS_WITH().exec(brick))) {
        not = r[1];
        value = r[2];

        condition =
          caseSensitiveStringFilters === true
            ? `${proc} LIKE '%${value}'`
            : `LOWER(${proc}) LIKE LOWER('%${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.StringDoesNotEndWith,
            stringValue: value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.StringEndsWith,
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
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.StringIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.StringIsNull
          });
        }

        // IS BLANK
        // IS NOT BLANK
      } else if ((r = common.MyRegex.BRICK_STRING_IS_BLANK().exec(brick))) {
        not = r[1];
        blank = r[2];

        if (connection.type === common.ConnectionTypeEnum.SnowFlake) {
          condition = `(${proc} IS NULL OR LENGTH(CAST(${proc} AS STRING)) = 0)`;
        } else if (connection.type === common.ConnectionTypeEnum.BigQuery) {
          condition = `(${proc} IS NULL OR LENGTH(CAST(${proc} AS STRING)) = 0)`;
        } else if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
          condition = `(${proc} IS NULL OR LENGTH(CAST(${proc} AS TEXT)) = 0)`;
        } else if (connection.type === common.ConnectionTypeEnum.ClickHouse) {
          condition = `(${proc} IS NULL OR LENGTH(CAST(${proc} AS String)) = 0)`;
        }

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.StringIsNotEmpty
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.StringIsEmpty
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.StringIsAnyValue
        });
      }

      // common for string
      if (not && condition) {
        nots.push(`NOT ${condition}`);
      } else if (condition) {
        ors.push(condition);
      } else if (not) {
        nots.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ors.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === common.FieldResultEnum.Yesno) {
      // YESNO YES
      if ((r = common.MyRegex.BRICK_YESNO_IS_YES().exec(brick))) {
        condition = `${proc} = 'Yes'`;

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.YesnoIs,
          yesnoValue: common.FractionYesnoValueEnum.Yes
        });

        // YESNO NO
      } else if ((r = common.MyRegex.BRICK_YESNO_IS_NO().exec(brick))) {
        condition = `${proc} = 'No'`;

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.YesnoIs,
          yesnoValue: common.FractionYesnoValueEnum.No
        });

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.YesnoIsAnyValue
        });
      }

      // common for yesno
      if (condition) {
        ors.push(condition);
      } else {
        ors.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === common.FieldResultEnum.Ts) {
      let {
        currentTs,
        currentMinuteTs,
        currentHourTs,
        currentDateTs,
        currentWeekStartTs,
        currentMonthTs,
        currentQuarterTs,
        currentYearTs
      } = barTimestamp.makeCurrentTimestamps({
        timezone: timezone,
        weekStart: weekStart,
        connection: connection,
        getTimeRange: getTimeRange
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
          let { sqlOpen, rgOpen } = barTimestamp.makeTimestampOpenFromDateParts(
            {
              year: year,
              month: month,
              day: day,
              hour: hour,
              minute: minute,
              connection: connection,
              timezone: timezone,
              getTimeRange: getTimeRange
            }
          );
          open = sqlOpen;
          rangeOpen = rgOpen;

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
            let { sqlOpen, rgOpen } =
              barTimestamp.makeTimestampOpenLastBeforeAfterComplete({
                unit: unit,
                integer: Number(integerStr),
                currentYearTs: currentYearTs,
                currentQuarterTs: currentQuarterTs,
                currentMonthTs: currentMonthTs,
                currentWeekStartTs: currentWeekStartTs,
                currentDateTs: currentDateTs,
                currentHourTs: currentHourTs,
                currentMinuteTs: currentMinuteTs,
                connection: connection,
                getTimeRange: getTimeRange
              });
            open = sqlOpen;
            rangeOpen = rgOpen;
          } else if (
            way.match(/^last$/) ||
            (way.match(/^before|after$/) && when.match(/^ago$/))
          ) {
            let { sqlOpen, rgOpen } =
              barTimestamp.makeTimestampOpenLastBeforeAfter({
                unit: unit,
                integer: Number(integerStr),
                currentTs: currentTs,
                connection: connection,
                getTimeRange: getTimeRange
              });
            open = sqlOpen;
            rangeOpen = rgOpen;
          } else if (
            way.match(/^before|after$/) &&
            when.match(/^in\s+future$/) &&
            complete
          ) {
            let { sqlOpen, rgOpen } =
              barTimestamp.makeTimestampOpenBeforeAfterInFutureComplete({
                unit: unit,
                integer: Number(integerStr),
                currentYearTs: currentYearTs,
                currentQuarterTs: currentQuarterTs,
                currentMonthTs: currentMonthTs,
                currentWeekStartTs: currentWeekStartTs,
                currentDateTs: currentDateTs,
                currentHourTs: currentHourTs,
                currentMinuteTs: currentMinuteTs,
                connection: connection,
                getTimeRange: getTimeRange
              });
            open = sqlOpen;
            rangeOpen = rgOpen;
          } else if (
            way.match(/^before|after$/) &&
            when.match(/^in\s+future$/)
          ) {
            let { sqlOpen, rgOpen } =
              barTimestamp.makeTimestampOpenBeforeAfterInFuture({
                unit: unit,
                integer: Number(integerStr),
                currentTs: currentTs,
                connection: connection,
                getTimeRange: getTimeRange
              });
            open = sqlOpen;
            rangeOpen = rgOpen;
          }

          // CLOSE INTERVAL
          if (way.match(/^last$/) && complete && plusCurrent) {
            let { sqlClose, rgClose } =
              barTimestamp.makeTimestampCloseLastCompletePlusCurrent({
                unit: unit,
                currentYearTs: currentYearTs,
                currentQuarterTs: currentQuarterTs,
                currentMonthTs: currentMonthTs,
                currentWeekStartTs: currentWeekStartTs,
                currentDateTs: currentDateTs,
                currentHourTs: currentHourTs,
                currentMinuteTs: currentMinuteTs,
                connection: connection,
                getTimeRange: getTimeRange
              });
            close = sqlClose;
            rangeClose = rgClose;
          } else if (way.match(/^last$/) && complete) {
            close =
              unit === common.FractionUnitEnum.Minutes
                ? currentMinuteTs
                : unit === common.FractionUnitEnum.Hours
                  ? currentHourTs
                  : unit === common.FractionUnitEnum.Days
                    ? currentDateTs
                    : unit === common.FractionUnitEnum.Weeks
                      ? currentWeekStartTs
                      : unit === common.FractionUnitEnum.Months
                        ? currentMonthTs
                        : unit === common.FractionUnitEnum.Quarters
                          ? currentQuarterTs
                          : unit === common.FractionUnitEnum.Years
                            ? currentYearTs
                            : undefined;

            rangeClose =
              unit === common.FractionUnitEnum.Minutes
                ? fromUnixTime(Number(currentMinuteTs))
                : unit === common.FractionUnitEnum.Hours
                  ? fromUnixTime(Number(currentHourTs))
                  : unit === common.FractionUnitEnum.Days
                    ? fromUnixTime(Number(currentDateTs))
                    : unit === common.FractionUnitEnum.Weeks
                      ? fromUnixTime(Number(currentWeekStartTs))
                      : unit === common.FractionUnitEnum.Months
                        ? fromUnixTime(Number(currentMonthTs))
                        : unit === common.FractionUnitEnum.Quarters
                          ? fromUnixTime(Number(currentQuarterTs))
                          : unit === common.FractionUnitEnum.Years
                            ? fromUnixTime(Number(currentYearTs))
                            : undefined;
          } else if (way.match(/^last$/)) {
            close = currentTs;
            rangeClose = fromUnixTime(Number(currentTs));
          }
        }

        if (way.match(/^before|after$/) && forUnit) {
          let sIntegerStr = way.match(/^after$/)
            ? `${forIntegerStr}`
            : `-${forIntegerStr}`;

          let { sqlClose, rgClose } =
            barTimestamp.makeTimestampCloseBeforeAfterForUnit({
              open: open,
              forUnit: forUnit,
              sInteger: Number(sIntegerStr),
              connection: connection,
              getTimeRange: getTimeRange,
              rangeOpen: rangeOpen
            });
          close = sqlClose;
          rangeClose = rgClose;
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

        ors.push(`(${one}` + `${two})`);

        if (way.match(/^last$/)) {
          let tsLastCompleteOption =
            complete && plusCurrent
              ? common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent
              : complete
                ? common.FractionTsLastCompleteOptionEnum.Complete
                : common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent;

          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsInLast,
            tsLastValue: Number(integerStr),
            tsLastUnit: <any>unit,
            tsLastCompleteOption: tsLastCompleteOption
          });
        } else if (way.match(/^before$/) && year) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsBeforeDate,
            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute),
            tsForOption: forUnit
              ? common.FractionTsForOptionEnum.For
              : common.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^before$/)) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsBeforeRelative,
            tsRelativeValue: Number(integerStr),
            tsRelativeUnit: <any>unit,
            tsRelativeCompleteOption: complete
              ? common.FractionTsRelativeCompleteOptionEnum.Complete
              : common.FractionTsRelativeCompleteOptionEnum.Incomplete,
            tsRelativeWhenOption: when.match(/^ago$/)
              ? common.FractionTsRelativeWhenOptionEnum.Ago
              : when.match(/^in\s+future$/)
                ? common.FractionTsRelativeWhenOptionEnum.InFuture
                : undefined,
            tsForOption: forUnit
              ? common.FractionTsForOptionEnum.For
              : common.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^after$/) && year) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsAfterDate,
            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute),
            tsForOption: forUnit
              ? common.FractionTsForOptionEnum.For
              : common.FractionTsForOptionEnum.ForInfinity,
            tsForValue: Number(forIntegerStr),
            tsForUnit: <any>forUnit
          });
        } else if (way.match(/^after$/)) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsAfterRelative,
            tsRelativeValue: Number(integerStr),
            tsRelativeUnit: <any>unit,
            tsRelativeCompleteOption: complete
              ? common.FractionTsRelativeCompleteOptionEnum.Complete
              : common.FractionTsRelativeCompleteOptionEnum.Incomplete,
            tsRelativeWhenOption: when.match(/^ago$/)
              ? common.FractionTsRelativeWhenOptionEnum.Ago
              : when.match(/^in\s+future$/)
                ? common.FractionTsRelativeWhenOptionEnum.InFuture
                : undefined,
            tsForOption: forUnit
              ? common.FractionTsForOptionEnum.For
              : common.FractionTsForOptionEnum.ForInfinity,
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

        let { sqlOpen, rgOpen } = barTimestamp.makeTimestampOpenFromDateParts({
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
          connection: connection,
          timezone: timezone,
          getTimeRange: getTimeRange
        });
        open = sqlOpen;
        rangeOpen = rgOpen;

        if (common.isUndefined(toYear)) {
          let { sqlClose, rgClose } = barTimestamp.makeTimestampCloseBetween({
            open: open,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            connection: connection,
            getTimeRange: getTimeRange,
            rangeOpen: rangeOpen
          });
          close = sqlClose;
          rangeClose = rgClose;
        } else {
          // to
          let { sqlClose, rgClose } = barTimestamp.makeTimestampCloseBetweenTo({
            toYear: toYear,
            toMonth: toMonth,
            toDay: toDay,
            toHour: toHour,
            toMinute: toMinute,
            connection: connection,
            timezone: timezone,
            getTimeRange: getTimeRange
          });
          close = sqlClose;
          rangeClose = rgClose;
        }

        ors.push(`(${sqlTsSelect} >= ${open} AND ${sqlTsSelect} < ${close})`);

        if (toYear) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsInRange,

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
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsOnMinute,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour),
            tsDateMinute: Number(minute)
          });
        } else if (hour) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsOnHour,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day),
            tsDateHour: Number(hour)
          });
        } else if (day) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsOnDay,

            tsDateYear: Number(year),
            tsDateMonth: Number(month),
            tsDateDay: Number(day)
          });
        } else if (month) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsOnMonth,

            tsDateYear: Number(year),
            tsDateMonth: Number(month)
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsOnYear,

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
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.TsIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsNull
          });
        }

        if (not && condition) {
          nots.push(`NOT ${condition}`);
        } else if (condition) {
          ors.push(condition);
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        ors.push(constants.SQL_TRUE_CONDITION);

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.TsIsAnyValue
        });

        if (not && condition) {
          nots.push(`NOT ${condition}`);
        } else if (condition) {
          ors.push(condition);
        }
      } else {
        ors.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === common.FieldResultEnum.DayOfWeek) {
      // IS
      // IS NOT
      if ((r = common.MyRegex.BRICK_DAY_OF_WEEK_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${proc}) = UPPER('${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.DayOfWeekIsNot,
            dayOfWeekValue: <any>value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.DayOfWeekIs,
            dayOfWeekValue: <any>value
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
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.DayOfWeekIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.DayOfWeekIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.DayOfWeekIsAnyValue
        });
      }

      // common for DayOfWeek
      if (not && condition) {
        nots.push(`NOT ${condition}`);
      } else if (condition) {
        ors.push(condition);
      } else if (not) {
        nots.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ors.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === common.FieldResultEnum.DayOfWeekIndex) {
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
            notIns.push(num);
            dayOfWeekIndexValues.push(num);
          } else if (num) {
            ins.push(num);
            dayOfWeekIndexValues.push(num);
          } else if (not) {
            nots.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          } else {
            ors.push(constants.FAIL);
            answerError = { valid: 0, brick: brick };
            return;
          }
        });

        let dayOfWeekIndexValuesString = dayOfWeekIndexValues.join(', ');

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.DayOfWeekIndexIsNotEqualTo,
            dayOfWeekIndexValues: dayOfWeekIndexValuesString
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.DayOfWeekIndexIsEqualTo,
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
              operator: common.FractionOperatorEnum.And,
              type: common.FractionTypeEnum.DayOfWeekIndexIsNotNull
            });
          } else {
            fractions.push({
              brick: brick,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.DayOfWeekIndexIsNull
            });
          }

          // IS ANY VALUE
        } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
          condition = constants.SQL_TRUE_CONDITION;

          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.DayOfWeekIndexIsAnyValue
          });
        }

        // common for DayOfWeekIndex
        if (not && condition) {
          nots.push(`NOT ${condition}`);
        } else if (condition) {
          ors.push(condition);
        } else if (not) {
          nots.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        } else {
          ors.push(constants.FAIL);
          answerError = { valid: 0, brick: brick };
          return;
        }
      }
    } else if (result === common.FieldResultEnum.MonthName) {
      // IS
      // IS NOT
      if ((r = common.MyRegex.BRICK_MONTH_NAME_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${proc}) = UPPER('${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.MonthNameIsNot,
            monthNameValue: <any>value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.MonthNameIs,
            monthNameValue: <any>value
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
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.MonthNameIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.MonthNameIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.MonthNameIsAnyValue
        });
      }

      // common for MonthName
      if (not && condition) {
        nots.push(`NOT ${condition}`);
      } else if (condition) {
        ors.push(condition);
      } else if (not) {
        nots.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ors.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    } else if (result === common.FieldResultEnum.QuarterOfYear) {
      // IS
      // IS NOT
      if ((r = common.MyRegex.BRICK_QUARTER_OF_YEAR_IS().exec(brick))) {
        not = r[1];
        value = r[2];

        condition = `UPPER(${proc}) = UPPER('${value}')`;

        if (not) {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.QuarterOfYearIsNot,
            quarterOfYearValue: <any>value
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.QuarterOfYearIs,
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
            operator: common.FractionOperatorEnum.And,
            type: common.FractionTypeEnum.QuarterOfYearIsNotNull
          });
        } else {
          fractions.push({
            brick: brick,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.QuarterOfYearIsNull
          });
        }

        // IS ANY VALUE
      } else if ((r = common.MyRegex.BRICK_IS_ANY_VALUE().exec(brick))) {
        condition = constants.SQL_TRUE_CONDITION;

        fractions.push({
          brick: brick,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.QuarterOfYearIsAnyValue
        });
      }

      // common for QuarterOfYear
      if (not && condition) {
        nots.push(`NOT ${condition}`);
      } else if (condition) {
        ors.push(condition);
      } else if (not) {
        nots.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      } else {
        ors.push(constants.FAIL);
        answerError = { valid: 0, brick: brick };
        return;
      }
    }
  });

  if (answerError) {
    return answerError;
  }

  if (getTimeRange === true) {
    return {
      valid: 1,
      rangeOpen: common.isDefined(rangeOpen)
        ? getUnixTime(rangeOpen)
        : undefined,
      rangeClose: common.isDefined(rangeClose)
        ? getUnixTime(rangeClose)
        : undefined
    };
  }

  return { valid: 1 };
}
