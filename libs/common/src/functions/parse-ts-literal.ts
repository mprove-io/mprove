import { TemporalUnit } from '@malloydata/malloy-filter';
import { MyRegex } from '~common/models/my-regex';
import { isDefined } from './is-defined';

export function parseTsLiteral(item: {
  input: string;
  units: TemporalUnit;
}) {
  let { input, units } = item;

  let year;
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

  return {
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute
  };
}
