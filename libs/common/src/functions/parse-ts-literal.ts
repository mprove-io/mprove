import type { TemporalUnit } from '@malloydata/malloy-filter';
import { MyRegex } from '#common/models/my-regex';
import { isDefined } from './is-defined';
import { isUndefined } from './is-undefined';

export function parseTsLiteral(item: { input: string; units: TemporalUnit }) {
  let { input, units } = item;

  let year;
  let quarter;
  let month;
  let day;
  let hour;
  let minute;

  if (isDefined(input)) {
    let literalToParse =
      units === 'quarter'
        ? input.slice(0, -3)
        : units === 'week'
          ? input.slice(0, -3)
          : input;

    let r;

    if ((r = MyRegex.BRICK_TS_LITERAL().exec(literalToParse))) {
      year = r[1];
      month = r[2];
      day = r[3];
      hour = r[4];
      minute = r[5];
    }
  }

  quarter =
    isDefined(input) && units === 'quarter'
      ? input[input.length - 1]
      : isDefined(month)
        ? [1, 2, 3].indexOf(Number(month)) > -1
          ? '1'
          : [4, 5, 6].indexOf(Number(month)) > -1
            ? '2'
            : [7, 8, 9].indexOf(Number(month)) > -1
              ? '3'
              : [10, 11, 12].indexOf(Number(month)) > -1
                ? '4'
                : undefined
        : undefined;

  if (isDefined(quarter) && isUndefined(month) && isUndefined(day)) {
    day = '01';

    month =
      quarter === '1'
        ? '01'
        : quarter === '2'
          ? '04'
          : quarter === '3'
            ? '07'
            : quarter === '4'
              ? '10'
              : undefined;
  }

  return {
    year: year,
    quarter: quarter,
    month: month,
    day: day,
    hour: hour,
    minute: minute
  };
}
